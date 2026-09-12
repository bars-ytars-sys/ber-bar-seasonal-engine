/**
 * Проверка боевого сайта после публикации — целиком, а не только наши блоки.
 *
 * Ловит то, на чём мы уже обожглись:
 *   • пропавшие родные скрипты сайта (сравнение с копией «до»);
 *   • блоки, которые есть в разметке, но не показываются;
 *   • элементы, спрятанные стилями, которым некому вернуть видимость;
 *   • ошибки в консоли;
 *   • бесконечный пересчёт после изменения окна (тряска страницы).
 *
 * Запуск: node demo/check-live.mjs eco
 *         node demo/check-live.mjs bp
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const САЙТЫ = {
  eco: { адрес: 'https://ecobr.ru/', копия: 'demo/sites/eco.html' },
  bp:  { адрес: 'https://barskie-polya.ru/', копия: 'demo/sites/bp.html' }
};

const кто = process.argv[2] || 'eco';
const сайт = САЙТЫ[кто];
if (!сайт) { console.error('нужно: node demo/check-live.mjs eco|bp'); process.exit(1); }

/* Блоки, удалённые из Тильды намеренно: в копии «до» они есть, на живом сайте
   их быть и не должно. Без этого списка проверка каждый раз требует вернуть
   то, что мы сами и убрали. */
const УДАЛЁННЫЕ = {
  bp: {
    rec2463108211: 'старый опросник «Давайте подберём идеальный дом» — заменён нашим подбором (rec3608956801)'
  },
  eco: {}
};

/* Из копии «до» достаём приметы родных скриптов: по ним поймём, что пропало. */
const копия = fs.readFileSync(path.join(ROOT, сайт.копия), 'utf8');
const родные = [...копия.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
  .map(m => m[1])
  .filter(t => t.length > 200 && /rec\d{9,}/.test(t))
  .map(t => (t.match(/rec\d{9,}/g) || [])[0])
  .filter((v, i, a) => v && a.indexOf(v) === i)
  .filter(v => !(УДАЛЁННЫЕ[кто] || {})[v]);

const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });

const ошибки = [];
p.on('pageerror', e => ошибки.push(e.message.split('\n')[0].slice(0, 110)));

await p.goto(сайт.адрес, { waitUntil: 'commit', timeout: 120000 });
await p.waitForTimeout(28000);
await p.evaluate(async () => {
  const шаг = window.innerHeight * 0.8;
  for (let y = 0; y < document.body.scrollHeight; y += шаг) {
    window.scrollTo(0, y); await new Promise(r => setTimeout(r, 200));
  }
  window.scrollTo(0, 0);
});
await p.waitForTimeout(8000);

const итог = await p.evaluate((родные) => {
  const скрипты = [...document.querySelectorAll('script')].map(s => s.textContent || '');
  const пропали = родные.filter(id => !скрипты.some(t => t.includes(id)));

  /* Блок есть в разметке, но не виден — и это не всплывающее окно. */
  const мёртвые = [...document.querySelectorAll('.r.t-rec')]
    .filter(r => r.getBoundingClientRect().height < 10)
    .filter(r => !/popup/i.test(r.className) && !r.querySelector('.t-popup'))
    .map(r => r.id);

  /* Крупные элементы, спрятанные стилями: обычно их показывает свой скрипт,
     и если он пропал — на странице остаётсябелое поле. */
  const спрятаны = [...document.querySelectorAll('[class*="tn-group"], [class*="t396__group"]')]
    .filter(e => {
      const s = getComputedStyle(e);
      return (s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05) &&
             e.getBoundingClientRect().width > 300;
    }).length;

  return {
    пропавшиеСкрипты: пропали,
    блоковВсего: document.querySelectorAll('.r.t-rec').length,
    блоковВидно: [...document.querySelectorAll('.r.t-rec')]
      .filter(r => r.getBoundingClientRect().height > 10).length,
    мёртвыеБлоки: мёртвые.slice(0, 10),
    крупныхСпрятано: спрятаны,
    высотаСтраницы: document.body.scrollHeight,
    картинокНеЗагрузилось: [...document.querySelectorAll('img')]
      .filter(i => !i.complete || !i.naturalWidth).length
  };
}, родные);

/* Тряска: одно изменение окна не должно порождать лавину пересчётов. */
await p.setViewportSize({ width: 1500, height: 1000 });
const пересчётов = await p.evaluate(() => new Promise(res => {
  let n = 0; const f = () => n++;
  window.addEventListener('resize', f);
  setTimeout(() => { window.removeEventListener('resize', f); res(n); }, 2500);
}));

console.log(`\n=== ${сайт.адрес} ===`);
console.log(`блоков ${итог.блоковВсего}, видно ${итог.блоковВидно}, страница ${итог.высотаСтраницы}px`);
console.log(`картинок не загрузилось: ${итог.картинокНеЗагрузилось}`);
console.log(`крупных элементов спрятано стилями: ${итог.крупныхСпрятано}`);
console.log(`пересчётов после одного resize: ${пересчётов}` +
            (пересчётов > 3 ? '   ← ПЕТЛЯ, страницу трясёт' : ''));
console.log(`ошибки консоли: ${ошибки.length ? [...new Set(ошибки)].slice(0, 5).join(' | ') : 'нет'}`);
console.log(`пропавшие родные скрипты: ${итог.пропавшиеСкрипты.length
  ? итог.пропавшиеСкрипты.join(', ') + '   ← ВОССТАНОВИТЬ ИЗ КОПИИ'
  : 'нет'}`);
if (итог.мёртвыеБлоки.length) console.log(`блоки без высоты: ${итог.мёртвыеБлоки.join(', ')}`);

await b.close();
