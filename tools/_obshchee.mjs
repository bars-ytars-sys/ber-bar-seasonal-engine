/**
 * Общее для инструментов проверки: запуск браузера, профиль телефона,
 * замедление «как у PageSpeed», карта сайта, папка для результатов.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ПАПКА_ИНСТРУМЕНТОВ = path.dirname(fileURLToPath(import.meta.url));
export const КОРЕНЬ = path.resolve(ПАПКА_ИНСТРУМЕНТОВ, '..');

/* Браузер. По умолчанию — установленный Chrome. Если его нет (облачная
   песочница), укажите путь к любому Chromium в переменной PW_EXECUTABLE. */
export function браузер() {
  const путь = process.env.PW_EXECUTABLE;
  return chromium.launch(путь ? { executablePath: путь } : { channel: 'chrome' });
}

/* Профиль, в котором меряет мобильный PageSpeed. */
export const ТЕЛЕФОН = {
  viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75,
  isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 ' +
             '(KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'
};
export const КОМПЬЮТЕР = { viewport: { width: 1440, height: 900 } };

/* Медленный 4G и процессор ×4 — те же условия, что у Lighthouse. */
export async function замедлить(cdp) {
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150,
    downloadThroughput: 1.6 * 1024 * 1024 / 8,
    uploadThroughput: 750 * 1024 / 8
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}

export async function картаСайта(домен) {
  const о = await fetch('https://' + домен + '/sitemap.xml');
  const t = await о.text();
  return [...t.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

/* Результаты складываются в tools/out — папка в git не идёт. */
export function выход(имя) {
  const папка = path.join(ПАПКА_ИНСТРУМЕНТОВ, 'out');
  fs.mkdirSync(папка, { recursive: true });
  return path.join(папка, имя);
}

export const пауза = мс => new Promise(r => setTimeout(r, мс));

/* Флаги вида --имя или --имя=значение; остальное — позиционные аргументы. */
export function аргументы(argv = process.argv.slice(2)) {
  const флаги = {}, позиции = [];
  for (const a of argv) {
    const м = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (м) флаги[м[1]] = м[2] === undefined ? true : м[2];
    else позиции.push(a);
  }
  return { флаги, позиции };
}

/* Домен из «ecobr.ru», «https://ecobr.ru/» или «https://ecobr.ru/doma». */
export const домен = s => (s || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');

/* Пролистать страницу до низа и вернуться — чтобы сработала ленивая загрузка. */
export async function пролистать(p, шаг = 0.7, задержка = 220) {
  await p.evaluate(async ([шаг, задержка]) => {
    const h = innerHeight * шаг;
    for (let y = 0; y < document.body.scrollHeight; y += h) {
      scrollTo(0, y);
      await new Promise(r => setTimeout(r, задержка));
    }
    scrollTo(0, 0);
  }, [шаг, задержка]);
}
