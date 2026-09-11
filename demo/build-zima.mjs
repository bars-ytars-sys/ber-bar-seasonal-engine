/**
 * Демонстрация новогодней страницы «Зимняя сказка» для barskie-polya.ru.
 *
 * Страница собрана в оформлении сайта: тёмно-зелёный фон #314C44,
 * заголовки Lora, текст Rubik, акцент #EE995D, кремовый #EEE5D5.
 * Логотип — тот же файл, что в шапке сайта.
 *
 * 11.09.2026 — правки по таблице заказчика (лист «БП НГ»):
 *   логотип вместо текста; на обложке горят лампочки, на ёлках снег,
 *   снеговики; новые тексты; программа 31.12–10.01 с сайта /new-year
 *   (без рыбалки, с катком); чан «у дома», а не «у террасы»;
 *   «можно оплатить частями»; добавлен дом Шале.
 *
 * Запуск: node demo/build-zima.mjs   →  zima.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* Постер — ссылкой, а не внутри страницы: так zima.html весит килобайты,
   а не мегабайты, и одинаково открывается и локально, и на GitHub Pages. */
const постер = 'demo/assets/bp-zima-poster.png';
if (!fs.existsSync(path.join(ROOT, постер))) throw new Error('нет постера ' + постер);
/* Обложка — фото дома в новогодних огнях на весь экран (вариант A, 4K,
   nano-banana-pro «один в один»): широкая нарезка и вертикальная для телефона.
   В блоке описания — вариант B (ёлка слева, шары-фонари), чтобы не повторяться. */
const ОБЛОЖКА = 'demo/assets/bp-zima-hero.webp';
const ОБЛОЖКА_ТЕЛ = 'demo/assets/bp-zima-hero-tel.webp';
/* Все картинки — по настоящим фото домов БП (правило владельца 11.09):
   обложка — Ривер 4, описание — Гарден 4, карточки домов — Гарден 1,
   Барнхаус 1, Барский дом, Шале. Ни одна не повторяется. */
const ФОТО_ДОМА = 'demo/assets/bp-zima-garden4.webp';
const ФОТО_ДОМОВ = {
  риверГарден: 'demo/assets/bp-zima-dom-garden1.webp',
  барнхаус: 'demo/assets/bp-zima-dom-barnhaus.webp',
  барский: 'demo/assets/bp-zima-dom-barski.webp',
  шале: 'demo/assets/bp-zima-dom-chalet.webp'
};
for (const ф of [ОБЛОЖКА, ОБЛОЖКА_ТЕЛ, ФОТО_ДОМА, ...Object.values(ФОТО_ДОМОВ)])
  if (!fs.existsSync(path.join(ROOT, ф))) throw new Error('нет фото ' + ф);

/* Линейные иконки в цвет акцента — вместо эмодзи, которые в Windows
   мелкие и разнокалиберные. viewBox 24×24, обводка currentColor. */
const ИКОНКИ = {
  ёлка: '<path d="M12 2.5 6.5 9h3L5 15h4l-4 5.5h14L15 15h4l-4.5-6h3L12 2.5Z"/><path d="M12 20.5V22"/>',
  чан: '<ellipse cx="12" cy="13" rx="8" ry="2.5"/><path d="M4 13v4.5c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V13"/><path d="M9 4.5c-1 1 1 2 0 3.2M12 3.5c-1 1 1 2 0 3.4M15 4.5c-1 1 1 2 0 3.2"/>',
  огонь: '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6 0-3.4 2.6-5.2 3.6-8.6.3 1.9 1.4 3 2.4 3.4C11.5 6.6 13 4.2 15.5 3c-.6 2.8.4 4.6 1.6 6.3 1 1.4 1.4 2.8 1.4 4.2 0 4.2-2.7 7.5-6.5 7.5Z"/><path d="M12 21c-1.6 0-2.7-1-2.7-2.6 0-1.6 1.2-2.3 1.7-3.9.8 1 2.2 1.7 2.9 2.9.8 1.4-.2 3.6-1.9 3.6Z"/>',
  кролик: '<path d="M9 9.5C7.8 6.8 7.2 3.6 8.4 3c1.3-.6 2.7 2.6 3.1 5.8M15 9.5c1.2-2.7 1.8-5.9.6-6.5-1.3-.6-2.7 2.6-3.1 5.8"/><circle cx="12" cy="14.5" r="5.5"/><path d="M10 13.5h.01M14 13.5h.01M11 16.5c.6.5 1.4.5 2 0"/>',
  мишка: '<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="6.5" r="2.5"/><circle cx="12" cy="13" r="7.5"/><ellipse cx="12" cy="15.5" rx="3" ry="2.2"/><path d="M9.5 11h.01M14.5 11h.01"/>',
  камера: '<path d="M4 8h3.2L9 5.5h6L16.8 8H20a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.6"/>',
  стол: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="3.5"/><path d="M3 4v5c0 1 .8 1.8 1.5 1.8V20M4.5 4v4M21 4c-1.5 0-2.5 2-2.5 4.5 0 1.7.7 2.5 1.5 2.5V20"/>',
  часы: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  дом: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  карта: '<rect x="3" y="6" width="18" height="12.5" rx="2"/><path d="M3 10h18M7 15h4"/>',
  снежинка: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2"/>'
};
const иконка = (имя, класс = 'иконка') =>
  `<svg class="${класс}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ИКОНКИ[имя]}</svg>`;

