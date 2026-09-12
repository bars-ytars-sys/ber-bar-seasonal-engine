/**
 * Проверка индексации площадки: всё ли из карты сайта отдаётся и открыто
 * роботу, нет ли битых ссылок и живых страниц, забытых в карте.
 *
 *   node tools/indeks.mjs barskie-polya.ru
 *
 * Так 10.09.2026 нашлись ссылка на политику конфиденциальности, ведущая
 * в 404 (/policy вместо /privacy), и «Питание» Барских полей, выпавшее
 * из карты сайта.
 */
import { картаСайта, аргументы, домен as взятьДомен } from './_obshchee.mjs';

const { позиции } = аргументы();
const домен = взятьДомен(позиции[0]);
if (!домен) { console.error('нужно: node tools/indeks.mjs <домен>'); process.exit(1); }

const КОРЕНЬ = 'https://' + домен;
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; ber-bar-check)' };
const норм = u => u.replace(/\/$/, '') || КОРЕНЬ;
const путь = u => u.replace(КОРЕНЬ, '') || '/';

const карта = await картаСайта(домен);
const вКарте = new Set(карта.map(норм));

const битые = [], редиректы = [], закрыты = [], чужойКанон = [];
const ссылки = new Map();                  /* адрес → на каких страницах встречается */

async function обработать(u) {
  const о = await fetch(u, { redirect: 'manual', headers: UA });
  if (о.status >= 300 && о.status < 400) { редиректы.push(путь(u) + ' → ' + о.headers.get('location')); return; }
  if (о.status !== 200) { битые.push(путь(u) + ' → ' + о.status); return; }
  const t = await о.text();
  if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(t)) закрыты.push(путь(u));
  const канон = (t.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)/i) || [])[1];
  if (канон && норм(канон) !== норм(u)) чужойКанон.push(путь(u) + ' → ' + канон);
  const re = new RegExp('href="(' + КОРЕНЬ.replace(/\./g, '\\.') + '[^"#?]*|/[a-z0-9/_-]*)"', 'gi');
  for (const м of t.matchAll(re)) {
    let л = м[1];
    if (л.startsWith('/')) л = КОРЕНЬ + л;
    л = норм(л);
    if (/\.(jpe?g|png|webp|svg|pdf|css|js)$/i.test(л)) continue;
    if (!ссылки.has(л)) ссылки.set(л, new Set());
    ссылки.get(л).add(путь(u));
  }
}

/* по четыре страницы разом — быстрее и не душит сервер */
const очередь = [...карта];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (очередь.length) {
    const u = очередь.shift();
    await обработать(u).catch(e => битые.push(путь(u) + ' → ошибка ' + e.message));
  }
}));

const сироты = [...вКарте].filter(u => !ссылки.has(u));
const внеКарты = [];
for (const u of [...ссылки.keys()].filter(u => !вКарте.has(u))) {
  const о = await fetch(u, { redirect: 'manual', headers: UA }).catch(() => null);
  внеКарты.push({ u, код: о ? о.status : 0, куда: о ? (о.headers.get('location') || '') : '' });
}
const robots = await (await fetch(КОРЕНЬ + '/robots.txt')).text();

console.log('\n=== ' + домен + ' — страниц в карте сайта: ' + карта.length + ' ===');
console.log('битые в карте:        ' + (битые.length ? битые.join(', ') : 'нет'));
console.log('редиректы в карте:    ' + (редиректы.length ? редиректы.join(', ') : 'нет'));
console.log('закрыты noindex:      ' + (закрыты.length ? закрыты.join(', ') : 'нет'));
console.log('canonical не на себя: ' + (чужойКанон.length ? чужойКанон.join(' | ') : 'нет'));
console.log('сироты (в карте, ссылок нет): ' + (сироты.length ? сироты.map(путь).join(', ') : 'нет'));
console.log('Clean-param в robots.txt: ' + (/clean-param/i.test(robots) ? 'есть' : 'НЕТ'));

const живые = внеКарты.filter(x => x.код === 200);
const мёртвые = внеКарты.filter(x => x.код === 0 || x.код >= 400);
const переадр = внеКарты.filter(x => x.код >= 300 && x.код < 400);

console.log('\n— живые страницы, которых НЕТ в карте сайта —');
console.log(живые.length ? живые.map(x => '  ' + путь(x.u)).join('\n') : '  нет');

console.log('\n— БИТЫЕ ССЫЛКИ и откуда они —');
console.log(мёртвые.length ? мёртвые.map(x => '  ' + путь(x.u) + ' (' + (x.код || 'нет ответа') + ') ← ' +
  [...ссылки.get(x.u)].slice(0, 8).join(', ')).join('\n') : '  нет');

if (переадр.length) {
  console.log('\n— ссылки через переадресацию —');
  переадр.forEach(x => console.log('  ' + путь(x.u) + ' → ' + x.куда));
}
