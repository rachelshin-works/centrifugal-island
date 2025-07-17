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
app.use(cors({
    origin: ['https://centrifugal-island.onrender.com', 'https://centrifugal-island.nyc', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.static('public'));

// Express 서버 생성
const server = app.listen(PORT, () => {
    console.log(`ISS Live Background 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log('고급 모드로 실행 중입니다 (실제 ISS 스트림 캡처 시도).');
    
    // 서버 시작 시 YouTube를 먼저 열기
    const { exec } = require('child_process');
    exec('open https://www.youtube.com/watch?v=fO9e9jnhYK8', (error) => {
        if (error) {
            console.log('YouTube 자동 열기 실패:', error.message);
        } else {
            console.log('YouTube ISS 스트림이 새 탭에서 열렸습니다.');
        }
    });
    
    // 3초 후 웹페이지 안내
    setTimeout(() => {
        console.log(`이제 브라우저에서 http://localhost:${PORT}를 열어보세요.`);
    }, 3000);
});

// SSE 클라이언트들을 저장할 배열
let sseClients = [];

// SSE 엔드포인트 추가
app.get('/color-stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': 'https://centrifugal-island.onrender.com',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    console.log('새로운 SSE 클라이언트 연결됨');
    sseClients.push(res);
    
    // 연결 즉시 현재 색상 전송
    captureAndAnalyzeAdvanced().then(color => {
        if (color) {
            res.write(`data: ${JSON.stringify(color)}\n\n`);
        }
    });
    
    // 클라이언트 연결 해제 시 정리
    req.on('close', () => {
        console.log('SSE 클라이언트 연결 해제됨');
        sseClients = sseClients.filter(client => client !== res);
    });
});

// ISS YouTube 라이브 스트림 URL (더 많은 URL 추가)
const ISS_STREAM_URLS = [
    'https://www.youtube.com/watch?v=fO9e9jnhYK8',  // ISS Live: Earth from Space
    'https://www.youtube.com/watch?v=86YLFOog4GM',  // ISS Live: NASA Earth Views
    'https://www.youtube.com/watch?v=4jKokxPRtck',  // ISS Live: Space Station
    'https://www.youtube.com/watch?v=UdnTZO_c-TY',  // ISS Live: International Space Station
    'https://www.youtube.com/watch?v=21X5lGlDOfg',  // NASA Live: Earth from Space
    'https://www.youtube.com/watch?v=qtl0WxQqJqE',  // ISS Live: Space Station Cam
    'https://www.youtube.com/watch?v=EEIk7gwjgIM',  // ISS Live: Earth Views
    'https://www.youtube.com/watch?v=1-fVoQKqKNE',  // ISS Live: Space Station Live
    'https://www.youtube.com/watch?v=6AviDjR9mmo',  // ISS Live: Space Station
    'https://www.youtube.com/watch?v=86YLFOog4GM',  // NASA Live: Earth from Space
    'https://www.youtube.com/watch?v=4jKokxPRtck',  // ISS Live: Space Station
    'https://www.youtube.com/watch?v=UdnTZO_c-TY'   // ISS Live: International Space Station
];

// 임시 디렉토리 생성
const tempDir = './temp';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// 평균 색상 계산 함수 (개선된 버전)
function getAverageColor(imageData) {
    let r = 0, g = 0, b = 0;
    const data = imageData.data;
    
    // 전체 이미지에서 샘플링 (더 많은 픽셀 사용)
    const width = imageData.width;
    const height = imageData.height;
    const totalPixels = width * height;
    
    // 샘플링 간격을 줄여서 더 많은 픽셀 사용
    const sampleStep = Math.max(1, Math.floor(totalPixels / 10000)); // 최대 10,000개 픽셀 샘플링
    
    let count = 0;
    
    for (let i = 0; i < data.length; i += sampleStep * 4) {
        if (i + 2 < data.length) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }
    }
    
    if (count === 0) {
        return { r: 0, g: 0, b: 0 };
    }
    
    const avgColor = {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count)
    };
    
    // 디버깅을 위한 로그
    console.log(`이미지 크기: ${width}x${height}, 샘플링된 픽셀: ${count}, 평균 색상:`, avgColor);
    
    return avgColor;
}

