(function () {
  'use strict';
  const catalog = document.querySelector('.bph-catalog');
  const header = document.querySelector('#rec1185050691 .t396__artboard');
  if (!catalog || !header) return;

  let frame = 0;
  function measure() {
    frame = 0;
    const headerBox = header.getBoundingClientRect();
    const catalogTop = catalog.getBoundingClientRect().top + window.scrollY;
    const overlap = Math.max(0, Math.ceil(headerBox.bottom - catalogTop));
    const value = overlap + 'px';
    if (catalog.style.getPropertyValue('--bph-header-overlap') !== value) {
      catalog.style.setProperty('--bph-header-overlap', value);
    }
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(measure);
  }

  measure();
  if ('ResizeObserver' in window) {
    new ResizeObserver(schedule).observe(header);
  }
  // Tilda reserves space on phones after initializing its fixed header.
  new MutationObserver(schedule).observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule, { once: true });
  window.addEventListener('pageshow', schedule);
  if (document.fonts) document.fonts.ready.then(schedule);
})();
