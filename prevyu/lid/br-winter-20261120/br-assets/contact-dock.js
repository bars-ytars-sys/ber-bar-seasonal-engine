(() => {
  function connect() {
    const write = document.querySelector('.панель-моб a[href="https://t.me/ecobazabr"]');
    const chat = document.getElementById('rec1841867761');
    const toggle = chat?.querySelector('.t898__btn_input');
    if (!write || !toggle || write.hasAttribute('aria-controls')) return;

    const tablet = window.matchMedia('(min-width: 640px) and (max-width: 959px)');
    function sync() {
      if (tablet.matches) write.setAttribute('aria-expanded', String(toggle.checked));
    }

    function configure() {
      document.body.classList.toggle('br-contact-dock', tablet.matches);
      if (tablet.matches) {
        write.setAttribute('aria-controls', chat.id);
        sync();
      } else {
        write.removeAttribute('aria-controls');
        write.removeAttribute('aria-expanded');
      }
    }

    write.addEventListener('click', event => {
      if (!tablet.matches) return;
      event.preventDefault();
      toggle.click();
    });
    toggle.addEventListener('change', sync);
    tablet.addEventListener('change', configure);
    configure();
  }

  if (document.querySelector('.панель-моб')) connect();
  else document.addEventListener('DOMContentLoaded', connect, { once: true });
})();
