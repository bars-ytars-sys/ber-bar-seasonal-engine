/**
 * Новогодняя страница Берёзовой рощи (ecobr.ru), компактная структура.
 * Первый экран с отсчётом → коротко о празднике → дома → что входит и за что
 * доплата → SPA → чем заняться зимой → вопросы → подвал с картой, формой и контактами.
 * Все факты и цены — со страниц ecobr.ru (главная, SPA, вопросы).
 * Фото — настоящие кадры домов, перегенерированные в хорошем качестве.
 *
 * Запуск: node demo/build-zima-br.mjs   →  zima-br.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ОБЛОЖКА = 'demo/assets/eco-zima-hero.webp';
const ОБЛОЖКА_ТЕЛ = 'demo/assets/eco-zima-hero-tel.webp';
for (const ф of [ОБЛОЖКА, ОБЛОЖКА_ТЕЛ, ...['aframe', 'house', 'barn', 'baus', 'sfera', 'panorama', 'interer'].map(и => 'demo/assets/eco-ng-' + и + '.webp')])
  if (!fs.existsSync(path.join(ROOT, ф))) throw new Error('нет фото ' + ф);

const ЛОГОТИП = 'https://static.tildacdn.com/tild6330-6562-4465-a232-323932353661/LOGO.svg';
const ТЕЛЕФОН = '+7 (495) 120-20-08';
const ТЕЛ_ССЫЛКА = 'tel:+74951202008';
const ТГ = 'https://t.me/ecobazabr';
const БРОНЬ = 'https://ecobr.ru/booking?dfrom=2026-12-31&amp;dto=2027-01-03&amp;adults=2&amp;scroll_to_rooms=1';

const ИКОНКИ = {
  календарь: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3.5v3M16 3.5v3"/>',
  рыба: '<path d="M3 12c3-4.5 8.5-5.5 12.5-3L20 6v12l-4.5-3C11.5 17.5 6 16.5 3 12Z"/><path d="M14 11.2h.01"/>',
  лапа: '<circle cx="6.5" cy="10" r="1.7"/><circle cx="10" cy="6.5" r="1.7"/><circle cx="14.5" cy="6.5" r="1.7"/><circle cx="18" cy="10" r="1.7"/><path d="M8 17.2c0-3 2-5.2 4.2-5.2s4.3 2.2 4.3 5.2c0 2-2 2.3-4.3 2.3S8 19.2 8 17.2Z"/>',
  подкова: '<path d="M6.5 4v7.5a5.5 5.5 0 0 0 11 0V4"/><path d="M4.5 4h4M15.5 4h4M8 13h.01M16 13h.01M7 9h.01M17 9h.01"/>',
  колесо: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3.5v6M12 14.5v6M3.5 12h6M14.5 12h6"/>',
  капля: '<path d="M12 3.5c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11Z"/>',
  плюс: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
  отметка: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  парковка: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3"/>',
  дом: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  чан: '<ellipse cx="12" cy="13" rx="8" ry="2.5"/><path d="M4 13v4.5c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V13"/><path d="M9 4.5c-1 1 1 2 0 3.2M12 3.5c-1 1 1 2 0 3.4M15 4.5c-1 1 1 2 0 3.2"/>',
  огонь: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6 0-3.4 2.6-5.2 3.6-8.6.3 1.9 1.4 3 2.4 3.4C11.5 6.6 13 4.2 15.5 3c-.6 2.8.4 4.6 1.6 6.3 1 1.4 1.4 2.8 1.4 4.2 0 4.2-2.7 7.5-6.5 7.5Z"/><path d="M12 21c-1.6 0-2.7-1-2.7-2.6 0-1.6 1.2-2.3 1.7-3.9.8 1 2.2 1.7 2.9 2.9.8 1.4-.2 3.6-1.9 3.6Z"/>',
  кролик: '<path d="M9 9.5C7.8 6.8 7.2 3.6 8.4 3c1.3-.6 2.7 2.6 3.1 5.8M15 9.5c1.2-2.7 1.8-5.9.6-6.5-1.3-.6-2.7 2.6-3.1 5.8"/><circle cx="12" cy="14.5" r="5.5"/><path d="M10 13.5h.01M14 13.5h.01M11 16.5c.6.5 1.4.5 2 0"/>',
  мишка: '<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="6.5" r="2.5"/><circle cx="12" cy="13" r="7.5"/><ellipse cx="12" cy="15.5" rx="3" ry="2.2"/><path d="M9.5 11h.01M14.5 11h.01"/>',
  стол: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="3.5"/><path d="M3 4v5c0 1 .8 1.8 1.5 1.8V20M4.5 4v4M21 4c-1.5 0-2.5 2-2.5 4.5 0 1.7.7 2.5 1.5 2.5V20"/>',
  часы: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  карта: '<rect x="3" y="6" width="18" height="12.5" rx="2"/><path d="M3 10h18M7 15h4"/>',
  снежинка: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2"/>',
  галка: '<path d="m6 9.5 6 6 6-6"/>'
};
const иконка = (имя, класс = 'иконка') =>
  `<svg class="${класс}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ИКОНКИ[имя]}</svg>`;

/* Коротко о празднике: четыре главных факта. */
const факты = [
  ['календарь', 'С 31 декабря по 10 января', 'Заезд с 16:00, выезд до 13:00'],
  ['дом', '22 дизайнерских домика', 'От 2 до 10 гостей, у большинства своя территория'],
  ['чан', 'Банный чан у дома', 'Под открытым небом, топим к вашему приезду'],
  ['огонь', 'SPA-комплекс в 300 метрах', 'Бассейн под открытым небом, зимой вода от 28 до 30 °C']
];

