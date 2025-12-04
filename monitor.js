// Koyeb死活監視 - 定期的にPingを送信してスリープを防止
const https = require('https');

const MONITOR_URL = 'https://sliply.koyeb.app';
const PING_INTERVAL = 5 * 60 * 1000; // 5分ごと

function sendPing() {
  const startTime = Date.now();
  
  https.get(MONITOR_URL, (res) => {
    const responseTime = Date.now() - startTime;
    console.log(`[Monitor] Ping成功: ${MONITOR_URL} (${res.statusCode}) - ${responseTime}ms`);
  }).on('error', (err) => {
    console.error(`[Monitor] Pingエラー: ${err.message}`);
  });
}

function startMonitor() {
  console.log(`[Monitor] 死活監視開始: ${MONITOR_URL} (間隔: ${PING_INTERVAL / 1000}秒)`);
  
  // 即座に1回実行
  sendPing();
  
  // 定期的に実行
  setInterval(sendPing, PING_INTERVAL);
}

// 環境変数でモニター機能を制御
if (process.env.ENABLE_MONITOR !== 'false') {
  startMonitor();
}

module.exports = { startMonitor, sendPing };
