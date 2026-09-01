/**
 * Автотесты движка сезонности.
 * Запуск: node test/engine.test.mjs
 *
 * Тесты гоняют НАСТОЯЩИЙ код компонентов из seasonal-engine/head/,
 * а не копию: скрипты вырезаются из html-файлов и исполняются
 * в минимальной заглушке браузера. Если компонент поменяли — тесты это увидят.
 *
 * «Сегодня» в тестах фиксировано через ?date=, чтобы результат не зависел
 * от дня запуска. Один блок проверок использует настоящее сегодня —
 * он помечен отдельно.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HEAD = path.join(ROOT, 'seasonal-engine', 'head');

/** Вырезает первый <script> из html-компонента (кроме application/json). */
function scriptOf(file) {
  const html = fs.readFileSync(path.join(HEAD, file), 'utf8');
  const m = /<script(?![^>]*application\/json)[^>]*>([\s\S]*?)<\/script>/.exec(html);
  if (!m) throw new Error(`в ${file} не найден <script>`);
  return m[1];
}

/** Минимальная заглушка браузера: ровно то, чего касаются компоненты. */
function browser(search, hostname = 'ecobr.ru') {
  const documentElement = {
    attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k]; },
    style: { setProperty() {} }
  };
  const stylesheets = [];
  const document = {
    documentElement,
    head: { appendChild(node) { stylesheets.push(node.__css ?? ''); } },
    createElement(tag) {
      if (tag === 'style') {
        return { __css: '', setAttribute() {}, appendChild(n) { this.__css = n.data; } };
      }
      return { setAttribute() {}, appendChild() {}, addEventListener() {}, style: { setProperty() {} } };
    },
    createTextNode(data) { return { data }; },
    addEventListener() {},
    querySelector() { return null; },
    readyState: 'complete'
  };
  const g = {
    document,
    location: { search, hostname, pathname: '/' },
    sessionStorage: { s: {}, getItem(k) { return this.s[k] ?? null; }, setItem(k, v) { this.s[k] = v; } },
    localStorage:   { s: {}, getItem(k) { return this.s[k] ?? null; }, setItem(k, v) { this.s[k] = v; } },
    navigator: {},
    console,
    setTimeout,
    setInterval: () => 0
  };
  g.window = g;
  g.stylesheets = stylesheets;
  return g;
}

/** Загружает компоненты 1-3 в общий контекст и отдаёт его. */
function boot(search = '', hostname = 'ecobr.ru') {
  const g = browser(search, hostname);
  vm.createContext(g);
  for (const f of ['1-tema-sezona.html', '2-raspisanie-blokov.html', '3-bnovo-deeplink.html']) {
    vm.runInContext(scriptOf(f), g);
  }
  return g;
}

/* --------------------------------------------------------------------- */

