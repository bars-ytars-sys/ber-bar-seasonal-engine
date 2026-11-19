(() => {
  const section = document.querySelector('.br-nov-scenarios');
  const filters = section.querySelector('.br-nov-filters');
  const buttons = [...filters.querySelectorAll('button')];
  const cards = [...section.querySelectorAll('[data-br-category]')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const category = button.dataset.brFilter;
      for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
      for (const card of cards) card.hidden = category !== 'all' && card.dataset.brCategory !== category;
    });
  }
  filters.hidden = false;
})();
