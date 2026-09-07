/**
 * Демонстрация новогодней страницы «Зимняя сказка» для barskie-polya.ru.
 *
 * Страница собрана в оформлении сайта: тёмно-зелёный фон #314C44,
 * заголовки Lora, текст Rubik, акцент #EE995D, кремовый #EEE5D5.
 * Рисунки гирлянды и деревьев — те же файлы, что стоят на сайте.
 *
 * Запуск: node demo/build-zima.mjs   →  zima.html
 * Смотреть: http://localhost:8749/zima.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* Постер — ссылкой, а не внутри страницы: так zima.html весит килобайты,
   а не мегабайты, и одинаково открывается и локально, и на GitHub Pages. */
const постер = 'demo/assets/bp-zima-poster.png';
if (!fs.existsSync(path.join(ROOT, постер))) throw new Error('нет постера ' + постер);

/* Рисунки с сервера Тильды — те же, что на сайте. */
const ГИРЛЯНДА = 'https://static.tildacdn.com/tild3638-6438-4366-b766-613130643330/_.svg';
const ДЕРЕВЬЯ  = 'https://static.tildacdn.com/tild3533-3034-4864-a235-613732613230/___.svg';

const дни = [
  ['31 декабря', 'Встречаем год по-барски',
   'Приезжаете без спешки, размещаетесь в наряженном доме. Кто хочет — сразу в чан, ' +
   'кто хочет — накрывать стол. Ближе к полуночи выходим на улицу: бой курантов ' +
   'под открытым небом, на снегу, с бенгальскими огнями.'],
  ['1 января', 'День, который не хочется торопить',
   'Позднее утро и неспешный завтрак. Днём — прогулка на ферму к животным, снежные ' +
   'забавы во дворе, детская комната для тех, кто помладше. Вечером снова тепло: ' +
   'баня, чан, самовар с алтайским чаем, мёд и сушки.'],
  ['2 января', 'Зимние забавы',
   'Гуляем, катаемся, топим чан. Фото у ёлки в русских народных костюмах — костюмы ' +
   'выдаём бесплатно. Вечер по своему сценарию: у кого-то тихий, у кого-то шумный.'],
  ['3 января', 'Тёплые проводы',
   'Спокойное утро, последний чан и дорога домой. Уезжаете отдохнувшими — и обычно ' +
   'уже с датами следующего приезда.']
];

/* Фотографии — настоящие, с сайта. */
const Ф = (ид, файл) =>
  'https://optim.tildacdn.com/' + ид + '/-/resize/600x600/-/format/webp/' + файл;

const занятия = [
  ['Банный чан под снегом', Ф('tild6438-3663-4030-a532-386633316331', '20240418-IMG_9487_1_.png.webp'),
   'Чан у террасы каждого дома. Топим к вашему приезду — выходите из тепла прямо в горячую воду, вокруг снег и лес.'],
  ['Ферма с животными', Ф('tild3938-6135-4239-b365-636635646235', 'IMG_5125.webp'),
   'Кролики, шиншиллы, козочки и павлины. Посещение бесплатное — детей оттуда не увести.'],
  ['Русские костюмы для фото', Ф('tild3839-3534-4233-b930-363038643731', 'ChatGPT_Image_8__202.png.webp'),
   'Выдаём бесплатно по запросу. Фото у ёлки в народных нарядах — то, что потом весь год в семейном альбоме.'],
  ['Баня и самовар', Ф('tild6566-6631-4365-a536-663439363463', 'photo_2026-05-21_12-.jpg.webp'),
   'Баня по-русски, самовар с алтайским чаем, мёд и сушки. В Барском доме сауна прямо внутри.']
];