/* Дома: вместимость и одна строка о главном. */
const дома = [
  ['A-фреймы', 'до 4 гостей', 'Панорамное остекление, банный чан, у чёрного A-фрейма своя баня', 'demo/assets/eco-ng-aframe.webp'],
  ['Хаусы', 'до 5 гостей', 'Два этажа, отдельная спальня и банный чан', 'demo/assets/eco-ng-house.webp'],
  ['Барнхаусы', 'до 6 гостей', 'Отдельные комнаты, у барнхауса 4 своя баня', 'demo/assets/eco-ng-barn.webp'],
  ['Баусы', 'до 2 гостей', 'Зеркальный дом для двоих с чаном под звёздами', 'demo/assets/eco-ng-baus.webp'],
  ['Сфера', 'до 4 гостей', 'Купольный дом со своей баней и банным чаном', 'demo/assets/eco-ng-sfera.webp'],
  ['Большие дома', 'до 10 гостей', 'Панорама, Сканди, Шале и Барилоче: баня, чан, отдельные спальни', 'demo/assets/eco-ng-panorama.webp']
];

const входит = [
  ['отметка', 'Дом с кухней, посудой и техникой'],
  ['отметка', 'Своя территория у большинства домов'],
  ['отметка', 'Парковка на территории базы'],
  ['отметка', 'Детские кроватки и стульчики для кормления по запросу'],
  ['отметка', 'Можно приезжать с питомцами']
];
const доплата = [
  ['Банный чан', '5 500 ₽, в SPA House 7 000 ₽'],
  ['SPA-комплекс', 'от 1 000 ₽ в час'],
  ['Новогодний банкет в ресторане', 'по меню ресторана'],
  ['Флоатинг', 'от 4 000 ₽'],
  ['Рыбалка, конные прогулки, багги', 'уточняйте у администратора']
];

const зимой = [
  ['кролик', 'Ферма с животными', 'Козлята, кролики, коровки, можно покормить'],
  ['рыба', 'Рыбалка', 'Платные пруды в 300 метрах от домов'],
  ['подкова', 'Конные прогулки', 'По маршрутам вокруг базы'],
  ['колесо', 'Багги и квадроциклы', 'Для тех, кому нужен драйв'],
  ['капля', 'Сухой флоатинг', 'Невесомость и глубокий отдых']
];

const вопросы = [
  ['Сколько стоит новогодний отдых?', 'Цена зависит от выбранного дома и количества гостей. Выберите даты в модуле бронирования или позвоните, и менеджер посчитает стоимость.'],
  ['Во сколько заезд и выезд?', 'Заезд с 16:00, выезд до 13:00. Ранний заезд и поздний выезд возможны по согласованию, при наличии мест.'],
  ['Можно ли приехать с питомцем?', 'Да, с животными можно.'],
  ['Что с питанием?', 'В каждом доме кухня со всем необходимым. Новогодний банкет в ресторане оплачивается отдельно.'],
  ['Где находится база?', 'Московская область, Солнечногорский район, деревня Васюково, КДЗ Новое Мишкино 1/5. 40 минут от Москвы.']
];

