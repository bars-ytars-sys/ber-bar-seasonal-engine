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
