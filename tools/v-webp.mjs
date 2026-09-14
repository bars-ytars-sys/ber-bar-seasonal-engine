/**
 * Сжатие JPEG/PNG в webp через Chrome (без sharp и прочих пакетов).
 *   node tools/v-webp.mjs <ширина> <качество 0..1> <файл> [файл…]
 * Рядом с каждым файлом кладёт <имя>.webp той же пропорции.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const [ширина, качество, ...файлы] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage();
for (const ф of файлы) {
  const данные = 'data:image/' + (ф.endsWith('.png') ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(ф).toString('base64');
  const webp = await p.evaluate(async ([src, w, q]) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const k = Math.min(1, w / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    const x = c.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, c.width, c.height);
    return { url: c.toDataURL('image/webp', q), w: c.width, h: c.height };
  }, [данные, Number(ширина), Number(качество)]);
  const куда = ф.replace(/\.(jpe?g|png)$/i, '.webp');
  fs.writeFileSync(куда, Buffer.from(webp.url.split(',')[1], 'base64'));
  console.log(path.basename(куда), webp.w + '×' + webp.h, (fs.statSync(куда).size / 1024).toFixed(0) + ' КБ');
}
await b.close();
