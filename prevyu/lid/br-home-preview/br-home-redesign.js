(() => {
  const hero = document.querySelector('[data-brh-hero]');
  if (hero) {
    const panels = [...hero.querySelectorAll('[data-brh-panel]')];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let interval = 0;
    let inView = true;
    let hovered = false;

    function show(name) {
      hero.dataset.slide = name;
      panels.forEach(panel => {
        panel.hidden = false;
        const inactive = panel.dataset.brhPanel !== name;
        panel.setAttribute('aria-hidden', String(inactive));
        panel.inert = inactive;
      });
    }
    function schedule() {
      window.clearInterval(interval);
      if (!motion.matches && inView && !hovered && !document.hidden && !hero.contains(document.activeElement)) {
        interval = window.setInterval(() => show(hero.dataset.slide === 'panorama' ? 'spa' : 'panorama'), 7500);
      }
    }
    hero.addEventListener('focusin', schedule);
    hero.addEventListener('focusout', () => window.setTimeout(schedule, 0));
    hero.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') { hovered = true; schedule(); }
    });
    hero.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') { hovered = false; schedule(); }
    });
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', schedule);
    if (window.IntersectionObserver) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        schedule();
      }).observe(hero);
    }
    show('panorama');
    schedule();
  }

  const track = document.getElementById('br-activity-cards');
  if (track) {
    const arrows = document.querySelector('.brh-activities__arrows');
    const buttons = [...arrows.querySelectorAll('[data-brh-step]')];
    const updateArrows = () => {
      const end = track.scrollWidth - track.clientWidth;
      arrows.hidden = end < 2;
      buttons[0].disabled = track.scrollLeft < 2;
      buttons[1].disabled = track.scrollLeft >= end - 2;
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      const distance = track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
      track.scrollBy({ left: Number(button.dataset.brhStep) * distance, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }));
    track.addEventListener('scroll', updateArrows, {passive:true});
    window.addEventListener('resize', updateArrows, {passive:true});
    updateArrows();
  }
})();

(() => {
  const map = document.getElementById('br-home-map');
  if (!map) return;
  const actions = map.querySelector('.brh-map-actions');
  const toggle = actions.querySelector('button');
  const hint = actions.querySelector('.brh-map-swipe');
  const tile = map.querySelector('img[imgfield="tn_img_1728748198007"]');
  const artboard = map.querySelector('#rec2856176101 .t396__artboard');
  const onMobile = matchMedia('(max-width: 639px)');
  let expanded = false;
  let currentScale = 1;
  function layout() {
    actions.hidden = !onMobile.matches;
    const fit = onMobile.matches && !expanded;
    if (!fit) {
      map.classList.remove('brh-map--fit');
      currentScale = 1;
      return;
    }
    const rect = tile.getBoundingClientRect();
    if (rect.width < 1) return;
    const ratio = Math.min(1,(map.clientWidth - 18) / (rect.width / currentScale));
    map.style.setProperty('--brh-map-height', Math.ceil(rect.height / currentScale * ratio + 12) + 'px');
    map.style.setProperty('--brh-map-scale', String(ratio));
    artboard.scrollLeft = 0;
    map.classList.add('brh-map--fit');
    currentScale = ratio;
  }
  toggle.addEventListener('click', () => {
    expanded = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Показать всю карту' : 'Увеличить карту';
    hint.hidden = !expanded;
    layout();
  });
  onMobile.addEventListener('change', layout);
  window.addEventListener('resize', () => requestAnimationFrame(layout), {passive:true});
  window.addEventListener('load', layout, {once:true});
  if (window.ResizeObserver) new ResizeObserver(layout).observe(tile);
  layout();
})();
