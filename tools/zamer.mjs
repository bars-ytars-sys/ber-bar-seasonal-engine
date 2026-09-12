/**
 * Замер скорости страницы в условиях мобильного PageSpeed:
 * Moto G Power, медленный 4G, процессор ×4.
 *
 *   node tools/zamer.mjs https://ecobr.ru/
 *   node tools/zamer.mjs https://ecobr.ru/ --kompyuter --bystro --zhdat=90
 *
 * Главное, что смотреть: наступает ли событие load. Не наступает —
 * PageSpeed выдаст ошибку вместо оценок, как было на Барских полях
 * 08.09.2026 (40 МБ картинок, 64 запроса висели и через 70 секунд).
 * Квота публичного API PageSpeed без ключа быстро кончается, поэтому
 * меряем сами.
 */
import fs from 'node:fs';
import path from 'node:path';
import { браузер, ТЕЛЕФОН, КОМПЬЮТЕР, замедлить, аргументы, пауза, КОРЕНЬ } from './_obshchee.mjs';

const { флаги, позиции } = аргументы();
const адрес = позиции[0];
if (!адрес) {
  console.error('нужно: node tools/zamer.mjs <адрес> [--kompyuter] [--bystro] [--zhdat=75]');
  process.exit(1);
}
const ЖДАТЬ = (+флаги.zhdat || 75) * 1000;

const b = await браузер();
const ctx = await b.newContext(флаги.kompyuter ? КОМПЬЮТЕР : ТЕЛЕФОН);
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send('Network.enable');
if (!флаги.bystro) await замедлить(cdp);

const запросы = new Map();
let t0 = 0;
cdp.on('Network.requestWillBeSent', e => {
  if (!t0) t0 = e.timestamp;
  запросы.set(e.requestId, { url: e.request.url, тип: e.type || '?', старт: (e.timestamp - t0) * 1000 });
});
cdp.on('Network.loadingFinished', e => {
  const r = запросы.get(e.requestId);
  if (r) { r.вес = e.encodedDataLength; r.конец = (e.timestamp - t0) * 1000; }
});
cdp.on('Network.loadingFailed', e => { const r = запросы.get(e.requestId); if (r) r.сбой = true; });

/* --head=<файл> — добавить код из файла в начало страницы: замер «стало» до
   публикации. Не через перехват документа: route.fulfill отдаёт HTML несжатым
   (2,6 МБ вместо 0,24 у ecobr.ru) и на медленной сети портит FCP и LCP.
   Init-скрипт срабатывает до разбора страницы — стили успевают раньше картинок. */
if (typeof флаги.head === 'string') {
  const файл = fs.readFileSync(path.resolve(КОРЕНЬ, флаги.head), 'utf8');
  const css = [...файл.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
  const js = [...файл.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  /* В момент init-скрипта элемента <html> ещё нет — appendChild падает.
     adoptedStyleSheets работают на пустом документе. */
  await p.addInitScript(([css, js]) => {
    const лист = new CSSStyleSheet(); лист.replaceSync(css);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, лист];
    window.__вставка = 'ok';
    for (const код of js) { try { new Function(код)(); } catch (e) { window.__вставка = 'ошибка: ' + e.message; } }
  }, [css, js]);
  console.log('подставлено из ' + флаги.head + ': стилей ' + css.length + ' симв., скриптов ' + js.length);
}

const старт = Date.now();
let load = null;
p.on('load', () => { load ??= Date.now() - старт; });
await p.goto(адрес, { waitUntil: 'commit', timeout: 180000 });
const край = Date.now() + ЖДАТЬ;
while (Date.now() < край && !load) await пауза(500);
await пауза(3000);

const м = await p.evaluate(() => new Promise(res => {
  const out = { fcp: null, lcp: null, lcpЭлемент: null, lcpФайл: null, cls: 0 };
  for (const e of performance.getEntriesByType('paint'))
    if (e.name === 'first-contentful-paint') out.fcp = Math.round(e.startTime);
  new PerformanceObserver(l => {
    const e = l.getEntries().at(-1);
    if (!e) return;
    out.lcp = Math.round(e.startTime);
    out.lcpФайл = e.url || null;
    if (e.element) {
      const cls = String(e.element.className || '').split(' ').filter(Boolean).slice(0, 2).join('.');
      out.lcpЭлемент = e.element.tagName + (cls ? '.' + cls : '');
      if (!e.url) {
        const bg = getComputedStyle(e.element).backgroundImage;
        if (bg && bg !== 'none') out.lcpФайл = bg.slice(0, 160);
      }
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value; })
    .observe({ type: 'layout-shift', buffered: true });
  setTimeout(() => res(out), 400);
}));

const готовые = [...запросы.values()].filter(r => r.вес != null);
const висят = [...запросы.values()].filter(r => r.вес == null && !r.сбой);
const сумма = готовые.reduce((s, r) => s + r.вес, 0);
const с = мс => мс == null ? '—' : (мс / 1000).toFixed(1) + ' с';

console.log('\n=== ' + адрес + (флаги.kompyuter ? ' — компьютер' : ' — телефон') +
  (флаги.bystro ? ', без замедления' : ', медленный 4G + CPU ×4') + ' ===');
console.log('полная загрузка (load): ' + (load ? с(load)
  : 'НЕ НАСТУПИЛА за ' + (ЖДАТЬ / 1000) + ' с  ← PageSpeed выдаст ошибку'));
console.log('FCP ' + с(м.fcp) + '   LCP ' + с(м.lcp) + '   CLS ' + м.cls.toFixed(3));
console.log('LCP-элемент: ' + (м.lcpЭлемент || '—') + '   ' +
  (м.lcpФайл ? м.lcpФайл.split('/').pop().slice(0, 60) : ''));
console.log('скачано ' + (сумма / 1048576).toFixed(2) + ' МБ за ' + готовые.length +
  ' запросов; не завершено ' + висят.length);

const поТипу = {};
for (const r of готовые) { (поТипу[r.тип] ||= { n: 0, вес: 0 }); поТипу[r.тип].n++; поТипу[r.тип].вес += r.вес; }
console.log('\n— по типам —');
Object.entries(поТипу).sort((a, b) => b[1].вес - a[1].вес).forEach(([т, v]) =>
  console.log('  ' + т.padEnd(12) + String(v.n).padStart(4) + ' шт  ' + (v.вес / 1048576).toFixed(2).padStart(6) + ' МБ'));

console.log('\n— 15 самых тяжёлых —');
готовые.sort((a, b) => b.вес - a.вес).slice(0, 15).forEach(r =>
  console.log('  ' + (r.вес / 1024).toFixed(0).padStart(6) + ' КБ  ' + r.тип.padEnd(10) +
    ' старт ' + с(r.старт).padStart(7) + '  ' + r.url.slice(0, 100)));

if (висят.length) {
  console.log('\n— не завершились —');
  висят.sort((a, b) => a.старт - b.старт).slice(0, 12).forEach(r =>
    console.log('  старт ' + с(r.старт).padStart(7) + '  ' + r.тип.padEnd(10) + ' ' + r.url.slice(0, 100)));
}
await b.close();
