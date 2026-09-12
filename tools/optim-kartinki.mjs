/**
 * Уменьшение тяжёлых фотографий без перезаливки — через optim.tildacdn.com.
 * Тот же приём, которым 08.09.2026 Барские поля ужали с 40,6 до 8,9 МБ.
 *
 *   node tools/optim-kartinki.mjs ecobr.ru                  — только разбор
 *   node tools/optim-kartinki.mjs ecobr.ru --sobrat         — прогреть копии и собрать код в HEAD
 *   node tools/optim-kartinki.mjs ecobr.ru --sobrat --porog=100 --limit=10 --stranica=/doma
 *
 * Как устроен приём (подробнее — СТАТУС.md):
 *   • optim.tildacdn.com/<tildID>/-/resize/<ширина>x/-/format/webp/<имя> отдаёт
 *     уменьшенную копию уже загруженного файла. Первый запрос ставит копию
 *     в обработку и редиректит на оригинал — копии надо прогреть заранее.
 *   • Фото, вставленные фоном в инлайновом style, перебиваются из HEAD правилом
 *     [style*="<tildID>"]{background-image:url(<копия>)!important} — оригинал
 *     даже не запрашивается.
 *   • Ленивые фото (адрес в data-original) правилом трогать НЕЛЬЗЯ: у заглушки
 *     тот же tildID, правило подменит её полной копией сразу, и ленивая
 *     загрузка пропадёт. Им переписывается сам data-original — скриптом, заранее.
 *   • Подсказки зеро-блока (data-tipimg-original) — так же, скриптом.
 *   • Обычные <img src> из сырого HTML из HEAD не перехватить: браузер начинает
 *     их качать раньше любого скрипта. Такие инструмент только перечисляет —
 *     лечатся перезаливкой в редакторе.
 *
 * Вес берётся по тому, что реально скачалось при прокрутке страницы.
 *
 * Результат — tools/out/HEAD-KARTINKI-<домен>.html. Сам на сайт он
 * не попадает: проверить подстановкой (kopiya-s-blokom.mjs --head=…) и
 * замером (zamer.mjs), потом отдать в буфер.
 */
import fs from 'node:fs';
import { браузер, ТЕЛЕФОН, аргументы, пауза, пролистать, выход, домен as взятьДомен } from './_obshchee.mjs';

const { флаги, позиции } = аргументы();
const домен = взятьДомен(позиции[0]);
if (!домен) {
  console.error('нужно: node tools/optim-kartinki.mjs <домен> [--sobrat] [--porog=150] [--limit=N] [--stranica=/путь]');
  process.exit(1);
}
const ПОРОГ = (+флаги.porog || 150) * 1024;
const адрес = 'https://' + домен + (флаги.stranica || '/');
const мб = б => (б / 1048576).toFixed(2);

/* ── 1. что скачивается и как вставлено ─────────────────────────────── */
const b = await браузер();
const ctx = await b.newContext(ТЕЛЕФОН);
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send('Network.enable');
const адресЗапроса = new Map();
const вес = new Map();                     /* адрес без параметров → байт */
cdp.on('Network.requestWillBeSent', e => адресЗапроса.set(e.requestId, e.request.url));
cdp.on('Network.loadingFinished', e => {
  const u = адресЗапроса.get(e.requestId);
  if (!u) return;
  const k = u.split('?')[0];
  вес.set(k, Math.max(вес.get(k) || 0, e.encodedDataLength));
});
await p.goto(адрес, { waitUntil: 'load', timeout: 240000 }).catch(() => {});
await пауза(8000);
await пролистать(p);
await пауза(8000);

