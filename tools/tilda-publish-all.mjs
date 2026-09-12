/**
 * «Опубликовать все страницы» проекта Тильды через залогиненный Chrome (порт 9333).
 *
 *   node tools/tilda-publish-all.mjs 4027012      — Берёзовая роща
 *   node tools/tilda-publish-all.mjs 8177746      — Барские поля
 *
 * У проектов с папками Тильда спрашивает «Публиковать все / Только в этой
 * папке» — выбираем «Публиковать все». Публикацию ведёт открытая вкладка:
 * закроешь раньше «Опубликовано N из N» — остальные страницы останутся
 * старыми (11.09.2026 так успели 19 из 95).
 */
import { chromium } from 'playwright-core';
const projectid = process.argv[2];
if (!/^\d+$/.test(projectid || '')) { console.error('нужно: node tools/tilda-publish-all.mjs <projectid>'); process.exit(1); }
const ждать = мс => new Promise(r => setTimeout(r, мс));
const b = await chromium.connectOverCDP('http://127.0.0.1:9333', { timeout: 30000 });
const p = await b.contexts()[0].newPage();
await p.setViewportSize({ width: 1400, height: 900 });
p.on('dialog', d => d.accept());
await p.goto('https://tilda.ru/projects/?projectid=' + projectid, { waitUntil: 'domcontentloaded', timeout: 60000 });
await ждать(6000);
await p.evaluate(id => td__projectPublish(id), projectid);
await ждать(3000);
const спросили = await p.evaluate(() => {
  const к = [...document.querySelectorAll('button.td-modal__button')].find(e => e.offsetParent && e.textContent.trim() === 'Публиковать все');
  if (к) { к.click(); return true; } return false;
});
console.log(спросили ? 'окно с папками: выбрано «Публиковать все»' : 'окна с папками не было');
const начало = Date.now();
let прошлое = '';
while (Date.now() - начало < 20 * 60 * 1000) {
  await ждать(5000);
  const т = await p.evaluate(() => { const м = document.body.innerText.match(/Опубликовано\s+(\d+)\s+страниц\S*\s+из\s+(\d+)/i); return м ? [+м[1], +м[2]] : null; });
  if (т) {
    const строка = т[0] + ' из ' + т[1];
    if (строка !== прошлое) { console.log(Math.round((Date.now() - начало) / 1000) + ' с: опубликовано ' + строка); прошлое = строка; }
    if (т[0] >= т[1] && т[1] > 0) { console.log('готово'); break; }
  } else if (прошлое) {
    /* окно прогресса закрылось — значит, закончила */
    console.log('окно прогресса закрылось после «' + прошлое + '»'); break;
  }
}
await ждать(3000);
await p.close();
process.exit(0);