// yt-dlp를 사용한 스트림 URL 가져오기 (개선된 버전)
async function getStreamUrl(url) {
    return new Promise((resolve, reject) => {
        // 먼저 yt-dlp 시도
        const ytdlp = spawn('yt-dlp', [
            '--get-url',
            '--format', 'worst[height<=480]',
            '--no-check-certificates',
            url
        ]);
        
        let streamUrl = '';
        let errorOutput = '';
        
        ytdlp.stdout.on('data', (data) => {
            streamUrl += data.toString().trim();
        });
        
        ytdlp.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        ytdlp.on('close', (code) => {
            if (code !== 0) {
                console.log(`yt-dlp 실패 (${code}): ${errorOutput}`);
                // yt-dlp가 실패하면 직접 URL 사용 시도
                console.log('yt-dlp 없이 직접 URL 사용 시도');
                resolve(url);
                return;
            }
            
            if (streamUrl && streamUrl.startsWith('http')) {
                resolve(streamUrl);
            } else {
                console.log('유효하지 않은 스트림 URL, 직접 URL 사용');
                resolve(url);
            }
        });
        
        ytdlp.on('error', (error) => {
            console.error('yt-dlp 오류:', error);
            console.log('yt-dlp 없이 직접 URL 사용');
            resolve(url);
        });
    });
}

// FFmpeg를 사용한 프레임 캡처 (개선된 버전)
async function captureFrameWithFFmpeg() {
    for (let i = 0; i < ISS_STREAM_URLS.length; i++) {
        try {
            console.log(`ISS 스트림 ${i + 1} 시도 중: ${ISS_STREAM_URLS[i]}`);
            
            const streamUrl = await getStreamUrl(ISS_STREAM_URLS[i]);
            console.log('스트림 URL 획득:', streamUrl.substring(0, 50) + '...');
            
            const outputPath = `${tempDir}/frame_${Date.now()}.jpg`;
            
            return new Promise((resolve, reject) => {
                // FFmpeg로 프레임 캡처 (HLS 스트림에 최적화된 설정)
                const ffmpeg = spawn('ffmpeg', [
                    '-i', streamUrl,
                    '-vframes', '1',
                    '-q:v', '1',  // 더 높은 품질
                    '-y',
                    '-avoid_negative_ts', 'make_zero',
                    '-fflags', '+genpts',
                    '-r', '1',  // 1fps로 설정
                    outputPath
                ]);
                
                let ffmpegError = '';
                
                ffmpeg.stderr.on('data', (data) => {
                    ffmpegError += data.toString();
                });
                
                ffmpeg.on('close', async (code) => {
                    if (code !== 0) {
                        console.log(`FFmpeg 캡처 실패 (${code}): ${ffmpegError}`);
                        resolve(null);
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
                        if (fs.existsSync(outputPath)) {
                            fs.unlinkSync(outputPath);
                        }
                        
                        console.log('성공적으로 색상 추출:', color);
                        resolve(color);
                    } catch (error) {
                        console.error('이미지 분석 오류:', error);
                        resolve(null);
                    }
                });
                
                ffmpeg.on('error', (error) => {
                    console.error('FFmpeg 오류:', error);
                    resolve(null);
                });
                
                // 20초 후 타임아웃 (더 긴 시간)
                setTimeout(() => {
                    ffmpeg.kill();
                    resolve(null);
                }, 20000);
            });
            
        } catch (error) {
            console.log(`스트림 ${i + 1} 실패:`, error.message);
            continue;
        }
    }
    
    // 모든 스트림이 실패한 경우
    console.log('모든 ISS 스트림 접근 실패, 시뮬레이션 모드로 전환');
    return null;
}

