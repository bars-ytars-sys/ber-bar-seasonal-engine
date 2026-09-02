/**
 * Собирает ОДНУ страницу для просмотра: копия ecobr.ru с уже вставленным
 * осенним оформлением — так, как оно встанет в Tilda.
 * Никаких переключателей: то, что увидит гость.
 *
 * Ставятся оба ваших набора:
 *   1HEAD + 2BODY           — листопад, ветки в углах, разделители, появление
 *   4HEADPACK2 + 5BODYPACK2 — гирлянда с фонариками, боковые полосы, букеты,
 *                             свисающая рябина, колосья-разделители,
 *                             куча листьев внизу, осенняя печать
 * Плюс блок «Тёплая осень» с акциями.
 *
 * Запуск: node demo/build-preview.mjs   →  bereza.html
 * Смотреть: http://localhost:8749/bereza.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

const styleOf = (file) => {
  const m = /<style[^>]*>([\s\S]*?)<\/style>/.exec(read('tilda', file));
  if (!m) throw new Error(`в ${file} не найден <style>`);
  return m[1];
};
const scriptsOf = (text) =>
  [...text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');

/* ---------------------------------------------------------------------------
   Настройки под «Берёзовую рощу». В ваших файлах списки пустые — без них
   разделители, букеты и печати просто не включаются. Номера блоков сняты
   с живой страницы.
   --------------------------------------------------------------------------- */
const CFG1 = {
  branchAfter: ['rec1684467611', 'rec1747907231', 'rec2710401401'],
  reveal: ['rec2486811301', 'rec2851363001', 'rec2421263681',
           'rec1758781921', 'rec2263527021', 'rec2710223901']
};

const CFG2 = {
  garland: false,          /* на первом экране гирлянда лишняя — убрана */
  bouquets: ['rec1694735441', 'rec2421263681', 'rec2710223901'],
  hangs: ['rec1684467611', 'rec1758781921'],
  dividersAfter: ['rec2486811301', 'rec2263527021']
};

function fill(text, cfg) {
  for (const [key, val] of Object.entries(cfg)) {
    if (Array.isArray(val)) {
      const re = new RegExp('(' + key + ':\\s*)\\[\\s*\\]');
      if (!re.test(text)) throw new Error(`не найден пустой список ${key}`);
      text = text.replace(re, '$1' + JSON.stringify(val));
    } else {
      /* Одиночные настройки: garland, pile, sides, drift — у них не список,
         а значение, поэтому подменяем до конца строки. */
      const re = new RegExp('(' + key + ':\\s*)([^,\\n]+)');
      if (!re.test(text)) throw new Error(`не найдена настройка ${key}`);
      text = text.replace(re, '$1' + JSON.stringify(val));
    }
  }
  return text;
}

/* --- наборы --- */
const css1 = styleOf('1HEAD.html');
const css2 = styleOf('4HEADPACK2.html');
const js1 = scriptsOf(fill(read('tilda', '2BODY.html'), CFG1));
const js2 = scriptsOf(fill(read('tilda', '5BODYPACK2.html'), CFG2));
if (!js1.trim() || !js2.trim()) throw new Error('не найдены скрипты набора');

/* --- блок «Тёплая осень» ---
   В копии сайта стоит <base href="https://ecobr.ru/">, поэтому любой
   относительный путь уезжает на боевой домен и фото не грузятся.
   Для просмотра встраиваем картинки прямо в блок. В Tilda этого не нужно:
   там вместо ФОТО_… подставляются адреса из Файлов сайта. */
const block = read('tilda', '4BLOK-TEPLAYA-OSEN.html')
  .replace(/ФОТО_([a-z-]+\.webp)/g, (_, n) => {
    const file = path.join(ROOT, 'demo', 'assets', n);
    if (!fs.existsSync(file)) throw new Error('нет фото ' + n);
    return 'data:image/webp;base64,' + fs.readFileSync(file).toString('base64');
  });

/* Внутри блока есть свой </script> — экранируем, иначе он оборвёт
   внешний тег, и вся вставка перестанет выполняться. */
const CLOSE = String.fromCharCode(60, 92, 47) + 'script' + String.fromCharCode(62);
const blockLiteral = JSON.stringify(block).replace(/<\/script>/gi, CLOSE);

