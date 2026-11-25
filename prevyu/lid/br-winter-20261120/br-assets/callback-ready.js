(() => {
  const hash = '#zayavka';
  const linkSelector = 'a[href="#zayavka"]';
  const popupSelector = '.t-popup[data-tooltip-hook="#zayavka"]';
  const menuCopy = '.br-menu-contact__callback';
  let pending;

  function openWhenReady(link) {
    if (!link || pending) return;
    const open = () => {
      const popup = document.querySelector(popupSelector);
      if (popup && !popup.classList.contains('t-popup_show')) link.click();
    };
    if (link.getAttribute('aria-haspopup') === 'dialog') {
      open();
      return;
    }

    function stopWaiting() {
      pending.disconnect();
      clearTimeout(timeout);
      pending = null;
    }

    pending = new MutationObserver(() => {
      if (link.getAttribute('aria-haspopup') !== 'dialog') return;
      stopWaiting();
      open();
    });
    const timeout = setTimeout(stopWaiting, 12000);
    pending.observe(link, {attributes: true, attributeFilter: ['aria-haspopup']});
  }

  document.addEventListener('click', event => {
    const link = event.target.closest?.(linkSelector);
    if (!link || event.button !== 0 || event.defaultPrevented || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || link.closest(menuCopy) ||
        link.getAttribute('aria-haspopup') === 'dialog' ||
        !document.querySelector(popupSelector)) return;
    event.preventDefault();
    openWhenReady(link);
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    if (location.hash !== hash) return;
    const links = [...document.querySelectorAll(linkSelector)].filter(link => !link.closest(menuCopy));
    openWhenReady(links.find(link => link.getClientRects().length) || links[0]);
  }, {once: true});
})();
