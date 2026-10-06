// Проверка страницы в условиях, когда адреса публикации действительно отдаются:
// запросы к bars-ytars-sys.github.io подменяются файлами из папки проекта (как будет на Pages).
// Запуск: node local-redesign/tools-video/proverka-s-podmenoy.mjs
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = 'C:/Users/ASON/Desktop/Ber&Bar';
const proof = path.join(root, 'local-redesign/proof/bp-strip');
const URL = 'http://127.0.0.1:4192/ber-bar-seasonal-engine/prevyu/lid/bp-glavnaya.html';
const HOST = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/';
const types = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };

const browser = await chromium.launch({ channel: 'chrome' });
const report = { url: URL, note: 'запросы к GitHub Pages подменены файлами проекта', viewports: {} };

for (const [name, vw, vh] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
  await ctx.route(HOST + '**', (route) => {
    const rel = decodeURIComponent(route.request().url().slice(HOST.length).split('?')[0]);
    const file = path.join(root, rel);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      route.fulfill({ status: 200, body: fs.readFileSync(file), headers: { 'content-type': types[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'access-control-allow-origin': '*' } });
    } else {
      route.fulfill({ status: 404, body: 'нет файла ' + rel });
    }
  });
  const page = await ctx.newPage();
  const bad = [];
  page.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().slice(-70)); });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 120)));
  await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(7000);

  const state = await page.evaluate(() => {
    const v = document.querySelector('video[data-bb-video]');
    const hero = document.getElementById('rec1538220631');
    const sub = hero.querySelector('.tn-elem[data-elem-id="1752661976580"] .tn-atom');
    const imgs = [...document.querySelectorAll('#bb-poloska img')];
    const scrim = getComputedStyle(document.querySelector('.bb-hero-scrim'));
    return {
      video: {
        currentSrc: v.currentSrc, paused: v.paused, duration: Math.round((v.duration || 0) * 100) / 100,
        vw: v.videoWidth, vh: v.videoHeight, loop: v.loop, muted: v.muted, playing: v.getAttribute('data-bb-playing') === '1',
        poster: v.getAttribute('poster'), staticMode: v.closest('.bb-hero-media')?.getAttribute('data-bb-static') ?? null,
        box: (() => { const r = v.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
        objectFit: getComputedStyle(v).objectFit, objectPosition: getComputedStyle(v).objectPosition,
      },
      scrim: scrim.backgroundImage.slice(0, 120),
      subtitle: { size: getComputedStyle(sub).fontSize, lineHeight: getComputedStyle(sub).lineHeight, color: getComputedStyle(sub).color, shadow: getComputedStyle(sub).textShadow.slice(0, 60) },
      stripPhotos: { total: imgs.length, loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length, first: imgs[0]?.currentSrc.slice(-40) },
      loopSeam: null,
    };
  });

  // Петля: следим за временем воспроизведения и проверяем, что после конца идёт начало
  if (name === 'desktop') {
    const seam = await page.evaluate(async () => {
      const v = document.querySelector('video[data-bb-video]');
      const t = [];
      for (let i = 0; i < 60; i++) { t.push(v.currentTime); await new Promise((r) => setTimeout(r, 200)); }
      return { first: t[0], last: t[t.length - 1], max: Math.max(...t), advanced: t[t.length - 1] !== t[0], duration: v.duration };
    });
    state.loopSeam = seam;
  }

  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(proof, `gotovo-${name}.png`) });
  const heroEl = await page.$('#rec1538220631');
  await heroEl.screenshot({ path: path.join(proof, `gotovo-geroy-${name}.png`) });
  await page.evaluate(() => document.getElementById('bb-poloska').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1200);
  state.stripAfterScroll = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('#bb-poloska img')];
    return { total: imgs.length, loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length, firstSize: imgs[0]?.naturalWidth + 'x' + imgs[0]?.naturalHeight };
  });
  const stripEl = await page.$('#bb-poloska');
  await stripEl.screenshot({ path: path.join(proof, `gotovo-poloska-${name}.png`) });

  report.viewports[name] = { ...state, badRequests: bad, errors };
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(proof, 'proverka-podmena.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 1));