const blockJs = `
(function () {
  var HTML = ${blockLiteral};
  function mount() {
    if (document.getElementById('to-host')) return;
    var target = document.getElementById('rec1694735441');
    if (!target || !target.parentNode) return;

    /* Заголовок блока становится сезонным. В Tilda правится мышкой. */
    var h = target.querySelector('[field="tn_text_1765543910875"]');
    if (h) h.textContent = 'Тёплая осень';
    var sub = target.querySelector('[field="tn_text_1774001435540000002"]');
    if (sub) sub.textContent = 'Ради нас берут выходной!';

    var host = document.createElement('div');
    host.id = 'to-host';
    /* Блок сверху уже даёт свой отступ, а снизу идёт следующая секция —
       поэтому подтягиваем вставку вверх и оставляем небольшой хвост. */
    host.style.cssText = 'margin-top:-6px;padding:0 0 62px';
    host.innerHTML = HTML;
    target.parentNode.insertBefore(host, target.nextSibling);

    host.querySelectorAll('script').forEach(function (old) {
      var neo = document.createElement('script');
      neo.text = old.textContent;
      old.parentNode.replaceChild(neo, old);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();`;

/* --- листопад растворяется после первого экрана ---
   Холст листопада и боковые полосы у набора закреплены за окном
   (position:fixed), поэтому едут за гостем через весь сайт и мешают
   читать. Оставляем их на первом экране и гасим к полутора экранам:
   осень встречает на входе, дальше не отвлекает. */
const fadeJs = `
(function () {
  var КОНЕЦ = 1.5;              /* к скольким экранам прокрутки исчезнут */
  var слои = [];
  var ждём = false;

  function собрать() {
    слои = [document.getElementById('au-canvas')]
      .concat([].slice.call(document.querySelectorAll('.au2-side')))
      .filter(Boolean);
    return слои.length > 0;
  }

  function пересчёт() {
    ждём = false;
    собрать();
    if (!слои.length) return;
    var предел = window.innerHeight * КОНЕЦ;
    var доля = Math.min(1, (window.pageYOffset || document.documentElement.scrollTop || 0) / предел);
    for (var i = 0; i < слои.length; i++) {
      var слой = слои[i];
      /* У боковых полос своя прозрачность в стилях набора — запоминаем её
         при первом проходе и гасим от неё, а не от единицы. */
      if (!слой.dataset.auBase) {
        слой.dataset.auBase = getComputedStyle(слой).opacity || '1';
      }
      var прозрачность = parseFloat(слой.dataset.auBase) * (1 - доля);
      /* В наборе прозрачность задана через !important, поэтому обычная
         запись в style её не перебивает. */
      слой.style.setProperty('opacity', прозрачность.toFixed(3), 'important');
      /* Невидимый холст всё равно перерисовывается — прячем, чтобы
         не тратить батарею на анимацию, которой не видно. */
      слой.style.visibility = прозрачность < 0.01 ? 'hidden' : '';
    }
  }

  function покадрово() {
    if (ждём) return;
    ждём = true;
    requestAnimationFrame(пересчёт);
  }

  window.addEventListener('scroll', покадрово, { passive: true });
  window.addEventListener('resize', покадрово, { passive: true });
  /* Слои создаются набором не сразу — пробуем несколько раз. */
  [0, 400, 1200, 2500].forEach(function (ms) { setTimeout(пересчёт, ms); });
})();`;

/* --- собираем страницу --- */
let page = read('demo', 'sites', 'eco.html');
page = page.replace(/<\/head>/i, `<style>\n${css1}\n${css2}\n</style>\n</head>`);
page = page.replace(/<\/body>/i,
  `<script>\n${js1}\n${js2}\n${blockJs}\n${fadeJs}\n</script>\n</body>`);

fs.writeFileSync(path.join(ROOT, 'bereza.html'), page, 'utf8');
console.log(`  bereza.html  ${(page.length / 1024 / 1024).toFixed(1)} МБ`);
console.log('  набор 1: листопад, ветки в углах, разделители, появление');
console.log('  набор 2: гирлянда, боковые полосы, букеты, рябина, колосья, куча листьев, печать');
console.log('  смотреть: http://localhost:8749/bereza.html');
