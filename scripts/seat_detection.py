import cv2
import numpy as np
import asyncio
import websockets
import json
from datetime import datetime

# 人体检测器初始化
def init_detector():
    # 使用HOG行人检测器
    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
    return hog

# 处理视频帧并检测人数
def process_frame(frame, detector):
    # 调整图像大小以提高性能
    frame = cv2.resize(frame, (640, 480))
    
    # 检测人体
    boxes, weights = detector.detectMultiScale(
        frame,
        winStride=(8, 8),
        padding=(4, 4),
        scale=1.05
    )
    
    # 在图像上绘制检测框
    for (x, y, w, h) in boxes:
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
    
    return frame, len(boxes)

# WebSocket服务器处理函数
async def websocket_handler(websocket, path):
    try:
        # 初始化检测器
        detector = init_detector()
        
        # 打开摄像头
        cap = cv2.VideoCapture(0)
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            # 处理帧并获取人数
            processed_frame, person_count = process_frame(frame, detector)
            
            # 构建座位分布数据
            seat_data = {
                'timestamp': datetime.now().isoformat(),
                'total_people': person_count,
                'areas': [
                    {
                        'id': 1,
                        'name': '区域A',
                        'occupancy': person_count  # 这里可以根据实际区域划分细化
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
    server = await websockets.serve(
        websocket_handler,
        'localhost',
        8765
    )
    print("WebSocket server started on ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())