const СТИЛИ = `
@font-face{font-family:Manrope;src:url(https://static.tildacdn.com/tild3736-6431-4634-b864-383266383235/manrope-regular.woff) format('woff');font-weight:400;font-display:swap}
@font-face{font-family:Manrope;src:url(https://static.tildacdn.com/tild3039-3861-4239-a464-373839643830/manrope-medium.woff) format('woff');font-weight:500;font-display:swap}
@font-face{font-family:Manrope;src:url(https://static.tildacdn.com/tild3766-3765-4962-a361-366264663735/manrope-semibold.woff) format('woff');font-weight:600;font-display:swap}
@font-face{font-family:DespairDisplay;src:url(https://static.tildacdn.com/tild3139-3132-4331-b632-343362316164/DespairDisplay-Bold.woff) format('woff');font-weight:700;font-display:swap}
:root{--фон:#0c1a24;--панель:#15293a;--панель2:#1c3447;--текст:#f4f6fb;--акцент:#2ed8a3;--тёплый:#ffd27a}
:root{--фон:#0c1a24;--панель:#15293a;--панель2:#1c3447;--текст:#f4f6fb;--акцент:#2ed8a3;--тёплый:#ffd27a;--линия:rgba(244,246,251,.1)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:radial-gradient(1100px 700px at 12% 18%,rgba(46,216,163,.09),transparent 62%),radial-gradient(900px 620px at 88% 46%,rgba(120,170,255,.08),transparent 62%),radial-gradient(1000px 700px at 30% 82%,rgba(255,210,122,.06),transparent 62%),linear-gradient(180deg,#0c1a24 0%,#10263a 45%,#0e2130 75%,#0c1a24 100%);color:var(--текст);font-family:Manrope,Arial,sans-serif;font-size:16px;line-height:1.6;
     -webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:DespairDisplay,Manrope,Arial,sans-serif;font-weight:700;letter-spacing:.01em}
a{color:inherit}
.полоса{max-width:1200px;margin:0 auto;padding:0 24px}
html{scroll-behavior:smooth}
section[id]{scroll-margin-top:84px}
.иконка{width:24px;height:24px;color:var(--акцент);flex:none}
.кнопки{display:flex;flex-wrap:wrap;gap:12px}
.кнопка{display:inline-block;padding:14px 26px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;
        background:var(--акцент);color:#10231c;box-shadow:0 14px 30px -16px rgba(46,216,163,.9);transition:.25s}
.кнопка:hover{background:#48e6b4;transform:translateY(-2px)}
.кнопка--контур{background:transparent;color:var(--текст);box-shadow:inset 0 0 0 1px rgba(244,246,251,.35)}
.кнопка--контур:hover{background:rgba(244,246,251,.08)}
/* первый экран */
.шапка{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:20px}
.лого img{display:block;width:184px;height:auto;filter:brightness(0) invert(1);opacity:.92}
.телефон{font-size:15px;text-align:right;text-decoration:none}
.телефон span{display:block;font-size:12px;opacity:.6}
.герой{position:relative;min-height:min(78svh,720px);display:flex;flex-direction:column;overflow:hidden;background:#08131b}
.герой__фон{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 55%}
.герой__тень{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,19,27,.9) 0%,rgba(8,19,27,.55) 45%,rgba(8,19,27,.05) 75%),
  linear-gradient(180deg,rgba(8,19,27,.6) 0%,transparent 25%,transparent 70%,var(--фон) 100%)}
.герой > .полоса{position:relative;z-index:3;width:100%}
.герой__текст{margin-block:auto;padding-block:20px 56px;max-width:1200px}
.над{font-size:12.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--акцент)}
.герой h1{margin:14px 0 0;font-size:clamp(40px,6.2vw,84px);line-height:1.02;text-transform:uppercase;max-width:760px;
          text-shadow:0 4px 30px rgba(0,0,0,.5)}
.герой .даты{margin-top:16px;font-size:clamp(17px,1.8vw,21px);color:var(--тёплый)}
.герой .кнопки{margin-top:26px}
.мини-отсчёт{display:inline-flex;align-items:center;gap:14px;margin-top:22px;padding:10px 16px;border-radius:12px;
  background:rgba(8,19,27,.55);box-shadow:inset 0 0 0 1px var(--линия);backdrop-filter:blur(6px);font-size:14px}
.мини-отсчёт b{font-family:DespairDisplay,Manrope,sans-serif;font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;margin-right:3px}
.мини-отсчёт span{opacity:.75}
/* навигация */
.навигация{position:sticky;top:0;z-index:30;background:rgba(9,22,31,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--линия)}
.навигация__полоса{display:flex;gap:8px;align-items:center;max-width:1200px;margin:0 auto;padding:10px 24px;overflow-x:auto;scrollbar-width:none}
.навигация__полоса::-webkit-scrollbar{display:none}
.навигация a{white-space:nowrap;text-decoration:none;font-size:14px;padding:9px 16px;border-radius:999px;
             background:rgba(244,246,251,.06);box-shadow:inset 0 0 0 1px rgba(244,246,251,.14);transition:.25s}
.навигация a:hover{background:rgba(244,246,251,.13)}
.навигация a.активна{color:#bff6e3;background:rgba(46,216,163,.18);box-shadow:inset 0 0 0 1px rgba(46,216,163,.6)}
.навигация .бронь{margin-left:auto;background:var(--акцент);color:#10231c;font-weight:600;box-shadow:none}
/* разделы */
.раздел{padding-top:64px}
.раздел__верх{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:22px;flex-wrap:wrap}
.раздел h2{font-size:clamp(26px,3vw,36px);text-transform:uppercase}
.раздел__подпись{opacity:.72;font-size:15px;max-width:520px}
/* коротко */
.факты{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:24px}
.факт{display:flex;gap:14px;align-items:flex-start;padding:20px;border-radius:14px;background:var(--панель);
      box-shadow:inset 0 0 0 1px var(--линия),0 20px 40px -28px rgba(0,0,0,.8)}
.факт .иконка{width:40px;height:40px;padding:9px;border-radius:12px;background:rgba(46,216,163,.1);box-shadow:inset 0 0 0 1px rgba(46,216,163,.3)}
.факт b{display:block;font-size:16px;font-weight:600;line-height:1.3}
.факт span{display:block;margin-top:4px;font-size:13.5px;opacity:.72;line-height:1.45}
/* дома */
.дома{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.дом{display:flex;flex-direction:column;background:var(--панель);border-radius:14px;overflow:hidden;text-decoration:none;
     box-shadow:inset 0 0 0 1px var(--линия);transition:.3s}
.дом:hover{transform:translateY(-4px);box-shadow:inset 0 0 0 1px rgba(46,216,163,.35),0 22px 40px -26px rgba(0,0,0,.8)}
.дом__фото{aspect-ratio:3/2;overflow:hidden;background:#12151a}
.дом__фото img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .6s}
.дом:hover .дом__фото img{transform:scale(1.05)}
.дом__низ{padding:14px 16px 16px;display:grid;gap:4px}
.дом__строка{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.дом__имя{font-size:18px;color:var(--текст);text-transform:uppercase}
.дом__гости{font-size:13px;color:var(--акцент);white-space:nowrap}
.дом__текст{font-size:14px;opacity:.75;line-height:1.45}
.дом__ссылка{margin-top:6px;font-size:14px;font-weight:600;color:var(--акцент)}
.сноска-фото{margin-top:12px;font-size:13px;opacity:.6}
/* что входит */
.условия{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.колонка{padding:24px 26px;border-radius:14px;background:var(--панель);box-shadow:inset 0 0 0 1px var(--линия)}
.колонка h3{font-size:18px;text-transform:uppercase;margin-bottom:14px}
.колонка ul{list-style:none;display:grid;gap:10px}
.колонка li{display:flex;gap:10px;align-items:flex-start;font-size:15px;line-height:1.4}
.колонка li .иконка{width:20px;height:20px;margin-top:1px}
.прайс li{justify-content:space-between;border-bottom:1px dashed var(--линия);padding-bottom:9px}
.прайс li:last-child{border-bottom:0;padding-bottom:0}
.прайс li span{opacity:.72;text-align:right}
.цена-дома{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
  padding:18px 26px;border-radius:14px;background:linear-gradient(120deg,rgba(46,216,163,.16),rgba(46,216,163,.04));box-shadow:inset 0 0 0 1px rgba(46,216,163,.3)}
.цена-дома p{font-size:16px}
/* SPA */
.спа{display:grid;grid-template-columns:1.1fr 1fr;gap:16px;align-items:stretch}
.спа__текст,.спа__цены{padding:24px 26px;border-radius:14px;background:var(--панель);box-shadow:inset 0 0 0 1px var(--линия)}
.спа__текст ul{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:10px 18px;margin-top:14px}
.спа__текст li{display:flex;gap:8px;font-size:15px}
.спа__текст li .иконка{width:20px;height:20px}
.спа__текст p{margin-top:16px;font-size:14px;opacity:.72}
.спа__цены{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;align-content:center}
.спа__цена{text-align:center;padding:14px 8px;border-radius:12px;background:rgba(6,16,24,.45)}
.спа__цена b{display:block;font-family:DespairDisplay,Manrope,sans-serif;font-size:24px}
.спа__цена span{font-size:13px;opacity:.72}
.спа__цены p{grid-column:1/-1;font-size:13px;opacity:.72;text-align:center}
/* зимой */
.зимой{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.занятие{padding:18px;border-radius:14px;background:var(--панель);box-shadow:inset 0 0 0 1px var(--линия)}
.занятие .иконка{width:28px;height:28px}
.занятие b{display:block;margin-top:10px;font-size:15px;font-weight:600}
.занятие span{display:block;margin-top:4px;font-size:13px;opacity:.72;line-height:1.4}
/* вопросы */
.вопросы{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.вопрос{background:var(--панель);box-shadow:inset 0 0 0 1px var(--линия);border-radius:12px;padding:16px 20px}
.вопрос summary{cursor:pointer;font-size:16px;list-style:none;position:relative;padding-right:28px}
.вопрос summary::-webkit-details-marker{display:none}
.вопрос summary::after{content:'+';position:absolute;right:0;top:-4px;font-size:22px;color:var(--акцент)}
.вопрос[open] summary::after{content:'−'}
.вопрос p{margin-top:8px;font-size:14.5px;opacity:.82}
/* ── подвал: карта, форма заявки, контакты ── */
.подвал{margin-top:80px;padding-block:56px 36px;background:rgba(0,0,0,.18);border-top:1px solid rgba(255,255,255,.1)}
.подвал__сетка{display:grid;grid-template-columns:1.15fr 1fr .85fr;gap:28px;align-items:start}
.подвал h3{font-size:22px;margin-bottom:14px;color:var(--текст)}
.подвал__карта iframe{display:block;width:100%;height:300px;border:0;border-radius:12px;background:rgba(255,255,255,.06)}
.подвал__адрес{margin-top:12px;font-size:14.5px;opacity:.85}
.подвал__ссылки{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:14px}
.подвал__ссылки a,.подвал__контакты a:not(.кнопка){color:var(--акцент)}
.подвал__форма{background:var(--панель);border-radius:14px;padding:22px 22px 18px;display:grid;gap:10px}
.подвал__форма h3{margin-bottom:0}
.подвал__форма>p{font-size:14px;opacity:.8;margin:0 0 4px}
.подвал__форма label{display:grid;gap:4px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;opacity:.85}
.подвал__форма input,.подвал__форма select{font:inherit;font-size:15px;letter-spacing:0;text-transform:none;color:var(--текст);
  background:rgba(0,0,0,.22);border:0;border-radius:8px;padding:11px 12px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.16)}
.подвал__форма input:focus,.подвал__форма select:focus{outline:2px solid var(--акцент);outline-offset:1px}
.подвал__форма input[aria-invalid="true"]{box-shadow:inset 0 0 0 2px #e0765c}
.подвал__пара{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.подвал__форма .кнопка{width:100%;text-align:center;border:0;cursor:pointer;font:inherit;margin-top:4px}
.подвал__согласие{font-size:12px;opacity:.65;margin:0}
.подвал__согласие a{color:inherit}
.подвал__итог{font-size:14px;line-height:1.45;padding:10px 12px;border-radius:8px;background:rgba(255,255,255,.08);margin:0}
.подвал__итог a{color:var(--акцент)}
.подвал__тел{display:block;font-size:24px;font-weight:600;text-decoration:none;color:var(--текст)!important;margin-bottom:4px}
.подвал__контакты p{font-size:14.5px;opacity:.85;margin-bottom:14px}
.подвал__мессенджеры{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
.подвал__мессенджеры a{display:inline-block;padding:8px 14px;border-radius:999px;font-size:14px;text-decoration:none;
  color:var(--текст)!important;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16)}
.подвал__мессенджеры a:hover{background:rgba(255,255,255,.14)}
.подвал__низ{margin-top:36px;padding-top:18px;border-top:1px solid rgba(255,255,255,.1);font-size:13px;opacity:.6;text-align:center}
@media(max-width:980px){.подвал__сетка{grid-template-columns:1fr 1fr}.подвал__контакты{grid-column:1/-1}}
@media(max-width:700px){.подвал__сетка{grid-template-columns:1fr}.подвал__карта iframe{height:240px}}
/* снег и появление */
.снег{position:fixed;inset:0;pointer-events:none;z-index:5}
.снежинка{position:absolute;top:-12px;border-radius:50%;background:#fff;opacity:.45;animation:падать linear infinite}
@keyframes падать{0%{transform:translate3d(0,-12px,0)}100%{transform:translate3d(24px,105vh,0)}}
.ждёт{opacity:0;transform:translateY(24px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
.ждёт.видно{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.снежинка{display:none}.ждёт{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}}
@media(max-width:1100px){.факты{grid-template-columns:repeat(2,1fr)}.зимой{grid-template-columns:repeat(3,1fr)}.спа{grid-template-columns:1fr}}
@media(max-width:800px){
  .дома{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;margin-inline:-24px;padding-inline:24px;scrollbar-width:none}
  .дома::-webkit-scrollbar{display:none}
  .дом{flex:0 0 78%;scroll-snap-align:start}
  .условия,.вопросы{grid-template-columns:1fr}
  .зимой{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:700px){
  .полоса{padding:0 16px}
  .герой{min-height:0;display:block}
  .герой picture{display:block}
  .герой__фон{position:relative;height:46svh;min-height:300px;max-height:440px}
  .герой__тень{background:linear-gradient(180deg,rgba(8,19,27,.65) 0%,transparent 30%,transparent 55%,var(--фон) 100%);height:46svh;min-height:300px;max-height:440px}
  .герой .шапка{position:absolute;top:0;left:0;right:0;z-index:4}
  .лого img{width:140px}
  .герой__текст{margin-top:-60px;padding-bottom:28px}
  .кнопка{flex:1 1 100%;text-align:center}
  .мини-отсчёт{display:flex;justify-content:center;gap:10px;font-size:12px;padding:10px 12px}
  .мини-отсчёт>span{display:none}
  .мини-отсчёт b{font-size:20px}
  .факты{grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}
  .факт{flex-direction:column;gap:8px;padding:14px}
  .факт .иконка{width:34px;height:34px;padding:7px}
  .факт b{font-size:14.5px}
  .факт span{font-size:12.5px}
  .дома{margin-inline:-16px;padding-inline:16px}
  .спа__текст ul{grid-template-columns:1fr}
  .спа__цены{grid-template-columns:repeat(3,1fr);padding:18px}
  .спа__цена b{font-size:20px}
  .прайс li{flex-direction:column;gap:2px}
  .прайс li span{text-align:left}
  .цена-дома{padding:18px}
}
`;

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Новый год 2027 в «Берёзовой роще»: дома с банным чаном и SPA в Подмосковье</title>
<meta name="description" content="Новогодние праздники с 31 декабря по 10 января в 40 минутах от Москвы. 22 дизайнерских домика с банным чаном, SPA-комплекс с бассейном под открытым небом, ферма и зимние развлечения.">
<style>${СТИЛИ}</style>
</head>
<body>