const вопросы = [
  ['Во сколько заезд и выезд?',
   'Заезд с 16:00, выезд до 13:00. Ранний заезд или поздний выезд — по согласованию с администрацией, при наличии свободных мест, оплачивается отдельно.'],
  ['Сколько стоит новогодний заезд?',
   'Стоимость зависит от дома: они разного размера и вместимости. Напишите или позвоните — менеджер посчитает под вашу компанию.'],
  ['Входит ли новогодний стол?',
   'Нет. В каждом доме полноценная кухня — можно привезти своё или заказать кейтеринг. Для большой компании сдаётся крытая веранда с грилем и колонкой, от 12 000 ₽.'],
  ['Можно ли приехать с питомцем?',
   'Да. За весь период пребывания: до 5 кг — 1000 ₽, более 5 кг — 2000 ₽. Дадим миску, для крупных — лежанку.'],
  ['Можно ли оплатить частями?',
   'Да, через «Яндекс Сплит». Подробности уточняйте у менеджеров.'],
  ['Где находится база?',
   'Московская область, Новорижское шоссе, деревня Степаньково. Около часа езды от Москвы.']
];

const дома = [
  ['Ривер и Гарден', '4 спальных места · 55 м² · два этажа',
   'Своя территория и банный чан у террасы. Ривер — с живой изгородью, Гарден огорожен полностью.'],
  ['Барнхаус', '6 спальных мест · 65 м² · один этаж',
   'Просторный дом со своей территорией и банным чаном у террасы — для компании без суеты.'],
  ['Барский дом', '6 спальных мест · 95 м² · один этаж',
   'Самый большой: банный чан у террасы и сауна прямо в доме.']
];

const карточкаДня = ([дата, имя, текст], i) => `
      <article class="день">
        <div class="день__дата">${дата}</div>
        <h3 class="день__имя">${имя}</h3>
        <p class="день__текст">${текст}</p>
      </article>`;

const карточкаЗанятия = ([имя, фото, текст]) => `
      <article class="занятие">
        <div class="занятие__фото" style="background-image:url('${фото}')"></div>
        <div class="занятие__низ">
          <h3 class="занятие__имя">${имя}</h3>
          <p class="занятие__текст">${текст}</p>
        </div>
      </article>`;

const вопрос = ([что, ответ]) => `
      <details class="вопрос">
        <summary>${что}</summary>
        <p>${ответ}</p>
      </details>`;

const карточкаДома = ([имя, свойства, текст]) => `
      <article class="дом">
        <h3 class="дом__имя">${имя}</h3>
        <p class="дом__свойства">${свойства}</p>
        <p class="дом__текст">${текст}</p>
      </article>`;

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
.шапка{display:flex;align-items:center;justify-content:space-between;
       padding:22px 0;border-bottom:1px solid rgba(238,229,213,.12)}
.лого{font-family:'Lora',Georgia,serif;font-size:22px;letter-spacing:.12em;text-transform:uppercase}
.телефон{font-size:15px;text-align:right}
.телефон span{display:block;font-size:12px;opacity:.6}

/* ── обложка ── */
.обложка{padding:70px 0 64px;text-align:center;position:relative;overflow:hidden}
.обложка img{display:block;margin:0 auto;opacity:.85}
.гирлянда{width:min(1100px,92%)}
.деревья{width:min(320px,60%);margin-top:-18px!important}
.обложка h1{font-size:clamp(46px,8vw,104px);line-height:1;text-transform:uppercase;
            margin:26px 0 0;letter-spacing:.02em}
.подзаголовок{margin-top:20px;font-size:19px;color:var(--акцент)}
.ночи{margin-top:8px;font-size:15px;opacity:.75;font-weight:300}

/* ── постер и описание ── */
.описание{background:var(--панель);border-radius:6px;padding:34px;
          display:grid;grid-template-columns:390px 1fr;gap:44px;align-items:start}
