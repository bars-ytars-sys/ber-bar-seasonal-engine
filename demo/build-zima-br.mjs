/**
 * Новогодняя страница «Зимняя сказка» для Берёзовой рощи (ecobr.ru).
 * Оформление — фирменное для БР: почти чёрный фон, мятный акцент,
 * шрифты Manrope и DespairDisplay с сервера Тильды.
 *
 * Все фото — настоящие зимние кадры с их страниц домов; обложка —
 * новогодняя версия зимнего фото A-фрейма (kie.ai, «один в один»).
 *
 * Запуск: node demo/build-zima-br.mjs   →  zima-br.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ОБЛОЖКА = 'demo/assets/eco-zima-hero.webp';
const ОБЛОЖКА_ТЕЛ = 'demo/assets/eco-zima-hero-tel.webp';
for (const ф of [ОБЛОЖКА, ОБЛОЖКА_ТЕЛ])
  if (!fs.existsSync(path.join(ROOT, ф))) throw new Error('нет фото ' + ф);

const ЛОГОТИП = 'https://static.tildacdn.com/tild6330-6562-4465-a232-323932353661/LOGO.svg';
const ТЕЛЕФОН = '+7 (495) 120-20-08';
const ТЕЛ_ССЫЛКА = 'tel:+74951202008';
const ТГ = 'https://t.me/ecobazabr';
const БРОНЬ = 'https://ecobr.ru/booking?dfrom=2026-12-31&amp;dto=2027-01-03&amp;adults=2&amp;scroll_to_rooms=1';
const Ф = (u, ш = 900) => u.replace('static.tildacdn.com', 'optim.tildacdn.com')
  .replace(/\/([^/]+)$/, '/-/resize/' + ш + 'x/-/format/webp/$1');

/* Дома — по группам, данные и зимние фото со страниц домов ecobr.ru. */
const дома = [
  ['A-фреймы', 'до 4 гостей · от 10 000 ₽',
   'Треугольные дома с панорамным остеклением: белый, чёрный, люкс и нео. У каждого банный чан, у чёрного — своя баня.',
   Ф('https://static.tildacdn.com/tild6134-3934-4635-b065-643162663465/image.png')],
  ['Хаусы', 'до 5 гостей · от 11 000 ₽',
   'Двухэтажные дома с изолированной спальней и банным чаном — для семьи или компании друзей.',
   Ф('https://static.tildacdn.com/tild6636-3439-4538-a132-646132623831/fa11355d-0634-40e2-9.png')],
  ['Барнхаусы', 'до 6 гостей · от 14 300 ₽',
   'Просторные дома с отдельными комнатами, подходят для мероприятий. У барнхауса-4 своя баня.',
   Ф('https://static.tildacdn.com/tild3361-3565-4563-b230-346632303232/e14219a5-4f95-47b2-9.png')],
  ['Баусы', 'до 2 гостей · от 13 200 ₽',
   'Зеркальные дома, растворяющиеся в лесу. Идеальны для двоих: тишина, панорамные окна и чан под звёздами.',
   Ф('https://static.tildacdn.com/tild6130-3034-4036-b330-386139363837/image_2.png')],
  ['Сфера', 'до 4 гостей · от 12 100 ₽',
   'Купольный дом необычной формы: своя баня, банный чан и гирлянды на террасе.',
   Ф('https://static.tildacdn.com/tild3934-3763-4936-b334-306266623761/clipboard-image-1766.png')],
  ['Большие дома', 'до 10 гостей · от 16 500 ₽',
   'Панорама, Сканди, Шале и Барилоче — для больших компаний и важных событий: баня, чан, отдельные спальни.',
   Ф('https://static.tildacdn.com/tild3861-3563-4462-b136-336230363135/f37b0ca3-069a-4cde-a.png')]
];

