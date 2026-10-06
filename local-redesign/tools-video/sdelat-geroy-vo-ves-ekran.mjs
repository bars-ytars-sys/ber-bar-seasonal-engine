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
  + '#rec1538220631 .tn-elem[data-elem-id="176271657216679970"],#rec1538220631 .tn-elem[data-elem-id="1752672192686"],#rec1538220631 .tn-elem[data-elem-id="1752662611116"]{top:0!important;left:0!important;width:100%!important;height:100%!important;zoom:1!important;transform:none!important}\n'
  + '/* на широких экранах колонка Tilda сдвинута вправо — возвращаем медиа к левому краю окна */\n'
  + '@media screen and (min-width:1200px){#rec1538220631 .tn-elem[data-elem-id="176271657216679970"],#rec1538220631 .tn-elem[data-elem-id="1752672192686"],#rec1538220631 .tn-elem[data-elem-id="1752662611116"]{left:calc((100vw - 1200px) / -2)!important}}';if (!html.includes('Медиа первого экрана — во весь экран')) {
  html = html.replace('/* Читаемость текста поверх', mediaCss + '\n/* Читаемость текста поверх');
  done.push('видео растянуто на весь первый экран');
}

/* Шаг 2. Колонку контента сдвигаем в центр экрана: у Tilda она прижата к левому краю.
   Только для широких экранов — на телефонах и планшетах колонка уже по центру. */
if (!html.includes('Центрируем контент первого экрана')) {
  const contentShift = '/* Центрируем контент первого экрана на экране, а не в колонке Tilda */\n'
    + '@media screen and (min-width:1200px){#rec1538220631 .t396__artboard_scale{transform:translateX(calc((100vw - 1200px) / 2))}}';
  html = html.replace('/* Читаемость текста поверх', contentShift + '\n/* Читаемость текста поверх');
  done.push('колонка с текстом выведена в центр экрана');
}

/* Шаг 3. Медали: в ряд по центру, под кнопками.
   Значения в локальной сетке брейкпоинта (у телефонов это 320, поэтому 50 % там не центр экрана). */
const medalLeft = {
  '1774600646727000001': { '': 464, '-res-960': 371, '-res-640': 247, '-res-480': 92, '-res-320': 61 },
  '1786039775754000001': { '': 556, '-res-960': 445, '-res-640': 296, '-res-480': 110, '-res-320': 73 },
  '1785334752681000001': { '': 648, '-res-960': 519, '-res-640': 345, '-res-480': 128, '-res-320': 85 },
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
