(() => {
  const script = document.currentScript;
  const brand = script.dataset.demoNewYearHeader;
  const base = new URL('.', script.src);
  const native = {
    bp: {record: 'rec1185050691', booking: '1752779495403', mobileRecord: 'rec1185050691'},
    br: {record: 'rec1729326481', booking: '1718876194020', mobileRecord: 'rec1730117851'},
  }[brand];
  if (!native) return;

  function createLink(className, text, href) {
    const link = document.createElement('a');
    link.className = className;
    link.href = href;
    link.textContent = text;
    return link;
  }

  function newYearLink() {
    const link = createLink('demo-ny-link', 'Новый год', new URL(brand + '-new-year.html', base));
    const hat = document.createElement('span');
    hat.className = 'demo-ny-hat';
    hat.setAttribute('aria-hidden', 'true');
    hat.append(document.createElement('i'));
    link.prepend(hat);
    const sparkles = document.createElement('span');
    sparkles.className = 'demo-ny-sparkles';
    sparkles.setAttribute('aria-hidden', 'true');
    link.append(sparkles);
    return link;
  }

  function mount() {
    const header = document.getElementById('t-header');
    const booking = header?.querySelector('#' + native.record + ' [data-elem-id="' + native.booking + '"] > a[href]');
    if (!booking || header.querySelector('.demo-ny-link')) return;

    header.dataset.demoNySite = brand;
    booking.parentElement.classList.add('demo-ny-booking-slot');
    booking.after(newYearLink());
    if (brand === 'bp') {
      header.querySelectorAll('#rec1185050691 [data-elem-id="1752777201026"], #rec1185050691 [data-elem-id="1764977546442000001"]')
        .forEach(contact => contact.classList.add('demo-ny-contact'));
    }

    const actions = document.createElement('div');
    actions.className = 'demo-ny-mobile';
    actions.hidden = true;
    actions.append(newYearLink(), createLink('demo-ny-mobile-book', 'Забронировать', booking.href));
    header.append(actions);

    const spacer = document.createElement('div');
    spacer.className = 'demo-ny-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    spacer.hidden = true;
    header.after(spacer);

    const bars = [...new Set([native.record, native.mobileRecord])]
      .map(id => header.querySelector('#' + id + ' .t396__artboard'))
      .filter(Boolean);
    const mobile = matchMedia('(max-width: 959px)');
    function placeMobileRow() {
      const bar = mobile.matches && bars.find(element => element.getBoundingClientRect().height > 0);
      if (bar) actions.style.setProperty('--demo-ny-top', Math.round(bar.getBoundingClientRect().bottom) + 'px');
      actions.hidden = spacer.hidden = !bar;
    }

    const observer = new ResizeObserver(placeMobileRow);
    bars.forEach(bar => observer.observe(bar));
    window.addEventListener('resize', placeMobileRow, {passive: true});
    window.addEventListener('load', placeMobileRow, {once: true});
    placeMobileRow();
  }

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('demo-new-year-header.css?v=20261112-2', base);
  stylesheet.addEventListener('load', () => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once: true});
    else mount();
  }, {once: true});
  document.head.append(stylesheet);
})();
