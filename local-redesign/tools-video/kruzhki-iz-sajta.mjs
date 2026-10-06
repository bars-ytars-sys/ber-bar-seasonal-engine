// Круглые фото категорий из ОБЛОЖЕК действующих страниц домов «Барских полей» (каталог от 04.10.2026):
// скачиваем обложку, режем квадрат и сохраняем маленький webp без правки цвета.
// Запуск: node local-redesign/tools-video/kruzhki-iz-sajta.mjs
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = 'C:/Users/ASON/Desktop/Ber&Bar';
const outDir = path.join(root, 'demo/assets/znachki');
fs.mkdirSync(outDir, { recursive: true });

// Обложки взяты из prevyu/lid/stay-data.js — это фото действующих страниц домов БП (проверено 04.10.2026)
const items = [
  { name: 'Шале', url: 'https://static.tildacdn.com/tild3931-6466-4330-b739-303235643534/IMG_6543.PNG', out: 'kategoriya-shale.webp' },
  { name: 'Барский дом', url: 'https://static.tildacdn.com/tild3536-3139-4464-b561-393636653063/photo_2026-05-07_01-.jpg', out: 'kategoriya-barskij-dom.webp' },
  { name: 'Барнхаус', url: 'https://static.tildacdn.com/tild3038-3830-4637-b765-353136383838/photo_2026-05-06_23-.jpg', out: 'kategoriya-barnhaus.webp' },
  { name: 'Гарден', url: 'https://static.tildacdn.com/tild6462-3331-4663-a539-303537383266/photo_2026-05-06_18-.jpg', out: 'kategoriya-garden.webp' },
  { name: 'Ривер', url: 'https://static.tildacdn.com/tild3833-6265-4131-b663-366363643166/photo_2026-05-06_16-.jpg', out: 'kategoriya-river.webp' },
];

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 300, height: 300 } });
fs.writeFileSync(path.join(root, 'local-redesign/proof/bp-strip/holst-kruzhki.html'), '<!doctype html><meta charset="utf-8"><body></body>');
await page.goto('http://127.0.0.1:4191/local-redesign/proof/bp-strip/holst-kruzhki.html', { waitUntil: 'load' });

const report = [];
for (const it of items) {
  const res = await fetch(it.url);
  if (!res.ok) throw new Error(`${it.name}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get('content-type') || 'image/jpeg';
  const dataUrl = `data:${type};base64,${buf.toString('base64')}`;
  const out = await page.evaluate(async (src) => {
    const img = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
    const size = 220;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    // центр по горизонтали, чуть выше центра по вертикали — так в кружке виден дом, а не газон
    const sx = Math.round((img.naturalWidth - side) / 2);
    const sy = Math.round((img.naturalHeight - side) * 0.38);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    return { data: c.toDataURL('image/webp', 0.85), w: img.naturalWidth, h: img.naturalHeight };
  }, dataUrl);
  const webp = Buffer.from(out.data.split(',')[1], 'base64');
  fs.writeFileSync(path.join(outDir, it.out), webp);
  report.push({ name: it.name, source: it.url, sourceSize: `${out.w}x${out.h}`, bytes: webp.length });
  console.log(it.name.padEnd(13), `${out.w}x${out.h}`.padEnd(11), '->', it.out, Math.round(webp.length / 1024) + ' КБ');
}
await browser.close();
fs.writeFileSync(path.join(root, 'local-redesign/proof/bp-strip/kruzhki.json'), JSON.stringify({ date: new Date().toISOString(), note: 'обложки со страниц домов БП', items: report }, null, 2));
