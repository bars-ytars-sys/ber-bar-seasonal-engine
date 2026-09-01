/**
 * Собирает готовые к вставке файлы для Tilda — по одному на сайт.
 * Запуск: node tools/build-tilda.mjs
 *
 * На выходе tilda/:
 *   ecobr-HEAD.html     — вставить целиком в HEAD ecobr.ru
 *   barskie-HEAD.html   — вставить целиком в HEAD barskie-polya.ru
 *   images/             — картинки, которые надо загрузить в Файлы Tilda
 *   КАК-ВСТАВИТЬ.md     — инструкция на пять шагов
 *
 * Файлы собираются из seasonal-engine/, поэтому не расходятся с кодом.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'seasonal-engine');
const OUT = path.join(ROOT, 'tilda');

const read = (...p) => fs.readFileSync(path.join(SRC, ...p), 'utf8');

const SITES = [
  {
    id: 'eco',
    file: 'ecobr-HEAD.html',
    title: 'ЭкоБаза «Берёзовая роща» · ecobr.ru',
    images: ['leaf-terracotta.webp', 'leaf-ochre.webp', 'leaf-sand.webp', 'leaf-olive.webp'],
    assets:
      '  leaves: ["ССЫЛКА_НА_leaf-terracotta.webp", "ССЫЛКА_НА_leaf-ochre.webp",\n' +
      '           "ССЫЛКА_НА_leaf-sand.webp", "ССЫЛКА_НА_leaf-olive.webp"]',
    blocks: [
      'head/1-tema-sezona.html',
      'head/2-raspisanie-blokov.html',
      'head/3-bnovo-deeplink.html',
      'head/4-anons-polosa.html',
      'head/5-celi-metriki.html',
      'head/6-vk-pixel-ecobr.html',
      'head/10-osennie-elementy.html',
      'blocks/8-mobile-sticky-cta.html'
    ]
  },
  {
    id: 'bp',
    file: 'barskie-HEAD.html',
    title: 'База отдыха «Барские поля» · barskie-polya.ru',
    images: ['leaf-terracotta.webp', 'leaf-ochre.webp', 'leaf-sand.webp', 'leaf-olive.webp'],
    assets:
      '  leaves: ["ССЫЛКА_НА_leaf-terracotta.webp", "ССЫЛКА_НА_leaf-ochre.webp",\n' +
      '           "ССЫЛКА_НА_leaf-sand.webp", "ССЫЛКА_НА_leaf-olive.webp"]',
    blocks: [
      'head/1-tema-sezona.html',
      'head/2-raspisanie-blokov.html',
      'head/3-bnovo-deeplink.html',
      'head/4-anons-polosa.html',
      'head/5-celi-metriki.html',
      'head/10-osennie-elementy.html'
    ]
  }
];

fs.mkdirSync(path.join(OUT, 'images'), { recursive: true });

for (const f of new Set(SITES.flatMap(s => s.images))) {
  fs.copyFileSync(path.join(ROOT, 'demo', 'assets', f), path.join(OUT, 'images', f));
}

for (const s of SITES) {
  const head =
`<!-- ===========================================================================
     ${s.title}
     ОСЕННЕЕ ОФОРМЛЕНИЕ · вставить ЦЕЛИКОМ в HEAD

     Куда: Настройки сайта → Ещё → HTML-код для вставки внутрь HEAD.
     Вставлять целиком, ничего не выкидывая: блоки зависят друг от друга
     и идут в этом порядке.

     ПЕРЕД ВСТАВКОЙ сделайте два дела:
       1. Загрузите картинки из папки tilda/images в Настройки сайта → Файлы.
       2. Замените ниже ССЫЛКА_НА_… на адреса, которые выдала Tilda.

     Проверить после публикации:
       ?season=autumn   — включить осень принудительно
       ?decor=off       — выключить осенние элементы
       ?date=2026-12-25 — посмотреть сайт на любую дату

     Файл собран автоматически из seasonal-engine/. Правьте компоненты
     в репозитории и пересобирайте: node tools/build-tilda.mjs
     =========================================================================== -->

<script>
/* ---------------------------------------------------------------------------
   ССЫЛКИ НА КАРТИНКИ. Единственное, что нужно заполнить руками.
   --------------------------------------------------------------------------- */
window.BB_AUTUMN_ASSETS = {
${s.assets}
};
</script>

${s.blocks.map(b => read(b)).join('\n\n')}
`;
  fs.writeFileSync(path.join(OUT, s.file), head, 'utf8');
  console.log(`  tilda/${s.file}  ${(head.length / 1024).toFixed(1)} КБ  · блоков: ${s.blocks.length}`);
}

console.log(`  tilda/images/  ${fs.readdirSync(path.join(OUT, 'images')).length} файла`);
