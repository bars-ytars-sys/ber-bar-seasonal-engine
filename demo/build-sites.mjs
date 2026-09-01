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

  /* --- осенний слой --- */
  let css = `/* ЛЁГКАЯ ОСЕНЬ · ${s.title}\n   Бренд не трогаем: акцентные цвета остаются как есть.\n`
          + `   Двигается только «земля» — фоны уходят из холодных в тёплые. */\n`;

  const varLines = Object.entries(s.vars)
    .map(([k, [from, to]]) => `  ${k}:${to} !important;   /* было ${from} */`);
  if (varLines.length) {
    css += `\n/* Через Цветовые стили Tilda — одним блоком на весь сайт */\n`
         + `#allrecords .r, body{\n${varLines.join('\n')}\n}\n`;
  } else {
    css += `\n/* Цветовых стилей на этом сайте нет — всё ниже сгенерировано по блокам */\n`;
  }

  if (Object.keys(s.hard).length) {
    const tmpMap = path.join(OUT, `.map-${s.id}.json`);
    const tmpCss = path.join(OUT, `.hard-${s.id}.css`);
    const tmpProj = path.join(OUT, `.proj-${s.id}.css`);
    fs.writeFileSync(tmpMap, JSON.stringify(s.hard), 'utf8');
    const projCache = path.join(OUT, '.proj-cache-' + s.id + '.css');
    if (!fs.existsSync(projCache)) fs.writeFileSync(projCache, await (await fetch(s.projectCss)).text(), 'utf8');
    fs.copyFileSync(projCache, tmpProj);
    fs.writeFileSync(path.join(OUT, `.page-${s.id}.html`), html, 'utf8');

    execFileSync(process.execPath, [
      path.join(ROOT, 'seasonal-engine', 'tools', 'recolor.mjs'),
      path.join(OUT, `.page-${s.id}.html`), tmpMap, tmpCss, '--css=' + tmpProj
    ], { stdio: 'inherit' });

    css += '\n' + fs.readFileSync(tmpCss, 'utf8');
    for (const f of [tmpMap, tmpCss, tmpProj, path.join(OUT, `.page-${s.id}.html`)]) fs.unlinkSync(f);
  }

  if (s.extra) css += s.extra + '\n';

  const cssFile = path.join(OUT, `autumn-${s.id}.css`);
  fs.writeFileSync(cssFile, css, 'utf8');
  console.log(`  ${path.relative(ROOT, cssFile)}  ${(css.length / 1024).toFixed(1)} КБ`);

  /* --- осенние элементы: собираем из настоящих компонентов --------------- */
  fs.writeFileSync(path.join(OUT, `autumn-${s.id}.js`), buildElements(s), 'utf8');
  console.log(`  demo/sites/autumn-${s.id}.js  ${(buildElements(s).length / 1024).toFixed(1)} КБ`);
}

/**
 * Витрина показывает не бутафорию, а те же блоки 1, 4 и 10, что идут в Tilda.
 * Меняем ровно три вещи:
 *   — базу задаём явно (внутри iframe домен github.io, по нему её не определить);
 *   — анонс-полосу включаем и даём ей осенний оффер;
 *   — сезон фиксируем на autumn, чтобы элементы не зависели от даты запуска.
 */
function buildElements(s) {
  const readPart = (file, tag) => {
    const html = fs.readFileSync(path.join(ROOT, 'seasonal-engine', file), 'utf8');
    const re = new RegExp(`<${tag}(?![^>]*application/json)[^>]*>([\\s\\S]*?)</${tag}>`);
    const m = re.exec(html);
    if (!m) throw new Error(`нет <${tag}> в ${file}`);
    return m[1];
  };
  const script = (file) => readPart(file, 'script');

  /* Палитра --bb-* лежит в <style> первого блока. Без неё анонс-полоса
     отрисуется без цвета — проверено на витрине. */
  const theme = readPart('head/1-tema-sezona.html', 'style');
  const injectTheme =
    `(function(){var s=document.createElement('style');s.setAttribute('data-bb','theme');` +
    `s.appendChild(document.createTextNode(${JSON.stringify(theme)}));` +
    `(document.head||document.documentElement).appendChild(s);})();`;

  const ANNOUNCE = {
    eco: {
      id: 'eco-2026-09-osen',
      text: 'Осенние каникулы −20%: раннее бронирование до 15 сентября',
      cta: 'Забронировать',
      href: '/booking?dfrom=2026-10-23&dto=2026-10-26&adults=2&children=2'
    },
    bp: {
      id: 'bp-2026-09-osen',
      text: 'Осенние каникулы −20%: раннее бронирование до 15 сентября',
      cta: 'Забронировать',
      href: '/booking?dfrom=2026-10-23&dto=2026-10-26&adults=2&children=2'
    }
  }[s.id];

  let announce = script('head/4-anons-polosa.html')
    .replace(/enabled: false/g, 'enabled: true')
    .replace(/from:\s*'20\d\d-\d\d-\d\d'/g, "from:  '2020-01-01'")
    .replace(/until:\s*'20\d\d-\d\d-\d\d'/g, "until: '2035-12-31'");

  for (const [key, val] of Object.entries(ANNOUNCE)) {
    const re = new RegExp(`(${s.id}: \\{[\\s\\S]*?)${key}:\\s*'[^']*'`);
    if (!re.test(announce)) throw new Error(`не нашёл ${key} у ${s.id} в анонс-полосе`);
    announce = announce.replace(re, `$1${key}: ${JSON.stringify(val)}`);
  }

  return [
    `/* Осенние элементы для витрины. Собрано из seasonal-engine/ автоматически,`,
    `   правьте компоненты, а не этот файл. База: ${s.title} */`,
    script('head/1-tema-sezona.html'),
    `/* палитра компонентов --bb-* из того же блока 1 */`,
    injectTheme,
    `/* витрина: база и сезон заданы явно */`,
    `window.BB.site = ${JSON.stringify(s.id)};`,
    `window.BB.season = 'autumn';`,
    `document.documentElement.setAttribute('data-site', ${JSON.stringify(s.id)});`,
    `document.documentElement.setAttribute('data-season', 'autumn');`,
    `/* витрина: не помним закрытие полосы, иначе её не вернуть 7 дней */`,
    `try { Object.keys(localStorage).forEach(function (k) {`,
    `  if (k.indexOf('bb_ab_') === 0) localStorage.removeItem(k); }); } catch (e) {}`,
    script('head/3-bnovo-deeplink.html'),
    announce,
    /* В копии сайта стоит <base href> боевого домена, поэтому относительные
       пути уехали бы на ecobr.ru. Считаем адреса от src самого бандла:
       .../demo/sites/autumn-eco.js  ->  .../demo/assets/... */
    'window.BB_AUTUMN_ASSETS = (function () {\n' +
    '  var me = document.currentScript && document.currentScript.src;\n' +
    '  var base = me ? me.replace(/sites\\/[^/]*$/, "assets/") : "demo/assets/";\n' +
    '  var L = ["wleaf1","wleaf3","wleaf5","wleaf6","wleaf7","wleaf9","wleaf10","wleaf11"];\n' +
    '  var url = function (n) { return base + n + ".webp"; };\n' +
    '  return { leaves: L.map(url), branch: base + "branch.webp" };\n' +
    '})();',
    script('head/10-osennie-elementy.html')
  ].join('\n');
}

console.log('\nГотово. Витрина: index.html');
