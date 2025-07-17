# 네트워크 접근 설정 가이드

## 현재 서버 정보
- **로컬 주소**: http://localhost:3000
- **네트워크 주소**: http://192.168.123.103:3000
- **WebSocket**: ws://192.168.123.103:3000

## 다른 컴퓨터에서 접근하는 방법

### 1. 같은 Wi-Fi 네트워크 내에서
다른 컴퓨터의 브라우저에서 다음 주소로 접근:
```
http://192.168.123.103:3000
```

### 2. 외부 네트워크에서 접근 (포트 포워딩 필요)

#### 라우터 설정
1. 라우터 관리 페이지 접속 (보통 192.168.1.1 또는 192.168.0.1)
2. 포트 포워딩 설정으로 이동
3. 새 규칙 추가:
   - **외부 포트**: 3000
   - **내부 IP**: 192.168.123.103
   - **내부 포트**: 3000
   - **프로토콜**: TCP

#### 외부 접근
포트 포워딩 설정 후 외부 IP로 접근:
```
http://[외부IP]:3000
```

## 방화벽 설정

### macOS
1. 시스템 환경설정 > 보안 및 개인 정보 보호 > 방화벽
2. 방화벽 옵션 클릭
3. "+" 버튼으로 Node.js 추가
4. 또는 터미널에서:
   ```bash
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/bin/node
   ```

### Windows
1. Windows Defender 방화벽 > 고급 설정
2. 인바운드 규칙 > 새 규칙
3. 포트 선택 > TCP > 특정 포트: 3000
4. 연결 허용 선택
5. 모든 프로필 선택
6. 이름: "ISS Background Server"

### Linux
```bash
# UFW 사용
sudo ufw allow 3000

# iptables 사용
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables-save
```

## WebSocket 연결 확인

브라우저 개발자 도구 콘솔에서 확인:
```javascript
// WebSocket 연결 테스트
const ws = new WebSocket('ws://192.168.123.103:3000');
ws.onopen = () => console.log('연결됨');
ws.onmessage = (e) => console.log('메시지:', e.data);
ws.onerror = (e) => console.log('오류:', e);
```

## 문제 해결

### 연결이 안 되는 경우
1. 서버가 실행 중인지 확인: `curl http://localhost:3000/status`
2. 방화벽 설정 확인
3. 포트가 사용 중인지 확인: `lsof -i :3000`
4. 네트워크 연결 확인: `ping 192.168.123.103`

### WebSocket 연결 실패
1. 브라우저 콘솔에서 오류 메시지 확인
2. 방화벽에서 WebSocket 포트 허용
3. 프록시 설정 확인

### 성능 최적화
- 로컬 네트워크에서는 지연이 거의 없음
- 외부 네트워크에서는 지연이 있을 수 있음
- 시뮬레이션 모드로 자동 전환되어 안정적 동작 