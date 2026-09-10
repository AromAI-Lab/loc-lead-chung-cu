/**
 * Máy chủ chạy thử trên máy cá nhân. KHÔNG dùng cho production.
 * Mục đích: xem sản phẩm chạy đúng trước khi deploy lên Vercel.
 *
 * Chạy:  node dev-server.js     rồi mở http://localhost:3000
 * Đọc biến môi trường từ file .env nếu có (file .env KHÔNG lên GitHub).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const goc = path.dirname(fileURLToPath(import.meta.url));

// Nạp .env đơn giản, không cần thư viện ngoài
try {
  for (const d of fs.readFileSync(path.join(goc, '.env'), 'utf8').split('\n')) {
    const m = d.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  console.log('Đã nạp .env');
} catch { console.log('Không có .env — lớp AI sẽ tắt, lớp luật cứng vẫn chạy'); }

const KIEU = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.md': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml'
};

const may = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');

  if (u.pathname === '/api/score') {
    let than = '';
    for await (const c of req) than += c;
    try { req.body = JSON.parse(than || '{}'); } catch { req.body = {}; }
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(o)); };
    const { default: handler } = await import('./api/score.js');
    return handler(req, res);
  }

  let p = u.pathname === '/' ? '/index.html' : u.pathname;
  let tep = p.startsWith('/docs/')
    ? path.join(goc, p)
    : path.join(goc, 'public', p);

  if (!tep.startsWith(goc)) { res.statusCode = 403; return res.end('Cấm'); }

  fs.readFile(tep, (e, d) => {
    if (e) { res.statusCode = 404; return res.end('Không tìm thấy: ' + p); }
    res.setHeader('content-type', KIEU[path.extname(tep)] || 'application/octet-stream');
    res.end(d);
  });
});

const CONG = process.env.PORT || 3000;
may.listen(CONG, () => console.log(`Đang chạy: http://localhost:${CONG}`));
