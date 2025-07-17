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

// 미묘한 톤의 색상 팔레트 (보라색 제거)
const subtleColors = [
    { r: 120, g: 120, b: 125 },  // 미묘한 회색톤
    { r: 140, g: 160, b: 180 },  // 하늘색 톤
    { r: 100, g: 130, b: 150 },  // 바다톤
    { r: 150, g: 140, b: 120 },  // 갈색톤
    { r: 130, g: 140, b: 160 },  // 회청색 톤
    { r: 160, g: 150, b: 140 },  // 베이지톤
    { r: 110, g: 140, b: 160 },  // 청회색 톤
    { r: 140, g: 130, b: 110 }   // 모래톤
];

let currentColorIndex = 0;
let colorChangeTime = Date.now();
const COLOR_DURATION = 180000; // 3분 (밀리초)

// 미묘한 톤의 색상 시뮬레이션
function getSubtleColor() {
    const now = Date.now();
    
    // 3분마다 색상 변경
    if (now - colorChangeTime > COLOR_DURATION) {
        currentColorIndex = (currentColorIndex + 1) % subtleColors.length;
        colorChangeTime = now;
    }
    
    return subtleColors[currentColorIndex];
}

// 프레임 캡처 및 색상 분석 (시뮬레이션 모드)
async function captureAndAnalyze() {
    try {
        // 시뮬레이션된 색상 반환
        const simulatedColor = getSubtleColor();
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

// 주기적으로 색상 분석 및 전송 (3분마다)
setInterval(async () => {
    const color = await captureAndAnalyze();
    if (color) {
        broadcastColor(color);
    }
}, COLOR_DURATION);

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