// Локальный сервер, повторяющий раскладку GitHub Pages: проект отдаётся по адресу
// /ber-bar-seasonal-engine/**, поэтому абсолютные адреса публикации проверяются с диска.
// Запуск: node local-redesign/tools-video/serve-pages.mjs [port]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const port = Number(process.argv[2] ?? 4192);
const root = 'C:/Users/ASON/Desktop/Ber&Bar';
const prefix = '/ber-bar-seasonal-engine';
const kinds = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = path.join(root, url.startsWith(prefix) ? url.slice(prefix.length) : url);
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('не найдено: ' + url);
    return;
  }
  if (!file.startsWith(path.resolve(root))) { res.writeHead(403).end('нельзя'); return; }
  try {
    const data = fs.readFileSync(file);
    const type = kinds[path.extname(file).toLowerCase()] ?? 'application/octet-stream';
    const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Number(range[2]) : data.length - 1;
      const part = data.subarray(start, end + 1);
      res.writeHead(206, { 'content-type': type, 'accept-ranges': 'bytes', 'content-range': `bytes ${start}-${end}/${data.length}`, 'content-length': part.length }).end(part);
      return;
    }
    res.writeHead(200, { 'content-type': type, 'content-length': data.length, 'accept-ranges': 'bytes', 'cache-control': 'no-store' }).end(data);
  } catch (e) {
    res.writeHead(500).end(String(e.message));
  }
}).listen(port, '127.0.0.1', () => console.log(`страницы: http://127.0.0.1:${port}${prefix}/prevyu/lid/bp-glavnaya.html`));
