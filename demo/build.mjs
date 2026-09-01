/**
 * Сборка демо-стенда и playbook для GitHub Pages.
 * Запуск: node demo/build.mjs
 *
 * Стенд собирается ИЗ НАСТОЯЩИХ файлов компонентов, без копипасты.
 * Правите компонент — пересобираете стенд, и он показывает новое поведение.
 *
 * Единственное отличие стенда от боевой вставки: в таблицу расписания
 * подставляются три демо-строки (в бою она пустая). Это делается здесь,
 * исходный файл не трогается.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'seasonal-engine');
const read = (...p) => fs.readFileSync(path.join(SRC, ...p), 'utf8');

/* ------------------------------------------------------------------ */
/* Компоненты                                                          */
/* ------------------------------------------------------------------ */

const head1 = read('head', '1-tema-sezona.html');
const head2raw = read('head', '2-raspisanie-blokov.html');
const head3 = read('head', '3-bnovo-deeplink.html');
const head4 = read('head', '4-anons-polosa.html');
const head5 = read('head', '5-celi-metriki.html');
const head8 = read('blocks', '8-mobile-sticky-cta.html');
const offers = read('blocks', '7-katalog-offerov.html');

/* Демо-строки расписания: три блока на стенде живут по разным правилам. */
const DEMO_ROWS = `
    /* --- строки добавлены сборщиком стенда, в боевом файле их нет --- */
    { rec:'rec9000000001', season:'autumn',                     note:'Осенний блок' },
    { rec:'rec9000000002', from:'2026-11-15', to:'2027-01-10',  note:'Новогодний баннер' },
    { rec:'rec9000000003', season:'summer',                     note:'Летние веранды' },`;

const head2 = head2raw.replace('var SCHEDULE = [', 'var SCHEDULE = [' + DEMO_ROWS);
if (head2 === head2raw) throw new Error('не нашёл таблицу SCHEDULE — сборщик надо чинить');

/* Полосу на стенде показываем всегда: включаем флаг и расширяем окно дат.
   В боевом файле окно узкое (ноябрь) — это пример под конкретную акцию,
   и на стенде с датой 25 декабря полоса корректно не показалась бы. */
let head4demo = head4
  .replace(/enabled: false/g, 'enabled: true')
  .replace(/from:\s*'20\d\d-\d\d-\d\d'/g,  "from:  '2020-01-01'")
  .replace(/until:\s*'20\d\d-\d\d-\d\d'/g, "until: '2035-12-31'")
  /* На стенде одна шапка — та, что у Рощи. Чтобы переключатель базы
     не ломал сдвиг шапки, у обеих баз указываем её же. */
  .replace(/bp:\s*\['rec1185050691'\]/, "bp:  ['rec1729326481']");
for (const [what, re] of [['enabled', /enabled: true/],
                          ['окно дат', /from:  '2020-01-01'/],
                          ['шапка bp', /bp:  \['rec1729326481'\]/]]) {
  if (!re.test(head4demo)) throw new Error(`не удалось пропатчить анонс-полосу: ${what}`);
}
if (/enabled: false/.test(head4demo)) throw new Error('осталась выключенная полоса');

/* ------------------------------------------------------------------ */
/* Стенд                                                               */
/* ------------------------------------------------------------------ */