/* Пункты — текст заказчика дословно, разбит на «суть — пояснение». */
const пункты = [
  ['ёлка', 'Заезжаете в зимнюю сказку', 'Дом уже наряжен: ёлка, гирлянды, атмосфера с порога.'],
  ['чан', 'Банный чан у каждого дома', 'Прямо в снегу, под открытым небом.'],
  ['огонь', 'Баня и сауна', 'А в Барском доме сауна прямо внутри дома, не нужно даже выходить на мороз. На территории нескольких домов — баня.'],
  ['кролик', 'Своя ферма', 'Кролики, шиншиллы, козочки и павлины. Бесплатно и без ограничений.'],
  ['мишка', 'Детская игровая «Детский мир»', 'Дети в своей стихии, вы — в своей: отдыхаете.'],
  ['камера', 'Русские народные костюмы', 'Выдаём бесплатно, для тех самых кадров у ёлки.']
];

const ЛОГОТИП = 'https://static.tildacdn.com/tild3262-6436-4764-a235-366133623239/photo.svg';

/* Фотографии — настоящие, с сайта (уменьшенные копии optim.tildacdn). */
const Ф = (ид, файл, ш = 600) =>
  'https://optim.tildacdn.com/' + ид + '/-/resize/' + ш + 'x/-/format/webp/' + файл;

/* ── обложка: гирлянда с горящими лампочками, ёлки в снегу, снеговики ── */
const ЦВЕТА = ['#ffd27a', '#ff8a6b', '#9fe0a0', '#8cc8ff', '#ffd27a', '#ff8a6b', '#9fe0a0', '#8cc8ff', '#ffd27a'];

function гирлянда() {
  /* провод — плавная дуга, лампочки висят на ней через равные доли */
  const точки = [];
  const x0 = 40, x1 = 1060, y0 = 40, провис = 110;
  const y = x => y0 + провис * Math.sin(Math.PI * (x - x0) / (x1 - x0));
  for (let i = 0; i < ЦВЕТА.length; i++) {
    const x = x0 + (x1 - x0) * (i + 0.5) / ЦВЕТА.length;
    точки.push({ x, y: y(x), цвет: ЦВЕТА[i], задержка: (i * 0.37 % 2.2).toFixed(2) });
  }
  const путь = 'M' + x0 + ' ' + y0 + ' Q 550 ' + (y0 + провис * 2) + ' ' + x1 + ' ' + y0;
  return `<svg class="гирлянда" viewBox="0 0 1100 230" aria-hidden="true">
    <defs>
      <filter id="свечение" x="-150%" y="-150%" width="400%" height="400%">
        <feGaussianBlur stdDeviation="7" result="р"/><feMerge><feMergeNode in="р"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path d="${путь}" fill="none" stroke="#eee5d5" stroke-width="1.6" opacity=".75"/>
    ${точки.map(т => `
    <g transform="translate(${т.x.toFixed(1)} ${т.y.toFixed(1)}) rotate(${((т.x - 550) / 40).toFixed(1)})">
      <rect x="-6" y="0" width="12" height="11" rx="2" fill="#2a4038" stroke="#eee5d5" stroke-width="1.2"/>
      <path class="лампа" style="--цвет:${т.цвет};animation-delay:-${т.задержка}s" filter="url(#свечение)"
            d="M-9 14 C-17 26,-15 44,0 48 C15 44,17 26,9 14 Z" fill="${т.цвет}"/>
    </g>`).join('')}
  </svg>`;
}

function ёлка(x, высота, снег = true) {
  /* три яруса, на каждом шапка снега */
  const ш = высота * 0.62, яр = [0, 0.3, 0.58];
  let s = `<rect x="${x - 4}" y="${высота - 2}" width="8" height="14" fill="#5b4636"/>`;
  яр.forEach((н, i) => {
    const верх = высота * н, низ = высота * (н + 0.46), полу = ш * (0.42 + i * 0.29) / 2;
    s += `<path d="M${x} ${верх} L${x + полу} ${низ} L${x - полу} ${низ} Z" fill="#23433a" stroke="#eee5d5" stroke-width="1.3" stroke-linejoin="round"/>`;
    if (снег) s += `<path d="M${x} ${верх + 2} L${x + полу * 0.55} ${верх + (низ - верх) * 0.55} Q${x + полу * 0.25} ${верх + (низ - верх) * 0.47} ${x} ${верх + (низ - верх) * 0.58} Q${x - полу * 0.25} ${верх + (низ - верх) * 0.47} ${x - полу * 0.55} ${верх + (низ - верх) * 0.55} Z" fill="#fbf8f2"/>`;
  });
  return s;
}

