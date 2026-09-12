/**
 * Расширенная страница «Вся программа праздников» — третий уровень
 * новогоднего блока: с главной (zima.html) на неё ведут «Подробнее»
 * в карточках программы и ссылка из раскрытого блока заезда.
 *
 * Стили берутся из собранной zima.html, чтобы оформление совпадало.
 * Порядок: node demo/build-zima.mjs && node demo/build-zima-programma.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const главная = fs.readFileSync(path.join(ROOT, 'zima.html'), 'utf8');
const стили = (главная.match(/<style>([\s\S]*?)<\/style>/) || [])[1];
if (!стили) throw new Error('в zima.html нет стилей — сначала node demo/build-zima.mjs');

const ЛОГОТИП = 'https://static.tildacdn.com/tild3262-6436-4764-a235-366133623239/photo.svg';
const БРОНЬ = 'https://barskie-polya.ru/booking?dfrom=2026-12-31&amp;dto=2027-01-03&amp;adults=2&amp;scroll_to_rooms=1';
const Ф = (ид, файл, ш = 900) =>
  'https://optim.tildacdn.com/' + ид + '/-/resize/' + ш + 'x/-/format/webp/' + файл;

/* Разделы программы: якоря те же, что у «Подробнее» в карточках на главной. */
const разделы = [
  ['loterea', 'Беспроигрышная лотерея', Ф('tild6135-3933-4964-b961-373634613538', 'ukrasennaa-elka-s-po.jpg'),
   ['Лотерея ждёт каждого гостя прямо при заезде — проигравших нет.',
    'Тянете билет, забираете подарок или сюрприз и оказываетесь в празднике ещё до того, как разобрали вещи.']],
  ['elka', 'Большая новогодняя ёлка', Ф('tild3866-3538-4737-b964-363961616335', 'portret-zensiny-v-ro.jpg'),
   ['На территории наряжена большая ёлка — та самая, вокруг которой водят хоровод.',
    'Приходите танцевать с детьми и фотографироваться у сверкающей красавицы: вечером она горит огнями и получается лучший кадр праздника.']],
  ['fotozony', 'Фотозоны и костюмы', Ф('tild3636-3566-4263-a665-393639366466', '4H3A0913.jpg'),
   ['Окунитесь в атмосферу русского праздника: примеряйте костюмы Деда Мороза, Снегурочки и народные наряды.',
    'Костюмы выдаём бесплатно. Памятные снимки — у баннера-тантамарески и в праздничных декорациях на территории.']],
  ['podarki', 'Подарки для всех', Ф('tild3736-3363-4133-b537-363264303466', 'noroot.png'),
   ['В каждом домике гостей ждут праздничные сувениры — и для взрослых, и для детей.',
    'Подарки лежат в доме к вашему заезду: открывайте сразу или оставьте на новогоднюю ночь.']],
  ['razvlecheniya', 'Развлечения для всей семьи', Ф('tild3531-6663-4639-b236-303638323533', 'deti-v-zimnei-odezde.jpg'),
   ['Зимой работают снежные забавы: боулинг и настольные игры, каток и лесная горка, лыжные прогулки и уличные игры.',
    'Кататься можно весь день: горка рядом с домами, каток на территории, лыжи — по лесным дорожкам вокруг базы.']],
  ['ded-moroz', '31 декабря — Дед Мороз и Снегурочка', Ф('tild3464-3537-4638-b134-336139313930', 'konnaa-ezda-na-.jpg'),
   ['Главные волшебники праздника приезжают 31 декабря и поздравляют гостей.',
    'Встречайте их, фотографируйтесь и вручайте подготовленные подарки своим детям. Подробности у администратора.']]
];

/* Что на территории помимо программы. Фото — наши новогодние виды домов. */
const территория = [
  ['ferma', 'Своя ферма', 'demo/assets/bp-zima-dom-garden1.webp',
   ['Кролики, шиншиллы, козочки и павлины живут на базе круглый год.',
    'Посещение бесплатное и без ограничений — дети готовы проводить там полдня даже зимой.']],
  ['detskiy', 'Детская игровая «Детский мир»', 'demo/assets/bp-zima-dom-barnhaus.webp',
   ['Отдельная игровая комната для самых маленьких гостей.',
    'Дети заняты и в тепле, родители в это время отдыхают — в чане, в бане или просто в тишине.']],
  ['banya', 'Баня, сауна и банный чан', 'demo/assets/bp-zima-dom-barski.webp',
   ['Банный чан стоит у каждого дома — прямо в снегу, под открытым небом. Топим к приезду, наполнение оплачивается отдельно.',
    'В Барском доме сауна прямо внутри дома — не нужно выходить на мороз. На территории нескольких домов есть своя баня.']],
  ['pitanie', 'Новогодний стол и питание', 'demo/assets/bp-zima-dom-chalet.webp',
   ['Стол — как вам удобнее: в каждом доме полноценная кухня, можно готовить самим, привезти своё или заказать кейтеринг.',
    'Для компании сдаётся крытая веранда с газовым грилем и колонкой, с 15:00 до 23:00, от 12 000 ₽ — свою еду приносить можно.']]
];

