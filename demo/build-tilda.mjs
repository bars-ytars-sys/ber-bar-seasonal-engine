/**
 * Готовит файлы под вставку в Тильду — из тех же исходников, что и превью,
 * чтобы код на сайте и код в предпросмотре не разъезжались.
 *
 * Запуск: node demo/build-tilda.mjs   →  tilda/ГОТОВО/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const ВЫХОД = path.join(ROOT, 'tilda', 'ГОТОВО');

fs.mkdirSync(path.join(ВЫХОД, 'Берёзовая-роща'), { recursive: true });
fs.mkdirSync(path.join(ВЫХОД, 'Барские-поля'), { recursive: true });

const записать = (папка, имя, текст) => {
  const p = path.join(ВЫХОД, папка, имя);
  fs.writeFileSync(p, текст, 'utf8');
  console.log(`  ${папка}/${имя}  ${(текст.length / 1024).toFixed(0)} КБ`);
};

const стиль = (файл) => {
  const m = /<style[^>]*>([\s\S]*?)<\/style>/.exec(read('tilda', файл));
  if (!m) throw new Error(`в ${файл} не найден <style>`);
  return m[1].trim();
};
const скрипты = (текст) =>
  [...текст.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');

/* ───────────────────────── БЕРЁЗОВАЯ РОЩА ───────────────────────── */

const ЭКО1 = {
  branchAfter: ['rec1684467611', 'rec1747907231', 'rec2710401401'],
  reveal: ['rec2486811301', 'rec2851363001', 'rec2421263681',
           'rec1758781921', 'rec2263527021', 'rec2710223901']
};
const ЭКО2 = {
  garland: false,
  bouquets: ['rec1694735441', 'rec2421263681', 'rec2710223901'],
  hangs: ['rec1684467611', 'rec1758781921'],
  dividersAfter: ['rec2486811301', 'rec2263527021']
};

/* Настройки в файлах набора лежат заготовкой с пустыми списками —
   подставляем свои значения на их место. */
function заполнить(текст, настройки) {
  for (const [ключ, знач] of Object.entries(настройки)) {
    const re = Array.isArray(знач)
      ? new RegExp('(' + ключ + ':\\s*)\\[\\s*\\]')
      : new RegExp('(' + ключ + ':\\s*)([^,\\n]+)');
    if (!re.test(текст)) throw new Error(`не найдена настройка ${ключ}`);
    текст = текст.replace(re, '$1' + JSON.stringify(знач));
  }
  return текст;
}

записать('Берёзовая-роща', '1-HEAD.html',
`<!-- БЕРЁЗОВАЯ РОЩА — часть 1 из 3: СТИЛИ
     Тильда → Настройки сайта → Ещё → HTML-код в HEAD.
     Это два ваших набора, склеенные в один файл: 1HEAD и 4HEADPACK2. -->
<style>
${стиль('1HEAD.html')}

${стиль('4HEADPACK2.html')}
</style>
`);

