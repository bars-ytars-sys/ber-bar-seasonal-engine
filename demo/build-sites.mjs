/**
 * Готовит копии живых сайтов для витрины «до / лёгкая осень».
 * Запуск: node demo/build-sites.mjs
 *
 * Что делает:
 *   1. скачивает главные страницы ecobr.ru и barskie-polya.ru;
 *   2. ВЫРЕЗАЕТ всю аналитику и формы — копия не должна слать данные
 *      в боевые счётчики и создавать фейковые заявки;
 *   3. ставит noindex, чтобы копия не конкурировала с оригиналом в поиске;
 *   4. генерирует осенний слой для каждого сайта.
 *
 * Копии сохраняются в demo/sites/ и коммитятся — витрина работает без сети
 * (кроме картинок, они грузятся с tildacdn).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'demo', 'sites');
/* --offline: не качать сайты заново, взять уже сохранённые копии.
   Нужно, когда правишь только слой или элементы: сеть до tildacdn
   периодически отваливается и роняет всю сборку. */
const OFFLINE = process.argv.includes('--offline');
fs.mkdirSync(OUT, { recursive: true });

const SITES = [
  {
    id: 'eco',
    title: 'ЭкоБаза «Берёзовая роща»',
    url: 'https://ecobr.ru/',
    projectCss: 'https://static.tildacdn.com/ws/project4027012/tilda-blocks-page103448346.min.css',
    /* ЦВЕТ САЙТА НЕ ТРОГАЕМ. Осень добавляется только элементами.
       Перекраска подложек была ошибкой: часть блоков уезжала в тёплый,
       часть оставалась прежней, и сайт разъезжался по цвету. */
    vars: {},
    hard: {}
  },
  {
    id: 'bp',
    title: 'База отдыха «Барские поля»',
    url: 'https://barskie-polya.ru/',
    projectCss: 'https://static.tildacdn.com/ws/project8177746/tilda-blocks-page41434555.min.css',
    /* ЦВЕТ САЙТА НЕ ТРОГАЕМ — см. комментарий у «Рощи». */
    vars: {},
    hard: {}
  }
];

/** Признаки блока, который в копии жить не должен. */
const BAD = [
  'mc.yandex.ru',          // Яндекс.Метрика
  'VK.Retargeting',        // пиксель ВК
  'vk.com/rtrg',
  'vk.com/js/api/openapi', // загрузчик пикселя ВК
  'mango-office.ru'        // коллтрекинг Mango
];

/**
 * Аккуратно вырезает теги <script>/<noscript>, попадающие под BAD.
 * Регулярка «от открывающего до закрывающего» тут не годится: она
 * схлопывает половину страницы. Идём по тегам последовательно.
 */
function stripTag(html, tag) {
  const open = new RegExp('<' + tag + '\\b[^>]*>', 'gi');
  const lower = html.toLowerCase();
  const close = '</' + tag + '>';
  const parts = [];
  let last = 0, m, removed = 0;

  while ((m = open.exec(html))) {
    const bodyStart = m.index + m[0].length;
    const closeIdx = lower.indexOf(close, bodyStart);
    if (closeIdx === -1) break;
    const end = closeIdx + close.length;
    const chunk = m[0] + html.slice(bodyStart, closeIdx);

    if (BAD.some(b => chunk.includes(b))) {
      parts.push(html.slice(last, m.index));
      last = end;
      removed++;
    }
    open.lastIndex = end;
  }
  parts.push(html.slice(last));
  return { html: parts.join(''), removed };
}

const NEUTER = `
<script>
/* Витрина: копия сайта не должна ничего отправлять наружу. */
(function(){
  window.ym = function(){};                       // Метрика
  window.VK = { Retargeting: { Init:function(){}, Hit:function(){}, Event:function(){} } };
  window.tildastatOptions = null;
  document.addEventListener('submit', function(e){
    e.preventDefault(); e.stopPropagation();
    alert('Это витрина. Форма здесь не отправляется — откройте настоящий сайт.');
  }, true);
})();
</script>`;

for (const s of SITES) {
  console.log('\n' + s.title);

  const copy = path.join(OUT, s.id + '.html');
  let html;
  if (OFFLINE && fs.existsSync(copy)) {
    html = fs.readFileSync(copy, 'utf8');
    console.log('  взята сохранённая копия: ' + (html.length / 1024 / 1024).toFixed(1) + ' МБ');
  } else {
    html = await (await fetch(s.url, { headers: { 'user-agent': 'Mozilla/5.0 Chrome/120' } })).text();
    console.log('  скачано: ' + (html.length / 1024 / 1024).toFixed(1) + ' МБ');
  }

  let out = html, killed = 0;
  for (const tag of ['script', 'noscript']) {
    const r = stripTag(out, tag);
    out = r.html;
    killed += r.removed;
  }
  /* Страховка: если вырезали больше 5% страницы — что-то пошло не так */
  const lost = 1 - out.length / html.length;
  if (lost > 0.05) throw new Error(`вырезано ${(lost * 100).toFixed(0)}% страницы — проверьте stripTag`);
  for (const b of BAD) {
    if (out.includes(b)) console.log(`  ! в копии осталось упоминание ${b}`);
  }

  /* В офлайн-режиме копия уже подготовлена — не вставляем служебное дважды */
  if (!out.includes('BB_NEUTERED')) {
    out = out.replace(/<head[^>]*>/i, m => m
      + '\n<meta name="robots" content="noindex,nofollow">'
      + `\n<base href="${s.url}" target="_blank">`
      + '\n<!-- BB_NEUTERED -->'
      + NEUTER);
  }

  const file = path.join(OUT, s.id + '.html');
  fs.writeFileSync(file, out, 'utf8');
  console.log(`  вырезано блоков аналитики: ${killed}`);
  console.log(`  ${path.relative(ROOT, file)}  ${(out.length / 1024 / 1024).toFixed(1)} МБ`);

  /* --- осенний слой: ваши файлы, без единой моей правки --- */
  const cssFile = path.join(OUT, `autumn-${s.id}.css`);
  fs.writeFileSync(cssFile, buildLayerCss(), "utf8");
  console.log(`  ${path.relative(ROOT, cssFile)}  ${(fs.statSync(cssFile).size / 1024).toFixed(1)} КБ`);

  /* --- осенние элементы: собираем из настоящих компонентов --------------- */
  fs.writeFileSync(path.join(OUT, `autumn-${s.id}.js`), buildElements(s.id), "utf8");
  console.log(`  demo/sites/autumn-${s.id}.js  ${(buildElements(s.id).length / 1024).toFixed(1)} КБ`);
}