const найдено = await p.evaluate(() => {
  const из = [];
  const добавить = (url, э, как) => {
    if (!url) return;
    const k = url.split('?')[0];
    if (!/^https:\/\/static\.tildacdn\.com\/tild[0-9a-f-]+\//.test(k)) return;
    const r = э.getBoundingClientRect();
    из.push({ url: k, как, w: Math.round(r.width), рек: (э.closest('.t-rec') || {}).id || '—' });
  };
  for (const э of document.querySelectorAll('[data-original]'))
    добавить(э.getAttribute('data-original'), э, 'ленивое');
  for (const э of document.querySelectorAll('[data-tipimg-original]'))
    добавить(э.getAttribute('data-tipimg-original'), э, 'подсказка');
  for (const э of document.querySelectorAll('[style*="static.tildacdn.com"]')) {
    if (э.hasAttribute('data-original')) continue;
    const м = (э.getAttribute('style') || '').match(/url\(["']?(https:\/\/static\.tildacdn\.com\/[^"')]+)/);
    if (м) добавить(м[1], э, 'фон');
  }
  for (const im of document.querySelectorAll('img')) {
    if (im.hasAttribute('data-original') || im.hasAttribute('data-tipimg-original')) continue;
    добавить(im.getAttribute('src'), im, 'img');
  }
  return из;
});
await b.close();

/* сводим по файлу: способы вставки и самая большая ширина показа */
const файлы = new Map();
for (const н of найдено) {
  const ф = файлы.get(н.url) || { url: н.url, способы: new Set(), w: 0, рек: new Set() };
  ф.способы.add(н.как); ф.w = Math.max(ф.w, н.w); ф.рек.add(н.рек);
  файлы.set(н.url, ф);
}
let список = [...файлы.values()]
  .map(ф => ({ ...ф, вес: вес.get(ф.url) || 0 }))
  .filter(ф => ф.вес >= ПОРОГ && !/\.svg$/i.test(ф.url))
  .sort((a, b) => b.вес - a.вес);
if (флаги.limit) список = список.slice(0, +флаги.limit);

for (const ф of список) {
  /* чем лечим: ленивое и подсказки — скриптом; фон — правилом; <img> — никак */
  ф.лечение = ф.способы.has('ленивое') || ф.способы.has('подсказка') ? 'скрипт'
            : ф.способы.has('фон') ? 'css' : 'нельзя';
  /* ширина копии: двойная от показа под экраны 2×, в пределах 600…1200;
     скрытые (в закрытых окнах, за краем) — 900; только подсказки — 400 */
  ф.ширина = ф.способы.size === 1 && ф.способы.has('подсказка') ? 400
           : ф.w ? Math.min(1200, Math.max(ф.w * 2, 600)) : 900;
  const [, id, имя] = ф.url.match(/\/(tild[0-9a-f-]+)\/(.+)$/);
  ф.id = id;
  ф.копия = 'https://optim.tildacdn.com/' + id + '/-/resize/' + ф.ширина + 'x/-/format/webp/' + имя;
}

console.log('\n=== ' + адрес + ' — фото тяжелее ' + (ПОРОГ / 1024) + ' КБ: ' + список.length + ', ' +
  мб(список.reduce((s, ф) => s + ф.вес, 0)) + ' МБ ===');
for (const ф of список)
  console.log('  ' + мб(ф.вес).padStart(5) + ' МБ  ' + [...ф.способы].join('+').padEnd(18) + ' → ' +
    ф.лечение.padEnd(7) + ' показ ' + String(ф.w || 'скрыт').padEnd(6) + ' ' +
    [...ф.рек].slice(0, 2).join(',').padEnd(30) + ' ' + ф.url.split('/').pop().slice(0, 32));
const нельзя = список.filter(ф => ф.лечение === 'нельзя');
if (нельзя.length)
  console.log('\n  ' + нельзя.length + ' шт — обычные <img> в сыром HTML: из HEAD не перехватить, только перезаливкой.');

if (!флаги.sobrat) {
  console.log('\nразбор готов. Прогреть копии и собрать код: добавьте --sobrat');
  process.exit(0);
}

/* ── 2. прогрев копий ───────────────────────────────────────────────── */
async function взятьКопию(u) {
  const о = await fetch(u, { headers: { Referer: 'https://' + домен + '/' } });
  const buf = Buffer.from(await о.arrayBuffer());
  const webp = buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP';
  return webp ? buf.length : 0;
}
const лечим = список.filter(ф => ф.лечение !== 'нельзя');
console.log('\nпрогреваем ' + лечим.length + ' копий…');
let ждут = лечим;
for (let заход = 0; заход < 4 && ждут.length; заход++) {
  if (заход) await пауза(8000);
  const ещё = [];
  for (const ф of ждут) {
    ф.стало = await взятьКопию(ф.копия).catch(() => 0);
    if (!ф.стало) ещё.push(ф);
  }
  console.log('  заход ' + (заход + 1) + ': готово ' + (лечим.length - ещё.length) + ' из ' + лечим.length);
  ждут = ещё;
}
const готовы = лечим.filter(ф => ф.стало);
if (ждут.length) console.log('  не отдались, в код не попадут: ' + ждут.map(ф => ф.url.split('/').pop()).join(', '));

/* ── 3. код для HEAD ────────────────────────────────────────────────── */
const css = готовы.filter(ф => ф.лечение === 'css').map(ф =>
  '/* ' + [...ф.рек].slice(0, 2).join(',') + ' · ' + ф.url.split('/').pop() + ' · ' +
  мб(ф.вес) + ' → ' + мб(ф.стало) + ' МБ */\n' +
  '[style*="' + ф.id + '"]{background-image:url("' + ф.копия + '")!important}').join('\n');
const карта = Object.fromEntries(готовы.filter(ф => ф.лечение === 'скрипт').map(ф => [ф.id, ф.ширина]));
const было = готовы.reduce((s, ф) => s + ф.вес, 0);
const стало = готовы.reduce((s, ф) => s + ф.стало, 0);
const дата = new Date().toISOString().slice(0, 10);

const блок = `<!-- УМЕНЬШЕННЫЕ КАРТИНКИ — код для ${домен}
     Собрано tools/optim-kartinki.mjs ${дата}, страница ${адрес}.
     Тильда → Настройки сайта → Вставка кода → «HTML-код для вставки внутрь
     тега HEAD». Именно в HEAD: правила должны сработать до отрисовки.

     Покрыто файлов: ${готовы.length}, их вес ${мб(было)} МБ → ${мб(стало)} МБ.
     Фоны в инлайновом style — правилами ниже (${готовы.filter(ф => ф.лечение === 'css').length} шт).
     Ленивые фото и подсказки — скриптом: переписывается data-original
     и data-tipimg-original (${Object.keys(карта).length} шт по карте ширин, остальные —
     шириной 900 и 400 по умолчанию).

     Замените фото в Тильде — у нового файла будет новый адрес, правило
     перестанет совпадать, покажется оригинал. Сломать нельзя, но после
     большой замены фото код стоит пересобрать.
     -->
<style>
${css}
</style>

<script>
(function () {
  /* ширина копии по файлу; чего нет в карте — по умолчанию */
  var КАРТА = ${JSON.stringify(карта)};
  var НАЧАЛО = 'https://static.tildacdn.com/';

  function копия(адрес, поУмолчанию) {
    if (!адрес || адрес.indexOf(НАЧАЛО) !== 0) return null;
    var хвост = адрес.slice(НАЧАЛО.length), черта = хвост.indexOf('/');
    if (черта < 1) return null;
    var файл = хвост.slice(0, черта), имя = хвост.slice(черта + 1);
    if (файл.indexOf('tild') !== 0 || !имя || /\\.svg$/i.test(имя)) return null;
    return 'https://optim.tildacdn.com/' + файл + '/-/resize/' +
      (КАРТА[файл] || поУмолчанию) + 'x/-/format/webp/' + имя;
  }

  function пройтись() {
    var сп = document.querySelectorAll(
      '[data-original]:not([data-optim]), [data-tipimg-original]:not([data-optim])');
    for (var i = 0; i < сп.length; i++) {
      var э = сп[i];
      э.setAttribute('data-optim', '1');
      var атр = э.hasAttribute('data-original') ? 'data-original' : 'data-tipimg-original';
      var новый = копия(э.getAttribute(атр), атр === 'data-original' ? 900 : 400);
      if (новый) э.setAttribute(атр, новый);
    }
  }

  пройтись();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', пройтись);
  /* блоки Тильды доезжают позже — досматриваем */
  var т = setInterval(пройтись, 300);
  setTimeout(function () { clearInterval(т); пройтись(); }, 20000);
})();
</script>
`;
const файл = выход('HEAD-KARTINKI-' + домен + '.html');
fs.writeFileSync(файл, блок, 'utf8');
console.log('\nготово: ' + готовы.length + ' файлов, ' + мб(было) + ' МБ → ' + мб(стало) + ' МБ');
console.log('код: ' + файл);
console.log('дальше: node tools/kopiya-s-blokom.mjs ' + адрес + ' --head=' + файл + ' --otkryt');
