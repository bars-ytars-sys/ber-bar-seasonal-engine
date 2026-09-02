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

/* --- «Дорога к отдыху должна быть лёгкой!» ---
   Суть карточки — заправка по дороге, но фраза тонет в общем тексте.
   Выделяем её акцентным цветом сайта. В Тильде то же самое делается
   выделением слов в редакторе карточки. Текст рисуется каруселью
   не сразу, поэтому ждём его короткими проверками. */
const fuelJs = `
(function () {
  /* В разметке Тильды между словами стоят &nbsp;, поэтому ищем не строку,
     а слова, разделённые любым пробелом — обычным или неразрывным. */
  var СЛОВА = ['заправка', 'в', 'удобном', 'месте'];
  var ИСКАТЬ = new RegExp(СЛОВА.join('(?:\\\\s|&nbsp;)+'), 'i');

  function правка() {
    var поле = document.querySelector('[field="li_descr__1771852717075"]');
    if (!поле) return false;
    if (поле.dataset.boDone) return true;
    if (!ИСКАТЬ.test(поле.innerHTML)) return false;
    поле.innerHTML = поле.innerHTML.replace(
      ИСКАТЬ,
      function (m) { return '<span style="color:#ee995d;font-weight:500">' + m + '</span>'; }
    );
    поле.dataset.boDone = '1';
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
  /* Раскладка по вашей схеме: декор только на однотонных зелёных блоках
     с большим отступом, по одному элементу на блок, между украшенными
     блоками промежуток. Первый экран не трогаем — там видео и две кнопки,
     ему достаётся только листопад.

     Углы набор раздаёт по кругу tr → bl → br → tl, поэтому порядок в
     списке подобран так, чтобы каждый блок получил нужный угол:
       rec2709575101  верхний правый
       rec1185039476  нижний левый
       rec1216607536  нижний правый

     Две перестановки против исходной схемы — по правилу «ничего поверх
     кнопок», замер показал попадания:
       карточки домов rec2241691831 — каждая карточка целиком ссылка,
         любой угол ложится на кнопку. Россыпь ушла на соседний блок
         с заголовком «Дома», где место свободно.
       досуг rec2010822961 — полоса по низу задевала три кнопки.
         Заменена дугой сверху на заголовке отзывов. */
  /* Угол на «Программах» (rec1216607536) снят: в нижнем правом углу
     стоит описание, четыре листа из девяти ложились на буквы, и часть
     обрезалась краем блока. Сам раздел не остался без осени — над ним
     дуга на заголовке rec1216602591. */
  corners: ['rec2709575101', 'rec1185039476'],
  topStrips: ['rec1216602591',       /* заголовок программ, отступ 135 */
              'rec1185039536'],      /* заголовок отзывов              */
  bottomStrips: [],
  dividersAfter: ['rec1534422731'],  /* перед картой                   */

  /* wreaths и piles в наборе не реализованы — в BP2BODY.html таких
     раскладок нет. Заголовки «Дома» и «Отзывы» и подвал пока без декора. */

  scale: 0.85,       /* мельче: при 1.2 листья задевали текст и обрезались краем */
  fallScale: 0.8,
  density: 0.6,
  ground: false,       /* справа внизу чат-виджет, листья по низу мешают */
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
/* Страховка к набору.
   Набор раскладывает листья только после того, как ВСЕ картинки сообщат
   о загрузке. Здесь картинки встроены в страницу и успевают загрузиться
   раньше, чем набор вешает обработчики, — счётчик до нуля не доходит,
   и раскладок не появляется вовсе. Поэтому дозываем place() сами, но
   только если он ещё ничего не разложил: повторный вызов удвоил бы листья.
   На боевом сайте картинки грузятся с сервера и такого обычно не бывает —
   строчка лишней не будет. */
const safetyJs = `
(function () {
  /* Набор раскладывает листья только после того, как ВСЕ картинки сообщат
     о загрузке. Здесь картинки встроены в страницу и иногда успевают
     загрузиться раньше, чем он вешает обработчики, — тогда раскладок
     не появляется вовсе. Ждём его долго и вмешиваемся только если он
     действительно не справился. */
  setTimeout(function () {
    if (document.querySelector('.bp')) return;
    if (window.barskieLayer && window.barskieLayer.place) window.barskieLayer.place();
  }, 25000);

  /* Если набор отработает уже после нас, раскладки задвоятся. Ждать
     удобного момента бесполезно — сторожим появление новых узлов и
     убираем лишние сразу: на один блок одна раскладка каждого вида. */
  var видел = {};
  function ключ(box) {
    var хозяин = box.closest ? box.closest('.bp-host') : null;
    return (хозяин ? хозяин.id : 'между·' + Array.prototype.indexOf.call(
             box.parentNode.children, box)) +
           '|' + box.className + '|' + (box.getAttribute('data-pos') || '');
  }
  function проверить(box) {
    if (!box.classList || !box.classList.contains('bp')) return;
    var k = ключ(box);
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

/* Набор идёт последним: его раскладки ищут #bo-host, а к этому моменту
   блок уже вставлен. */
page = page.replace(/<\/body>/i,
  `<script>\n${blockJs}\n${popupJs}\n${fuelJs}\n</script>\n` +
  `<script>\n${packBody}\n</script>\n<script>\n${safetyJs}\n</script>\n</body>`);

fs.writeFileSync(path.join(ROOT, 'barskie.html'), page, 'utf8');
console.log(`  barskie.html  ${(page.length / 1024 / 1024).toFixed(1)} МБ`);
console.log('  блок осенних акций — на месте «Отдых сейчас — оплата потом!», летний блок оставлен');
console.log('  смотреть: http://localhost:8749/barskie.html');