<div class="снег" aria-hidden="true"></div>

<section class="герой">
  <picture>
    <source media="(max-width:700px)" srcset="${ОБЛОЖКА_ТЕЛ}">
    <img class="герой__фон" src="${ОБЛОЖКА}" alt="Дом на базе отдыха «Берёзовая роща» в новогодних огнях" fetchpriority="high">
  </picture>
  <div class="герой__тень"></div>
  <header class="шапка полоса">
    <a class="лого" href="https://ecobr.ru/"><img src="${ЛОГОТИП}" alt="Берёзовая роща"></a>
    <a class="телефон" href="${ТЕЛ_ССЫЛКА}">${ТЕЛЕФОН}<span>с 9:00 до 24:00</span></a>
  </header>
  <div class="герой__текст полоса">
    <div class="над">База отдыха «Берёзовая роща» · Подмосковье</div>
    <h1>Новый год в Берёзовой роще</h1>
    <p class="даты">С 31 декабря по 10 января · 40 минут от Москвы</p>
    <div class="кнопки">
      <a class="кнопка" href="${БРОНЬ}">Выбрать даты и дом</a>
      <a class="кнопка кнопка--контур" href="#условия">Что входит</a>
    </div>
    <div class="мини-отсчёт" id="отсчёт" aria-label="До Нового года">
      <span>До Нового года</span>
      <div><b data-ч="д">—</b><span>дн.</span></div>
      <div><b data-ч="ч">—</b><span>ч</span></div>
      <div><b data-ч="м">—</b><span>мин</span></div>
      <div><b data-ч="с">—</b><span>с</span></div>
    </div>
  </div>
