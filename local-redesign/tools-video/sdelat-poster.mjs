// Кадр-подложка первого экрана: первый кадр готовой петли → маленький webp для постера.
// Первый кадр петли совпадает с первым кадром клипа, поэтому подложка не «прыгает» при запуске видео.
// Запуск: node local-redesign/tools-video/sdelat-poster.mjs [video.mp4] [vyhod.webp]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = 'C:/Users/ASON/Desktop/Ber&Bar';
const video = process.argv[2] ?? 'demo/assets/bp-hero-barski.mp4';
const outArg = process.argv[3] ?? 'demo/assets/bp-barski-poster.webp';
const out = path.join(root, outArg);
const rel = (p) => 'http://127.0.0.1:4191/' + p.replace(/\\/g, '/').replace(root + '/', '');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
fs.writeFileSync(path.join(root, 'local-redesign/proof/bp-strip/holst-poster.html'), '<!doctype html><meta charset="utf-8"><body></body>');
await page.goto('http://127.0.0.1:4191/local-redesign/proof/bp-strip/holst-poster.html', { waitUntil: 'load' });

const data = await page.evaluate(async (src) => {
  const v = document.createElement('video');
  v.src = src; v.muted = true; v.preload = 'auto';
  await new Promise((ok, no) => { v.addEventListener('loadeddata', ok, { once: true }); v.addEventListener('error', no, { once: true }); });
  v.currentTime = 0.02;
  await new Promise((ok) => v.addEventListener('seeked', ok, { once: true }));
  const width = 1176, height = 780;
  const c = document.createElement('canvas');
  c.width = width; c.height = height;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(v, 0, 0, width, height);
  return { webp: c.toDataURL('image/webp', 0.82), jpg: c.toDataURL('image/jpeg', 0.85) };
}, rel(video));

fs.writeFileSync(out, Buffer.from(data.webp.split(',')[1], 'base64'));
fs.writeFileSync(path.join(root, 'local-redesign/proof/bp-strip/poster-pervyj-kadr.jpg'), Buffer.from(data.jpg.split(',')[1], 'base64'));
await browser.close();
console.log(`подложка: ${out} (${Math.round(fs.statSync(out).size / 1024)} КБ) из первого кадра ${video}`);