const условия = [
  ['Даты программы', 'Праздничная программа идёт с 31 декабря по 10 января.'],
  ['Заезд и выезд', 'Заезд с 16:00, выезд до 13:00. Ранний заезд и поздний выезд — по согласованию, при наличии мест, оплачиваются отдельно.'],
  ['Стоимость', 'Зависит от дома и дат: дома разного размера и вместимости. Менеджер посчитает под вашу компанию.'],
  ['Оплата', 'Можно оплатить сразу целиком, а по желанию — частями через «Яндекс Сплит».'],
  ['С питомцем', 'Можно: за весь период до 5 кг — 1000 ₽, более 5 кг — 2000 ₽. Дадим миску, для крупных — лежанку.'],
  ['Сертификат', 'Есть подарочные сертификаты на 10 000, 20 000 и 30 000 ₽ — на проживание и дополнительные услуги.']
];

/* Разделы чередуются: фото то слева, то справа. */
const блок = ([якорь, имя, фото, абзацы], i) => `
<section class="раздел полоса" id="${якорь}">
  <div class="описание${i % 2 ? ' фото-справа' : ''}">
    <div class="описание__фото">
      <img src="${фото}" alt="${имя}" loading="lazy">
    </div>
    <div class="описание__текст">
      <h2 style="text-align:left;text-transform:none;font-size:30px;margin-bottom:16px">${имя}</h2>
      ${абзацы.map(а => `<p class="вводный" style="margin-bottom:14px">${а}</p>`).join('')}
    </div>
  </div>
</section>`;

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Вся программа праздников — «Зимняя сказка» в Барских полях</title>
<meta name="description" content="Программа новогодних праздников на базе отдыха «Барские поля» с 31 декабря по 10 января: лотерея, ёлка, фотозоны и костюмы, подарки, каток и лесная горка, Дед Мороз 31 декабря.">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500&family=Rubik:wght@300;400;500&display=swap">
<style>
${стили}
/* страница программы: компактная шапка вместо первого экрана */
.верх{position:relative;padding-block:30px 44px;text-align:center;overflow:hidden}
.верх::before{content:'';position:absolute;inset:-40% -10% auto -10%;height:340px;
              background:radial-gradient(closest-side,rgba(238,153,93,.2),transparent);pointer-events:none}
.верх h1{position:relative;font-size:clamp(34px,5vw,58px);line-height:1.05;margin-top:12px}
.верх .подзаголовок{position:relative;margin-top:14px;font-size:18px;color:var(--акцент)}
/* разделы чередуются: фото то слева, то справа; на телефоне — всегда сверху */
.описание.фото-справа .описание__фото{order:2}
@media(max-width:900px){.описание.фото-справа .описание__фото{order:0}}
.назад{display:inline-flex;align-items:center;gap:8px;margin-top:18px;color:var(--текст);
       text-decoration:none;font-size:15px;opacity:.85}
.назад:hover{opacity:1}
</style>
</head>
<body>

<div class="снег" aria-hidden="true"></div>

<header class="шапка полоса">
  <a class="лого" href="https://barskie-polya.ru/"><img src="${ЛОГОТИП}" alt="Барские поля"></a>
  <div class="телефон">+7 (495) 150-39-08<span>Принимаем звонки с 9:00 до 24:00</span></div>
</header>

<nav class="навигация" aria-label="Разделы программы">
  <div class="навигация__полоса">
    <a href="#loterea">Лотерея</a>
    <a href="#elka">Ёлка</a>
    <a href="#fotozony">Фотозоны</a>
    <a href="#podarki">Подарки</a>
    <a href="#razvlecheniya">Развлечения</a>
    <a href="#ded-moroz">Дед Мороз</a>
    <a href="#territoriya">На территории</a>
    <a href="#usloviya">Условия</a>
    <a class="бронь" href="${БРОНЬ}">Забронировать</a>
  </div>