</section>

<nav class="навигация" aria-label="Разделы страницы">
  <div class="навигация__полоса">
    <a href="#дома">Дома</a>
    <a href="#условия">Что входит</a>
    <a href="#спа">SPA</a>
    <a href="#зимой">Зимой</a>
    <a href="#вопросы">Вопросы</a>
    <a class="бронь" href="${БРОНЬ}">Забронировать</a>
  </div>
</nav>

<section class="полоса" id="коротко" aria-label="Коротко о празднике">
  <div class="факты">${факты.map(([и, з, т]) => `
    <div class="факт">${иконка(и)}<div><b>${з}</b><span>${т}</span></div></div>`).join('')}
  </div>
</section>

<section class="раздел полоса" id="дома">
  <div class="раздел__верх"><h2>Дома на Новый год</h2><p class="раздел__подпись">Выберите формат под вашу компанию. Свободные даты видно сразу в модуле бронирования.</p></div>
  <div class="дома">${дома.map(([имя, гости, текст, фото]) => `
    <a class="дом" href="${БРОНЬ}">
      <div class="дом__фото"><img src="${фото}" alt="${имя} на базе отдыха «Берёзовая роща» зимой" width="900" height="600" loading="lazy" decoding="async"></div>
      <div class="дом__низ">
        <div class="дом__строка"><h3 class="дом__имя">${имя}</h3><span class="дом__гости">${гости}</span></div>
        <p class="дом__текст">${текст}</p>
        <span class="дом__ссылка">Свободные даты →</span>
      </div>
    </a>`).join('')}
  </div>
  <p class="сноска-фото">Комплектация и новогоднее украшение домов могут отличаться от фотографий на сайте.</p>
