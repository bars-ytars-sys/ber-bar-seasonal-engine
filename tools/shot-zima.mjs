import { chromium } from 'playwright-core';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const файл = pathToFileURL(path.resolve('zima.html')).href;
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
await p.goto(файл, { waitUntil: 'networkidle' });
// прокрутить так, чтобы навигация прилипла и показался блок отсчёта
await p.evaluate(() => {
  const нав = document.querySelector('.навигация');
  const y = нав.getBoundingClientRect().top + window.scrollY - 0;
  window.scrollTo(0, y + 4);
});
await p.waitForTimeout(600);
await p.screenshot({ path: 'tools/out/zima-otschet.png' });
await b.close();
console.log('снято tools/out/zima-otschet.png');