/* Что включено и вопросы — по страницам /spa, /banchan, /deti, /aktivnosti. */
const включено = [
  ['SPA-комплекс в 300 метрах', 'Горячий бассейн под открытым небом, турецкий хамам, русская баня на дровах и массаж.'],
  ['Банные чаны', 'Классический чан — 5 500 ₽ без наполнения, в SPA House — 7 000 ₽. Последняя сдача чана — не позже 22:00.'],
  ['Отдых с детьми', 'Детские кроватки и стульчики для кормления — бесплатно по запросу для гостей с детьми до 3 лет.'],
  ['Зимние активности', 'Прогулки по лесу, рыбалка, баня и чаны, сезонные развлечения — расписание уточняйте у администратора.']
];

const вопросы = [
  ['Во сколько заезд и выезд?', 'Заезд с 16:00, выезд до 13:00. Ранний заезд и поздний выезд — по согласованию, при наличии мест.'],
  ['Сколько стоит новогодний отдых?', 'Зависит от дома и дат: в будни от 10 000 ₽, в выходные и праздники — выше. Менеджер посчитает под вашу компанию.'],
  ['Входит ли банный чан?', 'Чан оплачивается отдельно: 5 500 ₽ классический, 7 000 ₽ в SPA House. Топим к вашему приезду.'],
  ['Что с питанием?', 'В домах есть всё для готовки, рядом ресторан с доставкой в дом. Новогодний стол — на ваше усмотрение.'],
  ['Где находится база?', 'Московская область, Солнечногорский район, деревня Васюково, КДЗ Новое Мишкино 1/5. Около часа от Москвы.']
];

const карточкаДома = ([имя, свойства, текст, фото]) => `
      <article class="дом">
        <div class="дом__фото" style="background-image:url('${фото}')"></div>
        <div class="дом__низ">
          <h3 class="дом__имя">${имя}</h3>
          <p class="дом__свойства">${свойства}</p>
          <p class="дом__текст">${текст}</p>
        </div>
      </article>`;

