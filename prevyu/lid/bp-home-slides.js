/* Слайдер первого экрана: смена кадров раз в 6 с, пауза при наведении и в фоновой вкладке,
   без автосмены при «уменьшить движение». Кадры, кроме первого, грузятся после загрузки страницы. */
(() => {
  'use strict';
  function init() {
    const box = document.querySelector('#bp-production-hero .bp-calm');
    const slides = box ? [...box.querySelectorAll('[data-calm-slide]')] : [];
    if (slides.length < 2) return;
    const caps = [...box.querySelectorAll('[data-calm-caption]')];
    const dots = [...box.querySelectorAll('[data-calm-dot]')];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cur = 0, timer = 0, paused = false, loaded = false;
    const load = s => {
      s.querySelectorAll('[data-srcset]').forEach(x => { x.srcset = x.dataset.srcset; x.removeAttribute('data-srcset'); });
      const img = s.querySelector('img');
      if (img && img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
      return img;
    };
    const show = i => {
      cur = (i + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === cur); s.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
      caps.forEach((c, k) => c.classList.toggle('is-active', k === cur));
      dots.forEach((d, k) => { d.classList.toggle('is-active', k === cur); d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    };
    const go = i => {
      const n = (i + slides.length) % slides.length;
      const img = load(slides[n]);
      if (img && !img.complete) img.addEventListener('load', () => show(n), {once: true}); else show(n);
    };
    const start = () => {
      if (reduce) return;
      clearInterval(timer);
      timer = setInterval(() => { if (!paused && !document.hidden) go(cur + 1); }, 6000);
    };
    const preload = () => { if (loaded) return; loaded = true; slides.slice(1).forEach(load); start(); };
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));
    box.addEventListener('mouseenter', () => { paused = true; });
    box.addEventListener('mouseleave', () => { paused = false; });
    if (document.readyState === 'complete') preload(); else addEventListener('load', preload, {once: true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true}); else init();
})();
