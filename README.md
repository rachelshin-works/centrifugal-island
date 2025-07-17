# ISS Live Background

ISS(국제우주정거장) 실시간 영상의 픽셀 평균값을 분석하여 웹 배경을 동적으로 변경하는 프로젝트입니다.

## 🚀 기능

- **실시간 색상 분석**: ISS YouTube 라이브 스트림에서 프레임을 캡처하여 평균 색상 계산
- **동적 배경 변경**: p5.js를 사용한 부드러운 배경색 전환
- **WebSocket 실시간 통신**: 서버와 클라이언트 간 실시간 데이터 전송
- **시각적 효과**: 우주 테마의 입자 애니메이션
- **반응형 UI**: 실시간 색상 정보 및 연결 상태 표시

## 📋 요구사항

### 기본 요구사항
- Node.js 16.0 이상
- npm 또는 yarn

### 고급 기능 (실제 스트림 캡처)
- FFmpeg
- yt-dlp

## 🛠️ 설치

1. **의존성 설치**
```bash
npm install
```

2. **고급 기능을 위한 추가 도구 설치 (선택사항)**

macOS:
```bash
# Homebrew 사용
brew install ffmpeg
brew install yt-dlp
```

Ubuntu/Debian:
```bash
sudo apt update
sudo apt install ffmpeg
pip install yt-dlp
```

## 🚀 실행

### 기본 모드 (시뮬레이션)
```bash
npm start
```

### 고급 모드 (실제 스트림 캡처)
```bash
node advanced-server.js
```

### 개발 모드 (자동 재시작)
```bash
npm run dev
```

## 🌐 접속

서버 실행 후 브라우저에서 다음 주소로 접속:
- **웹 인터페이스**: http://localhost:3000
- **API 엔드포인트**: http://localhost:3000/average-color
- **상태 확인**: http://localhost:3000/status

## 📁 프로젝트 구조

```
iss-live-background/
├── server.js              # 기본 서버 (시뮬레이션 모드)
├── advanced-server.js     # 고급 서버 (실제 스트림 캡처)
├── package.json           # 프로젝트 설정
├── README.md             # 프로젝트 문서
└── public/
    └── index.html        # 웹 클라이언트 (p5.js)
```

## 🔧 API 엔드포인트

### GET /average-color
현재 ISS 스트림의 평균 색상을 JSON 형태로 반환

**응답 예시:**
```json
{
  "r": 100,
  "g": 150,
  "b": 200,
  "timestamp": 1640995200000,
  "source": "iss-stream"
}
```

### GET /status
서버 상태 정보를 반환

**응답 예시:**
```json
{
  "status": "running",
  "clients": 2,
  "timestamp": 1640995200000
}
```

## 🎨 색상 분석 알고리즘

1. **프레임 캡처**: YouTube 라이브 스트림에서 주기적으로 프레임 추출
2. **중앙 영역 샘플링**: 이미지 중앙 영역의 픽셀만 샘플링하여 성능 최적화
3. **평균 계산**: RGB 채널별 평균값 계산
4. **부드러운 전환**: 클라이언트에서 lerp 함수를 사용한 부드러운 색상 전환

## 🌟 시뮬레이션 모드

실제 스트림 캡처가 불가능한 경우, 시간대별로 현실적인 ISS 색상을 시뮬레이션:

- **낮 시간대 (6-18시)**: 지구 대기권, 대륙, 구름, 태양광 반사
- **밤 시간대 (18-6시)**: 우주, 밤의 지구, 도시 불빛, 별빛 반사

## 🎮 인터랙션

- **마우스 클릭**: 클릭한 위치에 입자 효과 추가
- **실시간 정보**: 화면 좌상단에 현재 색상 정보 표시
- **연결 상태**: 우상단에 WebSocket 연결 상태 표시

## 🔧 설정 옵션

### 서버 설정
- `PORT`: 웹 서버 포트 (기본값: 3000)
- `ISS_STREAM_URL`: ISS YouTube 라이브 스트림 URL

### 클라이언트 설정
- 업데이트 주기: 2-3초
- 색상 전환 속도: 0.05 (lerp 계수)
- 입자 개수: 50개

## 🐛 문제 해결

### 일반적인 문제

1. **포트 충돌**
   ```bash
   # 다른 포트 사용
   PORT=3001 npm start
   ```

2. **의존성 오류**
   ```bash
   # node_modules 삭제 후 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Canvas 모듈 오류 (macOS)**
   ```bash
   # Xcode Command Line Tools 설치
   xcode-select --install
   ```

### 고급 기능 문제

1. **FFmpeg 오류**
   - FFmpeg가 올바르게 설치되었는지 확인
   - `ffmpeg -version` 명령어로 설치 확인

2. **yt-dlp 오류**
   - yt-dlp가 최신 버전인지 확인
   - `yt-dlp --version` 명령어로 설치 확인

## 📝 라이선스

MIT License

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. Node.js 버전이 16.0 이상인지 확인
2. 모든 의존성이 올바르게 설치되었는지 확인
3. 포트 3000과 8080이 사용 가능한지 확인 