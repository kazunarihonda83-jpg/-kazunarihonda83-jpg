/**
 * 簡易データ同期サーバー
 * 管理者パネルとユーザーアプリの間でデータを同期するための簡単なHTTPサーバー
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888;
const DATA_FILE = path.join(__dirname, 'shared-menu-data.json');

// 初期データ
let menuData = null;

// データファイルを読み込み
if (fs.existsSync(DATA_FILE)) {
  menuData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  console.log('📂 Loaded existing menu data');
}

const server = http.createServer((req, res) => {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET: データ取得
  if (req.method === 'GET' && req.url === '/api/menu') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(menuData || { error: 'No data' }));
    return;
  }

  // POST: データ保存
  if (req.method === 'POST' && req.url === '/api/menu') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        menuData = JSON.parse(body);
        fs.writeFileSync(DATA_FILE, JSON.stringify(menuData, null, 2));
        console.log('✅ Menu data updated:', new Date().toLocaleTimeString());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        console.error('❌ Error saving data:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to save' }));
      }
    });
    return;
  }

  // その他
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  🔄 Menu Data Sync Server                     ║
║  Port: ${PORT}                                    ║
║  Status: Running                              ║
╚════════════════════════════════════════════════╝

📡 Endpoints:
  GET  http://localhost:${PORT}/api/menu  - Get menu data
  POST http://localhost:${PORT}/api/menu  - Update menu data

💡 This server syncs data between:
  - Admin Panel (port 3003)
  - Customer App (port 3001)
`);
});
