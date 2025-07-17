# ISS Live Background

ISS 라이브 스트림의 픽셀 분석을 통한 동적 웹 배경 애플리케이션

## 기능

- 실시간 ISS 라이브 스트림에서 색상 추출
- WebSocket을 통한 실시간 색상 전송
- 동적 배경 색상 변화
- 시뮬레이션 모드 (스트림 연결 실패 시)
- 네트워크 접근 지원 (다른 컴퓨터에서 접근 가능)

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 설정 (선택사항)
`.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:
```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
ISS_UPDATE_INTERVAL=5000
ISS_TIMEOUT=20000
```

### 3. 실행

#### 개발 모드
```bash
npm run dev
```

#### 프로덕션 모드
```bash
npm run prod
```

#### 기본 실행
```bash
npm start
```

## 네트워크 접근

### 로컬 네트워크에서 접근
서버가 `0.0.0.0`에서 실행되므로 같은 네트워크의 다른 컴퓨터에서 접근할 수 있습니다:

1. 서버 컴퓨터의 IP 주소 확인:
   ```bash
   # macOS/Linux
   ifconfig
   
   # Windows
   ipconfig
   ```

2. 다른 컴퓨터에서 브라우저로 접근:
   ```
   http://[서버IP]:3000
   ```

### 포트 포워딩 (외부 접근)
외부에서 접근하려면 라우터에서 포트 포워딩을 설정하세요:

1. 라우터 관리 페이지 접속
2. 포트 포워딩 설정에서 포트 3000을 서버 컴퓨터로 포워딩
3. 외부 IP로 접근: `http://[외부IP]:3000`

### 방화벽 설정
- Windows: Windows Defender 방화벽에서 포트 3000 허용
- macOS: 시스템 환경설정 > 보안 및 개인 정보 보호 > 방화벽에서 허용
- Linux: `ufw allow 3000` 또는 `iptables` 설정

## WebSocket 연결

클라이언트는 자동으로 현재 호스트의 WebSocket에 연결됩니다:
- HTTP: `ws://host:port`
- HTTPS: `wss://host:port`

연결 실패 시 자동으로 시뮬레이션 모드로 전환됩니다.

## API 엔드포인트

- `GET /` - 메인 페이지
- `GET /average-color` - 현재 평균 색상 (JSON)
- `GET /status` - 서버 상태 정보 (JSON)

## 기술 스택

- **Backend**: Node.js, Express, WebSocket
- **Frontend**: HTML5, JavaScript, p5.js
- **Stream Processing**: FFmpeg, yt-dlp
- **Image Analysis**: Canvas API

## 문제 해결

### WebSocket 연결 실패
- 방화벽 설정 확인
- 포트가 열려있는지 확인
- 브라우저 콘솔에서 오류 메시지 확인

### ISS 스트림 접근 실패
- FFmpeg와 yt-dlp가 설치되어 있는지 확인
- 네트워크 연결 상태 확인
- 자동으로 시뮬레이션 모드로 전환됩니다

### CORS 오류
- `config.js`에서 `allowedOrigins` 설정 확인
- 개발 환경에서는 모든 origin이 허용됩니다

## 라이선스

MIT License 