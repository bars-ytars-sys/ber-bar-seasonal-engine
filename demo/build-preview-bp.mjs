/**
 * Собирает страницу для просмотра «Барских полей»: копия barskie-polya.ru
 * с вставленным блоком осенних акций — так, как он встанет в Tilda.
 *
 * Осенние элементы (листопад, букеты и прочее) сюда пока НЕ ставятся:
 * сайт очищен по договорённости, добавляем по одному шагу.
 *
 * Запуск: node demo/build-preview-bp.mjs   →  barskie.html
 * Смотреть: http://localhost:8749/barskie.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

/* В копии сайта стоит <base href="https://barskie-polya.ru/">, поэтому любой
   относительный путь уезжает на боевой домен и фото не грузятся.
   Для просмотра встраиваем картинки прямо в блок. В Tilda этого не нужно:
   там вместо ФОТО_… подставляются адреса из Файлов сайта. */
const block = read('tilda', '6BLOK-OSEN-BP.html')
  .replace(/ФОТО_([a-z-]+\.webp)/g, (_, n) => {
    const file = path.join(ROOT, 'demo', 'assets', n);
    if (!fs.existsSync(file)) throw new Error('нет фото ' + n);
    return 'data:image/webp;base64,' + fs.readFileSync(file).toString('base64');
  });

/* Внутри блока есть свой </script> — экранируем, иначе он оборвёт
   внешний тег, и вся вставка перестанет выполняться. */
const CLOSE = String.fromCharCode(60, 92, 47) + 'script' + String.fromCharCode(62);
const blockLiteral = JSON.stringify(block).replace(/<\/script>/gi, CLOSE);

/* Блок осенних акций занимает место «Отдых сейчас — оплата потом!» —
   встаёт прямо перед ним, сразу под первым экраном. Летний блок пока
   остаётся на странице: скрыть его можно позже одной галочкой
   «скрыть блок» в Тильде. */
const blockJs = `
(function () {
  var HTML = ${blockLiteral};
  function mount() {
    if (document.getElementById('bo-host')) return;
    var target = document.getElementById('rec1655343021');
    if (!target || !target.parentNode) return;

    var host = document.createElement('div');
    host.id = 'bo-host';
    host.innerHTML = HTML;
    target.parentNode.insertBefore(host, target);

    host.querySelectorAll('script').forEach(function (old) {
      var neo = document.createElement('script');
      neo.text = old.textContent;
      old.parentNode.replaceChild(neo, old);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();`;

/* --- всплывающее окно «Продлеваем лето» → «Вкусная осень» ---
   Летняя акция закончилась 10.09, её место занимает осенняя.
   В Тильде это правится в самом окне (запись rec2461410871): текст мышкой,
   фотография — заменой файла в фигуре, кнопка — ссылкой на якорь.
   Здесь то же самое делается кодом, чтобы показать результат.
   Окно появляется не сразу, поэтому ждём его короткими проверками. */
const popupPhoto = 'data:image/webp;base64,' +
  fs.readFileSync(path.join(ROOT, 'demo', 'assets', 'bp-popup.webp')).toString('base64');

const popupJs = `
(function () {
  var ФОТО = ${JSON.stringify(popupPhoto)};
  var готово = false;
  function правка() {
    if (готово) return true;
    var rec = document.getElementById('rec2461410871');
    if (!rec) return false;

    var h = rec.querySelector('[field="tn_text_1779479956023"]');
    var t = rec.querySelector('[field="tn_text_1779480103511"]');
    var pic = rec.querySelector('[data-elem-id="1764653785569000002"] .tn-atom');
    var btn = rec.querySelector('[data-elem-id="1764653785624000005"] .tn-atom');
    if (!h || !t || !pic || !btn) return false;

    h.textContent = 'Вкусная осень';
    /* Промокод — отдельной плашкой, а не словами в строке: так его видно
       и по нему хочется нажать. Обе строки умещаются в высоту элемента,
       поэтому кнопку двигать не нужно. */
    t.innerHTML =
      '<div style="margin-bottom:7px">Завтраки в будни — в подарок</div>' +
      '<span data-bo-code="ОСЕНЬ2026" style="display:inline-block;padding:5px 12px;' +
      'border:1px dashed currentColor;border-radius:4px;letter-spacing:.09em;' +
      'font-size:12px;line-height:1;cursor:pointer">ОСЕНЬ2026</span>';
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

    /* Кнопка ведёт к карточке «Вкусная осень» в блоке акций и закрывает окно */
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var закрыть = rec.querySelector('[data-elem-id="1779480618329000002"]');
      if (закрыть) закрыть.click();
      var цель = document.getElementById('bo-zavtrak');
      if (цель) цель.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    готово = true;
    return true;
  }
  if (!правка()) {
    var t = setInterval(function () { if (правка()) clearInterval(t); }, 400);
    setTimeout(function () { clearInterval(t); }, 30000);
  }
})();`;

/* Карточка «Продлеваем лето» в ряду акций: предложение действовало
   до 10.09.26 и закончилось, её место занимает осень.
   Ряд карточек выложен флексом, поэтому соседние сдвигаются сами —
   дыры не остаётся. В Тильде карточка просто удаляется в редакторе. */
