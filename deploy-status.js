#!/usr/bin/env node

const https = require('https');
const http = require('http');

const SITE_URL = 'https://centrifugal-island.nyc';

function checkStatus(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        const req = client.get(url + '/status', (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const status = JSON.parse(data);
                    resolve(status);
                } catch (error) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function main() {
    console.log('🌍 ISS Live Background 배포 상태 확인 중...\n');
    
    try {
        const status = await checkStatus(SITE_URL);
        
        console.log('✅ 서버 상태:', status.status);
        console.log('🔧 모드:', status.mode);
        console.log('👥 연결된 클라이언트:', status.clients);
        console.log('⏰ 마지막 업데이트:', new Date(status.timestamp).toLocaleString());
        console.log('\n🌐 사이트 주소:', SITE_URL);
        
        if (status.clients > 0) {
            console.log('🎉 실시간 연결이 활성화되어 있습니다!');
        } else {
            console.log('💡 브라우저에서 사이트를 열어보세요.');
        }
        
    } catch (error) {
        console.error('❌ 서버 연결 실패:', error.message);
        console.log('\n🔧 문제 해결 방법:');
        console.log('1. Render.com 대시보드에서 서비스 상태 확인');
        console.log('2. 로그에서 오류 메시지 확인');
        console.log('3. 환경 변수 설정 확인');
    }
}

if (require.main === module) {
    main();
}

module.exports = { checkStatus }; 