записать('Берёзовая-роща', '2-BODY.html',
`<!-- БЕРЁЗОВАЯ РОЩА — часть 2 из 3: СКРИПТЫ
     Тильда → Настройки сайта → Ещё → HTML-код перед </body>.
     После вставки — «Опубликовать все страницы».

     Номера блоков уже проставлены по живой странице:
       ветки-разделители  после rec1684467611, rec1747907231, rec2710401401
       появление          на шести блоках
       букеты в углах     rec1694735441, rec2421263681, rec2710223901
       свисающая рябина   rec1684467611, rec1758781921
       колосья            после rec2486811301, rec2263527021
       гирлянда выключена — на первом экране она лишняя

     Последним идёт растворение листопада: холст и боковые полосы
     закреплены за окном и едут за гостем через весь сайт. Здесь они
     живут на первом экране и гаснут к полутора экранам прокрутки. -->
<script>
${скрипты(заполнить(read('tilda', '2BODY.html'), ЭКО1))}
</script>

<script>
${скрипты(заполнить(read('tilda', '5BODYPACK2.html'), ЭКО2))}
</script>

<script>
(function () {
  var КОНЕЦ = 1.5;              /* к скольким экранам прокрутки исчезнут */
  var слои = [];

  function собрать() {
    слои = [document.getElementById('au-canvas')]
      .concat([].slice.call(document.querySelectorAll('.au2-side')))
      .filter(Boolean);
  }

  var ждём = false;
  function пересчёт() {
    ждём = false;
    собрать();
    if (!слои.length) return;
    var предел = window.innerHeight * КОНЕЦ;
    var доля = Math.min(1, (window.pageYOffset || document.documentElement.scrollTop || 0) / предел);
    for (var i = 0; i < слои.length; i++) {
      var слой = слои[i];
      /* У боковых полос своя прозрачность в наборе — гасим от неё. */
      if (!слой.dataset.auBase) слой.dataset.auBase = getComputedStyle(слой).opacity || '1';
      var прозрачность = parseFloat(слой.dataset.auBase) * (1 - доля);
      /* В наборе прозрачность задана через !important — пишем так же. */
      слой.style.setProperty('opacity', прозрачность.toFixed(3), 'important');
      слой.style.visibility = прозрачность < 0.01 ? 'hidden' : '';
    }
  }
  function покадрово() { if (!ждём) { ждём = true; requestAnimationFrame(пересчёт); } }

  window.addEventListener('scroll', покадрово, { passive: true });
  window.addEventListener('resize', покадрово, { passive: true });
  [0, 400, 1200, 2500].forEach(function (ms) { setTimeout(пересчёт, ms); });
})();
</script>
`);

записать('Берёзовая-роща', '3-BLOK-tyoplaya-osen.html', read('tilda', '4BLOK-TEPLAYA-OSEN.html'));

/* ───────────────────────── БАРСКИЕ ПОЛЯ ───────────────────────── */

const БП = {
  falling: true,
  ground: false,
  corners: ['rec2709575101', 'rec1185039476'],
  topStrips: ['rec1216602591', 'rec1185039536'],
  bottomStrips: [],
  dividersAfter: ['rec1534422731'],
  scale: 0.85,
  fallScale: 0.8,
  density: 0.6,
  opacity: 0.9
};

const пакет = read('tilda', '7BP2BODY.html');

/* Страховка к набору — проверено на боевом сайте.
   Набор раскладывает листья по краям блоков только после того, как ВСЕ
   картинки сообщат о загрузке. Картинки успевают загрузиться раньше, чем
   он вешает обработчики: счётчик до нуля не доходит, и раскладок не
   появляется вовсе. Ждём его и вмешиваемся, только если он не справился.
   Если он отработает уже после нас — убираем задвоившиеся раскладки. */
const СТРАХОВКА = `
(function () {
  setTimeout(function () {
    if (document.querySelector('.bp')) return;
    if (window.barskieLayer && window.barskieLayer.place) window.barskieLayer.place();
  }, 12000);

  var видел = {};
  function проверить(box) {
    if (!box.classList || !box.classList.contains('bp')) return;
    var хозяин = box.closest ? box.closest('.bp-host') : null;
    var k = (хозяин ? хозяин.id : 'между') + '|' + box.className +
            '|' + (box.getAttribute('data-pos') || '');
    if (видел[k]) { if (box.parentNode) box.parentNode.removeChild(box); }
    else видел[k] = true;
  }
  new MutationObserver(function (записи) {
    записи.forEach(function (з) {
      Array.prototype.forEach.call(з.addedNodes, function (n) {
        if (n.nodeType === 1) проверить(n);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
})();`;
const телоПакета = скрипты(пакет).replace(
  /window\.BARSKIE\s*=\s*\{[\s\S]*?\n\};/,
  `window.BARSKIE = Object.assign({
  /* СЮДА вставьте адреса загруженных листьев (файлы из tilda/images/leaves).
     Без картинок набор ничего не покажет — он весь построен на них. */
  leafImages: [
    // 'https://static.tildacdn.com/.../leaf-01.png',
  ],
  /* Клёны: в раскладки по краям блоков подмешиваются, с неба не падают. */
  decorImages: [
    // 'https://static.tildacdn.com/.../maple-01.png',
  ]
}, ${JSON.stringify(БП, null, 2)});`);