const СТИЛИ = `
@font-face{font-family:Manrope;src:url(https://static.tildacdn.com/tild3736-6431-4634-b864-383266383235/manrope-regular.woff) format('woff');font-weight:400;font-display:swap}
@font-face{font-family:Manrope;src:url(https://static.tildacdn.com/tild3039-3861-4239-a464-373839643830/manrope-medium.woff) format('woff');font-weight:500;font-display:swap}
@font-face{font-family:Manrope;src:url(https://static.tildacdn.com/tild3766-3765-4962-a361-366264663735/manrope-semibold.woff) format('woff');font-weight:600;font-display:swap}
@font-face{font-family:DespairDisplay;src:url(https://static.tildacdn.com/tild3139-3132-4331-b632-343362316164/DespairDisplay-Bold.woff) format('woff');font-weight:700;font-display:swap}
:root{--фон:#1a1b19;--панель:#222831;--панель2:#2b323b;--текст:#f4f6fb;--акцент:#2ed8a3;--тёплый:#ffd27a}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--фон);color:var(--текст);font-family:Manrope,Arial,sans-serif;font-size:16px;line-height:1.6;
     -webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:DespairDisplay,Manrope,Arial,sans-serif;font-weight:700;letter-spacing:.01em}
a{color:inherit}
.полоса{max-width:1200px;margin:0 auto;padding:0 24px}
html{scroll-behavior:smooth}
section[id]{scroll-margin-top:92px}
/* шапка и герой */
.шапка{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:20px}
.лого img{display:block;width:184px;height:auto;filter:brightness(0) invert(1);opacity:.92}
.телефон{font-size:15px;text-align:right}
.телефон span{display:block;font-size:12px;opacity:.6}
.герой{position:relative;min-height:min(100svh,920px);display:flex;flex-direction:column;overflow:hidden;background:#0e1013}
.герой__фон{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 55%}
.герой__тень{position:absolute;inset:0;background:
  radial-gradient(ellipse 60% 45% at 50% 72%,rgba(10,12,14,.6),transparent 100%),
  linear-gradient(180deg,rgba(10,12,14,.7) 0%,rgba(10,12,14,.15) 24%,rgba(10,12,14,.05) 44%,
                  rgba(16,20,22,.55) 66%,rgba(26,27,25,.95) 88%,var(--фон) 100%)}
.герой > .полоса{position:relative;z-index:3;width:100%}
.герой__текст{margin-top:auto;padding-block:0 60px;text-align:center}
.над{font-size:12.5px;letter-spacing:.22em;text-transform:uppercase;opacity:.85;color:var(--акцент)}
.герой h1{margin:14px 0 0;font-size:clamp(44px,8vw,110px);line-height:1;text-transform:uppercase;
          text-shadow:0 0 40px rgba(46,216,163,.25),0 4px 30px rgba(0,0,0,.5)}
.герой .даты{margin-top:16px;font-size:clamp(16px,1.8vw,21px);color:var(--тёплый)}
.герой .лид{margin-top:8px;opacity:.88}
.кнопки{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:28px}
.кнопка{display:inline-block;padding:15px 30px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;
        background:var(--акцент);color:#10231c;box-shadow:0 14px 30px -16px rgba(46,216,163,.9);transition:.25s}
.кнопка:hover{background:#48e6b4;transform:translateY(-2px)}
.кнопка--контур{background:transparent;color:var(--текст);box-shadow:inset 0 0 0 1px rgba(244,246,251,.35)}
.кнопка--контур:hover{background:rgba(244,246,251,.08)}
/* навигация */
.навигация{position:sticky;top:0;z-index:30;background:rgba(16,17,20,.9);backdrop-filter:blur(12px);
           border-bottom:1px solid rgba(244,246,251,.12)}
.навигация__полоса{display:flex;gap:10px;align-items:center;max-width:1200px;margin:0 auto;padding:12px 24px;
                   overflow-x:auto;scrollbar-width:none}
.навигация__полоса::-webkit-scrollbar{display:none}
.навигация a{position:relative;white-space:nowrap;text-decoration:none;font-size:14.5px;padding:10px 18px;border-radius:999px;
             background:rgba(244,246,251,.06);box-shadow:inset 0 0 0 1px rgba(244,246,251,.14);transition:.25s}
.навигация a:hover{background:rgba(244,246,251,.13)}
.навигация a.активна{color:#bff6e3;background:rgba(46,216,163,.18);box-shadow:inset 0 0 0 1px rgba(46,216,163,.6)}
.навигация .бронь{margin-left:auto;background:var(--акцент);color:#10231c;font-weight:600}
.навигация .бронь::after{content:'';position:absolute;inset:0;border-radius:999px;animation:пульс 2.8s ease-out infinite}
@keyframes пульс{0%{box-shadow:0 0 0 0 rgba(46,216,163,.45)}70%{box-shadow:0 0 0 14px rgba(46,216,163,0)}100%{box-shadow:0 0 0 0 rgba(46,216,163,0)}}
section:target h2{animation:вспышка 1.6s ease-out}
@keyframes вспышка{0%{color:#bff6e3;text-shadow:0 0 30px rgba(46,216,163,.7)}100%{color:inherit;text-shadow:none}}
/* отсчёт */
.отсчёт-полоса{position:relative;z-index:4;margin-top:-44px}
.отсчёт{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:28px;align-items:center;padding:24px 30px;
        border-radius:16px;background:linear-gradient(120deg,#252c35,#1d232a);box-shadow:0 26px 50px -30px rgba(0,0,0,.8)}
.отсчёт__заг{font-family:DespairDisplay,Manrope,sans-serif;font-size:20px;line-height:1.3}
.отсчёт__заг span{display:block;margin-bottom:6px;font-family:Manrope,sans-serif;font-size:12px;letter-spacing:.18em;
                  text-transform:uppercase;color:var(--акцент)}
.отсчёт__числа{display:flex;gap:12px}
.ячейка{min-width:80px;padding:12px 8px 10px;border-radius:12px;text-align:center;background:rgba(10,12,14,.5);
        box-shadow:inset 0 0 0 1px rgba(244,246,251,.1)}
.ячейка b{display:block;font-family:DespairDisplay,Manrope,sans-serif;font-size:36px;line-height:1;font-variant-numeric:tabular-nums}
.ячейка span{display:block;margin-top:6px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.65}
/* разделы */
.раздел{padding-top:84px}
.раздел h2{font-size:clamp(28px,3.4vw,40px);text-transform:uppercase;text-align:center;margin-bottom:16px}
.вступление{max-width:760px;margin:0 auto 34px;text-align:center;opacity:.85}
/* заезд: уровни */
.заезд{border-radius:18px;overflow:hidden;background:linear-gradient(150deg,#252c35,#1c2127);
       box-shadow:0 30px 60px -34px rgba(0,0,0,.85)}
.заезд__кратко{padding:32px 36px}
.заезд__даты{display:inline-block;padding:8px 16px;border-radius:999px;color:#bff6e3;font-size:14px;
             background:rgba(46,216,163,.14);box-shadow:inset 0 0 0 1px rgba(46,216,163,.45)}
.заезд__лид{margin-top:18px;font-size:19px;max-width:680px}
.заезд__список{list-style:none;display:flex;flex-wrap:wrap;gap:12px 26px;margin:20px 0 24px;font-size:15px;opacity:.9}
.заезд__список li::before{content:'—  ';color:var(--акцент)}
.раскрыть{border:0;cursor:pointer;font:inherit}
.заезд__подробно{padding:0 36px 32px;border-top:1px solid rgba(244,246,251,.12)}
.заезд__подробно[hidden]{display:none}
.подробно__сетка{display:grid;grid-template-columns:1fr 1fr;gap:22px 40px;padding:24px 0 4px}
.подробно__сетка h3{font-size:18px;color:var(--акцент);margin-bottom:10px}
.подробно__сетка ul{list-style:none}
.подробно__сетка li{margin-bottom:8px;font-size:15px;opacity:.88;padding-left:18px;text-indent:-18px}
.подробно__сетка li::before{content:'— '}
.действия{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}
.действие{display:block;padding:20px;border-radius:14px;text-decoration:none;background:rgba(10,12,14,.42);
          box-shadow:inset 0 0 0 1px rgba(244,246,251,.12);transition:.3s}
a.действие:hover{background:rgba(10,12,14,.62);transform:translateY(-4px)}
.действие b{display:block;font-size:17px;margin-bottom:4px}
.действие span{display:block;font-size:13.5px;opacity:.7}
.модуль{display:grid;gap:10px;margin-top:12px}
.модуль label{display:grid;gap:4px;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;opacity:.65}
.модуль input,.модуль select{font:inherit;color:var(--текст);background:rgba(10,12,14,.6);border:0;border-radius:10px;
                             padding:10px 12px;box-shadow:inset 0 0 0 1px rgba(244,246,251,.16)}
.модуль .кнопка{margin-top:6px;text-align:center}
/* дома */
.дома{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.дом{background:var(--панель);border-radius:16px;overflow:hidden;display:flex;flex-direction:column;transition:.35s}
.дом:hover{transform:translateY(-6px);box-shadow:0 26px 46px -26px rgba(0,0,0,.8)}
.дом__фото{height:210px;background:#12151a center/cover no-repeat;transition:transform .7s}
.дом:hover .дом__фото{transform:scale(1.06)}
.дом__низ{padding:22px 24px 26px}
.дом__имя{font-size:21px;color:var(--акцент);text-transform:uppercase}
.дом__свойства{margin:8px 0 12px;font-size:13px;opacity:.65}
.дом__текст{font-size:15px;opacity:.88}
/* что включено, вопросы, заявка */
.плиты{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.плита{background:var(--панель);border-radius:16px;padding:26px 28px}
.плита h3{font-size:19px;color:var(--акцент);margin-bottom:10px}
.плита p{font-size:15px;opacity:.88}
.вопрос{background:var(--панель);border-radius:14px;padding:18px 24px;margin-bottom:12px}
.вопрос summary{cursor:pointer;font-size:17px;list-style:none;position:relative;padding-right:32px}
.вопрос summary::-webkit-details-marker{display:none}
.вопрос summary::after{content:'+';position:absolute;right:2px;top:-3px;font-size:24px;color:var(--акцент)}
.вопрос[open] summary::after{content:'−'}
.вопрос p{margin-top:10px;font-size:15px;opacity:.85}
.заявка{margin-top:84px;padding:46px 40px;border-radius:20px;text-align:center;position:relative;overflow:hidden;
        background:radial-gradient(ellipse 70% 90% at 50% 120%,rgba(46,216,163,.25),transparent 70%),var(--панель)}
.заявка h2{margin-bottom:10px}
.заявка p{opacity:.85;margin-bottom:22px}
.низ{margin-top:84px;padding:40px 0 56px;border-top:1px solid rgba(244,246,251,.12);text-align:center;font-size:15px;opacity:.75}
/* снег и появление */
.снег{position:fixed;inset:0;pointer-events:none;z-index:5}
.снежинка{position:absolute;top:-12px;border-radius:50%;background:#fff;opacity:.45;animation:падать linear infinite}
@keyframes падать{0%{transform:translate3d(0,-12px,0)}100%{transform:translate3d(24px,105vh,0)}}
.ждёт{opacity:0;transform:translateY(30px);transition:opacity .9s ease,transform .9s cubic-bezier(.2,.7,.2,1)}
.ждёт.видно{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.снежинка{display:none}.ждёт{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}}
@media(max-width:1000px){.дома{grid-template-columns:repeat(2,1fr)}}
@media(max-width:900px){
  .отсчёт{grid-template-columns:1fr;text-align:center;gap:16px;padding:22px 16px}
  .отсчёт__числа{justify-content:center;gap:8px}.ячейка{min-width:0;flex:1}.ячейка b{font-size:28px}
  .заезд__кратко{padding:24px 18px}.заезд__подробно{padding:0 18px 24px}
  .подробно__сетка,.действия,.дома,.плиты{grid-template-columns:1fr}
  .кнопка{width:100%;text-align:center}
  .отсчёт-полоса{margin-top:-10px}
}
@media(max-width:700px){
  .герой{min-height:0;display:block}
  .герой picture{display:block}
  .герой__фон,.герой__тень{position:relative;height:58svh;min-height:340px;max-height:520px}
  .герой__тень{position:absolute;inset:0 0 auto 0;background:linear-gradient(180deg,rgba(10,12,14,.65) 0%,
    rgba(10,12,14,0) 28%,rgba(10,12,14,0) 66%,var(--фон) 100%)}
  .герой .шапка{position:absolute;top:0;left:0;right:0;z-index:4}
  .герой__текст{margin-top:-30px;padding-bottom:32px}
}
`;

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Новый год в «Берёзовой роще» — дома, SPA и чаны в зимнем лесу</title>
<meta name="description" content="Новогодние праздники на экобазе «Берёзовая роща» в Подмосковье: дизайнерские дома в зимнем лесу, банные чаны, SPA-комплекс с бассейном под открытым небом и баней на дровах.">
<style>${СТИЛИ}</style>
</head>
<body>