function снеговик(x, м = 1) {
  const о = (dy, r) => `<circle cx="${x}" cy="${dy}" r="${r * м}" fill="#fbf8f2" stroke="#d9d2c4" stroke-width="1"/>`;
  const низ = 150, r1 = 22, r2 = 16, r3 = 11;
  const y1 = низ - r1 * м, y2 = y1 - (r1 + r2 - 5) * м, y3 = y2 - (r2 + r3 - 4) * м;
  return `<g>
    ${о(y1, r1)}${о(y2, r2)}${о(y3, r3)}
    <path d="M${x - 12 * м} ${y2 - 12 * м} q${12 * м} ${7 * м} ${24 * м} 0 l${-2 * м} ${6 * м} q${-10 * м} ${4 * м} ${-20 * м} 0 z" fill="#c24a3a"/>
    <path d="M${x + 7 * м} ${y2 - 9 * м} l${4 * м} ${14 * м} l${5 * м} ${-2 * м} z" fill="#c24a3a"/>
    <rect x="${x - 9 * м}" y="${y3 - 20 * м}" width="${18 * м}" height="${12 * м}" fill="#2a2a2a"/>
    <rect x="${x - 13 * м}" y="${y3 - 9 * м}" width="${26 * м}" height="${3 * м}" fill="#2a2a2a"/>
    <circle cx="${x - 4 * м}" cy="${y3 - 2 * м}" r="${1.5 * м}" fill="#2a2a2a"/><circle cx="${x + 4 * м}" cy="${y3 - 2 * м}" r="${1.5 * м}" fill="#2a2a2a"/>
    <path d="M${x} ${y3 + 1 * м} l${11 * м} ${2 * м} l${-11 * м} ${2 * м} z" fill="#ee995d"/>
    <circle cx="${x}" cy="${y2 - 2 * м}" r="${1.8 * м}" fill="#2a2a2a"/><circle cx="${x}" cy="${y2 + 6 * м}" r="${1.8 * м}" fill="#2a2a2a"/>
    <path d="M${x - r2 * м} ${y2} l${-18 * м} ${-12 * м}" stroke="#5b4636" stroke-width="${2.2 * м}" stroke-linecap="round"/>
    <path d="M${x + r2 * м} ${y2} l${18 * м} ${-14 * м}" stroke="#5b4636" stroke-width="${2.2 * м}" stroke-linecap="round"/>
  </g>`;
}

const лес = `<svg class="лес" viewBox="0 0 760 180" aria-hidden="true">
    <defs>
      <linearGradient id="сугроб" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#fbf8f2" stop-opacity="0"/>
        <stop offset=".14" stop-color="#fbf8f2" stop-opacity=".95"/>
        <stop offset=".86" stop-color="#fbf8f2" stop-opacity=".95"/>
        <stop offset="1" stop-color="#fbf8f2" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="M0 164 Q120 140 250 147 Q380 132 520 146 Q650 138 760 162 Q380 184 0 164 Z" fill="url(#сугроб)"/>
    ${снеговик(96, 0.9)}
    <g transform="translate(0 4)">${ёлка(200, 120)}${ёлка(262, 146)}${ёлка(330, 104)}</g>
    <g transform="translate(0 0)">${ёлка(430, 150)}${ёлка(500, 118)}${ёлка(566, 138)}</g>
    ${снеговик(670, 1.05)}
  </svg>`;

/* ── программа праздников — с сайта /new-year, правки заказчика ── */
const программа = [
  ['Беспроигрышная лотерея', Ф('tild6135-3933-4964-b961-373634613538', 'ukrasennaa-elka-s-po.jpg'),
   'Каждому гостю при заезде — весёлый шанс выиграть приятные подарки и сюрпризы!'],
  ['Большая новогодняя ёлка', Ф('tild3866-3538-4737-b964-363961616335', 'portret-zensiny-v-ro.jpg'),
   'Выходите на хоровод, танцуйте и делайте яркие фото у сверкающей красавицы!'],
  ['Фотозоны и костюмы', Ф('tild3636-3566-4263-a665-393639366466', '4H3A0913.jpg'),
   'Окунитесь в атмосферу русского праздника: примеряйте костюмы Деда Мороза, Снегурочки и народные наряды. Памятные снимки — у баннера-фотозоны и в стильных декорациях!'],
  ['Подарки для всех', Ф('tild3736-3363-4133-b537-363264303466', 'noroot.png'),
   'В каждом домике вас ждут праздничные сувениры — и для взрослых, и для детей!'],
  ['Развлечения для всей семьи', Ф('tild3531-6663-4639-b236-303638323533', 'deti-v-zimnei-odezde.jpg'),
   '<ul class="черты"><li>снежные забавы: боулинг, настольные игры;</li><li>каток и лесная горка;</li><li>лыжные прогулки;</li><li>уличные игры.</li></ul>'],
  ['31 декабря — Дед Мороз и Снегурочка', Ф('tild3464-3537-4638-b134-336139313930', 'konnaa-ezda-na-.jpg'),
   'Поздравления от главных волшебников праздника — встречайте, фотографируйтесь и вручайте подарки своим детям!']
];

const вопросы = [
  ['Во сколько заезд и выезд?',
   'Заезд с 16:00, выезд до 13:00. Ранний заезд или поздний выезд — по согласованию с администрацией, при наличии свободных мест, оплачивается отдельно.'],
  ['Сколько стоит новогодний отдых?',
   'Стоимость зависит от дома и дат: дома разного размера и вместимости. Напишите или позвоните — менеджер посчитает под вашу компанию.'],
  ['Входит ли новогодний стол?',
   'Нет — как вам удобнее: в каждом доме полноценная кухня, можно готовить самим, привезти своё или заказать кейтеринг.'],
  ['Можно ли приехать с питомцем?',
   'Да. За весь период пребывания: до 5 кг — 1000 ₽, более 5 кг — 2000 ₽. Дадим миску, для крупных — лежанку.'],
  ['Можно ли оплатить частями?',
   'Да, по желанию — через «Яндекс Сплит». Можно оплатить и сразу целиком, как обычно.'],
  ['Где находится база?',
   'Московская область, Новорижское шоссе, деревня Степаньково. Около часа езды от Москвы.']
];

