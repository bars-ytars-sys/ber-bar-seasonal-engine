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
      root.style.setProperty('--bp-screen', innerHeight + 'px');
      root.style.setProperty('--bp-header-height', (header?.getBoundingClientRect().height || 76) + 'px');
      root.style.setProperty('--bp-bottom-height', bottom + 'px');
      if (hero) root.style.setProperty('--bp-calm-top', Math.max(0, Math.round(hero.getBoundingClientRect().top + scrollY)) + 'px');
    }
    addEventListener('resize', sync); addEventListener('load', sync); sync();

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
