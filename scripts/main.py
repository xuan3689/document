import asyncio
import websockets
from seat_detection import websocket_handler as handler_impl

async def websocket_handler(websocket, path):
    try:
        await handler_impl(websocket)
    except websockets.exceptions.ConnectionClosed:
        print("客户端连接已断开，等待重新连接...")
    except Exception as e:
        print(f"处理WebSocket连接时发生错误：{str(e)}")

async def main():
    while True:  # 添加永久运行循环
        try:
            port = 8766
            max_attempts = 5
            
            # 尝试不同的端口
            for attempt in range(max_attempts):
                try:
                    server = await websockets.serve(
                        lambda websocket: websocket_handler(websocket, None),
                        '0.0.0.0',  # 允许从任何IP地址访问
                        port + attempt,
                        ping_interval=20,  # 调整心跳间隔
                        ping_timeout=10,    # 增加超时时间
                        max_size=10485760  # 设置最大消息大小为10MB
                    )
                    print(f'WebSocket服务器已启动，监听地址：ws://0.0.0.0:{port + attempt}')
                    break
                except OSError as e:
                    if attempt == max_attempts - 1:
                        raise Exception(f'无法找到可用的端口（尝试了端口 {port} 到 {port + max_attempts - 1}）')
                    print(f'端口 {port + attempt} 已被占用，尝试下一个端口...')
                    continue
            
            await server.wait_closed()
        except Exception as e:
            print(f'服务器发生错误：{str(e)}')
            print('5秒后尝试重新启动服务器...')
            await asyncio.sleep(5)  # 等待5秒后重试

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print('服务器已手动停止')
    except Exception as e:
        print(f'发生严重错误：{str(e)}')