/* Дома — данные со страниц домов. Чан стоит у дома, не на террасе. */
const дома = [
  ['Ривер и Гарден', '4 спальных места · 55 м² · два этажа',
   'Своя территория и банный чан у дома. Ривер — у реки, с живой изгородью; Гарден — в лесу, огорожен полностью, у некоторых домов своя баня.',
   ФОТО_ДОМОВ.риверГарден],
  ['Барнхаус', '6 спальных мест · 65 м² · один этаж',
   'Просторный дом с отдельными спальнями, своей территорией и банным чаном у дома — для компании без суеты.',
   ФОТО_ДОМОВ.барнхаус],
  ['Барский дом', '6 спальных мест · 95 м² · один этаж',
   'Самый большой: банный чан у дома и сауна прямо внутри — не нужно выходить на мороз.',
   ФОТО_ДОМОВ.барский],
  ['Шале', '5 спальных мест · 95 м² · один этаж',
   'Новый дом с дизайнерским интерьером, территория полностью огорожена: современная баня, купель и банный чан.',
   ФОТО_ДОМОВ.шале]
];

const карточкаПрограммы = ([имя, фото, текст]) => `
      <article class="праздник">
        <div class="праздник__фото" style="background-image:url('${фото}')"></div>
        <div class="праздник__низ">
          <h3 class="праздник__имя">${имя}</h3>
          <div class="праздник__текст">${текст.startsWith('<') ? текст : '<p>' + текст + '</p>'}</div>
        </div>
      </article>`;

const вопрос = ([что, ответ]) => `
      <details class="вопрос">
        <summary>${что}</summary>
        <p>${ответ}</p>
      </details>`;

const карточкаДома = ([имя, свойства, текст, фото]) => `
      <article class="дом">
        <div class="дом__фото" style="background-image:url('${фото}')"></div>
        <div class="дом__низ">
          <h3 class="дом__имя">${имя}</h3>
          <p class="дом__свойства">${свойства}</p>
          <p class="дом__текст">${текст}</p>
        </div>
      </article>`;

const БРОНЬ = 'https://barskie-polya.ru/booking?dfrom=2026-12-31&amp;dto=2027-01-03&amp;adults=2&amp;scroll_to_rooms=1';

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Зимняя сказка — Барские поля</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500&family=Rubik:wght@300;400;500&display=swap">
<style>
:root{
  --фон:#314c44;
  --панель:#36564b;
  --текст:#eee5d5;
  --акцент:#ee995d;
  --кнопка:#995d2f;
  --кнопка-навод:#a36434;
}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--фон);color:var(--текст);font-family:'Rubik',Arial,sans-serif;
     font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased}
.полоса{max-width:1200px;margin:0 auto;padding:0 24px}
h1,h2,h3{font-family:'Lora','NotoSerif',Georgia,serif;font-weight:400}

/* ── шапка ── */
.шапка{display:flex;align-items:center;justify-content:space-between;gap:16px;
       padding-block:22px;border-bottom:1px solid rgba(238,229,213,.12)}
.лого img{display:block;width:172px;height:auto}
.телефон{font-size:15px;text-align:right}
.телефон span{display:block;font-size:12px;opacity:.6}

/* ── герой: фото на весь первый экран ── */
.герой{position:relative;min-height:min(100svh,920px);display:flex;flex-direction:column;overflow:hidden;
       background:#1c2c26}
.герой__фон{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 45%}
.герой__тень{position:absolute;inset:0;
  background:
    radial-gradient(ellipse 60% 42% at 50% 70%,rgba(12,20,17,.62),rgba(12,20,17,0) 100%),
    linear-gradient(180deg,rgba(14,24,21,.72) 0%,rgba(14,24,21,.18) 22%,rgba(14,24,21,.05) 40%,
                    rgba(20,34,29,.5) 62%,rgba(34,54,47,.94) 88%,var(--фон) 100%)}
/* внутри флекс-колонки margin:auto у .полоса сжимает её по содержимому — растягиваем */
.герой > .полоса{width:100%}
.герой .шапка{position:relative;z-index:3;border-bottom-color:rgba(238,229,213,.18)}
.герой .гирлянда{position:absolute;z-index:2;left:50%;top:78px;transform:translateX(-50%);
                 width:min(1280px,108%);pointer-events:none}
.герой__текст{position:relative;z-index:3;margin-top:auto;padding-block:0 64px;text-align:center}
.герой__над{font-size:13px;letter-spacing:.24em;text-transform:uppercase;opacity:.85}
.герой h1{font-size:clamp(58px,9vw,132px);line-height:.95;margin:14px 0 0;letter-spacing:.01em;
          text-shadow:0 0 40px rgba(255,200,120,.35),0 4px 30px rgba(0,0,0,.45)}
.герой .подзаголовок{margin-top:18px;font-size:clamp(17px,1.8vw,22px);color:#ffc58f;
                     text-shadow:0 2px 12px rgba(0,0,0,.5)}
.герой .ночи{text-shadow:0 2px 10px rgba(0,0,0,.6);opacity:.9}
.герой .кнопки{justify-content:center;margin-top:30px}
.вниз{display:block;margin:30px auto 0;width:26px;height:40px;border-radius:14px;
      box-shadow:inset 0 0 0 1.5px rgba(238,229,213,.55);position:relative}
.вниз::after{content:'';position:absolute;left:50%;top:9px;width:4px;height:8px;margin-left:-2px;
             border-radius:2px;background:var(--текст);animation:вниз 1.8s ease-in-out infinite}
@keyframes вниз{0%{opacity:0;transform:translateY(0)}40%{opacity:1}100%{opacity:0;transform:translateY(12px)}}

/* ── обложка (старая, не используется) ── */
.обложка{padding-block:40px 64px;text-align:center;position:relative;overflow:hidden}
.гирлянда{display:block;width:min(1100px,100%);height:auto;margin:0 auto}
.лампа{animation:мерцать 2.2s ease-in-out infinite}
@keyframes мерцать{0%,100%{opacity:1}50%{opacity:.55}}
.лес{display:block;width:min(560px,92%);height:auto;margin:-6px auto 0}
.обложка h1{font-size:clamp(46px,8vw,104px);line-height:1;text-transform:uppercase;
            margin:22px 0 0;letter-spacing:.02em;text-shadow:0 0 28px rgba(255,210,122,.25)}
.подзаголовок{margin-top:20px;font-size:19px;color:var(--акцент)}
.ночи{margin-top:8px;font-size:15px;opacity:.75;font-weight:300}

/* ── описание: фото дома и что внутри ── */
.описание{background:linear-gradient(160deg,#3a5c50,#2f4a41);border-radius:10px;overflow:hidden;
          display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.12fr);
          box-shadow:0 30px 60px -30px rgba(0,0,0,.55)}
.описание__фото{position:relative;min-height:100%}
.описание__фото img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 50%}
.описание__фото::after{content:'';position:absolute;inset:auto 0 0 0;height:45%;
                       background:linear-gradient(transparent,rgba(20,32,28,.78))}
