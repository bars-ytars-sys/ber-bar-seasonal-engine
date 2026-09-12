/**
 * Локальная копия живой страницы с подменённым блоком и/или добавленным
 * кодом в HEAD — посмотреть, как будет на сайте, ничего не публикуя.
 *
 *   node tools/kopiya-s-blokom.mjs https://barskie-polya.ru/ \
 *        --rec=rec3545323801 --blok="tilda/ГОТОВО/Барские-поля/4-BLOK-akcii-gotov.html" --otkryt
 *   node tools/kopiya-s-blokom.mjs https://ecobr.ru/ --head=tools/out/HEAD-KARTINKI-ecobr.ru.html
 *
 * Пути к файлам — от корня проекта.
 *
 * Картинки, которые блок берёт с GitHub Pages (demo/assets/…), вшиваются
 * в страницу из локальной папки demo/assets — так видно и ещё не запушенные.
 * Ссылкой на файл с диска их давать нельзя: в пути Desktop\Ber&Bar есть «&»,
 * и браузер на нём спотыкается.
 *
 * В копии не поднимается модуль бронирования Bnovo — он грузится только
 * с настоящего домена. Это нормально.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { КОРЕНЬ, аргументы, выход } from './_obshchee.mjs';

const { флаги, позиции } = аргументы();
const адрес = позиции[0];
if (!адрес || (!флаги.blok && !флаги.head)) {
  console.error('нужно: node tools/kopiya-s-blokom.mjs <адрес> [--rec=recNNN --blok=файл] [--head=файл] [--otkryt]');
  process.exit(1);
}
const прочесть = f => fs.readFileSync(path.resolve(КОРЕНЬ, f), 'utf8');

let t = await (await fetch(адрес + (адрес.includes('?') ? '&' : '?') + 'n=' + Date.now())).text();

if (флаги.blok) {
  if (!флаги.rec) { console.error('для --blok нужен --rec=recNNN'); process.exit(1); }
  const нач = t.indexOf('<div id="' + флаги.rec + '"');
  if (нач < 0) { console.error('блок ' + флаги.rec + ' на странице не найден'); process.exit(1); }
  const открытие = t.indexOf('>', нач) + 1;
  /* парный </div> ищем счётом вложенности */
  let глубина = 1, конец = -1, м;
  const re = /<div\b|<\/div>/gi;
  re.lastIndex = открытие;
  while ((м = re.exec(t))) {
    глубина += м[0][1] === '/' ? -1 : 1;
    if (!глубина) { конец = м.index; break; }
  }
  if (конец < 0) { console.error('не нашёл конец блока ' + флаги.rec); process.exit(1); }
  t = t.slice(0, открытие) + '\n' + прочесть(флаги.blok) + '\n' + t.slice(конец);
}
if (флаги.head) t = t.replace(/<head([^>]*)>/i, '<head$1>' + прочесть(флаги.head));

/* картинки с GitHub Pages — вшиваем из demo/assets, если файл есть локально */
t = t.replace(/https:\/\/bars-ytars-sys\.github\.io\/ber-bar-seasonal-engine\/(demo\/assets\/[^"')\s]+)/g, (весь, отн) => {
  const ф = path.join(КОРЕНЬ, отн);
  if (!fs.existsSync(ф)) return весь;
  const расш = path.extname(ф).slice(1).toLowerCase();
  const mime = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' }[расш] || 'application/octet-stream';
  return 'data:' + mime + ';base64,' + fs.readFileSync(ф).toString('base64');
});

t = t.replace('</body>',
  '<div style="position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#c9a227;' +
  'color:#1d1d1b;font:600 13px/1.5 Arial,sans-serif;text-align:center;padding:7px 12px">' +
  'ПРЕДПРОСМОТР — локальная копия, живой сайт не изменён</div></body>');

const имя = new URL(адрес).hostname + (флаги.rec ? '-' + флаги.rec : '') + (флаги.head ? '-head' : '') + '.html';
const файл = выход(имя);
fs.writeFileSync(файл, t, 'utf8');
console.log('копия: ' + файл + '  (' + (t.length / 1048576).toFixed(1) + ' МБ)');

/* Открываем через PowerShell: cmd споткнётся на «&» в пути Ber&Bar. */
if (флаги.otkryt) {
  const [cmd, args] = process.platform === 'win32'
    ? ['powershell', ['-NoProfile', '-Command', 'Start-Process -FilePath "' + файл + '"']]
    : ['xdg-open', [файл]];
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
}
