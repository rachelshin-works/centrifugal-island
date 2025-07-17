const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const WebSocket = require('ws');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(cors());
app.use(express.static('public'));

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버를 HTTP 서버에 연결
const wss = new WebSocket.Server({ server });

// ISS YouTube 라이브 스트림 URL
const ISS_STREAM_URL = 'https://www.youtube.com/watch?v=fO9e9jnhYK8';

// ISS 색상 시뮬레이션 (현실적인 버전)
function getSimulatedISSSColor() {
    const time = Date.now();
    const hour = new Date().getHours();
    
    // 시간대별 색상 변화
    if (hour >= 6 && hour <= 18) {
        // 낮 시간대 - 지구와 우주
        const colors = [
            { r: 0, g: 100, b: 200 },    // 지구 대기권 (파랑)
            { r: 100, g: 150, b: 50 },   // 대륙 (녹색)
            { r: 200, g: 200, b: 100 },  // 구름 (흰색)
            { r: 255, g: 255, b: 255 },  // 태양광 반사 (흰색)
            { r: 50, g: 100, b: 150 },   // 바다 (어두운 파랑)
            { r: 150, g: 200, b: 255 }   // 하늘 (밝은 파랑)
        ];
        return colors[Math.floor(time / 4000) % colors.length];
    } else {
        // 밤 시간대 - 우주와 도시 불빛
        const colors = [
            { r: 0, g: 0, b: 0 },        // 우주 (검정)
            { r: 20, g: 20, b: 40 },     // 어두운 우주
            { r: 50, g: 50, b: 100 },    // 밤의 지구 (어두운 파랑)
            { r: 100, g: 50, b: 50 },    // 도시 불빛 (붉은색)
            { r: 30, g: 30, b: 60 },     // 별빛 반사
            { r: 80, g: 40, b: 80 }      // 오로라 효과
        ];
        return colors[Math.floor(time / 5000) % colors.length];
    }
}

// 프레임 캡처 및 색상 분석 (시뮬레이션 모드)
async function captureAndAnalyze() {
    try {
        // 시뮬레이션된 색상 반환
        const simulatedColor = getSimulatedISSSColor();
        return simulatedColor;
        
    } catch (error) {
        console.error('색상 분석 오류:', error);
        return { r: 0, g: 0, b: 0 };
    }
}

// WebSocket 클라이언트들에게 색상 전송
function broadcastColor(color) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                ...color,
                timestamp: Date.now(),
                source: 'iss-simulation'
            }));
        }
    });
}

// 주기적으로 색상 분석 및 전송
setInterval(async () => {
    const color = await captureAndAnalyze();
    if (color) {
        broadcastColor(color);
    }
}, 2000); // 2초마다 업데이트

// API 엔드포인트
app.get('/average-color', async (req, res) => {
    const color = await captureAndAnalyze();
    res.json(color || { r: 0, g: 0, b: 0 });
});

app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        mode: 'simulation',
        clients: wss.clients.size,
        timestamp: Date.now()
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
server.listen(PORT, () => {
    console.log(`ISS Live Background 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`브라우저에서 http://localhost:${PORT}를 열어보세요.`);
});

// WebSocket 연결 처리
wss.on('connection', (ws) => {
    console.log('새로운 WebSocket 클라이언트 연결됨');
    
    // 연결 즉시 현재 색상 전송
    captureAndAnalyze().then(color => {
        if (color) {
            ws.send(JSON.stringify({
                ...color,
                timestamp: Date.now(),
                source: 'iss-simulation'
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket 클라이언트 연결 해제됨');
    });
}); 