.значок{position:absolute;left:28px;bottom:28px;z-index:2;padding:12px 18px;border-radius:8px;
        background:rgba(238,229,213,.94);color:#2b433b;line-height:1.25}
.значок b{display:block;font-family:'Lora',Georgia,serif;font-weight:500;font-size:20px}
.значок span{font-size:13px;opacity:.8}
.описание__текст{padding:52px 52px 46px}
.над{display:flex;align-items:center;gap:10px;font-size:13px;letter-spacing:.18em;
     text-transform:uppercase;color:var(--акцент)}
.над .иконка{width:18px;height:18px}
.описание h2{font-size:clamp(28px,3vw,38px);line-height:1.18;margin:14px 0 18px}
.вводный{font-size:17px;opacity:.9;max-width:560px}
.пункты{display:grid;grid-template-columns:1fr 1fr;gap:22px 30px;margin:34px 0 30px;list-style:none}
.пункт{display:grid;grid-template-columns:44px 1fr;gap:14px;align-items:start}
.иконка{width:24px;height:24px;color:var(--акцент)}
.пункт .иконка{width:44px;height:44px;padding:10px;border-radius:50%;
               background:rgba(238,153,93,.12);box-shadow:inset 0 0 0 1px rgba(238,153,93,.35)}
.пункт b{display:block;font-weight:500;font-size:16px;line-height:1.35}
.пункт span{display:block;margin-top:4px;font-size:14px;line-height:1.5;opacity:.78}
.стол{display:grid;grid-template-columns:44px 1fr;gap:14px;align-items:center;padding:16px 18px;
      border-radius:8px;background:rgba(20,32,28,.28);font-size:14.5px}
.стол .иконка{width:44px;height:44px;padding:10px}
.стол b{font-weight:500}
.условия{display:grid;grid-template-columns:repeat(3,1fr);margin:22px 0 0;
         border-top:1px solid rgba(238,229,213,.14);border-bottom:1px solid rgba(238,229,213,.14)}
.условие{display:flex;gap:10px;align-items:flex-start;padding:16px 14px 16px 0;font-size:13.5px;line-height:1.45}
.условие+.условие{padding-left:14px;border-left:1px solid rgba(238,229,213,.14)}
.условие .иконка{flex:none;width:20px;height:20px;margin-top:1px}
.условие b{display:block;font-weight:500;font-size:14px}
.условие span{opacity:.75}
.кнопки{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.кнопка{display:inline-block;padding:16px 32px;border-radius:6px;
        background:var(--кнопка);color:#fff;text-decoration:none;font-size:15px;font-weight:500;
        box-shadow:0 10px 24px -12px rgba(153,93,47,.9)}
.кнопка:hover{background:var(--кнопка-навод)}
.кнопка--контур{background:transparent;color:var(--текст);box-shadow:inset 0 0 0 1px rgba(238,229,213,.4)}
.кнопка--контур:hover{background:rgba(238,229,213,.08)}

/* ── программа ── */
.раздел{padding:76px 0 0}
.раздел h2{font-size:34px;text-transform:uppercase;text-align:center;margin-bottom:18px}
.вступление{max-width:760px;margin:0 auto 34px;text-align:center;opacity:.9}
.вступление b{display:block;margin-top:14px;color:var(--акцент);font-weight:500}
.праздники{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.праздник{background:var(--панель);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;
          transition:transform .35s ease,box-shadow .35s ease}
.праздник:hover{transform:translateY(-6px);box-shadow:0 24px 44px -24px rgba(0,0,0,.65)}
.праздник__фото{height:230px;background:#26382f center/cover no-repeat;transition:transform .7s ease}
.праздник:hover .праздник__фото{transform:scale(1.06)}
.праздник__низ{position:relative;background:var(--панель)}
.праздник__низ{padding:22px 26px 26px}
.праздник__имя{font-size:20px;color:var(--акцент);line-height:1.3;text-transform:uppercase;
               padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid rgba(238,229,213,.18)}
.праздник__текст{font-size:14.5px;opacity:.92}
.черты{list-style:none}
.черты li::before{content:'— '}
.приписка{margin-top:26px;text-align:center;font-size:15px;opacity:.85}

/* ── дома ── */
.дома{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.дом{background:var(--панель);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;
     transition:transform .35s ease,box-shadow .35s ease}
.дом:hover{transform:translateY(-6px);box-shadow:0 24px 44px -24px rgba(0,0,0,.65)}
.дом__фото{height:190px;background:#26382f center/cover no-repeat;transition:transform .7s ease}
.дом:hover .дом__фото{transform:scale(1.06)}
.дом__низ{position:relative;padding:22px 24px 26px;background:var(--панель)}
.дом__имя{font-size:22px;text-transform:uppercase;color:var(--акцент)}
.дом__свойства{margin:8px 0 12px;font-size:13px;letter-spacing:.02em;opacity:.7}
.дом__текст{font-size:15px;opacity:.9}
.дома-приписка{margin-top:18px;font-size:14px;opacity:.7;font-weight:300;text-align:center}

/* ── питание и сертификат ── */
.двое{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.плита{background:var(--панель);border-radius:6px;padding:30px 32px}
.плита h3{font-size:23px;text-transform:uppercase;color:var(--акцент);margin-bottom:14px}
.плита p{font-size:15px;opacity:.9;margin-bottom:12px}

/* ── вопросы ── */
.вопрос{background:var(--панель);border-radius:6px;padding:20px 26px;margin-bottom:12px}
.вопрос summary{cursor:pointer;font-size:17px;list-style:none;position:relative;padding-right:34px}
.вопрос summary::-webkit-details-marker{display:none}
.вопрос summary::after{content:'+';position:absolute;right:4px;top:-4px;font-size:24px;
                       color:var(--акцент);line-height:1}
.вопрос[open] summary::after{content:'−'}
.вопрос p{margin-top:12px;font-size:15px;opacity:.9}

/* ── заявка ── */
.заявка{margin-top:76px;background:var(--панель);border-radius:6px;padding:44px 40px;text-align:center}
.заявка h2{font-size:30px;text-transform:uppercase;margin-bottom:10px}
.заявка p{opacity:.85;font-weight:300;margin-bottom:24px}
.заявка a{margin:0 8px}
.кнопка--светлая{background:var(--текст);color:#314c44}
.кнопка--светлая:hover{background:#f4ecdd}

/* ── дорога ── */
.дорога{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center}
.дорога__текст p{margin-bottom:12px;font-size:15px;opacity:.9}

/* ── низ ── */
.низ{margin-top:80px;padding:44px 0 60px;border-top:1px solid rgba(238,229,213,.12);
     text-align:center;font-size:15px;opacity:.8;font-weight:300}

/* ── снег ── */
.снег{position:fixed;inset:0;pointer-events:none;z-index:5}
.снежинка{position:absolute;top:-12px;border-radius:50%;background:#fff;opacity:.5;
          animation:падать linear infinite}
@keyframes падать{
  0%{transform:translate3d(0,-12px,0)}
  100%{transform:translate3d(24px,105vh,0)}
}
@media(prefers-reduced-motion:reduce){.снежинка{display:none}.лампа{animation:none}}

@media(max-width:1000px){.дома{grid-template-columns:repeat(2,1fr)}.праздники{grid-template-columns:repeat(2,1fr)}}
@media(max-width:1100px){.пункты{grid-template-columns:1fr}}
@media(max-width:900px){
  .герой__над{letter-spacing:.1em;font-size:11.5px}
  .описание{grid-template-columns:1fr}
  .описание__фото{min-height:0;height:320px}
  .описание__текст{padding:30px 22px 28px}
  .условия{grid-template-columns:1fr}
  .условие{padding:12px 0}
  .условие+.условие{padding-left:0;border-left:0;border-top:1px solid rgba(238,229,213,.14)}
  .кнопка{width:100%;text-align:center}
  .праздники,.дома,.двое,.дорога{grid-template-columns:1fr}
  .лого img{width:136px}
}
/* ── отсчёт до Нового года ── */
.отсчёт-полоса{position:relative;z-index:4;margin-top:-44px;margin-bottom:8px}
.отсчёт{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:30px;align-items:center;
        padding:24px 32px;border-radius:14px;position:relative;overflow:hidden;
        background:linear-gradient(120deg,#3d6154,#2d473e);box-shadow:0 26px 50px -30px rgba(0,0,0,.7)}
.отсчёт::before{content:'';position:absolute;inset:-40% auto auto -10%;width:420px;height:260px;
                background:radial-gradient(closest-side,rgba(255,197,143,.22),transparent);pointer-events:none}
.отсчёт__заг{position:relative;font-family:'Lora',Georgia,serif;font-size:22px;line-height:1.25}
.отсчёт__заг span{display:block;margin-bottom:6px;font-family:'Rubik',Arial,sans-serif;font-size:12.5px;
                  letter-spacing:.18em;text-transform:uppercase;color:var(--акцент)}
.отсчёт__числа{display:flex;gap:12px}
.ячейка{min-width:82px;padding:12px 8px 10px;border-radius:10px;text-align:center;
        background:rgba(14,24,21,.35);box-shadow:inset 0 0 0 1px rgba(238,229,213,.12)}
.ячейка b{display:block;font-family:'Lora',Georgia,serif;font-weight:400;font-size:40px;line-height:1;
          font-variant-numeric:tabular-nums}
.ячейка span{display:block;margin-top:6px;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;opacity:.7}
.отсчёт .кнопка{white-space:nowrap;position:relative}
@media(max-width:900px){
  .отсчёт{grid-template-columns:1fr;text-align:center;gap:18px;padding:22px 16px}
  .отсчёт__числа{justify-content:center;gap:8px}
  .ячейка{min-width:0;flex:1}
  .ячейка b{font-size:30px}
  .отсчёт-полоса{margin-top:-10px}
}

/* ── гирлянда-разделитель ── */
.разделитель{padding-top:46px;margin-bottom:-52px;pointer-events:none}
.разделитель .гирлянда{display:block;width:min(760px,96%);height:auto;margin:0 auto}
.заявка{position:relative;overflow:hidden;
        background:radial-gradient(ellipse 70% 90% at 50% 120%,rgba(238,153,93,.32),transparent 70%),var(--панель)}
.заявка .гирлянда{display:block;width:min(640px,100%);height:auto;margin:-18px auto 6px}

/* ── появление при прокрутке (класс ставит скрипт, без JS всё видно сразу) ── */
.ждёт{opacity:0;transform:translateY(34px);
      transition:opacity .9s ease,transform .9s cubic-bezier(.2,.7,.2,1)}
.ждёт.видно{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.ждёт{opacity:1;transform:none;transition:none}}

/* телефон: фото отдельной частью сверху, текст ниже на фоне — чтобы
   заголовок не ложился на фасад дома */
@media(max-width:700px){
  .герой{min-height:0;display:block}
  .герой picture{display:block}
  .герой__фон,.герой__тень{position:relative;height:60svh;min-height:360px;max-height:540px}
  .герой__тень{position:absolute;inset:0 0 auto 0;
    background:linear-gradient(180deg,rgba(14,24,21,.7) 0%,rgba(14,24,21,0) 26%,rgba(14,24,21,0) 64%,var(--фон) 100%)}
  .герой .шапка{position:absolute;top:0;left:0;right:0}
  .герой .гирлянда{top:84px;width:120%}
  .герой__текст{margin-top:-34px;padding-bottom:36px}
  .вниз{display:none}
}
</style>
</head>
<body>

<div class="снег" aria-hidden="true"></div>

<section class="герой">
  <picture>
    <source media="(max-width:700px)" srcset="${ОБЛОЖКА_ТЕЛ}">
    <img class="герой__фон" src="${ОБЛОЖКА}" alt="Дом в Барских полях в новогодних огнях" fetchpriority="high">
  </picture>
  <div class="герой__тень"></div>
  <header class="шапка полоса">
    <a class="лого" href="https://barskie-polya.ru/"><img src="${ЛОГОТИП}" alt="Барские поля"></a>
    <div class="телефон">+7 (495) 150-39-08<span>Принимаем звонки с 9:00 до 24:00</span></div>
  </header>
  ${гирлянда()}
  <div class="герой__текст полоса">
    <div class="герой__над">База отдыха «Барские поля» · Подмосковье</div>
    <h1>Зимняя сказка</h1>
    <p class="подзаголовок">Новогодние праздники с 31 декабря по 10 января</p>
    <p class="ночи">Зимний лес в часе от Москвы — наряженный дом, чан в снегу и праздник в своём темпе</p>
    <div class="кнопки">
      <a class="кнопка" href="${БРОНЬ}">Забронировать новогодний отдых</a>
      <a class="кнопка кнопка--контур" href="#программа">Программа праздников</a>
    </div>
    <a class="вниз" href="#описание" aria-label="Листать вниз"></a>
  </div>
</section>
<section class="полоса отсчёт-полоса">
  <div class="отсчёт">
    <div class="отсчёт__заг"><span>До Нового года</span>Дома на праздники разбирают заранее</div>
    <div class="отсчёт__числа" id="отсчёт" aria-live="off">
      <div class="ячейка"><b data-ч="д">—</b><span>дней</span></div>
      <div class="ячейка"><b data-ч="ч">—</b><span>часов</span></div>
      <div class="ячейка"><b data-ч="м">—</b><span>минут</span></div>
      <div class="ячейка"><b data-ч="с">—</b><span>секунд</span></div>
    </div>
    <a class="кнопка" href="${БРОНЬ}">Выбрать даты</a>
  </div>
</section>
<div style="height:48px"></div>

<section class="полоса" id="описание">
  <div class="описание">
    <div class="описание__фото">
      <img src="${ФОТО_ДОМА}" alt="Дом в Барских полях в новогодних огнях" loading="lazy">
      <div class="значок"><b>31 декабря — 10 января</b><span>праздничная программа</span></div>
    </div>
    <div class="описание__текст">
      <div class="над">${иконка('снежинка')}Новый год за городом</div>
      <h2>Там, где скрипит снег, а не тормоза в пробке</h2>
      <p class="вводный">Час езды от Москвы по Новорижскому шоссе — и вы уже не в городе, а в зимнем лесу,
        где в доме тепло, а на улице парит банный чан. Никакой суеты — только праздник в своём темпе.</p>
      <ul class="пункты">${пункты.map(([и, суть, текст]) => `
        <li class="пункт">${иконка(и)}<div><b>${суть}</b><span>${текст}</span></div></li>`).join('')}
      </ul>
      <div class="стол">${иконка('стол')}<div><b>Новогодний стол — как вам удобнее:</b>
        в каждом доме полноценная кухня — готовьте сами, привозите своё или закажите кейтеринг.</div></div>
      <div class="условия">
        <div class="условие">${иконка('часы')}<div><b>Заезд с 16:00</b><span>выезд до 13:00</span></div></div>
        <div class="условие">${иконка('дом')}<div><b>Цена зависит от дома</b><span>уточните у менеджера</span></div></div>
        <div class="условие">${иконка('карта')}<div><b>Можно частями</b><span>по желанию, «Яндекс Сплит»</span></div></div>
      </div>
      <div class="кнопки">
        <a class="кнопка" href="${БРОНЬ}">Забронировать новогодний отдых</a>
        <a class="кнопка кнопка--контур" href="https://t.me/bazabarskie_polya">Написать менеджеру</a>
      </div>
    </div>
  </div>
</section>

<section class="раздел полоса" id="программа">
  <h2>Праздники в «Барских полях» — отдохни по-барски! 🎅</h2>
  <p class="вступление">Погрузитесь в волшебство зимней сказки и встретьте праздник с русским размахом!
    Специально для вас мы подготовили праздничную программу и подарки, чтобы сделать эти выходные незабываемыми.
    <b>С 31.12.26 по 10.01.27 вас ждёт:</b></p>
  <div class="праздники">${программа.map(карточкаПрограммы).join('')}
  </div>
  <p class="приписка">Встречайте зимние чудеса и создавайте свою новогоднюю историю в «Барских полях»!
    Погрузитесь в атмосферу тепла, заботы и волшебства этой зимы. ❄️✨</p>
</section>

<div class="разделитель" aria-hidden="true">${гирлянда()}</div>
<section class="раздел полоса">
  <h2>Дома</h2>
  <div class="дома">${дома.map(карточкаДома).join('')}
  </div>
  <p class="дома-приписка">При бронировании от 3 домов цена за дополнительного гостя не взимается.</p>
</section>

<section class="раздел полоса">
  <div class="двое">
    <div class="плита">
      <h3>Новогодний стол</h3>
      <p>Как вам удобнее: в каждом доме полноценная кухня — готовьте сами,
        привозите своё или закажите кейтеринг.</p>
      <p>Для большой компании сдаётся крытая веранда с газовым грилем и колонкой,
        с 15:00 до 23:00, от 12 000 ₽. Можно приносить свою еду.</p>
    </div>
    <div class="плита">
      <h3>Сертификат в подарок</h3>
      <p>Если дарите отдых, а даты пусть выберут сами — есть подарочные сертификаты
        номиналом 10 000, 20 000 и 30 000 ₽.</p>
      <p>Сертификат действует на проживание и дополнительные услуги.</p>
    </div>
  </div>
</section>

<div class="разделитель" aria-hidden="true">${гирлянда()}</div>
<section class="раздел полоса">
  <h2>Частые вопросы</h2>
  ${вопросы.map(вопрос).join('')}
</section>

<section class="раздел полоса">
  <h2>Как добраться</h2>
  <div class="дорога">
    <div class="дорога__текст">
      <p>Московская область, Новорижское шоссе, деревня Степаньково.
        Около часа езды от Москвы — выезжаете после работы и вечером уже в зимнем лесу.</p>
      <p>Отдел бронирования работает с 9:00 до 24:00, телефон +7 (495) 150-39-08.</p>
    </div>
    <div class="плита">
      <h3>Новогодние праздники</h3>
      <p>Праздничная программа — с 31 декабря по 10 января. Заезд с 16:00, выезд до 13:00.</p>
      <p>Количество домов ограничено — на праздники их разбирают заранее.</p>
    </div>
  </div>
</section>

<section class="полоса">
  <div class="заявка">
    ${гирлянда()}
    <h2>Поможем подобрать дом за 5 минут</h2>
    <p>Расскажите, сколько вас и что важно, — посчитаем стоимость и подберём дом под компанию.</p>
    <a class="кнопка" href="${БРОНЬ}">Забронировать новогодний отдых</a>
    <a class="кнопка кнопка--светлая" href="https://t.me/bazabarskie_polya">Написать менеджеру</a>
  </div>
</section>

<footer class="низ полоса">
  Московская область, Новорижское шоссе, деревня Степаньково · barskie-polya.ru
</footer>

<script>
/* Снег: несколько десятков точек со своим размером, скоростью и сдвигом,
   чтобы не выглядело сеткой. Двигаем только transform — страница
   от этого не пересчитывается. */
(function () {
  var поле = document.querySelector('.снег');
  for (var i = 0; i < 60; i++) {
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

/* Отсчёт до 00:00 1 января 2027 по Москве (UTC+3). */
(function () {
  var цель = Date.UTC(2026, 11, 31, 21, 0, 0);
  var поля = {};
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

/* Блоки мягко появляются при прокрутке. Класс «ждёт» ставим скриптом —
   без JS всё видно сразу. Соседние карточки — с небольшой задержкой. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var список = document.querySelectorAll('.описание, .раздел h2, .вступление, .праздник, .дом, .плита, .вопрос, .заявка');
  var н = new IntersectionObserver(function (записи) {
    записи.forEach(function (з) { if (з.isIntersecting) { з.target.classList.add('видно'); н.unobserve(з.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  список.forEach(function (е) {
    var i = Array.prototype.indexOf.call(е.parentElement.children, е);
    е.style.transitionDelay = Math.min(i, 5) * 90 + 'ms';
    е.classList.add('ждёт');
    н.observe(е);
  });
})();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'zima.html'), html, 'utf8');
console.log('  zima.html  ' + (html.length / 1024).toFixed(0) + ' КБ');