const hideSummer = `
#rec1655343021 [data-group-id="1785352752557000001"],
#rec1655343021 [data-elem-id="1785352752557000001"]{display:none!important}`;

/* --- ваш осенний набор (7BP2BODY.html) ---
   Набор весь построен на картинках листьев: и падающие, и раскладки по
   краям блоков берутся из leafImages. В Тильде туда вписываются адреса
   файлов сайта; здесь встраиваем сами картинки, потому что в копии стоит
   <base href="https://barskie-polya.ru/"> и относительные пути уезжают
   на боевой домен. Листья переведены в webp: 1045 КБ → 208 КБ. */
const leafDir = path.join(ROOT, 'demo', 'assets', 'leaves');
const leafData = (маска) => fs.readdirSync(leafDir)
  .filter(n => маска.test(n)).sort()
  .map(n => 'data:image/webp;base64,' +
       fs.readFileSync(path.join(leafDir, n)).toString('base64'));

const leafImages = leafData(/^leaf-/);
const decorImages = leafData(/^maple-/);
if (!leafImages.length) throw new Error('нет листьев в demo/assets/leaves');

/* Номера блоков сняты с живой страницы Барских полей. */
const CFG = {
  leafImages, decorImages,
  falling: true,
  ground: true,
  /* Углы набор раздаёт по кругу: tr → bl → br → tl. Порядок ниже подобран
     так, чтобы соседние по странице блоки получали разные углы и декор
     шёл змейкой, а не липнул к одной стороне. */
  /* Россыпь в углу — только на высоких блоках. На низких баннерах-заголовках
     коробка 250×250 занимает почти всю высоту и сбивается в комок у края,
     поэтому им достаётся не куча, а лёгкая россыпь по всей ширине. */
  corners: [
    'rec1538220631',   /* первый экран, 788px     — правый верх */
    'rec2463108211'    /* подберём дом, 667px     — левый низ   */
  ],
  /* Дуга по верхнему краю — россыпь во всю ширину блока.
     На блоках-заголовках только она: заголовок там стоит по центру
     по высоте, и полоса снизу ложится прямо на буквы. */
  topStrips: [
    'rec1534422731',   /* здесь отдых становится особенным */
    'rec1185039476',   /* в каждом доме                    */
    'rec1185039396',   /* о базе отдыха                    */
    'rec2010819681',   /* Чайковский                       */
    'rec1216602591',   /* категория эмоций                 */
    'rec1185039526',   /* карта территории                 */
    'rec1185039536',   /* отзывы гостей                    */
    'rec2238137661',   /* наши новости                     */
    'rec1249647481',   /* помощь с бронированием           */
    'rec1187742556'    /* контакты                         */
  ],
  /* Полоса снизу — только там, где низ блока свободен. */
  bottomStrips: [
    'rec1649328981',   /* галерея          */
    'rec1241556951'    /* расчёт стоимости */
  ],
  /* Цепочки — на стыках разделов, чтобы страница дышала. */
  dividersAfter: ['rec1534422731', 'rec1185039526', 'rec1216602591',
                  'rec1185039551', 'rec2238104591'],
  scale: 0.62,        /* листья в раскладках мельче: крупные выглядели кляксой */
  fallScale: 0.8,
  density: 1.1,
  opacity: 0.9
};

const packJs = [...read('tilda', '7BP2BODY.html')
  .matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
if (!packJs.trim()) throw new Error('в 7BP2BODY.html не найдены скрипты');

/* Настройки в файле лежат заготовкой с пустыми списками — подставляем свои
   целиком, до того как выполнится сам набор. */
const packSetup = `window.BARSKIE = ${JSON.stringify(CFG)};`;
const packBody = packJs.replace(/window\.BARSKIE\s*=\s*\{[\s\S]*?\n\};/, packSetup);
if (packBody === packJs) throw new Error('не найден блок настроек window.BARSKIE');

let page = read('demo', 'sites', 'bp.html');
/* Стили набора — часть 1. Пока это замена: в загрузках была только
   часть 2, а без стилей холст листопада нулевого размера и раскладки
   по краям блоков сваливаются в поток. */
const packCss = (/<style[^>]*>([\s\S]*?)<\/style>/.exec(read('tilda', '7BP1HEAD.html')) || [])[1];
if (!packCss) throw new Error('в 7BP1HEAD.html не найден <style>');
page = page.replace(/<\/head>/i, `<style>\n${packCss}\n${hideSummer}\n</style>\n</head>`);
/* Набор идёт последним: его раскладки ищут #bo-host, а к этому моменту
   блок уже вставлен. */
page = page.replace(/<\/body>/i,
  `<script>\n${blockJs}\n${popupJs}\n</script>\n<script>\n${packBody}\n</script>\n</body>`);

fs.writeFileSync(path.join(ROOT, 'barskie.html'), page, 'utf8');
console.log(`  barskie.html  ${(page.length / 1024 / 1024).toFixed(1)} МБ`);
console.log('  блок осенних акций — на месте «Отдых сейчас — оплата потом!», летний блок оставлен');
console.log('  смотреть: http://localhost:8749/barskie.html');
