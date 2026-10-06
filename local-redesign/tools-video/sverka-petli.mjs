// Итоговая сверка петли: насколько камера уехала за клип, совпадает ли конец с началом,
// и не выходит ли дом за кадр на всём протяжении.
// Запуск: node local-redesign/tools-video/sverka-petli.mjs <video.mp4>
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = 'C:/Users/ASON/Desktop/Ber&Bar';
const video = process.argv[2] ?? 'demo/assets/bp-hero-barski.mp4';
const rel = (p) => 'http://127.0.0.1:4191/' + p.replace(/\\/g, '/').replace(root + '/', '');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
fs.writeFileSync(path.join(root, 'local-redesign/proof/bp-strip/holst-petlya.html'), '<!doctype html><meta charset="utf-8"><body></body>');
await page.goto('http://127.0.0.1:4191/local-redesign/proof/bp-strip/holst-petlya.html', { waitUntil: 'load' });

const out = await page.evaluate(async (src) => {
  const v = document.createElement('video');
  v.src = src; v.muted = true; v.preload = 'auto';
  await new Promise((ok) => v.addEventListener('loadeddata', ok, { once: true }));
  const w = 300, h = 200;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  const frame = async (t) => {
    v.currentTime = Math.round(t * 1000) / 1000;
    await new Promise((ok) => v.addEventListener('seeked', ok, { once: true }));
    ctx.drawImage(v, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h).data;
  };
  const cols = (d) => { const a = new Float64Array(w); for (let x = 0; x < w; x++) { let s = 0; for (let y = 0; y < h; y++) s += d[(y * w + x) * 4]; a[x] = s / h; } return a; };
  const shift = (a, b, max = 100) => {
    let best = 0, bestScore = Infinity;
    for (let d = -max; d <= max; d++) {
      let sum = 0, n = 0;
      for (let x = max; x < w - max; x++) { sum += Math.abs(a[x] - b[x + d]); n++; }
      const score = sum / n;
      if (score < bestScore) { bestScore = score; best = d; }
    }
    return { d: best, score: Math.round(bestScore * 100) / 100 };
  };
  const diff = (a, b) => { let s = 0, n = 0; for (let x = 0; x < w; x++) { s += Math.abs(a[x] - b[x]); n++; } return Math.round((s / n) * 100) / 100; };
  const half = v.duration / 2;
  const f0 = cols(await frame(0.05));          // начало клипа
  const fMid = cols(await frame(half - 0.05)); // конец клипа = середина петли
  const fEnd = cols(await frame(v.duration - 0.1)); // конец петли = начало клипа
  const fMid2 = cols(await frame(half + 0.05)); // после разворота
  return {
    duration: Math.round(v.duration * 1000) / 1000,
    videoPixels: { w: v.videoWidth, h: v.videoHeight },
    cameraTravelInClipPx: Math.round(shift(f0, fMid).d * (v.videoWidth / w)),
    seamLoop: { shift: shift(fEnd, f0).d, meanDiff: diff(fEnd, f0) },
    seamMiddle: { shift: shift(fMid, fMid2).d, meanDiff: diff(fMid, fMid2) },
    controlDifferentFrame: diff(f0, fMid),
  };
}, rel(video));
await browser.close();
console.log(JSON.stringify(out, null, 1));