</section>

<section class="раздел полоса" id="условия">
  <div class="раздел__верх"><h2>Что входит и что за доплату</h2></div>
  <div class="условия">
    <div class="колонка">
      <h3>Входит в проживание</h3>
      <ul>${входит.map(([и, т]) => `<li>${иконка(и)}<span>${т}</span></li>`).join('')}</ul>
    </div>
    <div class="колонка прайс">
      <h3>За дополнительную плату</h3>
      <ul>${доплата.map(([что, цена]) => `<li><b>${что}</b><span>${цена}</span></li>`).join('')}</ul>
    </div>
    <div class="цена-дома">
      <p>Стоимость проживания зависит от выбранного дома и количества гостей.</p>
      <div class="кнопки"><a class="кнопка" href="${БРОНЬ}">Узнать цену на свои даты</a><a class="кнопка кнопка--контур" href="${ТЕЛ_ССЫЛКА}">${ТЕЛЕФОН}</a></div>
    </div>
  </div>
</section>

<section class="раздел полоса" id="спа">
  <div class="раздел__верх"><h2>SPA-комплекс</h2><p class="раздел__подпись">В 300 метрах от домов. Работает с воскресенья по четверг с 10:00 до 22:00, в пятницу и субботу до 23:00.</p></div>
  <div class="спа">
    <div class="спа__текст">
      <b>Что внутри</b>
      <ul>
        <li>${иконка('отметка')}Подогреваемый бассейн под открытым небом</li>
        <li>${иконка('отметка')}Турецкий хамам</li>
        <li>${иконка('отметка')}Русская баня на дровах</li>
        <li>${иконка('отметка')}Японская баня</li>
        <li>${иконка('отметка')}Массаж и уходовые процедуры</li>
      </ul>
      <p>В стоимость входят бассейн, лежаки и бани. Банщик, массаж, полотенца, закуски и напитки оплачиваются отдельно.</p>
    </div>
    <div class="спа__цены">
      <div class="спа__цена"><b>1 000 ₽</b><span>1 час</span></div>
      <div class="спа__цена"><b>1 500 ₽</b><span>2 часа</span></div>
      <div class="спа__цена"><b>4 000 ₽</b><span>весь день</span></div>
      <p>Детям до 14 лет скидка 50 %</p>
    </div>
  </div>
