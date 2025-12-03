const startTime = Date.now();

async function checkServerStatus() {
  const statusEl = document.getElementById('server-status');
  try {
    const pingStart = Date.now();
    const response = await fetch(location.origin + '/uv/uv.bundle.js', { method: 'HEAD' });
    const pingTime = Date.now() - pingStart;
    
    if (response.ok) {
      statusEl.innerHTML = `
        <span class="status-indicator online"></span>
        <span>オンライン</span>
      `;
      document.getElementById('ping').textContent = `${pingTime}ms`;
    } else {
      throw new Error('Server not responding');
    }
  } catch (error) {
    statusEl.innerHTML = `
      <span class="status-indicator offline"></span>
      <span>オフライン</span>
    `;
    document.getElementById('ping').textContent = 'N/A';
  }
}

async function fetchServerIPInfo() {
  try {
    const response = await fetch(`https://ipapi.co/${location.hostname}/json/`);
    const data = await response.json();
    
    document.getElementById('ip-address').textContent = location.hostname;
    
    if (data.city && data.region && data.country_name) {
      document.getElementById('location').textContent = 
        `${data.city}, ${data.region}, ${data.country_name}`;
    } else {
      document.getElementById('location').textContent = 'ローカル環境';
    }
    
    document.getElementById('isp').textContent = data.org || 'N/A';
  } catch (error) {
    console.error('サーバー情報の取得に失敗:', error);
    document.getElementById('ip-address').textContent = location.hostname;
    
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      document.getElementById('location').textContent = 'ローカル環境';
      document.getElementById('isp').textContent = 'ローカルホスト';
    } else {
      document.getElementById('location').textContent = '取得中...';
      document.getElementById('isp').textContent = '取得中...';
      
      setTimeout(async () => {
        try {
          const geoResponse = await fetch(`https://get.geojs.io/v1/ip/geo/${location.hostname}.json`);
          const geoData = await geoResponse.json();
          
          if (geoData.city && geoData.region && geoData.country) {
            document.getElementById('location').textContent = 
              `${geoData.city}, ${geoData.region}, ${geoData.country}`;
          } else {
            document.getElementById('location').textContent = 'N/A';
          }
          
          document.getElementById('isp').textContent = geoData.organization || 'N/A';
        } catch (err) {
          document.getElementById('location').textContent = 'N/A';
          document.getElementById('isp').textContent = 'N/A';
        }
      }, 1000);
    }
  }
}

function displayServerInfo() {
  const protocol = location.protocol.replace(':', '').toUpperCase();
  const host = location.hostname;
  const port = location.port || (location.protocol === 'https:' ? '443' : '80');
  
  document.getElementById('protocol').textContent = protocol;
  document.getElementById('host').textContent = host;
  document.getElementById('port').textContent = port;
  
  const serverUrl = `${location.protocol}//${location.host}`;
  document.getElementById('user-agent').textContent = serverUrl;
  
  const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
  document.getElementById('wisp-url').textContent = wispUrl;
}

async function getUltravioletVersion() {
  try {
    const response = await fetch('/uv/uv.bundle.js');
    const text = await response.text();
    const match = text.match(/version['"]\s*:\s*['"]([^'"]+)['"]/i);
    return match ? match[1] : 'Unknown';
  } catch {
    return 'N/A';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  displayServerInfo();
  checkServerStatus();
  fetchServerIPInfo();
  
  const uvVersion = await getUltravioletVersion();
  if (uvVersion !== 'N/A') {
    const userAgentEl = document.getElementById('user-agent');
    userAgentEl.textContent = `${location.protocol}//${location.host} (Ultraviolet ${uvVersion})`;
  }
});
