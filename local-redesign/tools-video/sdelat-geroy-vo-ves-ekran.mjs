// Первый экран демо БП как в демо Барских: видео на весь экран, текст, кнопки и медали поверх него.
// Работает по шагам и повторяемый: каждый шаг проверяет, не сделан ли он уже.
// Запуск: node local-redesign/tools-video/sdelat-geroy-vo-ves-ekran.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/ASON/Desktop/Ber&Bar';
const file = path.join(root, 'prevyu/lid/bp-glavnaya.html');
let html = fs.readFileSync(file, 'utf8');
const done = [];

/** Меняет поле элемента внутри блока первого экрана. */
function setField(id, attr, value) {
  const marker = 'tn-elem__1538220631' + id;
  const i = html.lastIndexOf(marker);
  if (i < 0) throw new Error('нет элемента ' + id);
  const end = html.indexOf('>', i);
  const seg = html.slice(i, end);
  const rx = new RegExp('(data-field-' + attr + '-value=")[^"]*(")');
  if (!rx.test(seg)) return false; // у элемента нет такого брейкпоинта — значение наследуется
  html = html.slice(0, i) + seg.replace(rx, '$1' + value + '$2') + html.slice(end);
  return true;
}

/* Шаг 1. Медиа растягиваем на весь экран.
   Tilda считает положение и размер по своей сетке с масштабом, поэтому надёжнее
   закрепить медиа поверх артборда напрямую — так оно совпадает с экраном на любом брейкпоинте. */
const media = ['176271657216679970', '1752672192686', '1752662611116'];
for (const id of media) {
  setField(id, 'top', 0);
  setField(id, 'left', 0);
  setField(id, 'height', 720);
  setField(id, 'width', 1200);
  setField(id, 'axisx', 'left');
  setField(id, 'axisy', 'top');
}
const mediaCss = '/* Медиа первого экрана — во весь экран, поверх сетки Tilda */\n'
  + '#allrecords #rec1538220631 .tn-elem[data-elem-id="176271657216679970"],#allrecords #rec1538220631 .tn-elem[data-elem-id="1752672192686"],#allrecords #rec1538220631 .tn-elem[data-elem-id="1752662611116"]{top:0!important;left:0!important;width:100%!important;height:100%!important;zoom:1!important;transform:none!important}\n'
  + '/* на широких экранах колонка Tilda сдвинута вправо — возвращаем медиа к левому краю окна */\n'
  + '@media screen and (min-width:1200px){#allrecords #rec1538220631 .tn-elem[data-elem-id="176271657216679970"],#allrecords #rec1538220631 .tn-elem[data-elem-id="1752672192686"],#allrecords #rec1538220631 .tn-elem[data-elem-id="1752662611116"]{left:calc((100vw - 1200px) / -2)!important}}';

/* Шаг 2. «Барские» по центру экрана: элементы растягиваем на всю ширину колонки,
   а текст внутри центрируем — так он встаёт по центру экрана при любой ширине окна. */
const centreIds = ['1752662111713', '1752662522336', '1752661976580'];
// ширина по брейкпоинтам: 320, 480, 640, 960, 1200 — чтобы текст не выходил за экран телефона
const widths = {
  '1752662111713': [300, 460, 620, 900, 1120],
  '1752662522336': [300, 460, 620, 900, 1120],
  '1752661976580': [300, 460, 620, 860, 860],
};
for (const id of centreIds) {
  const [w320, w480, w640, w960, w1200] = widths[id];
  setField(id, 'left', 0);
  setField(id, 'axisx', 'left');
  setField(id, 'width', w1200);
  for (const [suffix, value] of [['-res-320', w320], ['-res-480', w480], ['-res-640', w640], ['-res-960', w960]]) {
    setField(id, 'left' + suffix, 0);
    setField(id, 'axisx' + suffix, 'left');
    setField(id, 'width' + suffix, value);
  }
}
const contentShift = '/* Заголовок, разделитель и подпись — во всю ширину колонки, текст по центру */\n'
  + '#allrecords #rec1538220631 .tn-elem[data-elem-id="1752662111713"] .tn-atom,#allrecords #rec1538220631 .tn-elem[data-elem-id="1752661976580"] .tn-atom{text-align:center!important}\n'
  + '/* Кнопки первого экрана — по центру */\n'
  + '#allrecords #rec1538220631 .tn-group[data-group-id="175368842804016170"]{left:50%!important;transform:translateX(-50%)!important;zoom:1!important}';

if (!html.includes('Медиа первого экрана — во весь экран')) {
  // Вставляем в блок стилей первого экрана, иначе правила не попадут на страницу
  const anchor = '/* Высота артборда';
  if (!html.includes(anchor)) throw new Error('не нашёл блок стилей первого экрана');
  const css = mediaCss + '\n' + contentShift;
  html = html.replace(anchor, css + '\n' + anchor);
  done.push('видео растянуто на весь первый экран');
  done.push('заголовок, подпись и кнопки выведены по центру экрана');
}

/* Шаг 3. Медали: в ряд по центру, под кнопками.
   Значения в локальной сетке брейкпоинта (у телефонов это 320, поэтому 50 % там не центр экрана). */
const medalLeft = {
  '1774600646727000001': { '': 464, '-res-960': 371, '-res-640': 106, '-res-480': 100, '-res-320': 25 },
  '1786039775754000001': { '': 556, '-res-960': 445, '-res-640': 123, '-res-480': 195, '-res-320': 106 },
  '1785334752681000001': { '': 648, '-res-960': 519, '-res-640': 140, '-res-480': 290, '-res-320': 187 },
};
for (const [id, lefts] of Object.entries(medalLeft)) {
  for (const [suffix, left] of Object.entries(lefts)) {
    setField(id, 'axisx' + suffix, 'left');
    setField(id, 'left' + suffix, left);
  }
}
done.push('медали встали в ряд по центру экрана');

/* Шаг 4. Затемнение под текстом: слева плотнее, справа мягче */
const oldScrim = '{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(20,34,29,.10) 0%,rgba(20,34,29,.24) 52%,rgba(20,34,29,.52) 100%)}';
const newScrim = '{position:absolute;inset:0;pointer-events:none;background:linear-gradient(100deg,rgba(20,34,29,.68) 0%,rgba(20,34,29,.5) 34%,rgba(20,34,29,.3) 62%,rgba(20,34,29,.24) 100%),linear-gradient(180deg,rgba(20,34,29,.22) 0%,rgba(20,34,29,.12) 42%,rgba(20,34,29,.3) 100%)}';
if (html.includes(oldScrim)) {
  html = html.replace(oldScrim, newScrim);
  done.push('затемнение пересобрано под текст поверх видео');
}

fs.writeFileSync(file, html, 'utf8');
console.log(done.length ? done.map((d) => ' + ' + d).join('\n') : ' + правки уже применены');
console.log('файл: ' + path.basename(file) + ', ' + html.length + ' байт');
