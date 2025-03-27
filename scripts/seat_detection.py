import cv2
import numpy as np
import asyncio
import websockets
import json
from datetime import datetime
import torch
from deep_sort import DeepSort
from deep_sort.utils.parser import get_config

# 非极大值抑制
def non_max_suppression(boxes, overlapThresh):
    if len(boxes) == 0:
        return []
    
    # 计算所有框的面积
    x1 = boxes[:,0]
    y1 = boxes[:,1]
    x2 = boxes[:,0] + boxes[:,2]
    y2 = boxes[:,1] + boxes[:,3]
    area = (x2 - x1 + 1) * (y2 - y1 + 1)
    
    # 按面积大小排序
    idxs = np.argsort(area)
    pick = []
    
    while len(idxs) > 0:
        last = len(idxs) - 1
        i = idxs[last]
        pick.append(i)
        
        # 找出所有重叠框
        xx1 = np.maximum(x1[i], x1[idxs[:last]])
        yy1 = np.maximum(y1[i], y1[idxs[:last]])
        xx2 = np.minimum(x2[i], x2[idxs[:last]])
        yy2 = np.minimum(y2[i], y2[idxs[:last]])
        
        # 计算重叠面积
        w = np.maximum(0, xx2 - xx1 + 1)
        h = np.maximum(0, yy2 - yy1 + 1)
        overlap = (w * h) / area[idxs[:last]]
        
        # 删除重叠度高的框
        idxs = np.delete(idxs, np.concatenate(([last], np.where(overlap > overlapThresh)[0])))
    
    return pick

from yolov8_detector import YOLOv8Detector

# 人体检测器初始化
def init_detector():
    # 使用YOLOv8检测器
    detector = YOLOv8Detector()
    return detector

# 图像预处理
def preprocess_frame(frame):
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

# 处理视频帧并检测人数
def process_frame(frame, detector):
    # 使用YOLOv8检测器进行检测和跟踪
    frame, person_count = detector.detect_and_track(frame)
    return frame, person_count
    
    # 在图像上绘制检测框
    for (x, y, w, h) in boxes:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
    
    return frame, len(boxes)

# WebSocket服务器处理函数
async def websocket_handler(websocket):
    try:
        # 等待客户端初始化消息
        try:
            init_message = await websocket.recv()
            init_data = json.loads(init_message)
            if init_data.get('type') != 'init':
                print("Invalid initialization message received")
                await websocket.close(1002, '无效的初始化消息')
                return
            print(f"Client connected successfully: {init_data.get('client')}")
            # 发送连接成功确认消息
            await websocket.send(json.dumps({
                'type': 'init_response',
                'status': 'success',
                'message': '连接成功'
            }))
        except json.JSONDecodeError as e:
            print(f"Failed to parse initialization message: {str(e)}")
            await websocket.close(1007, '初始化消息格式错误')
            return
        except websockets.exceptions.ConnectionClosed as e:
            print(f"Connection closed during initialization: {str(e)}")
            return
        except Exception as e:
            print(f"Unexpected error during initialization: {str(e)}")
            await websocket.close(1011, '初始化过程发生错误')
            return

        try:
            # 初始化YOLOv8检测器
            detector = init_detector()
            
            # 打开摄像头
            cap = cv2.VideoCapture(0)
            
            # 检查摄像头是否成功打开
            if not cap.isOpened():
                error_msg = {
                    'error': '摄像头未能正常打开，请检查以下问题：\n1. 确保摄像头已正确连接\n2. 检查摄像头驱动是否正确安装\n3. 确保没有其他程序正在使用摄像头'
                }
                await websocket.send(json.dumps(error_msg))
                return
                
            while True:
                ret, frame = cap.read()
                if not ret:
                    error_msg = {
                        'error': '读取摄像头画面失败，请检查摄像头连接是否正常'
                    }
                    await websocket.send(json.dumps(error_msg))
                    break
                    
                # 处理帧并获取人数
                processed_frame, person_count = process_frame(frame, detector)
        except Exception as e:
            error_msg = {
                'error': f'检测过程发生错误：{str(e)}'
            }
            await websocket.send(json.dumps(error_msg))
            
            # 将图像编码为JPEG格式的字节流
            _, buffer = cv2.imencode('.jpg', processed_frame)
            image_data = buffer.tobytes()
            
            # 构建座位分布数据
            seat_data = {
                'timestamp': datetime.now().isoformat(),
                'total_people': person_count,
                'frame': image_data.hex(),  # 将图像数据转换为十六进制字符串
                'areas': [
                    {
                        'id': 1,
                        'name': '区域A',
                        'occupancy': person_count
                    }
                ]
            }
            
            # 发送数据到客户端
            await websocket.send(json.dumps(seat_data))
            
            # 控制帧率
            await asyncio.sleep(1/30)  # 30 FPS
            
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    finally:
        if 'cap' in locals():
            cap.release()

# 主函数
async def main():
    try:
        port = 8765
        max_attempts = 5
        
        # 尝试不同的端口
        for attempt in range(max_attempts):
            try:
                server = await websockets.serve(
                    websocket_handler,
                    '0.0.0.0',
                    port + attempt)
                print(f"WebSocket server started on ws://0.0.0.0:{port + attempt}")
                break
            except OSError as e:
                if attempt == max_attempts - 1:
                    raise Exception(f"无法找到可用的端口（尝试了端口 {port} 到 {port + max_attempts - 1}）")
                print(f"端口 {port + attempt} 已被占用，尝试下一个端口...")
                continue
        
        print("Tips: You need a WebSocket client to connect to this server.")
        await server.wait_closed()
    except Exception as e:
        print(f"Error starting WebSocket server: {e}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"\nServer error: {e}")