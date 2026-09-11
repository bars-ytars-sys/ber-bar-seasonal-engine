/**
 * Постер «Зимняя сказка» для Барских полей, 1080×1350.
 * Сверху — фото дома в новогодних огнях (demo/assets/bp-zima-ng-a.png,
 * A-фрейм с сайта /new-year, огни и ёлка дорисованы kie.ai), снизу —
 * текст на сплошной плашке: по замечанию заказчика «плохо видно, что
 * написано на картинке» текст больше не лежит поверх фото.
 *
 *   node tools/build-zima-poster.mjs   →  demo/assets/bp-zima-poster.png
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const КОРЕНЬ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/* 4K-версия (nano-banana-pro «один в один»); сервис отдаёт JPEG под именем .png */
const байтыФото = fs.readFileSync(path.join(КОРЕНЬ, 'demo/assets/bp-hero-river4.jpg'));
const фото = 'data:' + (байтыФото[0] === 0xFF ? 'image/jpeg' : 'image/png') + ';base64,' + байтыФото.toString('base64');
const логотип = await (await fetch('https://static.tildacdn.com/tild3262-6436-4764-a235-366133623239/photo.svg')).text();
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500&family=Rubik:wght@300;400;500&display=swap">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;background:#2b433b;color:#eee5d5;font-family:Rubik,Arial,sans-serif;overflow:hidden}
.фото{height:780px;background:url('${фото}') center 42%/cover no-repeat;position:relative}
.фото::after{content:'';position:absolute;left:0;right:0;bottom:0;height:120px;background:linear-gradient(transparent,#2b433b)}
/* логотип — на плашке, а не на фото: на светящейся крыше он не читался */
.лого{text-align:center;margin:-6px 0 14px}
.лого svg{width:190px;height:auto;opacity:.9}
.низ{padding:0 90px;text-align:center}
h1{font-family:Lora,Georgia,serif;font-weight:400;font-size:112px;line-height:.95;margin-top:-10px}
.даты{margin-top:18px;font-size:34px;color:#ee995d}
ul{list-style:none;margin:34px auto 0;text-align:left;width:780px}
li{font-size:28px;line-height:1.35;margin-bottom:14px;padding-left:52px;text-indent:-52px}
li span{display:inline-block;width:52px;text-indent:0}
.кнопка{display:inline-block;margin-top:22px;padding:18px 44px;border-radius:6px;background:#995d2f;color:#fff;font-size:28px}
.контакты{margin-top:20px;font-size:24px;opacity:.8}
</style></head><body>
<div class="фото"></div>
<div class="низ">
  <div class="лого">${логотип}</div>
  <h1>Зимняя сказка</h1>
  <div class="даты">Новогодние праздники 31.12 — 10.01</div>
  <ul>
    <li><span>🎄</span>Дом уже наряжен: ёлка и гирлянды с порога</li>
    <li><span>🛁</span>Банный чан у каждого дома — прямо в снегу</li>
    <li><span>🎅</span>Дед Мороз, лотерея, каток и лесная горка</li>
  </ul>
  <div class="кнопка">Забронировать новогодний отдых</div>
  <div class="контакты">barskie-polya.ru · +7 (495) 150-39-08</div>
</div>
</body></html>`;
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
await p.setContent(html, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
const куда = path.join(КОРЕНЬ, 'demo/assets/bp-zima-poster.png');
await p.screenshot({ path: куда });
await b.close();
console.log('постер:', куда, (fs.statSync(куда).size / 1024).toFixed(0) + ' КБ');