const demoCss = `
<style>
  /* Стенд намеренно простой: он показывает работу движка, а не дизайн Tilda.
     Всё покрашено переменными --bb-*, поэтому меняется вместе с сезоном. */
  *{box-sizing:border-box}
  body{margin:0;background:var(--bb-bg);color:var(--bb-ink);
       font:16px/1.6 var(--bb-font);transition:background .3s}
  .wrap{max-width:1200px;margin:0 auto;padding:0 20px}

  /* Шапка: те же id и классы, что на живом ecobr.ru, чтобы анонс-полоса
     двигала её ровно так же, как на боевом сайте. */
  #rec1729326481 .t396__artboard{
    position:fixed;width:100%;left:0;top:0;z-index:10;height:72px;
    background:var(--bb-surface);border-bottom:1px solid var(--bb-line);
    display:flex;align-items:center}
  .hdr{max-width:1200px;margin:0 auto;padding:0 20px;width:100%;
       display:flex;align-items:center;gap:24px}
  .hdr__logo{font-weight:600;letter-spacing:.02em;margin-right:auto;min-width:0;
             overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .hdr__nav{display:flex;gap:20px;font-size:14px;color:var(--bb-muted)}
  .hdr__cta{background:var(--bb-accent);color:var(--bb-accent-ink);flex:none;
            text-decoration:none;padding:11px 18px;border-radius:10px;
            font-weight:600;font-size:14px;white-space:nowrap}
  @media(max-width:800px){.hdr__nav{display:none}}
  @media(max-width:639px){
    .hdr{gap:12px;padding:0 14px}
    .hdr__logo{font-size:14px}
    .hdr__cta{padding:9px 13px;font-size:13px}
    #rec1729326481 .t396__artboard{height:60px}
  }

  .hero{padding:132px 0 56px;text-align:center}
  .hero h1{font-size:clamp(28px,5vw,46px);line-height:1.1;margin:0 0 14px;
           text-wrap:balance}
  .hero p{color:var(--bb-muted);max-width:52ch;margin:0 auto 26px}
  .hero__badge{display:inline-block;background:var(--bb-badge);
    border-radius:999px;padding:7px 15px;font-size:13px;font-weight:600;margin-bottom:18px}

  .sec{padding:36px 0}
  .sec h2{font-size:24px;margin:0 0 6px}
  .sec > p{color:var(--bb-muted);margin:0 0 22px}

  /* Блоки под расписанием — визуально помечены, чтобы было видно, что происходит */
  .sched{border:2px dashed var(--bb-line);border-radius:14px;padding:22px 24px;
         margin-bottom:14px;background:var(--bb-surface)}
  .sched h3{margin:0 0 6px;font-size:18px}
  .sched p{margin:0;color:var(--bb-muted);font-size:14.5px}
  .sched code{font:13px/1.5 ui-monospace,Menlo,Consolas,monospace;
              background:var(--bb-badge);padding:2px 6px;border-radius:4px}

  .foot{border-top:1px solid var(--bb-line);margin-top:40px;padding:26px 0 96px;
        color:var(--bb-muted);font-size:14px}

  /* Панель управления стендом */
  .panel{position:fixed;right:16px;top:136px;z-index:9995;width:250px;
    background:var(--bb-surface);border:1px solid var(--bb-line);border-radius:14px;
    box-shadow:0 6px 28px rgba(15,25,20,.14);font-size:13px;overflow:hidden}
  .panel__h{display:flex;align-items:center;gap:8px;padding:11px 14px;
    background:var(--bb-badge);font-weight:600;cursor:pointer;user-select:none}
  .panel__h span{margin-left:auto;color:var(--bb-muted);font-weight:400}
  .panel__b{padding:14px}
  .panel.is-off .panel__b{display:none}
  .panel h4{margin:0 0 7px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;
            color:var(--bb-muted);font-weight:600}
  .panel h4:not(:first-child){margin-top:16px}
  .panel__row{display:flex;flex-wrap:wrap;gap:5px}
  .panel a,.panel button{display:inline-block;border:1px solid var(--bb-line);
    background:var(--bb-surface);color:var(--bb-ink);border-radius:7px;
    padding:6px 10px;font:500 12.5px/1 var(--bb-font);text-decoration:none;cursor:pointer}
  .panel a:hover{border-color:var(--bb-accent)}
  .panel a.is-on{background:var(--bb-accent);border-color:var(--bb-accent);
                 color:var(--bb-accent-ink)}
  .panel input[type=date]{width:100%;padding:7px 9px;border:1px solid var(--bb-line);
    border-radius:7px;font:13px var(--bb-font);color:var(--bb-ink);background:var(--bb-surface)}
  .panel__note{margin:14px 0 0;color:var(--bb-muted);font-size:11.5px;line-height:1.45}
  @media(max-width:900px){
    .panel{right:10px;left:10px;top:auto;bottom:80px;width:auto}
    /* Свёрнутая панель не должна закрывать сам стенд — сжимаем её в уголок */
    .panel.is-off{left:auto;width:auto}
    .panel.is-off .panel__h{padding:9px 13px;font-size:12.5px}
  }
</style>`;