</nav>

<section class="верх полоса">
  <div class="герой__над">База отдыха «Барские поля» · Подмосковье</div>
  <h1>Вся программа праздников</h1>
  <p class="подзаголовок">С 31 декабря по 10 января</p>
  <div><a class="назад" href="zima.html"><span aria-hidden="true">←</span>Вернуться на «Зимнюю сказку»</a></div>
</section>

${разделы.map(блок).join('')}

<div class="разделитель" aria-hidden="true"></div>

<section class="раздел полоса" id="territoriya">
  <h2>Что есть на территории</h2>
  <p class="вступление">Программа идёт поверх обычной жизни базы: ферма, детская игровая,
    бани и чаны работают всю зиму.</p>
</section>
${территория.map(блок).join('')}

<section class="раздел полоса" id="usloviya">
  <h2>Условия</h2>
  <div class="двое" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
    ${условия.map(([что, текст]) => `<div class="плита"><h3>${что}</h3><p>${текст}</p></div>`).join('')}
  </div>
</section>

<section class="полоса" id="zayavka">
  <div class="заявка">
    <h2>Забронировать новогодний отдых</h2>
    <p>Расскажите, сколько вас и что важно, — подберём дом и посчитаем стоимость.</p>
    <div class="действия" style="text-align:left;margin-top:6px">
      <a class="действие" href="tel:+74951503908"><b>Позвонить</b><span>+7 (495) 150-39-08 · с 9:00 до 24:00</span></a>
      <a class="действие" href="https://t.me/bazabarskie_polya"><b>Оставить заявку</b><span>менеджер ответит в Телеграме</span></a>
      <a class="действие" href="${БРОНЬ}"><b>Выбрать даты</b><span>свободные дома на 31.12 — 10.01</span></a>
    </div>
  </div>
</section>

<footer class="низ полоса">
  <a class="назад" href="zima.html"><span aria-hidden="true">←</span>Вернуться на «Зимнюю сказку»</a><br><br>
  Московская область, Новорижское шоссе, деревня Степаньково · barskie-polya.ru
</footer>

<script>
/* Снег — как на главной. */
(function () {
  var поле = document.querySelector('.снег');
  for (var i = 0; i < 50; i++) {
    var с = document.createElement('i');
    с.className = 'снежинка';
    var р = 2 + Math.random() * 4;
    с.style.width = с.style.height = р.toFixed(1) + 'px';
    с.style.left = (Math.random() * 100).toFixed(2) + '%';
    с.style.opacity = (0.25 + Math.random() * 0.45).toFixed(2);
    с.style.animationDuration = (9 + Math.random() * 14).toFixed(1) + 's';
    с.style.animationDelay = (-Math.random() * 20).toFixed(1) + 's';
    поле.appendChild(с);
  }
})();

/* Навигация: подсветка раздела, который сейчас на экране. */
(function () {
  var ссылки = [].slice.call(document.querySelectorAll('.навигация a[href^="#"]'));
  if (!ссылки.length || !('IntersectionObserver' in window)) return;
  var карта = {}, видимые = {};
  ссылки.forEach(function (а) {
    var р = document.getElementById(decodeURIComponent(а.getAttribute('href').slice(1)));
    if (р) карта[р.id] = а;
  });
  var н = new IntersectionObserver(function (записи) {
    записи.forEach(function (з) { видимые[з.target.id] = з.isIntersecting; });
    var текущий = Object.keys(карта).filter(function (id) { return видимые[id]; })[0];
    ссылки.forEach(function (а) { а.classList.remove('активна'); });
    if (текущий) карта[текущий].classList.add('активна');
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(карта).forEach(function (id) { н.observe(document.getElementById(id)); });
})();

/* Блоки появляются при прокрутке. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var список = document.querySelectorAll('.описание, .раздел h2, .вступление, .плита, .заявка');
  var н = new IntersectionObserver(function (записи) {
    записи.forEach(function (з) { if (з.isIntersecting) { з.target.classList.add('видно'); н.unobserve(з.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  список.forEach(function (е) { е.classList.add('ждёт'); н.observe(е); });
})();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'zima-programma.html'), html, 'utf8');
console.log('  zima-programma.html  ' + (html.length / 1024).toFixed(0) + ' КБ');