// 프레임 캡처 및 색상 분석 (고급 버전)
async function captureAndAnalyzeAdvanced() {
    try {
        console.log('ISS 스트림에서 프레임 캡처 중...');
        
        // 모든 스트림 URL을 시도
        for (let i = 0; i < ISS_STREAM_URLS.length; i++) {
            try {
                console.log(`ISS 스트림 ${i + 1} 시도 중: ${ISS_STREAM_URLS[i]}`);
                
                const streamUrl = await getStreamUrl(ISS_STREAM_URLS[i]);
                console.log('스트림 URL 획득:', streamUrl.substring(0, 50) + '...');
                
                const outputPath = `${tempDir}/frame_${Date.now()}.jpg`;
                
                const color = await new Promise((resolve, reject) => {
                    const ffmpeg = spawn('ffmpeg', [
                        '-i', streamUrl,
                        '-vframes', '1',
                        '-q:v', '1',
                        '-y',
                        '-avoid_negative_ts', 'make_zero',
                        '-fflags', '+genpts',
                        '-r', '1',
                        outputPath
                    ]);
                    
                    let ffmpegError = '';
                    
                    ffmpeg.stderr.on('data', (data) => {
                        ffmpegError += data.toString();
                    });
                    
                    ffmpeg.on('close', async (code) => {
                        if (code !== 0) {
                            console.log(`FFmpeg 캡처 실패 (${code}): ${ffmpegError}`);
                            resolve(null);
                            return;
                        }
                        
                        try {
                            const image = await loadImage(outputPath);
                            const canvas = createCanvas(image.width, image.height);
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(image, 0, 0);
                            
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const color = getAverageColor(imageData);
                            
                            // 임시 파일 삭제
                            if (fs.existsSync(outputPath)) {
                                fs.unlinkSync(outputPath);
                            }
                            
                            console.log('성공적으로 색상 추출:', color);
                            resolve(color);
                        } catch (error) {
                            console.error('이미지 분석 오류:', error);
                            resolve(null);
                        }
                    });
                    
                    ffmpeg.on('error', (error) => {
                        console.error('FFmpeg 오류:', error);
                        resolve(null);
                    });
                    
                    // 15초 후 타임아웃
                    setTimeout(() => {
                        ffmpeg.kill();
                        resolve(null);
                    }, 15000);
                });
                
                // 색상 유효성 검사 (더 관대한 조건)
                if (color && (color.r >= 0 && color.g >= 0 && color.b >= 0)) {
                    // 검은색이 아닌 경우 (임계값을 더 낮게 설정)
                    if (color.r > 1 || color.g > 1 || color.b > 1) {
                        console.log('실제 색상 추출 성공:', color);
                        return color;
                    } else {
                        console.log('검은색 프레임 감지, 다른 스트림 시도');
                        continue;
                    }
                }
                
            } catch (error) {
                console.log(`스트림 ${i + 1} 실패:`, error.message);
                continue;
            }
        }
        
        console.log('모든 스트림에서 유효한 색상을 추출하지 못함, 시뮬레이션 모드로 전환');
        return getSimulatedISSSColor();
        
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

// SSE 클라이언트들에게 색상 전송
function broadcastColor(color) {
    sseClients.forEach(client => {
        client.write(`data: ${JSON.stringify(color)}\n\n`);
    });
}

// 주기적으로 색상 분석 및 전송
setInterval(async () => {
    const color = await captureAndAnalyzeAdvanced();
    if (color) {
        console.log('평균 색상:', color);
        broadcastColor(color);
    }
}, 5000); // 5초마다 업데이트 (더 긴 간격으로 변경)

// API 엔드포인트
app.get('/average-color', async (req, res) => {
    const color = await captureAndAnalyzeAdvanced();
    res.json(color || { r: 0, g: 0, b: 0 });
});

app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        mode: 'advanced',
        clients: sseClients.length, // SSE 클라이언트 수 반환
        timestamp: Date.now()
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
    
    // SSE 클라이언트들 정리
    sseClients.forEach(client => {
        client.end();
    });
    sseClients = [];
    
    process.exit(0);
});