const demoBody = `
<div id="rec1729326481">
  <div class="t396__artboard">
    <div class="hdr">
      <div class="hdr__logo">ЭкоБаза «Берёзовая роща»</div>
      <nav class="hdr__nav">
        <span>О базе</span><span>Каталог домов</span><span>Спецпредложения</span><span>SPA</span>
      </nav>
      <a class="hdr__cta" href="/booking?scroll_to_rooms=1">Проверить даты</a>
    </div>
  </div>
</div>

<div class="wrap">
  <section class="hero">
    <div class="hero__badge">Хорошее место по версии Яндекса 5 лет подряд</div>
    <h1>Демо-стенд движка сезонности</h1>
    <p>
      Страница-макет, на которой работают настоящие компоненты из
      <code>seasonal-engine/</code>. Переключайте сезон и дату в панели справа —
      меняется всё: палитра, анонс-полоса, состав блоков, живые офферы.
    </p>
  </section>

  <section class="sec">
    <h2>Показ блоков по датам</h2>
    <p>Три блока с разными правилами. Ничего не снимается руками.</p>

    <div class="sched" id="rec9000000001">
      <h3>Осенний блок</h3>
      <p>Правило: <code>season:'autumn'</code> — виден только осенью.</p>
    </div>

    <div class="sched" id="rec9000000002">
      <h3>🎄 Новогодний баннер</h3>
      <p>Правило: <code>from:'2026-11-15' to:'2027-01-10'</code> — появится и исчезнет сам.
         Поставьте дату 1 февраля и убедитесь.</p>
    </div>

    <div class="sched" id="rec9000000003">
      <h3>Летние веранды</h3>
      <p>Правило: <code>season:'summer'</code> — на витрине только в сезон.</p>
    </div>
  </section>

  <section class="sec">
    <h2>Каталог спецпредложений</h2>
    <p>
      Тот же блок, что ставится на <code>/special</code>. Фильтры собираются
      из тегов, таймеры считают до реального дедлайна, промокод копируется по клику,
      кнопка ведёт прямо в модуль Bnovo с подставленными датами.
    </p>
  </section>
</div>

${offers}

<div class="wrap">
  <div class="foot">
    Демо-стенд. Кнопки «Забронировать» ведут на настоящий модуль
    <code>ecobr.ru/booking</code> с подставленными параметрами — это и есть проверка,
    что механика работает.
  </div>
</div>

<div class="panel" id="panel">
  <div class="panel__h" id="panelH">Панель стенда <span id="panelS">свернуть</span></div>
  <div class="panel__b">
    <h4>Сезон</h4>
    <div class="panel__row" id="seasons"></div>

    <h4>Дата — машина времени</h4>
    <input type="date" id="dateIn">

    <h4>База</h4>
    <div class="panel__row" id="sites"></div>

    <h4>Режимы проверки</h4>
    <div class="panel__row">
      <a href="?debug=offers">офферы</a>
      <a href="?schedule=debug">расписание</a>
      <a href="?goals=debug">цели</a>
      <a href="?announce=preview">вернуть полосу</a>
      <a href="?">сброс</a>
    </div>

    <p class="panel__note">
      Это те же параметры, которыми проверяют боевой сайт. Их видит только тот,
      кто их набрал.
    </p>
  </div>
</div>

<script>
(function () {
  var qs = new URLSearchParams(location.search);
  function link(param, value, label) {
    var q = new URLSearchParams(location.search);
    q.set(param, value);
    var a = document.createElement('a');
    a.href = '?' + q.toString();
    a.textContent = label;
    if (qs.get(param) === value) a.className = 'is-on';
    return a;
  }

  var S = [['autumn','Осень'],['newyear','Новый год'],['winter','Зима'],
           ['spring','Весна'],['summer','Лето']];
  var box = document.getElementById('seasons');
  S.forEach(function (s) { box.appendChild(link('season', s[0], s[1])); });

  var sites = document.getElementById('sites');
  sites.appendChild(link('site', 'eco', 'Роща'));
  sites.appendChild(link('site', 'bp', 'Барские поля'));

  var d = document.getElementById('dateIn');
  d.value = qs.get('date') || (window.BB ? BB.ymd(BB.now()) : '');
  d.addEventListener('change', function () {
    var q = new URLSearchParams(location.search);
    q.set('date', d.value);
    q.delete('season');           // дата должна сама определить сезон
    location.search = q.toString();
  });

  var p = document.getElementById('panel');
  var s = document.getElementById('panelS');
  function label() { s.textContent = p.classList.contains('is-off') ? 'развернуть' : 'свернуть'; }
  /* На телефоне панель мешает смотреть сам стенд — сворачиваем её сразу. */
  if (window.matchMedia('(max-width:900px)').matches) p.classList.add('is-off');
  label();
  document.getElementById('panelH').addEventListener('click', function () {
    p.classList.toggle('is-off');
    label();
  });
})();
</script>`;

const index = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Движок сезонности — демо-стенд</title>
<!-- ВНИМАНИЕ: файл собран автоматически. Правьте seasonal-engine/, потом node demo/build.mjs -->
${head1}
${head2}
${head3}
${head4demo}
${head5}
${head8}
${demoCss}
</head>
<body>
${demoBody}
</body>
</html>
`;

/* ------------------------------------------------------------------ */
/* Playbook: оборачиваем в полноценный документ для Pages              */
/* ------------------------------------------------------------------ */

const playbookInner = read('playbook.html');
const playbook = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>:root{color-scheme:light dark}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
${playbookInner}
</html>
`;

/* ------------------------------------------------------------------ */

fs.writeFileSync(path.join(ROOT, 'index.html'), index, 'utf8');
fs.writeFileSync(path.join(ROOT, 'playbook.html'), playbook, 'utf8');

console.log('Собрано:');
console.log('  index.html     ' + (index.length / 1024).toFixed(1) + ' КБ  — демо-стенд');
console.log('  playbook.html  ' + (playbook.length / 1024).toFixed(1) + ' КБ  — документ для команды');
console.log('Источник: seasonal-engine/ (компоненты не менялись, кроме демо-строк расписания)');