/**
 * Слой для витрины собирается ИЗ ВАШИХ ФАЙЛОВ tilda/1HEAD.html и 2BODY.html.
 * Ничего своего сюда не добавляется: ни палитры, ни декора, ни полос.
 */
/**
 * Настройки слоя под каждый сайт. В самом 2BODY.html эти списки пустые —
 * без них веточки-разделители и плавное появление просто не включаются.
 * Номера блоков сняты с живых страниц.
 */
const AUTUMN_CFG = {
  eco: {
    /* веточка-разделитель после смысловых секций */
    branchAfter: ['rec1684467611', 'rec1747907231', 'rec2710401401'],
    /* плавное появление при прокрутке — крупные контентные блоки */
    reveal: ['rec2486811301', 'rec2851363001', 'rec2421263681',
             'rec1758781921', 'rec2263527021', 'rec2710223901']
  },
  bp: {
    branchAfter: ['rec1534422731', 'rec1216602591', 'rec1185039536'],
    reveal: ['rec1185039476', 'rec2463108211', 'rec2241691831',
             'rec1216607536', 'rec2010822961']
  }
};

function buildElements(siteId) {
  let body = fs.readFileSync(path.join(ROOT, "tilda", "2BODY.html"), "utf8");

  const cfg = AUTUMN_CFG[siteId];
  if (cfg) {
    for (const key of ['branchAfter', 'reveal']) {
      const re = new RegExp('(' + key + ':\\s*)\\[\\s*\\]');
      if (!re.test(body)) throw new Error(`в 2BODY.html не найден пустой список ${key}`);
      body = body.replace(re, '$1' + JSON.stringify(cfg[key]));
    }
  }

  const out = [];
  const re = /<script[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(body))) out.push(m[1]);
  if (!out.length) throw new Error("в 2BODY.html не найдено ни одного <script>");
  return out.join("\n") + "\n" + buildTeplayaOsen(siteId);
}

/**
 * Врезает блок «Тёплая осень» после записи с заголовком
 * «Ради нас берут выходной!» и меняет сам заголовок на сезонный.
 * Только для ecobr.ru — на «Барских полях» такого блока нет.
 *
 * В Tilda то же самое делается руками: заголовок правится мышкой,
 * блок ставится как T123 из tilda/4BLOK-TEPLAYA-OSEN.html.
 */
function buildTeplayaOsen(siteId) {
  if (siteId !== 'eco') return '';
  let block = fs.readFileSync(path.join(ROOT, 'tilda', '4BLOK-TEPLAYA-OSEN.html'), 'utf8');
  /* В витрине подставляем настоящие адреса фото вместо заглушек ФОТО_… */
  block = block.replace(/ФОТО_([a-z-]+\.webp)/g, (_, name) => '../assets/' + name);

  return [
    '(function () {',
    '  var HTML = ' + JSON.stringify(block).replace(/<\/script>/gi, String.fromCharCode(60) + String.fromCharCode(92) + String.fromCharCode(47) + "script" + String.fromCharCode(62)) + ';',
    '  function mount() {',
    '    if (document.getElementById("to-host")) return;',
    '    var target = document.getElementById("rec1694735441");',
    '    if (!target || !target.parentNode) return;',
    '',
    '    var h = target.querySelector(\'[field="tn_text_1765543910875"]\');',
    '    if (h) h.textContent = ' + JSON.stringify('Тёплая осень') + ';',
    '',
    '    var host = document.createElement("div");',
    '    host.id = "to-host";',
    '    host.style.cssText = "padding:10px 0 56px";',
    '    host.innerHTML = HTML;',
    '    target.parentNode.insertBefore(host, target.nextSibling);',
    '',
    '    host.querySelectorAll("script").forEach(function (old) {',
    '      var neo = document.createElement("script");',
    '      neo.text = old.textContent;',
    '      old.parentNode.replaceChild(neo, old);',
    '    });',
    '  }',
    '  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);',
    '  else mount();',
    '})();'
  ].join('\n');
}

/** Стили слоя — из вашего 1HEAD.html. */
function buildLayerCss() {
  const head = fs.readFileSync(path.join(ROOT, "tilda", "1HEAD.html"), "utf8");
  const m = /<style[^>]*>([\s\S]*?)<\/style>/.exec(head);
  if (!m) throw new Error("в 1HEAD.html не найден <style>");
  return m[1];
}
