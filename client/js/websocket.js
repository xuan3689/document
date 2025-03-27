// WebSocket连接配置
const WS_CONFIG = {
    url: 'ws://localhost:8766',
    reconnectAttempts: 5,
    reconnectDelay: 3000
};

// WebSocket连接类
class WebSocketClient {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.init();
    }

    init() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        this.ws = new WebSocket(WS_CONFIG.url);

        // 连接建立时发送初始化消息
        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            document.getElementById('connectionStatus').textContent = '已连接';
            document.getElementById('connectionStatus').className = 'status connected';

            // 发送初始化消息
            const initMessage = {
                type: 'init',
                client: 'web-client',
                timestamp: new Date().toISOString()
            };
            this.ws.send(JSON.stringify(initMessage));
        };

        this.ws.onclose = () => {
            document.getElementById('connectionStatus').textContent = '连接断开';
            document.getElementById('connectionStatus').className = 'status disconnected';
            
            if (this.reconnectAttempts < WS_CONFIG.reconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => this.init(), WS_CONFIG.reconnectDelay);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.error) {
                    console.error('服务器错误:', data.error);
                    document.getElementById('connectionStatus').textContent = data.error;
                    document.getElementById('connectionStatus').className = 'status disconnected';
                    return;
                }
                this.updateUI(data);
            } catch (error) {
                console.error('数据解析错误:', error);
            }
        };
    }

    updateUI(data) {
        const container = document.getElementById('seatsContainer');
        container.innerHTML = '';
        
        // 更新总人数显示
        document.getElementById('totalPeople').textContent = `当前检测到的人数：${data.total_people}`;

        // 更新区域信息
        data.areas.forEach(area => {
            const areaElement = document.createElement('div');
            areaElement.className = 'area';
            areaElement.innerHTML = `
                <h3>${area.name}</h3>
                <div class="occupancy ${area.occupancy > 0 ? 'occupied' : 'available'}">
                    人数：${area.occupancy}
                </div>
            `;
            container.appendChild(areaElement);
        });
    }
}

// 页面加载完成后初始化WebSocket连接
window.addEventListener('load', () => {
    new WebSocketClient();
});