/**
 * SEO-срез по всем страницам карты сайта: title, description, og, H1, alt,
 * повторы title и description.
 *
 *   node tools/seo.mjs ecobr.ru
 *   node tools/seo.mjs ecobr.ru --vse     — показать и страницы без замечаний
 *
 * На 10.09.2026: H1 по одному на страницу, canonical везде, og почти везде.
 * Главная дыра — alt у картинок пуст почти везде, поиск по картинкам
 * проходит мимо. Правится только в редакторе у каждой картинки.
 */
import { картаСайта, аргументы, домен as взятьДомен } from './_obshchee.mjs';

const { позиции, флаги } = аргументы();
const домен = взятьДомен(позиции[0]);
if (!домен) { console.error('нужно: node tools/seo.mjs <домен> [--vse]'); process.exit(1); }

const мета = (t, имя) => (t.match(new RegExp('<meta[^>]+name=["\']' + имя + '["\'][^>]*content=["\']([^"\']*)', 'i')) || [])[1] || '';
const ог = (t, св) => (t.match(new RegExp('<meta[^>]+property=["\']og:' + св + '["\'][^>]*content=["\']([^"\']*)', 'i')) || [])[1] || '';
const текст = s => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const строки = [];
for (const u of await картаСайта(домен)) {
  const t = await (await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ber-bar-check)' } })).text();
  const img = [...t.matchAll(/<img\b[^>]*>/gi)].map(м => м[0]);
  const безAlt = img.filter(x => !/\salt=/i.test(x)).length;
  const пустой = img.filter(x => /\salt=(["'])\s*\1/i.test(x)).length;
  строки.push({
    путь: u.replace('https://' + домен, '') || '/',
    title: текст((t.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''),
    descr: мета(t, 'description'),
    /* У Тильды атрибуты идут без пробелов (<h1 class='..'field='..'>),
       поэтому считаем по «<h1» с пробелом или «>» следом. */
    h1: (t.match(/<h1[\s>]/gi) || []).length,
    ogD: !!ог(t, 'description'), ogI: !!ог(t, 'image'),
    картинок: img.length, altЕсть: img.length - безAlt - пустой
  });
}

console.log('\n=== ' + домен + ' — страниц: ' + строки.length + ' ===\n');
for (const с of строки) {
  const беды = [];
  if (!с.descr) беды.push('нет description');
  else if (с.descr.length < 70) беды.push('description ' + с.descr.length + ' зн, коротко');
  if (с.title.length > 70) беды.push('title ' + с.title.length + ' зн, длинно');
  if (с.h1 !== 1) беды.push('H1: ' + с.h1);
  if (!с.ogD) беды.push('нет og:description');
  if (!с.ogI) беды.push('нет og:image');
  if (с.картинок && с.altЕсть / с.картинок < 0.5) беды.push('alt ' + с.altЕсть + '/' + с.картинок);
  if (беды.length || флаги.vse) console.log('  ' + с.путь.padEnd(36) + (беды.length ? беды.join('; ') : 'в порядке'));
}

for (const [поле, подпись] of [['title', 'title'], ['descr', 'description']]) {
  const м = new Map();
  for (const с of строки) if (с[поле]) {
    const k = с[поле].slice(0, 150);
    if (!м.has(k)) м.set(k, []);
    м.get(k).push(с.путь);
  }
  const повторы = [...м.entries()].filter(([, сп]) => сп.length > 1);
  console.log('\nповторяющиеся ' + подпись + ': ' + (повторы.length ? '' : 'нет'));
  повторы.forEach(([т, сп]) => console.log('  «' + т.slice(0, 60) + '…» — ' + сп.join(', ')));
}

const всего = строки.reduce((s, с) => s + с.картинок, 0);
const сAlt = строки.reduce((s, с) => s + с.altЕсть, 0);
console.log('\nalt: заполнен у ' + сAlt + ' из ' + всего + ' картинок (' +
  Math.round(100 * сAlt / Math.max(1, всего)) + '%)');