записать('Барские-поля', '1-HEAD.html',
`<!-- БАРСКИЕ ПОЛЯ — часть 1 из 3: СТИЛИ
     Тильда → Настройки сайта → Ещё → HTML-код в HEAD.

     ВНИМАНИЕ: в скачанном наборе была только часть 2 (BP2BODY.html).
     Скрипт расставляет листья через left/top в процентах и transform,
     но собственных стилей не задаёт: без них холст листопада нулевого
     размера, а раскладки по краям блоков сваливаются в поток.
     Здесь описано ровно то, чего скрипту не хватает — ни цветов,
     ни шрифтов сайта это не трогает. Придёт настоящая часть 1 —
     замените файл на неё. -->
${read('tilda', '7BP1HEAD.html').replace(/^<!--[\s\S]*?-->\n/, '')}`);

записать('Барские-поля', '2-BODY.html',
`<!-- БАРСКИЕ ПОЛЯ — часть 2 из 3: СКРИПТЫ
     Тильда → Настройки сайта → Ещё → HTML-код перед </body>.
     После вставки — «Опубликовать все страницы».

     ПЕРЕД ВСТАВКОЙ: загрузите листья из tilda/images/leaves в
     Настройки сайта → Файлы и впишите их адреса в leafImages
     и decorImages ниже. Без картинок набор ничего не покажет.

     Раскладка проверена замером: ни один лист не ложится на кнопки
     и текст ни на 1600px, ни на 390px.
       rec1534422731  перед картой         цепочка после блока
       rec1216602591  заголовок программ   дуга сверху
       rec1185039476  «Дома»               россыпь, нижний левый
       rec1185039536  заголовок отзывов    дуга сверху
       rec2709575101  заголовок внизу      россыпь, верхний правый
     Первый экран не тронут — там видео и две кнопки, ему достаётся
     только листопад. Листья по низу экрана выключены: справа внизу
     висит чат-виджет. -->
<script>
${телоПакета}
${СТРАХОВКА}
</script>
`);

записать('Барские-поля', '3-BLOK-osennie-akcii.html', read('tilda', '6BLOK-OSEN-BP.html'));

console.log('\nготово: tilda/ГОТОВО/');

/* ─────────────────── вариант «одним блоком» ───────────────────
   Стили и скрипты не обязаны лежать в настройках сайта: они одинаково
   работают из обычного HTML-блока на странице. Для тех случаев, когда
   до полей в настройках не добраться — тариф, права, просто не нашлось.
   Блок ставится последним на главной. */
const однимБлоком = (папка, заголовок, стили, скрипты) =>
  записать(папка, '0-ВСЁ-В-ОДНОМ-blok.html',
`<!-- ${заголовок} — стили и скрипты одним блоком.
     Тильда → Библиотека → Другое → T123 (HTML-код).
     Поставить ПОСЛЕДНИМ блоком на главной странице.

     Это замена частям 1 и 2: если код уже вставлен в настройках сайта,
     этот блок не нужен — иначе оформление задвоится.

     Блок действует только на той странице, где он стоит. Для оформления
     всего сайта код всё же лучше положить в настройки. -->
<style>
${стили}
</style>

<script>
${скрипты}
</script>
`);

