const WebSocket = require('ws');
const http = require('http');
const app = require('../app');

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 存储所有连接的客户端
const clients = new Set();

// 心跳检测配置
const HEARTBEAT_INTERVAL = 30000; // 30秒发送一次心跳
const HEARTBEAT_TIMEOUT = 5000;  // 5秒超时

wss.on('connection', (ws) => {
    console.log('新的WebSocket连接建立');
    clients.add(ws);

    // 设置客户端属性
    ws.isAlive = true;
    ws.lastPingTime = Date.now();

    // 处理接收到的消息
    ws.on('message', (message) => {
        const data = message.toString();
        console.log('收到消息:', data);

        if (data === 'ping') {
            ws.isAlive = true;
            ws.lastPingTime = Date.now();
            ws.send('pong');
        }
    });

    // 处理连接关闭
    ws.on('close', () => {
        console.log('WebSocket连接关闭');
        clients.delete(ws);
    });

    // 处理错误
    ws.on('error', (error) => {
        console.error('WebSocket错误:', error);
        clients.delete(ws);
    });
});

// 定期检查客户端连接状态
setInterval(() => {
    const now = Date.now();
    clients.forEach((ws) => {
        if (!ws.isAlive && (now - ws.lastPingTime) > HEARTBEAT_TIMEOUT) {
            console.log('客户端心跳超时，关闭连接');
            ws.terminate();
            clients.delete(ws);
            return;
        }

        if (now - ws.lastPingTime >= HEARTBEAT_INTERVAL) {
            ws.isAlive = false;
            ws.send('ping');
        }
    });
}, HEARTBEAT_INTERVAL);

module.exports = server;