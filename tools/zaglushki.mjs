/**
 * Фотографии, застрявшие крошечными заглушками.
 *
 *   node tools/zaglushki.mjs https://ecobr.ru/
 *
 * Тильда сначала ставит заглушку шириной 20 точек
 * (thb.tildacdn.com/…/-/resizeb/20x/…), а настоящий файл из data-original
 * подставляет, когда картинка подходит к экрану. Карточки каруселей стоят
 * за правым краем и в поле зрения не попадают никогда — заглушка остаётся
 * навсегда и растягивается на всю карточку. Выглядит как «плохое качество
 * фото». 09.09.2026 так на ecobr.ru было 12 фотографий; лечится блоком
 * tilda/17BLOK-FOTO-I-LISTALKA-ECO.html.
 */
import { браузер, ТЕЛЕФОН, аргументы, пауза, пролистать } from './_obshchee.mjs';

const { позиции } = аргументы();
const адрес = позиции[0];
if (!адрес) { console.error('нужно: node tools/zaglushki.mjs <адрес>'); process.exit(1); }

const b = await браузер();
const p = await (await b.newContext(ТЕЛЕФОН)).newPage();
await p.goto(адрес, { waitUntil: 'commit', timeout: 180000 });
await пауза(28000);
await пролистать(p, 0.7, 320);
await пауза(7000);

const r = await p.evaluate(() => {
  const плохо = [];
  const глянь = (url, э, тип) => {
    const м = (url || '').match(/\/-\/resizeb?\/(\d+)x\//);
    if (!м) return;
    const rr = э.getBoundingClientRect();
    if (rr.width < 60 || +м[1] >= rr.width) return;
    const рек = э.closest('.t-rec');
    плохо.push({
      рек: рек ? рек.id : '—', тип, файл: +м[1],
      показ: Math.round(rr.width) + '×' + Math.round(rr.height),
      настоящий: э.getAttribute('data-original') ? 'лежит в data-original' : 'не найден'
    });
  };
  for (const im of document.querySelectorAll('img')) глянь(im.currentSrc || im.src, im, 'img');
  for (const э of document.querySelectorAll('*')) {
    const bg = getComputedStyle(э).backgroundImage;
    if (bg && bg.includes('url(')) глянь((bg.match(/url\(["']?([^"')]+)/) || [])[1], э, 'фон');
  }
  return плохо;
});

console.log('\n=== ' + адрес + ' — застрявших заглушек: ' + r.length + ' ===');
const поБлокам = {};
for (const x of r) (поБлокам[x.рек] ||= []).push(x);
for (const [рек, сп] of Object.entries(поБлокам))
  console.log('  ' + рек.padEnd(16) + String(сп.length).padStart(3) + ' шт, заглушка ' + сп[0].файл +
    ' px при показе ' + сп[0].показ + ', настоящий файл ' + сп[0].настоящий);
await b.close();
