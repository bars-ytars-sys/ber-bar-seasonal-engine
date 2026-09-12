/**
 * Какую разметку schema.org отдаёт страница — в сыром HTML и после
 * выполнения скриптов.
 *
 *   node tools/razmetka.mjs https://barskie-polya.ru/gardens https://ecobr.ru/doma
 *
 * Разница важна. Валидатор Яндекса (webmaster.yandex.ru/tools/microtest)
 * JavaScript НЕ исполняет и видит только сырой HTML. Карточка организации
 * стоит у нас статикой — её он видит. Хлебные крошки собираются скриптом
 * (они разные на каждой странице, а HEAD общий), поэтому в валидаторе
 * их нет — это ожидаемо, а не поломка.
 */
import { браузер, КОМПЬЮТЕР, аргументы, пауза } from './_obshchee.mjs';

const { позиции } = аргументы();
if (!позиции.length) { console.error('нужно: node tools/razmetka.mjs <адрес> [адрес…]'); process.exit(1); }

const разобрать = текст => [...текст.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(м => { try { return JSON.parse(м[1]); } catch { return { '@type': 'БИТЫЙ JSON' }; } });

const описать = j => {
  const т = j['@type'];
  if (т === 'BreadcrumbList') return 'крошки: ' + (j.itemListElement || []).map(x => x.name).join(' → ');
  if (т === 'FAQPage') return 'вопросы-ответы: ' + (j.mainEntity || []).length;
  const поля = ['name', 'telephone', 'priceRange'].filter(k => j[k]).map(k => j[k]);
  return т + (поля.length ? ' — ' + поля.join(', ') : '');
};

const b = await браузер();
const p = await (await b.newContext(КОМПЬЮТЕР)).newPage();
for (const u of позиции) {
  const сырой = разобрать(await (await fetch(u)).text());
  await p.goto(u, { waitUntil: 'commit', timeout: 180000 });
  await пауза(18000);
  const живой = await p.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map(s => { try { return JSON.parse(s.textContent); } catch { return { '@type': 'БИТЫЙ JSON' }; } }));
  console.log('\n' + u);
  console.log('  в сыром HTML — это видит валидатор Яндекса: ' + сырой.length);
  сырой.forEach(j => console.log('     ' + описать(j)));
  console.log('  после скриптов — это видит браузер и робот Google: ' + живой.length);
  живой.forEach(j => console.log('     ' + описать(j)));
}
await b.close();