.описание img{width:100%;display:block;border-radius:4px}
.описание h2{font-size:30px;color:var(--акцент);text-transform:uppercase;margin-bottom:20px}
.описание p{margin-bottom:16px}
.список{list-style:none;margin:22px 0}
.список li{position:relative;padding-left:26px;margin-bottom:11px}
.список li::before{content:'';position:absolute;left:2px;top:11px;width:7px;height:7px;
                   border-radius:50%;background:var(--акцент)}
.мелко{font-size:14px;opacity:.75;font-weight:300}
.кнопка{display:inline-block;margin-top:22px;padding:15px 34px;border-radius:4px;
        background:var(--кнопка);color:#fff;text-decoration:none;font-size:15px}
.кнопка:hover{background:var(--кнопка-навод)}

/* ── программа ── */
.раздел{padding:76px 0 0}
.раздел h2{font-size:34px;text-transform:uppercase;text-align:center;margin-bottom:38px}
.дни{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.день{background:var(--панель);border-radius:6px;padding:30px 32px}
.день__дата{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--акцент)}
.день__имя{font-size:23px;margin:10px 0 14px;text-transform:uppercase;line-height:1.25}
.день__текст{font-size:15px;opacity:.9}
.приписка{margin-top:24px;text-align:center;font-size:14px;opacity:.7;font-weight:300}

/* ── дома ── */
.дома{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.дом{background:var(--панель);border-radius:6px;padding:28px}
.дом__имя{font-size:22px;text-transform:uppercase;color:var(--акцент)}
.дом__свойства{margin:8px 0 12px;font-size:13px;letter-spacing:.02em;opacity:.7}
.дом__текст{font-size:15px;opacity:.9}
.дома-приписка{margin-top:18px;font-size:14px;opacity:.7;font-weight:300;text-align:center}

/* ── чем заняться ── */
.занятия{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.занятие{background:var(--панель);border-radius:6px;overflow:hidden;display:flex;flex-direction:column}
.занятие__фото{height:220px;background:#26382f center/cover no-repeat}
.занятие__низ{padding:22px 24px 26px}
.занятие__имя{font-size:20px;color:var(--акцент);line-height:1.25}
.занятие__текст{margin-top:10px;font-size:14.5px;opacity:.9}

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
@media(prefers-reduced-motion:reduce){.снежинка{display:none}}

@media(max-width:900px){
  .описание{grid-template-columns:1fr;gap:26px;padding:24px}
  .дни,.дома,.занятия,.двое,.дорога{grid-template-columns:1fr}
}
</style>
</head>
<body>

<div class="снег" aria-hidden="true"></div>

<header class="шапка полоса">
  <div class="лого">Барские поля</div>
  <div class="телефон">+7 (495) 150-39-08<span>Принимаем звонки с 9:00 до 24:00</span></div>
</header>

<section class="обложка полоса">
  <img class="гирлянда" src="${ГИРЛЯНДА}" alt="">
  <img class="деревья" src="${ДЕРЕВЬЯ}" alt="">
  <h1>Зимняя сказка</h1>
  <p class="подзаголовок">Новогодний заезд 31 декабря — 3 января</p>
  <p class="ночи">Три ночи в зимнем лесу, час от Москвы</p>
</section>

<section class="полоса">
  <div class="описание">
    <img src="${постер}" alt="Зимняя сказка в Барских полях">
    <div>
      <h2>Зимняя сказка в Барских полях</h2>
      <p>❄️ Новый год за городом — это когда снег скрипит под ногами, в доме натоплено,
        а на террасе парит банный чан. Час от Москвы по Новорижскому шоссе — и вы
        в зимнем лесу, а не в пробке.</p>
      <ul class="список">
        <li>Дом с ёлкой и гирляндами — заезжаете в уже наряженный.</li>
        <li>Банный чан у террасы каждого дома — прямо в снегу.</li>
        <li>Баня и сауна: в Барском доме сауна прямо внутри.</li>
        <li>Ферма с кроликами, шиншиллами, козочками и павлинами — бесплатно.</li>
        <li>Игровая комната «Детский мир» — дети заняты, вы отдыхаете.</li>
        <li>Русские народные костюмы выдаём бесплатно — для фото у ёлки.</li>
      </ul>
      <p class="мелко">Новогодний стол — на ваше усмотрение: полноценная кухня в каждом доме,
        можно привезти своё или заказать кейтеринг. Для большой компании сдаётся
        крытая веранда с грилем и колонкой.</p>
      <p class="мелко">Заезд с 16:00, выезд до 13:00. Оплата частями через «Яндекс Сплит».
        Стоимость зависит от дома — уточните у менеджера.</p>
      <a class="кнопка" href="https://barskie-polya.ru/booking?dfrom=2026-12-31&amp;dto=2027-01-03&amp;adults=2&amp;scroll_to_rooms=1">Забронировать новогодний заезд</a>
    </div>
  </div>
</section>

<section class="раздел полоса">
  <h2>Программа зимней сказки</h2>
  <div class="дни">${дни.map(карточкаДня).join('')}
  </div>
  <p class="приписка">Программа дополняется. Точный распорядок пришлём перед заездом.</p>
</section>

<section class="раздел полоса">
  <h2>Дома</h2>
  <div class="дома">${дома.map(карточкаДома).join('')}
  </div>
  <p class="дома-приписка">При бронировании от 3 домов цена за дополнительного гостя не взимается.</p>
</section>

<section class="раздел полоса">
  <h2>Чем заняться зимой</h2>
  <div class="занятия">${занятия.map(карточкаЗанятия).join('')}
  </div>
</section>

<section class="раздел полоса">
  <div class="двое">
    <div class="плита">
      <h3>Питание</h3>
      <p>Новогодний стол — на ваше усмотрение. В каждом доме полноценная кухня:
        можно привезти своё, заказать доставку или кейтеринг.</p>
      <p>Для большой компании сдаётся крытая веранда с газовым грилем и колонкой,
        с 15:00 до 23:00, от 12 000 ₽. Можно приносить свою еду.</p>
    </div>
    <div class="плита">
      <h3>Сертификат в подарок</h3>
      <p>Если дарите отдых, а даты пусть выберут сами — есть подарочные сертификаты
        номиналом 10 000, 20 000 и 30 000 ₽.</p>
      <p>Сертификат действует на проживание и дополнительные услуги.
        Действует специальное предложение на покупку.</p>
    </div>
  </div>
</section>

<section class="раздел полоса">
  <h2>Частые вопросы</h2>
  ${вопросы.map(вопрос).join('')}
</section>

<section class="раздел полоса">
  <h2>Как добраться</h2>
  <div class="дорога">
    <div class="дорога__текст">
      <p>Московская область, Новорижское шоссе, деревня Степаньково.
        Около часа езды от Москвы — выезжаете после работы и вечером уже у камина.</p>
      <p>Отдел бронирования работает с 9:00 до 24:00, телефон +7 (495) 150-39-08.</p>
    </div>
    <div class="плита">
      <h3>Новогодний заезд</h3>
      <p>31 декабря — 3 января, три ночи. Заезд с 16:00, выезд до 13:00.</p>
      <p>Количество домов ограничено — на праздники они разбираются заранее.</p>
    </div>
  </div>
</section>

<section class="полоса">
  <div class="заявка">
    <h2>Поможем подобрать дом за 5 минут</h2>
    <p>Расскажите, сколько вас и что важно, — посчитаем стоимость и подберём дом под компанию.</p>
    <a class="кнопка" href="https://barskie-polya.ru/booking?dfrom=2026-12-31&amp;dto=2027-01-03&amp;adults=2&amp;scroll_to_rooms=1">Забронировать новогодний заезд</a>
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
</script>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'zima.html'), html, 'utf8');
console.log('  zima.html  ' + (html.length / 1024 / 1024).toFixed(1) + ' МБ');
console.log('  смотреть: http://localhost:8749/zima.html');
