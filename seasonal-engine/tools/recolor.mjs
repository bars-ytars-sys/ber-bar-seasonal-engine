/**
 * Генератор осеннего (и любого другого сезонного) слоя для Tilda.
 *
 * Зачем нужен. Часть цветов на сайте задана Цветовыми стилями Tilda — их
 * достаточно переопределить одним блоком переменных. Но часть цветов вбита
 * в Zero Block жёстко, и переменными до них не дотянуться. Этот скрипт
 * находит все правила с «старым» цветом и выпускает такие же правила
 * с новым цветом — их остаётся вставить в HEAD.
 *
 * Запуск:
 *   node seasonal-engine/tools/recolor.mjs <страница.html> <карта.json> <выход.css>
 *
 * Карта цветов — обычный json: { "#2ed8a3": "#1f8f6e", "#f4f6fb": "#f6f1e7" }
 *
 * Скрипт разбирает и <style> внутри страницы, и подключённые css проекта
 * (их надо заранее сохранить рядом — см. --css).
 */
import fs from 'node:fs';

const args = process.argv.slice(2);
const [pageFile, mapFile, outFile] = args.filter(a => !a.startsWith('--'));
const extraCss = args.filter(a => a.startsWith('--css=')).map(a => a.slice(6));

if (!pageFile || !mapFile || !outFile) {
  console.error('Использование: node recolor.mjs <страница.html> <карта.json> <выход.css> [--css=проект.css]');
  process.exit(1);
}

const MAP = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
const KEYS = Object.keys(MAP).map(k => k.toLowerCase());

/** Собираем весь css: инлайновые <style> страницы + отдельные файлы. */
function collectCss() {
  const html = fs.readFileSync(pageFile, 'utf8');
  const chunks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(html))) chunks.push(m[1]);
  for (const f of extraCss) if (fs.existsSync(f)) chunks.push(fs.readFileSync(f, 'utf8'));
  return chunks.join('\n');
}

/**
 * Мини-разбор css. Нужен один уровень @media/@supports — глубже Tilda не уходит.
 * Возвращает [{ at, selector, decls }].
 */
function parseRules(css) {
  const rules = [];
  let i = 0, at = '';

  while (i < css.length) {
    const brace = css.indexOf('{', i);
    if (brace === -1) break;

    let prelude = css.slice(i, brace).trim();
    // отрезаем хвост предыдущего правила и комментарии
    prelude = prelude.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\}+/, '').trim();

    if (prelude.startsWith('@')) {
      // вложенный блок: media, supports. Заходим внутрь.
      if (/^@(media|supports|layer)/i.test(prelude)) {
        at = prelude;
        i = brace + 1;
        continue;
      }
      // keyframes, font-face и прочее пропускаем целиком
      const end = matchBrace(css, brace);
      i = end + 1;
      continue;
    }

    const end = matchBrace(css, brace);
    if (end === -1) break;
    const body = css.slice(brace + 1, end);

    if (prelude) rules.push({ at, selector: prelude, decls: body });

    i = end + 1;
    // закрылся ли внешний @media
    const nextClose = css.slice(i).match(/^\s*\}/);
    if (nextClose && at) { at = ''; i += nextClose[0].length; }
  }
  return rules;
}

function matchBrace(s, open) {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

/** Из блока объявлений оставляем только те, где встретился нужный цвет. */
function recolorDecls(decls) {
  const kept = [];
  for (const raw of decls.split(';')) {
    const d = raw.trim();
    if (!d) continue;
    const colon = d.indexOf(':');
    if (colon === -1) continue;
    const prop = d.slice(0, colon).trim();
    let val = d.slice(colon + 1).trim();
    if (prop.startsWith('--')) continue;              // переменные покрыты отдельным блоком
    const low = val.toLowerCase();
    if (!KEYS.some(k => low.includes(k))) continue;

    for (const [from, to] of Object.entries(MAP)) {
      val = val.replace(new RegExp(from, 'gi'), to);
    }
    val = val.replace(/\s*!important\s*$/i, '');
    kept.push(`${prop}:${val} !important`);
  }
  return kept;
}

const css = collectCss();
const rules = parseRules(css);

const byAt = new Map();
let hit = 0;
for (const r of rules) {
  const kept = recolorDecls(r.decls);
  if (!kept.length) continue;
  hit++;
  const key = r.at || '';
  if (!byAt.has(key)) byAt.set(key, []);
  byAt.get(key).push(`${r.selector}{${kept.join(';')}}`);
}

let out = `/* Сезонный слой, сгенерирован автоматически из ${pageFile}\n`
        + `   Дата: ${new Date().toISOString().slice(0, 10)}\n`
        + `   Замен цвета: ${Object.entries(MAP).map(([a, b]) => a + '→' + b).join(', ')}\n`
        + `   Правил: ${hit} из ${rules.length}\n`
        + `   ВНИМАНИЕ: файл нужно перегенерировать после любой правки дизайна блоков. */\n`;

for (const [at, list] of byAt) {
  out += at ? `${at}{${list.join('')}}\n` : list.join('\n') + '\n';
}

fs.writeFileSync(outFile, out, 'utf8');
console.log(`  ${outFile}: ${hit} правил, ${(out.length / 1024).toFixed(1)} КБ`);
