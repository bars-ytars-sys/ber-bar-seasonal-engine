/* БР, первый экран: «Панорама» → SPA каждые 7 с. Без наложения кадров: текущий гаснет, затем появляется следующий.
   Пауза при наведении и в фоновой вкладке; при «уменьшить движение» сами не листаются. */
(() => {
  'use strict';
  function init() {
    const box = document.querySelector('[data-brx]');
    if (!box) return;
    const slides = [...box.querySelectorAll('.brx__slide')];
    if (slides.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cur = 0, timer = 0, paused = false;
    const load = s => {
      s.querySelectorAll('source[data-srcset]').forEach(x => { x.srcset = x.dataset.srcset; x.removeAttribute('data-srcset'); });
      const img = s.querySelector('img[data-src]'); if (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
    };
    function next() {
      const from = slides[cur], to = slides[(cur + 1) % slides.length];
      load(to);
      from.classList.remove('is-on');
      setTimeout(() => { to.classList.add('is-on'); cur = slides.indexOf(to); arm(); }, 560);
    }
    function arm() { clearTimeout(timer); if (!paused && !document.hidden) timer = setTimeout(next, 7000); }
    box.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { paused = true; clearTimeout(timer); } });
    box.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { paused = false; arm(); } });
    document.addEventListener('visibilitychange', arm);
    addEventListener('load', () => slides.slice(1).forEach(load), {once: true});
    arm();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true}); else init();
})();
