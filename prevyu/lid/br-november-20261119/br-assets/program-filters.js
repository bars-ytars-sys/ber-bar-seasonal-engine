const programs = document.getElementById('programmy-otdyha');
const filters = programs.querySelector('.br-nov-filters');
const buttons = [...filters.querySelectorAll('[data-program-filter]')];
const cards = [...programs.querySelectorAll('[data-program-category]')];

for (const button of buttons) {
  button.addEventListener('click', () => {
    const category = button.dataset.programFilter;
    for (const filter of buttons) {
      filter.setAttribute('aria-pressed', String(filter === button));
    }
    for (const card of cards) {
      card.hidden = category !== 'all' && card.dataset.programCategory !== category;
    }
  });
}
filters.hidden = false;
