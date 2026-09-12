/**
 * Правка заголовков и описаний страниц Тильды через залогиненный Chrome.
 * Chrome запущен с --remote-debugging-port=9333, владелец в нём вошёл в Тильду.
 *
 *   node tools/tilda-seo.mjs <задания.json>
 *
 * Задание: { pageid, заголовок?, описание?, og_заголовок?, копировать_описание? }
 * Как Тильда собирает теги (проверено 11.09.2026):
 *   <title>          = meta_title || title
 *   description      = meta_descr || descr
 *   og:title         = fb_title   || title
 *   og:description   = fb_descr   || descr
 * Поэтому «заголовок» пишем в meta_title, «описание» — в descr (и в meta_descr /
 * fb_descr, если они заполнены и перебили бы его).
 * Каждая страница: правка → «Сохранить изменения» → перечитать → «Опубликовать».
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const задания = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const ждать = мс => new Promise(r => setTimeout(r, мс));
const b = await chromium.connectOverCDP('http://127.0.0.1:9333', { timeout: 30000 });
const ctx = b.contexts()[0];
const ПОЛЯ = ['title', 'descr', 'meta_title', 'meta_descr', 'fb_title', 'fb_descr'];

for (const з of задания) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: 1400, height: 900 });
  const редактор = 'https://tilda.ru/page/?pageid=' + з.pageid;
  const открыть = async () => {
    await p.goto(редактор, { waitUntil: 'domcontentloaded', timeout: 60000 }); await ждать(6000);
    await p.evaluate(() => [...document.querySelectorAll('button.tp-menu__burger__item')].find(e => /Настройки страницы/.test(e.textContent)).click());
    await p.waitForSelector('input[name="descr"]', { state: 'attached', timeout: 20000 }); await ждать(1500);
  };
  const прочесть = () => p.evaluate(n => ({
    ...Object.fromEntries(n.map(x => [x, document.querySelector('[name="' + x + '"]')?.value ?? null])),
    nosearch: document.querySelector('[name="nosearch"]')?.checked ?? null
  }), ПОЛЯ);
  try {
    await открыть();
    const было = await прочесть();
    const план = await p.evaluate(з => {
      const g = n => document.querySelector('[name="' + n + '"]');
      const out = {};
      const set = (n, v) => { const e = g(n); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); out[n] = v; };
      if (з.заголовок) set('meta_title', з.заголовок);
      if (з.og_заголовок) set('fb_title', з.og_заголовок);
      if (з.описание) {
        set('descr', з.описание);
        if (g('meta_descr').value.trim()) set('meta_descr', з.описание);
        if (g('fb_descr').value.trim()) set('fb_descr', з.описание);
      }
      if (з.копировать_описание) {
        const d = (g('meta_descr').value || g('descr').value).trim();
        if (d) set('fb_descr', d);
      }
      /* noindex: галочка «Запретить поисковикам индексировать эту страницу» */
      if (з.noindex && !g('nosearch').checked) {
        const e = g('nosearch'); e.checked = true;
        e.dispatchEvent(new Event('change', { bubbles: true }));
        out.nosearch = true;
      }
      return out;
    }, з);
    if (!Object.keys(план).length) { console.log(з.pageid, 'НЕЧЕГО МЕНЯТЬ', JSON.stringify(было)); continue; }
    await p.evaluate(() => document.querySelector('.js-ps-popup-submit').click());
    await ждать(5000);
    await открыть();
    const стало = await прочесть();
    const ок = Object.entries(план).every(([n, v]) => стало[n] === v);
    if (!ок) { console.log(з.pageid, 'НЕ СОХРАНИЛОСЬ', JSON.stringify({ план, стало })); continue; }
    await p.goto(редактор, { waitUntil: 'domcontentloaded' }); await ждать(6000);
    const опубл = await p.evaluate(() => { const btn = document.querySelector('.tp-dropdown__item-icon_publish')?.closest('button'); if (btn) { btn.click(); return true; } return false; });
    await ждать(10000);
    console.log(з.pageid, 'сохранено', опубл ? '+ опубликовано' : 'НО КНОПКА ПУБЛИКАЦИИ НЕ НАЙДЕНА', '| было:', JSON.stringify(Object.fromEntries(Object.keys(план).map(n => [n, (было[n] || '').slice(0, 50)]))));
  } catch (e) {
    console.log(з.pageid, 'ОШИБКА', e.message.split('\n')[0]);
  } finally { await p.close(); }
}
process.exit(0);