<div class="снег" aria-hidden="true"></div>

<section class="герой">
  <picture>
    <source media="(max-width:700px)" srcset="${ОБЛОЖКА_ТЕЛ}">
    <img class="герой__фон" src="${ОБЛОЖКА}" alt="Дом в Берёзовой роще в новогодних огнях" fetchpriority="high">
  </picture>
  <div class="герой__тень"></div>
  <header class="шапка полоса">
    <a class="лого" href="https://ecobr.ru/"><img src="${ЛОГОТИП}" alt="Берёзовая роща"></a>
    <div class="телефон">${ТЕЛЕФОН}<span>Принимаем звонки с 9:00 до 24:00</span></div>
  </header>
  <div class="герой__текст полоса">
    <div class="над">Экобаза «Берёзовая роща» · Подмосковье</div>
    <h1>Новый год<br>в зимнем лесу</h1>
    <p class="даты">Новогодние праздники с 31 декабря по 10 января</p>
    <p class="лид">Дизайнерские дома, чан в снегу и SPA с бассейном под открытым небом — час от Москвы</p>
    <div class="кнопки">
      <a class="кнопка" href="${БРОНЬ}">Забронировать дом</a>
      <a class="кнопка кнопка--контур" href="#заезд">Что входит</a>
    </div>
  </div>
