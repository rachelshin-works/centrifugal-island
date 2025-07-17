// 환경 설정 관리
require('dotenv').config();

const config = {
    // 서버 설정
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // CORS 설정
    allowedOrigins: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : [
            'https://centrifugal-island.onrender.com',
            'https://centrifugal-island.nyc',
            'https://www.centrifugal-island.nyc',
            'http://localhost:3000',
            'http://localhost:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8080'
        ],
    
    // WebSocket 설정
    wsHeartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL) || 30000,
    
    // ISS 스트림 설정
    issUpdateInterval: parseInt(process.env.ISS_UPDATE_INTERVAL) || 5000,
    issTimeout: parseInt(process.env.ISS_TIMEOUT) || 20000,
    
    // 로깅 설정
    logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = config; 