однимБлоком('Берёзовая-роща', 'БЕРЁЗОВАЯ РОЩА',
  стиль('1HEAD.html') + '\n\n' + стиль('4HEADPACK2.html'),
  скрипты(заполнить(read('tilda', '2BODY.html'), ЭКО1)) + '\n' +
  скрипты(заполнить(read('tilda', '5BODYPACK2.html'), ЭКО2)));

/* Вшивать листья прямо в код оказалось громоздко: один блок на 300 тысяч
   символов. Берём их по ссылке — файлы лежат в нашем репозитории и
   раздаются по https. Блок становится 16 КБ вместо 294.
   Позже эти же файлы стоит загрузить в Файлы сайта и заменить адреса,
   чтобы картинки шли с сервера Тильды, а не со стороннего. */
const БАЗА = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/leaves/';
const ссылки = (маска) => fs.readdirSync(path.join(ROOT, 'demo', 'assets', 'leaves'))
  .filter(n => маска.test(n)).sort().map(n => БАЗА + n);

const пакетСЛистьями = скрипты(пакет).replace(
  /window\.BARSKIE\s*=\s*\{[\s\S]*?\n\};/,
  'window.BARSKIE = ' + JSON.stringify(Object.assign(
    { leafImages: ссылки(/^leaf-/), decorImages: ссылки(/^maple-/) }, БП), null, 2) + ';');

однимБлоком('Барские-поля', 'БАРСКИЕ ПОЛЯ',
  (/<style[^>]*>([\s\S]*?)<\/style>/.exec(read('tilda', '7BP1HEAD.html')) || [])[1].trim(),
  пакетСЛистьями + '\n' + СТРАХОВКА);

console.log('\nвариант «одним блоком» тоже собран');

/* ─────────── блоки акций с уже подставленными фотографиями ───────────
   Чтобы не заводить файлы в Тильде вручную, подставляем адреса картинок,
   которые раздаются из нашего репозитория. Позже их стоит перезалить
   в Файлы сайта и заменить адреса — тогда всё поедет с сервера Тильды. */
const ФОТОБАЗА = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/';
const сФото = (текст) => текст.replace(/ФОТО_([a-z-]+\.webp)/g, (_, n) => ФОТОБАЗА + n);

записать('Барские-поля', '4-BLOK-akcii-gotov.html',
  сФото(read('tilda', '6BLOK-OSEN-BP.html')));
записать('Берёзовая-роща', '4-BLOK-akcii-gotov.html',
  сФото(read('tilda', '4BLOK-TEPLAYA-OSEN.html')));

/* ─────────── правки, которые иначе делались бы мышкой ───────────
   Скрыть отжившую карточку, переписать всплывающее окно и выделить
   фразу — всё это правится в редакторе Тильды, но редактор Zero Block
   тяжёлый. Тот же результат даёт один блок с кодом. */
