import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const { chromium, webkit, devices } = await import(process.env.BR_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.BR_DEMO_ORIGIN || 'http://127.0.0.1:8154';
const output = new URL('./qa/', import.meta.url);
const reports = [];
await fs.mkdir(output, { recursive: true });
await Promise.all([390, 1440].map(async width => {
  const mobile = width === 390;
  const browser = mobile ? await webkit.launch() : await chromium.launch({
    executablePath: process.env.BR_CHROMIUM_EXECUTABLE,
  });
  const page = await browser.newPage({
    ...(mobile ? devices['iPhone 13'] : {}),
    viewport: { width, height: mobile ? 844 : 1000 },
    deviceScaleFactor: 1,
  });
  page.setDefaultTimeout(12000);
  const report = { width, checks: [], errors: [] };
  reports.push(report);
  page.on('pageerror', error => report.errors.push(error.message));
  await page.route('**/*', async route => {
    const request = route.request();
    if (!['GET','HEAD'].includes(request.method()) || /mc\.yandex|google-analytics|googletagmanager|stat\.tildaapi/.test(request.url())) {
      return route.abort();
    }
    return route.continue();
  });
  async function shot(name, locator) {
    // Crop the section without floating UI from unrelated parts of the page.
    await locator.evaluate(target => {
      for (const element of document.body.querySelectorAll('*')) {
        if (!target.contains(element) && !element.contains(target) && ['fixed', 'sticky'].includes(getComputedStyle(element).position)) {
          element.setAttribute('data-br-qa-fixed', '');
        }
      }
    });
    try {
      await locator.screenshot({
        path: new URL(`${name}-${width}.png`, output).pathname, timeout: 15000,
        style: '[data-br-qa-fixed], [data-br-qa-fixed] * { visibility: hidden !important; }',
      });
    } finally {
      await page.locator('[data-br-qa-fixed]').evaluateAll(nodes => nodes.forEach(node => node.removeAttribute('data-br-qa-fixed')));
    }
  }
  const load = async path => {
    const response = await page.goto(base + path, { waitUntil: 'domcontentloaded', timeout: 35000 });
    assert.ok(response === null || response.ok(), path);
  };
  async function check(label, fn) {
    try { await fn(); report.checks.push({ label, passed: true }); }
    catch (error) { report.checks.push({ label, passed: false, error: error.message }); }
    console.log(width, report.checks.at(-1));
  }
  try {
    await load('/');
    await check('Главная и порядок блоков', async () => {
      assert.deepEqual(await page.locator('#br-home-houses,#programmy-otdyha,#prazdniki,#br-home-offers').evaluateAll(nodes => nodes.map(n => n.id)),
        ['br-home-houses','programmy-otdyha','prazdniki','br-home-offers']);
      assert.equal(await page.locator('#programmy-otdyha article').count(), 3);
      assert.equal(await page.locator('#prazdniki article').count(), 3);
      await shot('programs', page.locator('#programmy-otdyha'));
      await shot('events', page.locator('#prazdniki'));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    });
    await check('Нативное меню, 7 разделов и вложенные ссылки', async () => {
      const trigger = page.locator('a[href="#menu"]:has(img),a[href="#menum"]:has(img)').filter({ visible: true }).first();
      await trigger.click({ timeout: 10000 });
      const menu = page.locator('.t-popup_show .br-nov-menu').filter({ visible: true }).first();
      await menu.waitFor({ timeout: 10000 });
      assert.equal(await menu.locator(':scope > *').count(), 7);
      await menu.getByText('Сценарии отдыха', { exact: true }).click();
      await menu.getByRole('link', { name: 'Банный отдых с самоваром' }).waitFor();
      await shot('menu', menu);
      await menu.getByRole('link', { name: 'Банный отдых с самоваром' }).click();
      await page.waitForURL('**/vip-programmy#samovar', { waitUntil: 'domcontentloaded' });
      await page.locator('#samovar').waitFor();
    });
    await check('Кнопка «Подробнее» ведёт на программу', async () => {
      await load('/');
      await page.locator('#programmy-otdyha a[href="/vip-programmy/svidanie"]').click();
      await page.waitForURL('**/vip-programmy/svidanie', { waitUntil: 'domcontentloaded' });
    });
    await check('Праздники: родная карточка и переход к детскому блоку', async () => {
      await load('/');
      await page.waitForFunction(() => typeof window.t750_init === 'function');
      const birthdayLink = page.locator('#prazdniki a[href="#popup:dr"]');
      const birthday = page.locator('[data-tooltip-hook="#popup:dr"].t-popup_show');
      await birthdayLink.click();
      try { await birthday.waitFor({ timeout: 1800 }); }
      catch { await birthdayLink.click(); await birthday.waitFor(); }
      await birthday.locator('.t-popup__close button').click();
      await birthday.waitFor({ state: 'hidden' });
      await page.locator('#prazdniki a[href="/deti#detskiy-prazdnik"]').click();
      await page.waitForURL('**/deti#detskiy-prazdnik', { waitUntil: 'domcontentloaded' });
    });
    await check('Самовар и цены', async () => {
      await load('/vip-programmy#samovar');
      assert.match(await page.locator('#samovar').innerText(), /8 000 ₽.*12 000 ₽/);
      assert.equal(await page.locator('#samovar article').count(), 2);
      await shot('samovar', page.locator('#samovar'));
    });
    await check('Детский блок, обе фотографии, CTA', async () => {
      await load('/deti#detskiy-prazdnik');
      const kids = page.locator('#detskiy-prazdnik');
      await kids.scrollIntoViewIfNeeded();
      for (const image of await kids.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(img => img.decode());
        assert.ok(await image.evaluate(img => img.naturalWidth > 1000));
      }
      assert.equal(await kids.getByRole('link', { name: 'Обсудить детский праздник' }).getAttribute('href'), 'https://t.me/ecobazabr');
      await shot('kids', kids);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
    });
    await check('Переключение SPA → бани → SPA', async () => {
      await load('/spa');
      await page.locator('.br-nov-tabs a[href="/banchan"]').click();
      await page.waitForURL('**/banchan', { waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('.br-nov-tabs [aria-current]').innerText(), 'Бани и банные чаны');
      await page.locator('.br-nov-tabs a[href="/spa"]').click();
      await page.waitForURL('**/spa', { waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('.br-nov-tabs [aria-current]').innerText(), 'SPA');
    });
    await check('Квадроциклы и подраздел «С детьми»', async () => {
      await load('/aktivnosti-v-beryozovoj-roshhe');
      assert.match(await page.locator('#rec2863877901').innerText(), /Квадроциклы/i);
      assert.match(await page.locator('#popuptitle_1763992611').textContent(), /КВАДРОЦИКЛЫ/);
      const popup = page.locator('[data-tooltip-hook="#baggi"].t-popup_show');
      await page.waitForFunction(() => typeof window.t1281_init === 'function' && typeof window.t750_init === 'function');
      const activeTab = page.getByRole('tab', { name: 'Активный отдых' });
      if (await activeTab.isVisible()) {
        await activeTab.click();
        try { await page.locator('#rec2863877901[aria-hidden="false"]').waitFor({ timeout: 1800 }); }
        catch { await activeTab.click(); }
      } else {
        await page.locator('.t1281__select').selectOption('2863877901');
      }
      await page.locator('#rec2863877901[aria-hidden="false"]').waitFor();
      await page.locator('#rec2863877901 a[href="#baggi"]').filter({ visible: true }).first().click();
      await popup.waitFor({ timeout: 10000 });
      assert.match(await popup.innerText(), /стоимость и условия/);
      await shot('quad', popup.locator('.t-popup__container'));
      await load('/aktivnosti-v-beryozovoj-roshhe#s-detmi');
      assert.equal(await page.locator('#s-detmi a[href="/deti"]').count(), 1);
    });
  } finally {
    await browser.close();
  }
}));
await fs.writeFile(new URL('checks.json', output), JSON.stringify(reports, null, 2));
if (reports.some(report => report.checks.some(check => !check.passed))) process.exitCode = 1;
