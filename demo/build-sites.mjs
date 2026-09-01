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
fs.mkdirSync(OUT, { recursive: true });

const SITES = [
  {
    id: 'eco',
    title: 'ЭкоБаза «Берёзовая роща»',
    url: 'https://ecobr.ru/',
    projectCss: 'https://static.tildacdn.com/ws/project4027012/tilda-blocks-page103448346.min.css',
    /* Палитра объявлена в css проекта селектором «#allrecords .r, body».
       Трогаем ТОЛЬКО фон секций: мятный акцент бренда остаётся как был. */
    vars: {
      '--uc-color-color-n3E0FkCwyE': ['#f4f6fb', '#f6f1e4']
    },
    /* Цвета, вбитые в блоки мимо Цветовых стилей */
    hard: { '#f6f6f6': '#f7f2e8' }
  },
  {
    id: 'bp',
    title: 'База отдыха «Барские поля»',
    url: 'https://barskie-polya.ru/',
    projectCss: 'https://static.tildacdn.com/ws/project8177746/tilda-blocks-page41434555.min.css',
    /* Цветовых стилей на сайте нет — переопределять нечего */
    vars: {},
    /* Самый большой фон страницы (64 млн px²) уводим в оливковый,
       светлый текст — на полтона теплее. Акцентная охра не трогается. */
    hard: { '#314c44': '#3a4a37', '#eee5d5': '#ece0c9' }
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

  const html = await (await fetch(s.url, { headers: { 'user-agent': 'Mozilla/5.0 Chrome/120' } })).text();
  console.log('  скачано: ' + (html.length / 1024 / 1024).toFixed(1) + ' МБ');

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

  out = out.replace(/<head[^>]*>/i, m => m
    + '\n<meta name="robots" content="noindex,nofollow">'
    + `\n<base href="${s.url}" target="_blank">`
    + NEUTER);

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
    fs.writeFileSync(tmpProj, await (await fetch(s.projectCss)).text(), 'utf8');
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
}

console.log('\nГотово. Витрина: index.html');