</section>

<nav class="навигация" aria-label="Разделы страницы">
  <div class="навигация__полоса">
    <a href="#заезд">Заезд</a>
    <a href="#дома">Дома</a>
    <a href="#включено">Что включено</a>
    <a href="#вопросы">Вопросы</a>
    <a class="бронь" href="${БРОНЬ}">Забронировать</a>
  </div>
</nav>

<section class="полоса отсчёт-полоса">
  <div class="отсчёт">
    <div class="отсчёт__заг"><span>До Нового года</span>Дома на праздники разбирают заранее</div>
    <div class="отсчёт__числа" id="отсчёт">
      <div class="ячейка"><b data-ч="д">—</b><span>дней</span></div>
      <div class="ячейка"><b data-ч="ч">—</b><span>часов</span></div>
      <div class="ячейка"><b data-ч="м">—</b><span>минут</span></div>
      <div class="ячейка"><b data-ч="с">—</b><span>секунд</span></div>
    </div>
    <a class="кнопка" href="${БРОНЬ}">Выбрать даты</a>
  </div>
</section>

<section class="раздел полоса" id="заезд">
  <h2>Новогодний заезд</h2>
  <div class="заезд">
    <div class="заезд__кратко">
      <div class="заезд__даты">31 декабря — 10 января</div>
      <p class="заезд__лид">Дом в зимнем лесу, банный чан прямо у дома и SPA-комплекс в трёх сотнях метров:
        бассейн под открытым небом, хамам и русская баня на дровах.</p>
      <ul class="заезд__список">
        <li>22 дома: от зеркальных для двоих до больших на 10 гостей</li>
        <li>Банный чан у дома — топим к приезду</li>
        <li>Заезд с 16:00, выезд до 13:00</li>
      </ul>
      <button class="кнопка кнопка--контур раскрыть" type="button" aria-expanded="false" aria-controls="заезд-подробно">Подробнее</button>
    </div>
    <div class="заезд__подробно" id="заезд-подробно" hidden>
      <div class="подробно__сетка">
        <div>
          <h3>Что в доме</h3>
          <ul>
            <li>кухня со всем необходимым, посуда и техника</li>
            <li>тёплые полы и панорамные окна в лес</li>
            <li>мангальная зона и дрова на своей территории</li>
            <li>детские кроватки и стульчики — бесплатно по запросу</li>
          </ul>
        </div>
        <div>
          <h3>Что рядом</h3>
          <ul>
            <li>SPA-комплекс: бассейн под открытым небом, хамам, массаж</li>
            <li>русская баня на дровах, 80–90 градусов, веники</li>
            <li>банные чаны с наполнением на выбор</li>
            <li>прогулки по лесу и зимние активности</li>
          </ul>
        </div>
      </div>
      <div class="действия">
        <a class="действие" href="${ТЕЛ_ССЫЛКА}"><b>Позвонить</b><span>${ТЕЛЕФОН} · с 9:00 до 24:00</span></a>
        <a class="действие" href="${ТГ}"><b>Оставить заявку</b><span>менеджер подберёт дом и посчитает</span></a>
        <div class="действие"><b>Подобрать даты</b><span>свободные дома на ваши числа</span>
          <div class="модуль">
            <label>Заезд<input type="date" id="дата-заезд" value="2026-12-31" min="2026-12-25" max="2027-01-10"></label>
            <label>Выезд<input type="date" id="дата-выезд" value="2027-01-03" min="2026-12-26" max="2027-01-11"></label>
            <label>Гостей<select id="гостей"><option>2</option><option>4</option><option>5</option><option>6</option><option>8</option><option>10</option></select></label>
            <a class="кнопка" id="кнопка-брони" href="${БРОНЬ}">Смотреть свободные дома</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="раздел полоса" id="дома">
  <h2>Дома</h2>
  <p class="вступление">22 дома в лесу: от зеркальных для двоих до больших на 10 гостей. У каждого своя территория и банный чан.</p>
  <div class="дома">${дома.map(карточкаДома).join('')}
  </div>
