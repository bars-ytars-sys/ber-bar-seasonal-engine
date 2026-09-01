/**
 * Собирает превью страницы /special с настоящими осенними акциями.
 * Запуск: node tools/build-special.mjs   →  special.html
 *
 * Собирается из тех же файлов, что идут в Tilda:
 *   seasonal-engine/blocks/7-katalog-offerov.html — сам каталог
 *   tilda/offers-*.json                          — акции из презентации
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

const core = read('seasonal-engine', 'head', '1-tema-sezona.html');
const bnovo = read('seasonal-engine', 'head', '3-bnovo-deeplink.html');
const block = read('seasonal-engine', 'blocks', '7-katalog-offerov.html');

const SITES = {
  eco: { title: 'Берёзовая роща', offers: read('tilda', 'offers-ecobr.json') },
  bp:  { title: 'Барские поля',   offers: read('tilda', 'offers-barskie.json') }
};

/* Какая база показывается — берём из ?site=, по умолчанию Роща */
const site = 'eco';
const withOffers = (json) => block.replace(
  /(<script type="application\/json" id="bb-offers">)[\s\S]*?(<\/script>)/,
  '$1\n' + json + '\n$2'
);

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Спецпредложения осени 2026</title>
${core}
<script>
/* Превью: базу берём из ?site=bp, сезон фиксируем на осени */
(function () {
  var s = /[?&]site=bp/.test(location.search) ? 'bp' : 'eco';
  window.BB.site = s;
  window.BB.season = 'autumn';
  document.documentElement.setAttribute('data-site', s);
  document.documentElement.setAttribute('data-season', 'autumn');
  window.__site = s;
})();
</script>
${bnovo}
<style>
  body{margin:0;background:var(--bb-bg);font:16px/1.5 var(--bb-font);color:var(--bb-ink)}
  .hd{max-width:1200px;margin:0 auto;padding:34px 20px 8px;display:flex;
      align-items:baseline;gap:18px;flex-wrap:wrap}
  .hd h1{font:600 26px/1.2 var(--bb-font);margin:0}
  .hd nav{margin-left:auto;display:flex;gap:8px}
  .hd a{text-decoration:none;color:var(--bb-muted);border:1px solid var(--bb-line);
        background:var(--bb-surface);border-radius:999px;padding:7px 15px;font-size:14px}
  .hd a.on{background:var(--bb-accent);border-color:var(--bb-accent);color:var(--bb-accent-ink);font-weight:600}
  .sub{max-width:1200px;margin:0 auto;padding:0 20px 22px;color:var(--bb-muted);font-size:14.5px}
  .pane{display:none}
  .pane.on{display:block}
</style>
</head>
<body>

<div class="hd">
  <h1 id="ttl">Спецпредложения · осень 2026</h1>
  <nav>
    <a href="?site=eco" id="l-eco">Берёзовая роща</a>
    <a href="?site=bp"  id="l-bp">Барские поля</a>
  </nav>
</div>
<p class="sub">
  Акции взяты из презентации «Осеннее оформление сайтов 2026». У каждой есть цена
  или суть выгоды, срок действия и кнопка, которая ведёт прямо в модуль бронирования
  с подставленными датами. Просроченные исчезают сами.
</p>

<div class="pane" id="p-eco">
${withOffers(SITES.eco.offers)}
</div>

<div class="pane" id="p-bp">
${withOffers(SITES.bp.offers)}
</div>

<script>
(function () {
  var s = window.__site;
  document.getElementById('p-' + s).classList.add('on');
  document.getElementById('l-' + s).classList.add('on');
  document.getElementById('ttl').textContent =
    'Спецпредложения · осень 2026 · ' + (s === 'bp' ? 'Барские поля' : 'Берёзовая роща');
})();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'special.html'), html, 'utf8');
console.log(`  special.html  ${(html.length / 1024).toFixed(1)} КБ  · акций: ` +
  `${JSON.parse(SITES.eco.offers).length} + ${JSON.parse(SITES.bp.offers).length}`);