</section>

<section class="раздел полоса" id="зимой">
  <div class="раздел__верх"><h2>Чем заняться зимой</h2></div>
  <div class="зимой">${зимой.map(([и, з, т]) => `
    <div class="занятие">${иконка(и)}<b>${з}</b><span>${т}</span></div>`).join('')}
  </div>
</section>

<section class="раздел полоса" id="вопросы">
  <div class="раздел__верх"><h2>Частые вопросы</h2></div>
  <div class="вопросы">${вопросы.map(([что, ответ]) => `
    <details class="вопрос"><summary>${что}</summary><p>${ответ}</p></details>`).join('')}
  </div>
</section>

<footer class="подвал" id="контакты">
  <div class="полоса подвал__сетка">
    <div class="подвал__карта">
      <h3>Как добраться</h3>
      <iframe src="https://yandex.ru/map-widget/v1/org/beryozovaya_roshcha/91160063546/?ll=36.984035%2C56.110515&z=14" loading="lazy" title="Берёзовая роща на Яндекс Картах" allowfullscreen></iframe>
      <p class="подвал__адрес">Московская область, Солнечногорский район, деревня Васюково, КДЗ Новое Мишкино 1/5 · 40 минут от Москвы</p>
      <div class="подвал__ссылки"><a href="https://yandex.ru/maps/org/beryozovaya_roshcha/91160063546/" target="_blank" rel="noopener">Открыть в Яндекс Картах</a><a href="https://go.2gis.com/39yoe" target="_blank" rel="noopener">2ГИС</a></div>
    </div>
    <form class="подвал__форма" id="форма-заявки" novalidate data-база="Берёзовая роща" data-чат="${ТГ}" data-тел="${ТЕЛЕФОН}" data-tel-link="${ТЕЛ_ССЫЛКА}">
      <h3>Оставить заявку</h3>
      <p>Подберём дом на праздники и посчитаем стоимость под вашу компанию.</p>
      <label>Имя<input name="имя" autocomplete="name" required></label>
      <label>Телефон<input name="телефон" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7" required></label>
      <div class="подвал__пара">
        <label>Заезд<input name="заезд" type="date" value="2026-12-31" min="2026-12-20" max="2027-01-15"></label>
        <label>Выезд<input name="выезд" type="date" value="2027-01-03" min="2026-12-21" max="2027-01-16"></label>
      </div>
      <label>Гостей<select name="гостей"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>8</option><option>10</option></select></label>
      <button class="кнопка" type="submit">Отправить заявку</button>
      <p class="подвал__согласие">Нажимая кнопку, вы соглашаетесь с <a href="https://ecobr.ru/privacy" target="_blank" rel="noopener">политикой конфиденциальности</a>.</p>
      <p class="подвал__итог" role="status" hidden></p>
    </form>
    <div class="подвал__контакты">
      <h3>Контакты</h3>
      <a class="подвал__тел" href="${ТЕЛ_ССЫЛКА}">${ТЕЛЕФОН}</a>
      <p>Отдел бронирования работает с 9:00 до 24:00<br><a href="mailto:BR.BP.House@yandex.ru">BR.BP.House@yandex.ru</a></p>
      <div class="подвал__мессенджеры"><a href="${ТГ}" target="_blank" rel="noopener">Telegram</a><a href="https://wa.me/74951202008" target="_blank" rel="noopener">WhatsApp</a><a href="https://max.ru/u/f9LHodD0cOJm8laQZfqVi7jnVVCh5Jiy-jmBnK8CdmUI1iVXCLbmKXSFqI0" target="_blank" rel="noopener">MAX</a><a href="https://vk.ru/bazabr" target="_blank" rel="noopener">ВКонтакте</a></div>
      <a class="кнопка кнопка--контур" href="${БРОНЬ}">Забронировать онлайн</a>
    </div>
  </div>
  <div class="полоса подвал__низ">База отдыха «Берёзовая роща» · Московская область, Солнечногорский район, деревня Васюково, КДЗ Новое Мишкино 1/5 · 40 минут от Москвы</div>