записать('Барские-поля', '5-BLOK-pravki.html',
`<!-- БАРСКИЕ ПОЛЯ — правки без редактора.
     Тильда → Библиотека → Другое → T123 (HTML-код).
     Поставить ПОСЛЕДНИМ блоком на главной, после блока с декором.

     Делает три вещи:
       1. прячет карточку «Продлеваем лето» — акция кончилась 10.09,
          ряд выложен флексом, поэтому соседние сдвигаются сами;
       2. переписывает всплывающее окно на «Вкусную осень»:
          заголовок, текст с промокодом, фотографию и кнопку;
       3. выделяет «заправка в удобном месте» акцентным цветом.

     Всё это можно в любой момент отменить — просто убрать блок. -->
<style>
#rec1655343021 [data-group-id="1785352752557000001"],
#rec1655343021 [data-elem-id="1785352752557000001"]{display:none!important}
</style>

<script>
(function () {
  var ФОТО = '${ФОТОБАЗА}bp-popup.webp';

  /* ── всплывающее окно ── */
  var окноГотово = false;
  function окно() {
    if (окноГотово) return true;
    var rec = document.getElementById('rec2461410871');
    if (!rec) return false;

    var h = rec.querySelector('[field="tn_text_1779479956023"]');
    var t = rec.querySelector('[field="tn_text_1779480103511"]');
    var pic = rec.querySelector('[data-elem-id="1764653785569000002"] .tn-atom');
    var btn = rec.querySelector('[data-elem-id="1764653785624000005"] .tn-atom');
    if (!h || !t || !pic || !btn) return false;

    h.textContent = 'Вкусная осень';
    t.innerHTML =
      '<div style="margin-bottom:7px">Завтраки в будни — в подарок</div>' +
      '<span data-bo-code="ОСЕНЬ2026" style="display:inline-block;padding:5px 12px;' +
      'border:1px dashed currentColor;border-radius:4px;letter-spacing:.09em;' +
      'font-size:12px;line-height:1;cursor:pointer">ОСЕНЬ2026</span>' +
      '<div style="margin-top:7px;font-size:11px;opacity:.7">Акции не суммируются</div>';

    var чип = t.querySelector('[data-bo-code]');
    чип.addEventListener('click', function (e) {
      e.stopPropagation();
      var готово = function () { чип.textContent = 'скопировано'; };
      if (navigator.clipboard) navigator.clipboard.writeText('ОСЕНЬ2026').then(готово, готово);
      else готово();
    });

    pic.style.backgroundImage = "url('" + ФОТО + "')";
    pic.style.backgroundSize = 'cover';
    pic.style.backgroundPosition = 'center';

    btn.textContent = 'Подробнее об акции';
    btn.setAttribute('href', '#bo-zavtrak');
    btn.removeAttribute('target');
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var закрыть = rec.querySelector('[data-elem-id="1779480618329000002"]');
      if (закрыть) закрыть.click();
      var цель = document.getElementById('bo-zavtrak');
      if (цель) цель.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    окноГотово = true;
    return true;
  }

  /* ── выделение фразы ──
     По разметке искать бесполезно: между словами стоят неразрывные
     пробелы, и в innerHTML они то символом, то мнемоникой &nbsp;.
     Поэтому ищем по тексту узла, заменив неразрывный пробел обычным —
     длина строки при этом не меняется, значит позиции остаются верны. */
  var ФРАЗА = 'заправка в удобном месте';
  function фраза() {
    var поле = document.querySelector('[field="li_descr__1771852717075"]');
    if (!поле) return false;
    if (поле.dataset.boDone) return true;

    var обход = document.createTreeWalker(поле, NodeFilter.SHOW_TEXT);
    var узел, начало = -1, цель = null;
    while ((узел = обход.nextNode())) {
      начало = узел.nodeValue.replace(/ /g, ' ').indexOf(ФРАЗА);
      if (начало >= 0) { цель = узел; break; }
    }
    if (!цель) return false;

    var хвост = цель.splitText(начало);
    хвост.splitText(ФРАЗА.length);
    var окраска = document.createElement('span');
    окраска.style.color = '#ee995d';
    окраска.style.fontWeight = '500';
    окраска.textContent = хвост.nodeValue;
    хвост.parentNode.replaceChild(окраска, хвост);

    поле.dataset.boDone = '1';
    return true;
  }

  /* Обе части страницы рисуются не сразу, и рисуются в разное время.
     Раньше они ждали друг друга в одном условии: пока не готово окно,
     до фразы дело не доходило. Теперь у каждой свой опрос, и вдобавок
     обе перепроверяются на любое изменение страницы. */
  function запустить(правка) {
    if (правка()) return;
    var t = setInterval(function () { if (правка()) clearInterval(t); }, 400);
    setTimeout(function () { clearInterval(t); }, 120000);
    new MutationObserver(function (_, наблюдатель) {
      if (правка()) наблюдатель.disconnect();
    }).observe(document.body, { childList: true, subtree: true });
  }
  запустить(окно);
  запустить(фраза);
})();
</script>
`);
