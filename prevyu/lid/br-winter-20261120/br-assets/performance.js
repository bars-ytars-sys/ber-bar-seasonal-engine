(() => {
  function init() {
    const callbacks = new Map();
    const observer = 'IntersectionObserver' in window && new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const load = callbacks.get(entry.target);
        callbacks.delete(entry.target);
        load?.();
      }
    }, {rootMargin: '240px'});

    function loadNear(element, load) {
      if (!observer) {
        load();
        return;
      }
      callbacks.set(element, load);
      observer.observe(element);
    }

    for (const image of document.querySelectorAll('img[data-br-image-src]')) {
      loadNear(image, () => {
        if (image.src.startsWith('data:')) image.src = image.dataset.brImageSrc;
        delete image.dataset.brImageSrc;
      });
    }

    for (const image of document.querySelectorAll('img[data-br-cover-fallback]')) {
      const primary = image.src;
      const useFallback = () => {
        if (image.src === primary) image.src = image.dataset.brCoverFallback;
      };
      image.addEventListener('error', useFallback);
      if (image.complete && !image.naturalWidth) useFallback();
    }

    for (const frame of document.querySelectorAll('iframe[data-br-map-src]')) {
      loadNear(frame, () => { frame.src = frame.dataset.brMapSrc; });
    }

    const panel = document.querySelector('#br-home-booking .brh-booking__panel');
    if (!panel || !document.querySelector('[data-br-load-booking]')) return;

    let started = false;
    function loadBooking() {
      if (started) return;
      started = true;
      if (observer) observer.unobserve(panel);
      callbacks.delete(panel);
      document.removeEventListener('click', startFromLink);
      window.removeEventListener('hashchange', startFromHash);
      panel.dispatchEvent(new Event('br:booking-loading'));
      const provider = document.createElement('script');
      provider.src = 'https://widget.reservationsteps.ru/js/bnovo.js';
      provider.addEventListener('load', () => {
        if (window.Bnovo_Widget) document.dispatchEvent(new Event('br:booking-ready'));
        else panel.dataset.widgetState = 'failed';
      }, {once: true});
      provider.addEventListener('error', () => { panel.dataset.widgetState = 'failed'; }, {once: true});
      document.head.append(provider);
    }

    function startFromLink(event) {
      const clicked = event.target.closest?.('a[href="#br-home-booking"]');
      if (clicked) loadBooking();
    }
    function startFromHash() {
      if (window.location.hash === '#br-home-booking') loadBooking();
    }

    document.addEventListener('click', startFromLink);
    window.addEventListener('hashchange', startFromHash);
    startFromHash();
    loadNear(panel, loadBooking);
  }

  document.addEventListener('DOMContentLoaded', init, {once: true});
})();
