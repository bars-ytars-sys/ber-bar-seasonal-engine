(() => {
  function init() {
    const anchorName = 'zayavka-deti';
    const anchor = document.querySelector('a[name="zayavka-deti"], #zayavka-deti');
    const formRecord = document.getElementById('rec1750171061');
    if (!anchor || !formRecord) return;

    document.querySelectorAll('a[href="#zayavka"]').forEach(link => {
      link.href = '#' + anchorName;
      link.dataset.brDetiCallback = '';
    });

    function showForm() {
      const form = formRecord.querySelector('form');
      if (!form) {
        anchor.scrollIntoView({block: 'start', behavior: 'instant'});
        return;
      }
      form.scrollIntoView({block: 'center', behavior: 'instant'});
      // Focus the form without opening the virtual keyboard.
      form.setAttribute('tabindex', '-1');
      window.requestAnimationFrame(() => form.focus({preventScroll: true}));
    }

    window.addEventListener('hashchange', () => {
      if (location.hash === '#' + anchorName) showForm();
    });

    document.addEventListener('click', event => {
      const link = event.target instanceof Element && event.target.closest('a[data-br-deti-callback]');
      if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();

      const menu = link.closest('.t-popup_show');
      const close = menu?.querySelector('.t-popup__close, a[href="#menuopen"]');
      close?.click();

      const navigate = () => {
        if (location.hash !== '#' + anchorName) history.pushState(null, '', '#' + anchorName);
        showForm();
      };
      if (close) window.setTimeout(navigate, 400);
      else navigate();
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once: true});
  } else {
    init();
  }
})();