</footer>

<script>
(function () {
  var поле = document.querySelector('.снег');
  for (var i = 0; i < 55; i++) {
    var с = document.createElement('i');
    с.className = 'снежинка';
    var р = 2 + Math.random() * 4;
    с.style.width = с.style.height = р.toFixed(1) + 'px';
    с.style.left = (Math.random() * 100).toFixed(2) + '%';
    с.style.opacity = (0.2 + Math.random() * 0.4).toFixed(2);
    с.style.animationDuration = (9 + Math.random() * 14).toFixed(1) + 's';
    с.style.animationDelay = (-Math.random() * 20).toFixed(1) + 's';
    поле.appendChild(с);
  }
})();

/* Отсчёт до 00:00 1 января 2027 по Москве. */
(function () {
  var цель = Date.UTC(2026, 11, 31, 21, 0, 0), поля = {};
  document.querySelectorAll('#отсчёт [data-ч]').forEach(function (e) { поля[e.getAttribute('data-ч')] = e; });
  function два(n) { return n < 10 ? '0' + n : '' + n; }
  function тик() {
    var с = Math.max(0, Math.floor((цель - Date.now()) / 1000));
    поля.д.textContent = Math.floor(с / 86400);
    поля.ч.textContent = два(Math.floor(с % 86400 / 3600));
    поля.м.textContent = два(Math.floor(с % 3600 / 60));
    поля.с.textContent = два(с % 60);
  }
  тик(); setInterval(тик, 1000);
})();

/* Подсветка раздела в навигации и мягкое появление карточек. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var ссылки = [].slice.call(document.querySelectorAll('.навигация a[href^="#"]')), карта = {}, видимые = {};
  ссылки.forEach(function (а) { var р = document.getElementById(decodeURIComponent(а.getAttribute('href').slice(1))); if (р) карта[р.id] = а; });
  var н1 = new IntersectionObserver(function (зап) {
    зап.forEach(function (з) { видимые[з.target.id] = з.isIntersecting; });
    var т = Object.keys(карта).filter(function (id) { return видимые[id]; })[0];
    ссылки.forEach(function (а) { а.classList.remove('активна'); });
    if (т) карта[т].classList.add('активна');
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(карта).forEach(function (id) { н1.observe(document.getElementById(id)); });
  var н2 = new IntersectionObserver(function (зап) {
    зап.forEach(function (з) { if (з.isIntersecting) { з.target.classList.add('видно'); н2.unobserve(з.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.колонка, .цена-дома, .спа__текст, .спа__цены, .занятие, .вопрос').forEach(function (е) { е.classList.add('ждёт'); н2.observe(е); });
})();
</script>

<script>
/* Форма в подвале. Демо-страница живёт без сервера, поэтому заявка собирается
   в текст, копируется и открывается чат базы в Телеграме. На сайте в Тильде
   на это место встанет её форма — заявки пойдут прямо в CRM. */
(function () {
  var ф = document.getElementById('форма-заявки');
  if (!ф) return;
  var итог = ф.querySelector('.подвал__итог');
  function дата(s) { if (!s) return '—'; var p = s.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  ф.addEventListener('submit', function (e) {
    e.preventDefault();
    var имя = ф.elements['имя'], тел = ф.elements['телефон'], ок = true;
    [имя, тел].forEach(function (п) { п.removeAttribute('aria-invalid'); });
    if (!имя.value.trim()) { имя.setAttribute('aria-invalid', 'true'); ок = false; }
    if (тел.value.replace(/\\D/g, '').length < 10) { тел.setAttribute('aria-invalid', 'true'); ок = false; }
    if (!ок) { итог.hidden = false; итог.textContent = 'Укажите имя и телефон — перезвоним и подберём дом.'; (имя.getAttribute('aria-invalid') ? имя : тел).focus(); return; }
    var текст = 'Заявка на Новый год — ' + ф.dataset.база + '\\n' +
      'Имя: ' + имя.value.trim() + '\\nТелефон: ' + тел.value.trim() + '\\n' +
      'Даты: ' + дата(ф.elements['заезд'].value) + ' — ' + дата(ф.elements['выезд'].value) + '\\n' +
      'Гостей: ' + ф.elements['гостей'].value;
    function готово() {
      итог.hidden = false;
      итог.innerHTML = 'Текст заявки скопирован — вставьте его в открывшийся чат Телеграма. Или позвоните: <a href="' + ф.dataset.telLink + '">' + ф.dataset.тел + '</a>.';
      window.open(ф.dataset.чат, '_blank', 'noopener');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(текст).then(готово, готово);
    else { var t = document.createElement('textarea'); t.value = текст; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (x) {} t.remove(); готово(); }
  });
})();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'zima-br.html'), html, 'utf8');
console.log('  zima-br.html  ' + (html.length / 1024).toFixed(0) + ' КБ');
