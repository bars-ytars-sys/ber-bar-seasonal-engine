/* Барские поля, главная, демо 14.11.2026.
   1) Окно «Чёрной пятницы» открывается не поверх первого экрана, а после того,
      как гость прокрутил первый экран (раньше — через 4,5 с после входа).
   2) Пока виден первый экран, на body стоит класс bp-hero-in-view (как раньше
      делал скрипт видео) — плавающие плашки в это время скрыты. Плашка акции
      скрыта и пока на экране сама карточка акции (bp-bf-card-in-view).
   3) После окончания акции карточка скрывается целиком, а не показывает
      «Акция завершена» с кнопкой. Срок берётся из data-end таймера, не меняется. */
(() => {
  'use strict';
  const heroSelector = '#bp-production-hero';

  window.bpCalmAutoShow = function (run) {
    const start = () => {
      const hero = document.querySelector(heroSelector);
      if (!hero || !('IntersectionObserver' in window)) { setTimeout(run, 4500); return; }
      let done = false;
      const io = new IntersectionObserver(entries => {
        if (done || entries[0].isIntersecting) return;
        done = true; io.disconnect(); setTimeout(run, 1200);
      });
      io.observe(hero);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
    else start();
  };

  function ready() {
    const hero = document.querySelector(heroSelector);
    const root = document.documentElement;
    function sync() {
      const header = document.querySelector('#rec1185050691 .t396__artboard');
      const nav = document.querySelector('.t975');
      const bottom = nav && getComputedStyle(nav).display !== 'none' ? nav.getBoundingClientRect().height : 0;
      root.style.setProperty('--bp-header-height', (header?.getBoundingClientRect().height || 76) + 'px');
      root.style.setProperty('--bp-bottom-height', bottom + 'px');
      if (hero) root.style.setProperty('--bp-calm-top', Math.max(0, Math.round(hero.getBoundingClientRect().top + scrollY)) + 'px');
    }
    // Высота экрана — в CSS через 100svh (не меняется при скрытии адресной строки Safari).
    // Здесь только отступ сверху; пересчёт при повороте экрана, а не при каждом изменении окна.
    let lastW = innerWidth;
    addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; sync(); } });
    addEventListener('load', sync); sync();
    // Тильда добавляет отступ под шапку и строку «Новый год» позже — пересчитываем при любом сдвиге.
    [300, 1000, 2500].forEach(t => setTimeout(sync, t));

    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        document.body.classList.toggle('bp-hero-in-view', entries[0].isIntersecting);
      }, {rootMargin: '-120px 0px 0px 0px'}).observe(hero);
    }

    const card = document.getElementById('bo-black-friday');
    if (card && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        document.body.classList.toggle('bp-bf-card-in-view', entries[0].isIntersecting);
      }).observe(card);
    }
    const end = Date.parse(card?.querySelector('[data-bf-countdown]')?.dataset.end || '');
    if (card && Number.isFinite(end)) {
      const expire = () => { if (Date.now() >= end) card.hidden = true; };
      expire();
      const left = end - Date.now();
      if (left > 0 && left < 2147483647) setTimeout(expire, left + 500);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once: true});
  else ready();
})();

/* iPhone: новогоднюю строку под шапкой переносим внутрь фиксированной шапки, чтобы Safari рисовал их одним слоем. */
(() => {
  'use strict';
  function move() {
    const row = document.querySelector('#t-header .demo-ny-mobile');
    const bar = document.querySelector('#rec1185050691 .t396__artboard');
    if (!row || !bar) return false;
    if (row.parentNode !== bar) bar.appendChild(row);
    Object.assign(row.style, {position: 'absolute', top: '100%', left: '0', right: '0', zIndex: '5'});
    return true;
  }
  let tries = 0;
  (function wait() { if (!move() && tries++ < 60) setTimeout(wait, 100); })();
  addEventListener('load', move);
})();
