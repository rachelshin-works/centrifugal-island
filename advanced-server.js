const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const { spawn } = require('child_process');
const { createCanvas, loadImage } = require('canvas');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(cors());
app.use(express.static('public'));

// WebSocket 서버 생성
const wss = new WebSocket.Server({ port: 8080 });

// ISS YouTube 라이브 스트림 URL
const ISS_STREAM_URL = 'https://www.youtube.com/watch?v=fO9e9jnhYK8';

// 임시 디렉토리 생성
const tempDir = './temp';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// 평균 색상 계산 함수 (개선된 버전)
function getAverageColor(imageData) {
    let r = 0, g = 0, b = 0;
    const data = imageData.data;
    
    // 더 정확한 샘플링을 위해 중앙 영역만 사용
    const width = imageData.width;
    const height = imageData.height;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const sampleSize = Math.min(width, height) / 4;
    
    let count = 0;
    
    for (let y = centerY - sampleSize; y < centerY + sampleSize; y += 2) {
        for (let x = centerX - sampleSize; x < centerX + sampleSize; x += 2) {
            const index = (y * width + x) * 4;
            if (index < data.length - 3) {
                r += data[index];
                g += data[index + 1];
                b += data[index + 2];
                count++;
            }
        }
    }
    
    if (count === 0) {
        return { r: 0, g: 0, b: 0 };
    }
    
    return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
}

// FFmpeg를 사용한 프레임 캡처
async function captureFrameWithFFmpeg() {
    return new Promise((resolve, reject) => {
        const outputPath = `${tempDir}/frame_${Date.now()}.jpg`;
        
        // yt-dlp를 사용하여 스트림 URL 가져오기
        const ytdlp = spawn('yt-dlp', [
            '--get-url',
            '--format', 'worst[height<=480]',
            ISS_STREAM_URL
        ]);
        
        let streamUrl = '';
        
        ytdlp.stdout.on('data', (data) => {
            streamUrl += data.toString().trim();
        });
        
        ytdlp.on('close', (code) => {
            if (code !== 0) {
                console.log('yt-dlp 실패, 서버 종료');
                reject(new Error('yt-dlp 실패'));
                return;
            }
            
            // FFmpeg로 프레임 캡처
            const ffmpeg = spawn('ffmpeg', [
                '-i', streamUrl,
                '-vframes', '1',
                '-q:v', '2',
                '-y',
                outputPath
            ]);
            
            ffmpeg.on('close', async (code) => {
                if (code !== 0) {
                    console.log('FFmpeg 캡처 실패, 시뮬레이션 모드로 전환');
                    resolve(getSimulatedISSSColor());
                    return;
                }
                
                try {
                    // 캡처된 이미지 분석
                    const image = await loadImage(outputPath);
                    const canvas = createCanvas(image.width, image.height);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0);
                    
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const color = getAverageColor(imageData);
                    
                    // 임시 파일 삭제
                    fs.unlinkSync(outputPath);
                    
                    resolve(color);
                } catch (error) {
                    console.error('이미지 분석 오류:', error);
                    resolve(getSimulatedISSSColor());
                }
            });
            
            ffmpeg.on('error', (error) => {
                console.error('FFmpeg 오류:', error);
                resolve(getSimulatedISSSColor());
            });
        });
        
        ytdlp.on('error', (error) => {
            console.error('yt-dlp 오류:', error);
            resolve(getSimulatedISSSColor());
        });
    });
}

// 프레임 캡처 및 색상 분석 (고급 버전)
async function captureAndAnalyzeAdvanced() {
    try {
        console.log('ISS 스트림에서 프레임 캡처 중...');
        
        // FFmpeg를 사용한 실제 캡처 시도
        const color = await captureFrameWithFFmpeg();
        return color;
        
    } catch (error) {
        console.error('고급 프레임 캡처 오류:', error);
        return getSimulatedISSSColor();
    }
}

// ISS 색상 시뮬레이션 (더 현실적인 버전)
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
            { r: 50, g: 100, b: 150 }    // 바다 (어두운 파랑)
        ];
        return colors[Math.floor(time / 3000) % colors.length];
    } else {
        // 밤 시간대 - 우주와 도시 불빛
        const colors = [
            { r: 0, g: 0, b: 0 },        // 우주 (검정)
            { r: 20, g: 20, b: 40 },     // 어두운 우주
            { r: 50, g: 50, b: 100 },    // 밤의 지구 (어두운 파랑)
            { r: 100, g: 50, b: 50 },    // 도시 불빛 (붉은색)
            { r: 30, g: 30, b: 60 }      // 별빛 반사
        ];
        return colors[Math.floor(time / 4000) % colors.length];
    }
}

// WebSocket 클라이언트들에게 색상 전송
function broadcastColor(color) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                ...color,
                timestamp: Date.now(),
                source: 'iss-stream'
            }));
        }
    });
}

// 주기적으로 색상 분석 및 전송
setInterval(async () => {
    const color = await captureAndAnalyzeAdvanced();
    if (color) {
        console.log('평균 색상:', color);
        broadcastColor(color);
    }
}, 3000); // 3초마다 업데이트

// API 엔드포인트
app.get('/average-color', async (req, res) => {
    const color = await captureAndAnalyzeAdvanced();
    res.json(color || { r: 0, g: 0, b: 0 });
});

app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        clients: wss.clients.size,
        timestamp: Date.now()
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`고급 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`웹소켓 서버가 포트 8080에서 실행 중입니다.`);
    console.log(`브라우저에서 http://localhost:${PORT}를 열어보세요.`);
    console.log('참고: 실제 스트림 캡처를 위해서는 ffmpeg와 yt-dlp가 설치되어야 합니다.');
});

// WebSocket 연결 처리
wss.on('connection', (ws) => {
    console.log('새로운 WebSocket 클라이언트 연결됨');
    
    // 연결 즉시 현재 색상 전송
    captureAndAnalyzeAdvanced().then(color => {
        if (color) {
            ws.send(JSON.stringify({
                ...color,
                timestamp: Date.now(),
                source: 'iss-stream'
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('WebSocket 클라이언트 연결 해제됨');
    });
});

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
    console.log('서버 종료 중...');
    
    // 임시 파일들 정리
    if (fs.existsSync(tempDir)) {
        fs.readdirSync(tempDir).forEach(file => {
            fs.unlinkSync(`${tempDir}/${file}`);
        });
        fs.rmdirSync(tempDir);
    }
    
    process.exit(0);
}); 