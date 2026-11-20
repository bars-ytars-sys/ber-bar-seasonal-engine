for (const gallery of document.querySelectorAll('[data-br-family-gallery]')) {
  const rail = gallery.querySelector('.br-family-birthday__photos');
  const slides = [...rail.children];
  const previous = gallery.querySelector('[data-br-photo-prev]');
  const next = gallery.querySelector('[data-br-photo-next]');
  const counter = gallery.querySelector('[data-br-photo-count]');
  let index = 0;
  function update() {
    if (!rail.clientWidth) return;
    index = Math.max(0, Math.min(slides.length - 1, Math.round(rail.scrollLeft / rail.clientWidth)));
    counter.textContent = `${index + 1} / ${slides.length}`;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  }
  function show(target) {
    rail.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, target)) * rail.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  rail.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  rail.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(rail);
  update();
}
