/**
 * Ставит картинку превью (og:image, вкладка «Соцсети») страницам Тильды.
 * Chrome с входом в Тильду — порт 9333.
 *   node tools/tilda-og-img.mjs <pageid>=<файл.jpg> [<pageid>=<файл> …]
 * Файл подсовывается в скрытый input[type=file] загрузчика рядом с fb_imgfile;
 * после загрузки поле fb_imgfile получает адрес на tildacdn.
 */
import { chromium } from 'playwright-core';
import path from 'node:path';
const ждать = мс => new Promise(r => setTimeout(r, мс));
const b = await chromium.connectOverCDP('http://127.0.0.1:9333', { timeout: 30000 });
const ctx = b.contexts()[0];
for (const пара of process.argv.slice(2)) {
  const [pageid, файл] = пара.split('=');
  const p = await ctx.newPage(); await p.setViewportSize({ width: 1400, height: 900 });
  const редактор = 'https://tilda.ru/page/?pageid=' + pageid;
  const открыть = async () => {
    await p.goto(редактор, { waitUntil: 'domcontentloaded', timeout: 60000 }); await ждать(6000);
    await p.evaluate(() => [...document.querySelectorAll('button.tp-menu__burger__item')].find(e => /Настройки страницы/.test(e.textContent)).click());
    await p.waitForSelector('input[name="fb_imgfile"]', { state: 'attached', timeout: 20000 }); await ждать(1500);
  };
  try {
    await открыть();
    const было = await p.$eval('input[name="fb_imgfile"]', e => e.value);
    const вход = p.locator('input[name="fb_imgfile"] ~ input[type="file"]').first();
    await вход.setInputFiles(path.resolve(файл));
    let адрес = '';
    for (let i = 0; i < 40 && !адрес; i++) { await ждать(1000); адрес = await p.$eval('input[name="fb_imgfile"]', e => e.value); }
    if (!адрес) { console.log(pageid, 'ЗАГРУЗКА НЕ ПРОШЛА'); continue; }
    await p.evaluate(() => document.querySelector('.js-ps-popup-submit').click()); await ждать(5000);
    /* Сохранённая картинка живёт в скрытом fb_img; поле загрузчика fb_imgfile
       при повторном открытии формы пустое — сверять по нему нельзя. */
    await открыть();
    const стало = await p.$eval('input[name="fb_img"]', e => e.value);
    if (стало !== адрес) { console.log(pageid, 'НЕ СОХРАНИЛОСЬ', стало); continue; }
    await p.goto(редактор, { waitUntil: 'domcontentloaded' }); await ждать(6000);
    const опубл = await p.evaluate(() => { const btn = document.querySelector('.tp-dropdown__item-icon_publish')?.closest('button'); if (btn) { btn.click(); return true; } return false; });
    await ждать(10000);
    console.log(pageid, 'картинка:', стало, опубл ? '+ опубликовано' : 'КНОПКА ПУБЛИКАЦИИ НЕ НАЙДЕНА', '| было:', было || 'пусто');
  } catch (e) { console.log(pageid, 'ОШИБКА', e.message.split('\n')[0]); }
  finally { await p.close(); }
}
process.exit(0);