</section>

<section class="раздел полоса" id="включено">
  <h2>Что включено и что рядом</h2>
  <div class="плиты">
    ${включено.map(([что, текст]) => `<div class="плита"><h3>${что}</h3><p>${текст}</p></div>`).join('')}
  </div>
</section>

<section class="раздел полоса" id="вопросы">
  <h2>Частые вопросы</h2>
  ${вопросы.map(([что, ответ]) => `
      <details class="вопрос"><summary>${что}</summary><p>${ответ}</p></details>`).join('')}
</section>

<section class="полоса" id="заявка">
  <div class="заявка">
    <h2>Подберём дом за 5 минут</h2>
    <p>Расскажите, сколько вас и что важно, — посчитаем стоимость и предложим свободные дома на праздники.</p>
    <div class="кнопки">
      <a class="кнопка" href="${БРОНЬ}">Забронировать дом</a>
      <a class="кнопка кнопка--контур" href="${ТГ}">Написать менеджеру</a>
    </div>
  </div>
</section>

<footer class="низ полоса">
  Московская область, Солнечногорский район, деревня Васюково, КДЗ Новое Мишкино 1/5 · ecobr.ru<br>
  ${ТЕЛЕФОН} · отдел бронирования с 9:00 до 24:00
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

/* Второй уровень блока заезда. */
(function () {
  var кнопка = document.querySelector('.раскрыть'), блок = document.getElementById('заезд-подробно');
  if (!кнопка || !блок) return;
  кнопка.addEventListener('click', function () {
    var открыт = кнопка.getAttribute('aria-expanded') === 'true';
    кнопка.setAttribute('aria-expanded', открыт ? 'false' : 'true');
    блок.hidden = открыт;
    кнопка.textContent = открыт ? 'Подробнее' : 'Свернуть';
  });
})();