let passed = 0, failed = 0;
const eq = (name, actual, expected) => {
  const ok = String(actual) === String(expected);
  ok ? passed++ : failed++;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}  ->  ${actual}${ok ? '' : `   (ждали ${expected})`}`);
};
const group = (n) => console.log(`\n${n}`);

/* Опорная дата для всех тестов, кроме отдельно оговорённых: вторник 1 сентября 2026 */
const DAY = '?date=2026-09-01';

group('Определение сезона по календарю');
eq('01.09 -> autumn',            boot('?date=2026-09-01').BB.season, 'autumn');
eq('14.11 -> autumn (граница)',  boot('?date=2026-11-14').BB.season, 'autumn');
eq('15.11 -> newyear (граница)', boot('?date=2026-11-15').BB.season, 'newyear');
eq('25.12 -> newyear',           boot('?date=2026-12-25').BB.season, 'newyear');
eq('05.01 -> newyear (через год)', boot('?date=2027-01-05').BB.season, 'newyear');
eq('01.02 -> winter',            boot('?date=2027-02-01').BB.season, 'winter');
eq('01.06 -> summer',            boot('?date=2027-06-01').BB.season, 'summer');
eq('?season= перебивает дату',   boot('?date=2026-09-01&season=newyear').BB.season, 'newyear');
eq('сезон попал на <html>',      boot('?date=2026-12-25').document.documentElement.getAttribute('data-season'), 'newyear');

group('Машина времени');
eq('BB.today учитывает ?date',   boot('?date=2026-12-25').BB.today, 20261225);
eq('без ?date берётся сегодня',  /^\d{8}$/.test(String(boot('').BB.today)), 'true');

group('Разбор плавающих дат');
{
  const { BB } = boot(DAY);
  eq('абсолютная дата как есть', BB.resolveDate('2026-11-15'), '2026-11-15');
  eq('+7 от вторника 01.09',     BB.resolveDate('+7'),         '2026-09-08');
  eq('ближайшая пятница',        BB.resolveDate('fri'),        '2026-09-04');
  eq('fri+2 = воскресенье',      BB.resolveDate('fri+2'),      '2026-09-06');
  eq('tue = сегодня',            BB.resolveDate('tue'),        '2026-09-01');
  eq('thu от заезда 07.09 (пн)', BB.resolveDate('thu', '2026-09-07'), '2026-09-10');
  eq('mon от заезда 07.09 -> +7 ночей', BB.resolveDate('mon', '2026-09-07'), '2026-09-14');
  eq('+2 ночи от 04.09',         BB.resolveDate('+2', '2026-09-04'), '2026-09-06');
}

group('Сборка ссылок в модуль Bnovo');
{
  const { BB } = boot(DAY);
  eq('будни пн-чт с промокодом',
    BB.bookUrl({ from: 'mon', to: 'thu', adults: 2, promo: 'BUDNI20' }),
    'https://ecobr.ru/booking?dfrom=2026-09-07&dto=2026-09-10&adults=2&promoCode=BUDNI20&scroll_to_rooms=1');
  eq('выходные пт-вс',
    BB.bookUrl({ from: 'fri', to: 'sun', adults: 2 }),
    'https://ecobr.ru/booking?dfrom=2026-09-04&dto=2026-09-06&adults=2&scroll_to_rooms=1');
  eq('новогодние фиксированные даты',
    BB.bookUrl({ from: '2026-12-30', to: '2027-01-03', adults: 4, promo: 'NY2027' }),
    'https://ecobr.ru/booking?dfrom=2026-12-30&dto=2027-01-03&adults=4&promoCode=NY2027&scroll_to_rooms=1');
  eq('фильтр по домам',
    /onlyrooms=101%2C102/.test(BB.bookUrl({ from: 'fri', to: 'sun', rooms: '101,102' })), 'true');
  eq('выезд никогда не раньше заезда', (() => {
    for (const from of ['mon','tue','wed','thu','fri','sat','sun']) {
      for (const to of ['mon','tue','wed','thu','fri','sat','sun']) {
        const u = BB.bookUrl({ from, to });
        const [, f] = u.match(/dfrom=([\d-]+)/), [, t] = u.match(/dto=([\d-]+)/);
        if (!(t > f)) return `${from}->${to} дал ${f}..${t}`;
      }
    }
    return 'true';
  })(), 'true');
}

group('Определение базы и счётчиков');
eq('Роща по домену',   boot(DAY).BB.counter, 108978291);
eq('Поля по домену',   boot(DAY, 'barskie-polya.ru').BB.counter, 109033653);
eq('Поля: свой /booking',
  boot(DAY, 'barskie-polya.ru').BB.bookUrl({ from: 'fri', to: 'sun' }).startsWith('https://barskie-polya.ru/booking'), 'true');
eq('?site=bp перебивает домен', boot(DAY + '&site=bp').BB.site, 'bp');

group('UTM доезжают до модуля');
eq('источник и кампания',
  /utm_source=vk&utm_campaign=ny2027/.test(
    boot(DAY + '&utm_source=vk&utm_campaign=ny2027').BB.bookUrl({ from: '2026-12-30', to: '2027-01-03' })), 'true');

group('Каталог офферов: данные валидны');
{
  const html = fs.readFileSync(path.join(ROOT, 'seasonal-engine', 'blocks', '7-katalog-offerov.html'), 'utf8');
  const json = /<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/.exec(html)[1];
  let offers = [];
  try { offers = JSON.parse(json); } catch (e) { /* поймает проверка ниже */ }
  eq('JSON читается', offers.length > 0, 'true');
  eq('у всех офферов есть цена', offers.every(o => typeof o.price === 'number' && o.price > 0), 'true');
  eq('у всех есть срок действия', offers.every(o => o.sale && /^\d{4}-\d{2}-\d{2}$/.test(o.sale.to)), 'true');
  eq('у всех кнопка ведёт в бронь или на страницу', offers.every(o => (o.book && o.book.from) || o.more), 'true');
}

group('Синтаксис всех компонентов');
{
  let bad = [];
  for (const dir of ['head', 'blocks']) {
    for (const f of fs.readdirSync(path.join(ROOT, 'seasonal-engine', dir))) {
      const html = fs.readFileSync(path.join(ROOT, 'seasonal-engine', dir, f), 'utf8');
      const re = /<script(?![^>]*application\/json)[^>]*>([\s\S]*?)<\/script>/g;
      let m;
      while ((m = re.exec(html))) {
        try { new Function(m[1]); } catch (e) { bad.push(`${dir}/${f}: ${e.message}`); }
      }
    }
  }
  eq('все скрипты парсятся', bad.length ? bad.join(' | ') : 'true', 'true');
}

console.log(`\n${failed ? `ПРОВАЛЕНО: ${failed}, пройдено: ${passed}` : `Все ${passed} проверок пройдены.`}`);
process.exit(failed ? 1 : 0);
