import torch
from ultralytics import YOLO
from deep_sort import DeepSort
from deep_sort.utils.parser import get_config
import cv2
import numpy as np

class YOLOv8Detector:
    def __init__(self):
        # 初始化YOLOv8模型
        self.model = YOLO('yolov8n.pt')
        self.model.conf = 0.5  # 置信度阈值
        self.model.classes = [0]  # 只检测人类
        
        # 初始化DeepSORT跟踪器
        cfg = get_config()
        cfg.merge_from_file("deep_sort/configs/deep_sort.yaml")
        self.deepsort = DeepSort(cfg.DEEPSORT.REID_CKPT,
                                max_dist=cfg.DEEPSORT.MAX_DIST,
                                min_confidence=cfg.DEEPSORT.MIN_CONFIDENCE,
                                nms_max_overlap=cfg.DEEPSORT.NMS_MAX_OVERLAP,
                                max_iou_distance=cfg.DEEPSORT.MAX_IOU_DISTANCE,
                                max_age=cfg.DEEPSORT.MAX_AGE,
                                n_init=cfg.DEEPSORT.N_INIT,
                                nn_budget=cfg.DEEPSORT.NN_BUDGET,
                                use_cuda=True)
    
    def preprocess_frame(self, frame):
        # 调整图像大小以提高性能
        frame = cv2.resize(frame, (640, 480))
        
        # 对比度增强
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        enhanced = cv2.merge((cl,a,b))
        frame = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
        
        # 降噪
        frame = cv2.GaussianBlur(frame, (5, 5), 0)
        return frame
    
    def detect_and_track(self, frame):
        # 图像预处理
        frame = self.preprocess_frame(frame)
        
        # YOLOv8检测
        results = self.model(frame, stream=True)
        
        for result in results:
            boxes = result.boxes.cpu().numpy()
            if len(boxes) == 0:
                return frame, 0
            
            # 准备DeepSORT输入格式
            bbox_xywh = []
            confs = []
            
            for box in boxes:
                # 获取边界框坐标和置信度
                x1, y1, x2, y2 = box.xyxy[0]
                conf = box.conf[0]
                
                # 转换为中心点坐标格式
                w = x2 - x1
                h = y2 - y1
                bbox_xywh.append([x1 + w/2, y1 + h/2, w, h])
                confs.append(conf)
            
            bbox_xywh = np.array(bbox_xywh)
            confs = np.array(confs)
            
            # DeepSORT跟踪
            outputs = self.deepsort.update(bbox_xywh, confs, frame)
            
            # 绘制跟踪结果
            for track in outputs:
                bbox = track[:4]
                identity = track[-1]
                
                x1, y1, x2, y2 = bbox.astype(int)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, f'ID: {identity}', (x1, y1-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            return frame, len(outputs)
        
        return frame, 0