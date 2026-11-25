for (const control of document.querySelectorAll('[data-br-season-switch]')) {
  const buttons = [...control.querySelectorAll('button[aria-controls]')];
  const panels = buttons.map(button => document.getElementById(button.getAttribute('aria-controls')));
  buttons.forEach((button, selected) => {
    button.addEventListener('click', () => {
      buttons.forEach((item, index) => {
        const active = index === selected;
        item.setAttribute('aria-pressed', String(active));
        panels[index].hidden = !active;
      });
      window.dispatchEvent(new Event('resize'));
      window.t_lazyload_update?.();
    });
  });
}

(() => {
  if (!window.HTMLDialogElement?.prototype.showModal) return;

  const mobile = window.matchMedia('(max-width: 640px)');
  const nativePhotos = '[data-br-season-panel] .t1148__img[data-img-zoom-url]';
  const archiveLink = '.br-season-archive > div > a[href]';
  const originalControls = new Map();
  let dialog, fullImage, opener;

  function updateControls() {
    if (mobile.matches) {
      for (const photo of document.querySelectorAll(nativePhotos)) {
        const attributes = {role: 'button', tabindex: '0', 'aria-label': photo.alt || 'Открыть фото дома'};
        originalControls.set(photo, Object.keys(attributes).map(name => [name, photo.getAttribute(name)]));
        for (const [name, value] of Object.entries(attributes)) photo.setAttribute(name, value);
      }
      return;
    }

    if (dialog?.open) dialog.close();
    for (const [photo, attributes] of originalControls) {
      for (const [name, value] of attributes) {
        if (value === null) photo.removeAttribute(name);
        else photo.setAttribute(name, value);
      }
    }
    originalControls.clear();
  }

  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.className = 'br-house-photo-dialog';
    dialog.setAttribute('aria-label', 'Полноразмерное фото дома');
    dialog.innerHTML = '<button type="button" aria-label="Закрыть фото" autofocus>×</button><img alt="">';
    fullImage = dialog.querySelector('img');
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      fullImage.removeAttribute('src');
      opener?.focus({preventScroll: true});
      opener = null;
    });
    document.body.append(dialog);
  }

  function showPhoto(photo, url, trigger) {
    if (!dialog) createDialog();
    opener = trigger;
    fullImage.alt = photo.alt;
    fullImage.src = url;
    if (!dialog.open) dialog.showModal();
  }

  window.addEventListener('click', event => {
    if (!mobile.matches || !(event.target instanceof Element) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest(archiveLink);
    const photo = link?.querySelector('img') || event.target.closest(nativePhotos);
    if (!photo) return;
    const url = link?.href || photo.dataset.imgZoomUrl;
    if (!url) return;
    event.preventDefault();
    event.stopPropagation();
    showPhoto(photo, url, link || photo);
  }, true);

  window.addEventListener('keydown', event => {
    if (mobile.matches && (event.key === 'Enter' || event.key === ' ') && event.target.matches?.(nativePhotos)) {
      event.preventDefault();
      event.target.click();
    }
  });

  mobile.addEventListener?.('change', updateControls);
  updateControls();
})();