/* Подбор дат → модуль бронирования. */
(function () {
  var з = document.getElementById('дата-заезд'), в = document.getElementById('дата-выезд'),
      г = document.getElementById('гостей'), к = document.getElementById('кнопка-брони');
  if (!з || !в || !г || !к) return;
  function собрать() {
    if (в.value <= з.value) { var д = new Date(з.value); д.setDate(д.getDate() + 1); в.value = д.toISOString().slice(0, 10); }
    к.href = 'https://ecobr.ru/booking?dfrom=' + з.value + '&dto=' + в.value + '&adults=' + г.value + '&scroll_to_rooms=1';
  }
  [з, в, г].forEach(function (п) { п.addEventListener('change', собрать); });
  собрать();
})();

/* Подсветка раздела и появление блоков. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  var ссылки = [].slice.call(document.querySelectorAll('.навигация a[href^="#"]')), карта = {}, видимые = {};
  ссылки.forEach(function (а) {
    var р = document.getElementById(decodeURIComponent(а.getAttribute('href').slice(1)));
    if (р) карта[р.id] = а;
  });
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
  document.querySelectorAll('.заезд, .дом, .плита, .вопрос, .заявка, .раздел h2').forEach(function (е) {
    е.classList.add('ждёт'); н2.observe(е);
  });
})();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'zima-br.html'), html, 'utf8');
console.log('  zima-br.html  ' + (html.length / 1024).toFixed(0) + ' КБ');
