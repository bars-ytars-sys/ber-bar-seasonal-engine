/* Осенние элементы для витрины. Собрано из seasonal-engine/ автоматически,
   правьте компоненты, а не этот файл. База: База отдыха «Барские поля» */

(function () {
  'use strict';

  /* ---------- ЯДРО. Не трогать. ---------- */
  var BB = window.BB = window.BB || {};
  BB.TZ = 180; /* Europe/Moscow. Все даты в системе — московские. */

  BB.param = function (name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  };

  /* «Машина времени»: ?date=2026-12-25 сдвигает ВСЮ систему — сезон, расписание,
     таймеры. Время суток остаётся текущим, поэтому таймеры считаются честно. */
  var fake = (BB.param('date') || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);

  BB.now = function () {
    var d = new Date();
    var msk = new Date(d.getTime() + (d.getTimezoneOffset() + BB.TZ) * 60000);
    if (fake) msk.setFullYear(+fake[1], +fake[2] - 1, +fake[3]);
    return msk;
  };
  BB.pad = function (n) { return (n < 10 ? '0' : '') + n; };
  BB.ymd = function (d) { return d.getFullYear() + '-' + BB.pad(d.getMonth() + 1) + '-' + BB.pad(d.getDate()); };

  /* 'YYYY-MM-DD' -> 20261115. Сравнивать числа надёжнее, чем объекты Date. */
  BB.num = function (s) {
    var m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? +(m[1] + m[2] + m[3]) : null;
  };
  BB.todayNum = function () { return BB.num(BB.ymd(BB.now())); };
  BB.today = BB.todayNum();   /* сегодня одним числом, с учётом ?date= */

  /* Обычно база определяется по домену. ?site=bp — посмотреть, как компоненты
     выглядят в палитре второй базы, не уходя с этого сайта. */
  BB.site = BB.param('site') || (/barskie/i.test(location.hostname) ? 'bp' : 'eco');

  /* ---------- ТАБЛИЦА СЕЗОНОВ · МОЖНО МЕНЯТЬ ---------- */
  /* Формат ММ-ДД. Диапазон может переходить через Новый год. */
  var SEASONS = [
    { id: 'newyear', from: '11-15', to: '01-10' },
    { id: 'winter',  from: '01-11', to: '03-07' },
    { id: 'spring',  from: '03-08', to: '05-08' },
    { id: 'summer',  from: '05-09', to: '08-31' },
    { id: 'autumn',  from: '09-01', to: '11-14' }
  ];

  function detect() {
    var d = BB.now(), md = BB.pad(d.getMonth() + 1) + '-' + BB.pad(d.getDate());
    for (var i = 0; i < SEASONS.length; i++) {
      var s = SEASONS[i];
      var ok = (s.from <= s.to) ? (md >= s.from && md <= s.to)
                                : (md >= s.from || md <= s.to);
      if (ok) return s.id;
    }
    return 'summer';
  }

  /* Предпросмотр ?season=winter — держится до закрытия вкладки. */
  var forced = BB.param('season');
  try {
    if (forced) sessionStorage.setItem('bb_season', forced);
    forced = forced || sessionStorage.getItem('bb_season');
  } catch (e) {}

  BB.season = forced || detect();
  document.documentElement.setAttribute('data-season', BB.season);
  document.documentElement.setAttribute('data-site', BB.site);
  if (forced) document.documentElement.setAttribute('data-season-preview', '1');
})();

/* палитра компонентов --bb-* из того же блока 1 */
(function(){var s=document.createElement('style');s.setAttribute('data-bb','theme');s.appendChild(document.createTextNode("\n/* ============================================================================\n   ПАЛИТРА НАШИХ КОМПОНЕНТОВ (--bb-*).\n   Ими покрашены анонс-полоса, карточки офферов, таймеры, мобильная панель.\n   Меняются каждый сезон — это безопасно, ничего чужого не задевает.\n   ============================================================================ */\n:root{\n  --bb-accent:#2ed8a3;\n  --bb-accent-ink:#0d2b22;\n  --bb-ink:#1a1b19;\n  --bb-muted:#6b7280;\n  --bb-surface:#ffffff;\n  --bb-bg:#f4f6fb;\n  --bb-line:#e6e9ef;\n  --bb-hot:#e0533d;\n  --bb-badge:#eef7f3;\n  --bb-radius:14px;\n  --bb-shadow:0 2px 10px rgba(20,25,35,.06);\n  --bb-font:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;\n}\n\n/* «Барские поля» — своя базовая палитра, снята с живого сайта */\n:root[data-site=\"bp\"]{\n  --bb-accent:#a36434;\n  --bb-accent-ink:#ffffff;\n  --bb-ink:#243d34;\n  --bb-bg:#eee5d5;\n  --bb-line:#e5d9b9;\n  --bb-badge:#f2e9d0;\n  --bb-hot:#c0442c;\n}\n\n/* ------------------------------- СЕЗОНЫ ---------------------------------- */\n\n/* НОВЫЙ ГОД · 15 ноября – 10 января */\n:root[data-season=\"newyear\"]{\n  --bb-accent:#1f7a5a; --bb-accent-ink:#fff8e7;\n  --bb-badge:#fdf3e0;  --bb-hot:#c0392b;\n  --bb-bg:#f2f5f3;\n}\n:root[data-season=\"newyear\"][data-site=\"bp\"]{\n  --bb-accent:#7d4d28; --bb-accent-ink:#f2e9d0; --bb-bg:#e9dfcb;\n}\n\n/* ЗИМА · 11 января – 7 марта */\n:root[data-season=\"winter\"]{ --bb-accent:#2f8f9d; --bb-accent-ink:#ffffff; --bb-bg:#eef3f6; }\n:root[data-season=\"winter\"][data-site=\"bp\"]{ --bb-accent:#5a6f7d; --bb-accent-ink:#ffffff; --bb-bg:#e9e6de; }\n\n/* ВЕСНА · 8 марта – 8 мая */\n:root[data-season=\"spring\"]{ --bb-accent:#57b894; --bb-accent-ink:#08281f; --bb-bg:#f2f8f4; }\n:root[data-season=\"spring\"][data-site=\"bp\"]{ --bb-accent:#8a8c46; --bb-accent-ink:#ffffff; --bb-bg:#efe9d8; }\n\n/* ЛЕТО · 9 мая – 31 августа (базовые цвета брендов) */\n:root[data-season=\"summer\"]{ --bb-accent:#2ed8a3; --bb-bg:#f4f6fb; }\n:root[data-season=\"summer\"][data-site=\"bp\"]{ --bb-accent:#a36434; --bb-bg:#eee5d5; }\n\n/* ОСЕНЬ · 1 сентября – 14 ноября */\n:root[data-season=\"autumn\"]{ --bb-accent:#c98a3c; --bb-accent-ink:#241a0c; --bb-bg:#f7f3ec; }\n:root[data-season=\"autumn\"][data-site=\"bp\"]{ --bb-accent:#b5642a; --bb-accent-ink:#ffffff; --bb-bg:#f0e4cd; }\n\n/* ============================================================================\n   ПЕРЕКРАСКА ВСЕГО САЙТА ecobr.ru ЧЕРЕЗ ЦВЕТОВЫЕ СТИЛИ TILDA\n\n   ПРАВИЛО: за сезон меняем максимум ДВЕ переменные — фон секций и (по решению\n   дизайнера) акцент. Текст (Z3IU8y) и тёмный фон (cPYWVKrTiQfG) не трогаем:\n   развалится контраст на 118 блоках.\n   Акцент #2ed8a3 совпадает с btn_background виджета Bnovo в блоке rec3032928101 —\n   если меняете акцент, поменяйте и там, иначе кнопка «поедет» по цвету.\n   ============================================================================ */\n:root[data-site=\"eco\"][data-season=\"autumn\"] #allrecords .r,\n:root[data-site=\"eco\"][data-season=\"autumn\"] body{\n  --uc-color-color-n3E0FkCwyE:#f6f1e4 !important;\n}\n:root[data-site=\"eco\"][data-season=\"newyear\"] #allrecords .r,\n:root[data-site=\"eco\"][data-season=\"newyear\"] body{\n  --uc-color-color-n3E0FkCwyE:#f2f5f3 !important;\n  /* --uc-color-color-qp7xN:#1f7a5a !important;  ← акцент. Только вместе с Bnovo */\n}\n:root[data-site=\"eco\"][data-season=\"winter\"] #allrecords .r,\n:root[data-site=\"eco\"][data-season=\"winter\"] body{\n  --uc-color-color-n3E0FkCwyE:#eef3f6 !important;\n}\n:root[data-site=\"eco\"][data-season=\"spring\"] #allrecords .r,\n:root[data-site=\"eco\"][data-season=\"spring\"] body{\n  --uc-color-color-n3E0FkCwyE:#f2f8f4 !important;\n}\n\n/* Плашка предпросмотра — видна только при открытии с ?season= */\n:root[data-season-preview] body::after{\n  content:\"ПРЕДПРОСМОТР СЕЗОНА · закройте вкладку, чтобы сбросить\";\n  position:fixed; left:0; right:0; bottom:0; z-index:99999;\n  background:#111; color:#fff; font:12px/32px var(--bb-font);\n  text-align:center; letter-spacing:.04em; pointer-events:none;\n}\n"));(document.head||document.documentElement).appendChild(s);})();
/* витрина: база и сезон заданы явно */
window.BB.site = "bp";
window.BB.season = 'autumn';
document.documentElement.setAttribute('data-site', "bp");
document.documentElement.setAttribute('data-season', 'autumn');
/* витрина: не помним закрытие полосы, иначе её не вернуть 7 дней */
try { Object.keys(localStorage).forEach(function (k) {
  if (k.indexOf('bb_ab_') === 0) localStorage.removeItem(k); }); } catch (e) {}

(function () {
  'use strict';
  var BB = window.BB = window.BB || {};

  /* Счётчики Метрики. Проверено на живых страницах. */
  BB.COUNTER = { eco: 108978291, bp: 109033653 };
  BB.counter = BB.COUNTER[BB.site || 'eco'];

  BB.BOOKING_URL = { eco: 'https://ecobr.ru/booking', bp: 'https://barskie-polya.ru/booking' };

  /* ---------------------------------------------------------------------
     Разбор «умных» дат.
       2026-12-30  — как есть
       +14         — сегодня + 14 дней
       fri         — ближайшая пятница (сегодня, если сегодня пятница)
       fri+2       — ближайшая пятница + 2 дня
       mon,tue,wed,thu,fri,sat,sun

     Второй аргумент base — от какой даты считать. Для даты выезда всегда
     передаём дату заезда, иначе «с понедельника по четверг» превратится
     в выезд раньше заезда: ближайший четверг может быть до ближайшего понедельника.
     --------------------------------------------------------------------- */
  var DOW = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };

  BB.resolveDate = function (token, base) {
    if (!token) return '';
    token = String(token).trim().toLowerCase();
    if (/^\d{4}-\d{2}-\d{2}$/.test(token)) return token;

    /* точка отсчёта: переданная дата или сегодня */
    var d;
    if (base && /^\d{4}-\d{2}-\d{2}$/.test(base)) {
      var p = base.split('-');
      d = new Date(+p[0], +p[1] - 1, +p[2]);
    } else {
      d = BB.now();
      d.setHours(12, 0, 0, 0);
    }

    var m;
    if ((m = token.match(/^\+(\d+)$/))) {
      d.setDate(d.getDate() + (+m[1]));
      return BB.ymd(d);
    }
    if ((m = token.match(/^(sun|mon|tue|wed|thu|fri|sat)(?:\+(\d+))?$/))) {
      var delta = (DOW[m[1]] - d.getDay() + 7) % 7;
      /* если считаем от даты заезда, выезд не может быть в тот же день */
      if (delta === 0 && base) delta = 7;
      d.setDate(d.getDate() + delta + (m[2] ? +m[2] : 0));
      return BB.ymd(d);
    }
    return token; /* не распознали — отдаём как есть, модуль сам разберётся */
  };

  /* ---------------------------------------------------------------------
     Сборка ссылки на бронирование.
     BB.bookUrl({from:'fri', to:'sun', adults:2, promo:'BUDNI20', rooms:'123,456'})
     --------------------------------------------------------------------- */
  BB.bookUrl = function (o) {
    o = o || {};
    var base = o.base || BB.BOOKING_URL[BB.site] || BB.BOOKING_URL.eco;
    var q = [];
    var from = BB.resolveDate(o.from);
    var to   = BB.resolveDate(o.to, from);   /* выезд считаем от заезда */

    if (from) q.push('dfrom=' + encodeURIComponent(from));
    if (to)   q.push('dto=' + encodeURIComponent(to));
    if (o.adults)   q.push('adults=' + encodeURIComponent(o.adults));
    if (o.children) q.push('children=' + encodeURIComponent(o.children));
    if (o.promo)    q.push('promoCode=' + encodeURIComponent(o.promo));
    if (o.rooms)    q.push('onlyrooms=' + encodeURIComponent(o.rooms));
    q.push('scroll_to_rooms=1');

    /* Донести источник трафика до модуля — иначе бронь потеряет канал */
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(function (u) {
      var v = BB.param(u);
      if (v) q.push(u + '=' + encodeURIComponent(v));
    });

    return base + '?' + q.join('&');
  };

  /* ---------------------------------------------------------------------
     Цель в Метрику. Безопасна, если счётчик ещё не загрузился.
     --------------------------------------------------------------------- */
  BB.goal = function (name, params) {
    try {
      if (typeof window.ym === 'function' && BB.counter) window.ym(BB.counter, 'reachGoal', name, params || {});
      if (window.VK && VK.Retargeting && VK.Retargeting.Event) VK.Retargeting.Event(name);
      if (BB.param('goals') === 'debug') console.log('[BB goal]', name, params || {});
    } catch (e) {}
  };

  /* ---------------------------------------------------------------------
     Перехват кликов.

     ВАРИАНТ А (для контент-менеджера, без кода):
       в Tilda в ссылке кнопки написать относительные даты, например
       https://ecobr.ru/booking?dfrom=fri&dto=sun&adults=2&promoCode=BUDNI20
       Скрипт подменит fri/sun на реальные даты в момент клика.

     ВАРИАНТ Б (для наших компонентов):
       <a data-bb-book data-from="fri" data-to="sun" data-adults="2"
          data-promo="BUDNI20" data-offer="budni-2026">Забронировать</a>
     --------------------------------------------------------------------- */
  function rewriteBookingHref(href) {
    var mf = href.match(/[?&]dfrom=([^&#]*)/), mt = href.match(/[?&]dto=([^&#]*)/);
    var from = mf ? BB.resolveDate(decodeURIComponent(mf[1])) : '';
    var to   = mt ? BB.resolveDate(decodeURIComponent(mt[1]), from) : '';
    if (mf) href = href.replace(/([?&]dfrom=)[^&#]*/, '$1' + encodeURIComponent(from));
    if (mt) href = href.replace(/([?&]dto=)[^&#]*/,   '$1' + encodeURIComponent(to));
    return href;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a,[data-bb-book]') : null;
    if (!a) return;

    /* Б: собираем ссылку из data-атрибутов */
    if (a.hasAttribute('data-bb-book')) {
      var url = BB.bookUrl({
        from: a.getAttribute('data-from'),
        to: a.getAttribute('data-to'),
        adults: a.getAttribute('data-adults'),
        children: a.getAttribute('data-children'),
        promo: a.getAttribute('data-promo'),
        rooms: a.getAttribute('data-rooms')
      });
      BB.goal('offer_book_click', { offer: a.getAttribute('data-offer') || 'unknown' });
      if (a.tagName === 'A') { a.href = url; return; }
      e.preventDefault(); location.href = url; return;
    }

    /* А: обычная ссылка на /booking с относительными датами */
    var href = a.getAttribute('href') || '';
    if (href.indexOf('/booking') > -1 && /[?&](dfrom|dto)=/.test(href)) {
      a.href = rewriteBookingHref(href);
      BB.goal('offer_book_click', { offer: a.getAttribute('data-offer') || 'link' });
    }
  }, true);
})();


(function () {
  'use strict';
  var BB = window.BB || {};
  if (!BB.num) return;

  /* =========================================================================
     НАСТРОЙКА ПОЛОСЫ · РЕДАКТИРУЕТ КОНТЕНТ-МЕНЕДЖЕР

     id      — короткий код кампании. МЕНЯЙТЕ при каждой новой акции:
               иначе гость, закрывший прошлую полосу, не увидит новую.
     text    — одна строка, без воды. Хорошо: «−20% на будни в ноябре, промокод BUDNI20»
     cta     — надпись на кнопке
     href    — куда ведёт. Лучше сразу в бронирование (см. блок 3):
               '/booking?dfrom=mon&dto=thu&adults=2&promoCode=BUDNI20'
               или на посадочную '/november'
     from/until — окно показа, ГГГГ-ММ-ДД, включительно
     ========================================================================= */
  var ANNOUNCE = {
    eco: {
      enabled: true,
      id:    'eco-2026-11-budni',
      text:  'Будни ноября: −20% при заезде с понедельника по четверг. Промокод BUDNI20',
      cta:   'Выбрать даты',
      href:  '/booking?dfrom=mon&dto=thu&adults=2&promoCode=BUDNI20',
      from:  '2020-01-01',
      until: '2035-12-31'
    },
    bp: {
      enabled: true,
      id: "bp-2026-09-osen",
      text: "Золотая осень: третья ночь в подарок при заезде с понедельника по четверг",
      cta: "Посмотреть даты",
      href: "/booking?dfrom=mon&dto=thu&adults=2&promoCode=OSEN3X2",
      from:  '2020-01-01',
      until: '2035-12-31'
    }
  };

  var HEADERS = {
    eco: ['rec1729326481', 'rec1730117851'],
    bp:  ['rec1185050691']
  };
  /* ======================= КОНЕЦ РЕДАКТИРУЕМОЙ ЧАСТИ ======================= */

  /* ?announce=preview — посмотреть полосу, не включая её для гостей.
     Игнорирует enabled, окно дат и то, что вы её уже закрывали. */
  var preview = BB.param('announce') === 'preview';

  var cfg = ANNOUNCE[BB.site];
  if (!cfg) return;
  if (!preview) {
    if (!cfg.enabled) return;
    if (location.pathname.indexOf('/booking') === 0) return; /* не мешаем в оплате */

    var today = BB.today || BB.todayNum();
    if (cfg.from  && today < BB.num(cfg.from))  return;
    if (cfg.until && today > BB.num(cfg.until)) return;

    try {
      var until = localStorage.getItem('bb_ab_' + cfg.id);
      if (until && +until > Date.now()) return;
    } catch (e) {}
  }

  /* Стартовая оценка высоты — чтобы не было прыжка до первого замера.
     Реальная высота измеряется после отрисовки: на телефоне длинный текст
     переносится на две-три строки, и зашитая константа увела бы шапку под полосу. */
  var HEIGHT_DESKTOP = 44, HEIGHT_MOBILE = 52;

  var css =
    ':root{--bb-ab-h:' + HEIGHT_DESKTOP + 'px}' +
    '@media(max-width:639px){:root{--bb-ab-h:' + HEIGHT_MOBILE + 'px}}' +
    'body{padding-top:var(--bb-ab-h)}' +
    HEADERS[BB.site].map(function (r) {
      return '#' + r + ' .t396__artboard{top:var(--bb-ab-h) !important}';
    }).join('') +
    '.bb-ab{position:fixed;top:0;left:0;right:0;z-index:9990;display:flex;align-items:center;' +
      'gap:14px;min-height:var(--bb-ab-h);padding:6px 44px 6px 16px;box-sizing:border-box;' +
      'background:var(--bb-accent);color:var(--bb-accent-ink);font:500 14px/1.3 var(--bb-font);' +
      'justify-content:center;text-align:center}' +
    '.bb-ab__t{max-width:820px}' +
    '.bb-ab__b{flex:none;background:var(--bb-accent-ink);color:var(--bb-accent);' +
      'text-decoration:none;padding:7px 16px;border-radius:999px;font-weight:600;white-space:nowrap}' +
    '.bb-ab__x{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:28px;height:28px;' +
      'border:0;background:transparent;color:inherit;font-size:20px;line-height:1;cursor:pointer;opacity:.65}' +
    '.bb-ab__x:hover{opacity:1}' +
    '@media(max-width:639px){.bb-ab{flex-direction:column;gap:6px;padding:8px 40px 8px 12px;' +
      'font-size:13px}.bb-ab__b{padding:5px 14px;font-size:13px}}';

  var st = document.createElement('style');
  st.setAttribute('data-bb', 'announce');
  st.appendChild(document.createTextNode(css));
  (document.head || document.documentElement).appendChild(st);

  function mount() {
    if (document.querySelector('.bb-ab')) return;
    var bar = document.createElement('div');
    bar.className = 'bb-ab';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Специальное предложение');

    var t = document.createElement('span');
    t.className = 'bb-ab__t';
    t.textContent = cfg.text;

    var a = document.createElement('a');
    a.className = 'bb-ab__b';
    a.href = cfg.href;
    a.textContent = cfg.cta;
    a.setAttribute('data-offer', cfg.id);
    a.addEventListener('click', function () { BB.goal && BB.goal('announce_click', { id: cfg.id }); });

    var x = document.createElement('button');
    x.className = 'bb-ab__x';
    x.type = 'button';
    x.setAttribute('aria-label', 'Закрыть');
    x.innerHTML = '&times;';
    x.addEventListener('click', function () {
      bar.remove();
      document.documentElement.style.setProperty('--bb-ab-h', '0px');
      try { localStorage.setItem('bb_ab_' + cfg.id, Date.now() + 7 * 864e5); } catch (e) {}
      BB.goal && BB.goal('announce_close', { id: cfg.id });
    });

    bar.appendChild(t); bar.appendChild(a); bar.appendChild(x);
    document.body.insertBefore(bar, document.body.firstChild);

    /* Подгоняем отступ под фактическую высоту полосы. Иначе на телефоне,
       где текст переносится, шапка сайта окажется под полосой. */
    function syncHeight() {
      var h = bar.offsetHeight;
      if (h) document.documentElement.style.setProperty('--bb-ab-h', h + 'px');
    }
    syncHeight();
    window.addEventListener('resize', syncHeight);
    window.addEventListener('orientationchange', syncHeight);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeight);
    setTimeout(syncHeight, 400);   /* запасной замер: шрифты Tilda грузятся позже */

    BB.goal && BB.goal('announce_show', { id: cfg.id });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();


(function () {
  'use strict';
  var BB = window.BB || {};
  if (!BB.num) { console.warn('BB: блок 1 не подключён — осенние элементы выключены'); return; }

  /* =========================================================================
     ТЕКУЩАЯ ФАЗА
     ========================================================================= */
  var LEVEL = 1;
  /* ========================================================================= */

  /* Шапки, под которыми вешаем верхний декор. ID сняты с живых страниц. */
  var HEADERS = {
    eco: ['rec1729326481', 'rec1730117851'],
    bp:  ['rec1185050691']
  };
  /* На «Полях» внизу своя закреплённая панель — поднимаем натюрморт над ней. */
  var CORNER_BOTTOM = { eco: 0, bp: 88 };

  var LEVELS = {
    /* --- ФАЗА 1 · ЛЁГКАЯ ОСЕНЬ (сентябрь) --------------------------------- */
    1: {
      /* общее для обеих баз */
      leaves: 14,
      size: [15, 27],
      fall: [18, 32],
      opacity: 0.55,
      colors: ['#c9903f', '#b5702c', '#9a8c3c', '#a85536'],
      wind: 34,
      vignette: 'rgba(150,95,35,.08)',
      glow: 'rgba(255,168,72,.11)',
      corner: { pumpkins: 2, leaves: 3, acorn: true, scale: 1 },

      /* --- главный элемент, свой у каждой базы --- */
      bp: {
        garland: {
          step: 78,                      /* расстояние между лампами, px */
          sag: 24,                       /* провис провода, px */
          bulb: [9, 13],
          wire: 'rgba(30,24,16,.55)',
          warm: ['#fff2cd', '#ffc266', '#e0932c'],
          flicker: [2.6, 4.8]            /* секунд на цикл мерцания */
        }
      },
      eco: {
        branch: {
          width: 290, height: 150,
          leaves: 8,
          size: [17, 29],
          stem: '#7d5a30',
          sway: 7                        /* градусов покачивания */
        }
      }
    },

    /* --- ФАЗА 2 · ОСЕНЬ ОСЕНЬ (конец сентября) ----------------------------
       НЕ ЗАПОЛНЯТЬ ЗАРАНЕЕ. Когда попросят: гуще листопад, крупнее натюрморт,
       вторая гирлянда у «Полей», ветки по нижним углам у «Рощи», насыщеннее
       палитра. Плюс за пределами блока — осенние фото на обложках и сезонные
       подборки домов через onlyrooms. */
    2: null,

    /* --- ФАЗА 3 · ОСЕНЬ ПЕРЕХОДИТ В ЗИМУ (начало ноября) ------------------
       НЕ ЗАПОЛНЯТЬ ЗАРАНЕЕ. Холодная примесь в палитре, редкие последние
       листья, иней, лампы уходят в холодный белый. Стыкуется с сезоном
       newyear, который включается 15 ноября (блок 1). */
    3: null
  };

  /* --- Предпросмотр и выключатель ---------------------------------------- */
  var q = BB.param('decor');
  if (q === 'off') return;
  if (q === '1' || q === '2' || q === '3') LEVEL = +q;
  if (BB.season !== 'autumn' && !q) return;

  var cfg = LEVELS[LEVEL];
  if (!cfg) {
    console.info('BB: фаза ' + LEVEL + ' ещё не наполнена — осенние элементы не рисуются');
    return;
  }

  var mine = cfg[BB.site] || {};
  var g = mine.garland, br = mine.branch;

  /* ----------------------------------------------------------------------
     Графика. Всё рисуем сами.
     ---------------------------------------------------------------------- */
  function svgUrl(svg) {
    return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  }

  function leafSvg(color) {
    return svgUrl(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 26">' +
        '<path d="M12 1C6.6 5.4 3.5 10.6 3.5 15.2c0 4.7 3.8 8.3 8.5 8.3s8.5-3.6 8.5-8.3C20.5 10.6 17.4 5.4 12 1z" fill="' + color + '"/>' +
        '<path d="M12 4v20" stroke="rgba(0,0,0,.18)" stroke-width="1" fill="none"/>' +
        '<path d="M12 10l-4 3M12 15l4 3" stroke="rgba(0,0,0,.13)" stroke-width="1" fill="none"/>' +
      '</svg>');
  }

  function pumpkinSvg(body, rib, stem) {
    return svgUrl(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 58">' +
        '<path d="M32 14c-2.4-5-1.4-8.6 1.6-11.6" stroke="' + stem + '" stroke-width="4.5" ' +
          'fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="32" cy="35" rx="26" ry="21" fill="' + body + '"/>' +
        '<ellipse cx="20" cy="35" rx="11" ry="20.4" fill="' + rib + '"/>' +
        '<ellipse cx="44" cy="35" rx="11" ry="20.4" fill="' + rib + '"/>' +
        '<ellipse cx="32" cy="35" rx="8.5" ry="21" fill="' + rib + '" opacity=".72"/>' +
      '</svg>');
  }

  function acornSvg() {
    return svgUrl(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42">' +
        '<path d="M16 40c-6.2 0-10.5-5.2-10.5-11.6 0-5.2 4.4-9.4 10.5-9.4s10.5 4.2 10.5 9.4C26.5 34.8 22.2 40 16 40z" fill="#b8813f"/>' +
        '<path d="M4.5 18.5c0-4.2 5.2-7.5 11.5-7.5s11.5 3.3 11.5 7.5c0 2.1-1.2 3.2-3.2 3.2H7.7c-2 0-3.2-1.1-3.2-3.2z" fill="#7d5527"/>' +
        '<path d="M16 11V4.5" stroke="#7d5527" stroke-width="3.2" stroke-linecap="round"/>' +
      '</svg>');
  }

  /* ----------------------------------------------------------------------
     Стили
     ---------------------------------------------------------------------- */
  var css =
    '.bb-autumn-vig{position:fixed;inset:0;z-index:4;pointer-events:none;' +
      'background:' +
        'radial-gradient(70% 45% at 18% 104%,' + cfg.glow + ',transparent 72%),' +
        'radial-gradient(125% 100% at 50% 0%,transparent 58%,' + cfg.vignette + ' 100%)}' +

    '.bb-leaf{position:fixed;top:-8vh;z-index:5;pointer-events:none;' +
      'background-repeat:no-repeat;background-size:contain;opacity:0;' +
      'will-change:transform,opacity;animation-name:bbFall;' +
      'animation-timing-function:linear;animation-iteration-count:infinite}' +
    '@keyframes bbFall{' +
      '0%{transform:translate3d(0,0,0) rotate(0deg);opacity:0}' +
      '8%{opacity:' + cfg.opacity + '}' +
      '92%{opacity:' + cfg.opacity + '}' +
      '100%{transform:translate3d(var(--bb-wind),118vh,0) rotate(320deg);opacity:0}}' +

    '.bb-corner{position:fixed;left:14px;z-index:6;pointer-events:none;width:180px;height:115px}' +
    '.bb-corner i{position:absolute;display:block;background-repeat:no-repeat;background-size:contain}' +

    '@media(max-width:639px){.bb-leaf,.bb-corner{display:none}}' +
    '@media(prefers-reduced-motion:reduce){.bb-leaf{display:none}}';

  if (g) {
    css +=
      '.bb-garland{position:fixed;left:0;right:0;z-index:8;pointer-events:none;' +
        'height:' + (g.sag + g.bulb[1] + 16) + 'px}' +
      '.bb-garland svg{position:absolute;inset:0;width:100%;height:100%}' +
      '.bb-bulb{position:absolute;width:' + g.bulb[0] + 'px;height:' + g.bulb[1] + 'px;' +
        'margin-left:' + (-g.bulb[0] / 2) + 'px;border-radius:46% 46% 52% 52%;' +
        'background:radial-gradient(circle at 50% 32%,' +
          g.warm[0] + ' 0%,' + g.warm[1] + ' 58%,' + g.warm[2] + ' 100%);' +
        'will-change:opacity;animation-name:bbGlow;' +
        'animation-timing-function:ease-in-out;animation-iteration-count:infinite}' +
      '.bb-bulb::before{content:"";position:absolute;left:50%;top:-4px;width:5px;height:5px;' +
        'margin-left:-2.5px;border-radius:2px;background:rgba(45,36,24,.75)}' +
      '@keyframes bbGlow{0%,100%{opacity:.7;filter:brightness(.9)}50%{opacity:1;filter:brightness(1.15)}}' +
      '@media(prefers-reduced-motion:reduce){.bb-bulb{animation:none;opacity:.95}}';
  }

  if (br) {
    css +=
      '.bb-branch{position:fixed;z-index:6;pointer-events:none;' +
        'width:' + br.width + 'px;height:' + br.height + 'px;transform-origin:top center;' +
        'animation:bbSway 7s ease-in-out infinite}' +
      '.bb-branch--r{right:0;transform:scaleX(-1);animation-name:bbSwayR;animation-duration:8.5s}' +
      '.bb-branch--l{left:0}' +
      '.bb-branch svg{position:absolute;inset:0;width:100%;height:100%}' +
      '.bb-branch i{position:absolute;display:block;background-repeat:no-repeat;' +
        'background-size:contain;transform-origin:50% 0}' +
      '@keyframes bbSway{0%,100%{transform:rotate(-' + br.sway / 2 + 'deg)}' +
        '50%{transform:rotate(' + br.sway / 2 + 'deg)}}' +
      '@keyframes bbSwayR{0%,100%{transform:scaleX(-1) rotate(-' + br.sway / 2 + 'deg)}' +
        '50%{transform:scaleX(-1) rotate(' + br.sway / 2 + 'deg)}}' +
      '@media(max-width:639px){.bb-branch{width:' + Math.round(br.width * 0.6) + 'px;' +
        'height:' + Math.round(br.height * 0.6) + 'px}.bb-branch--r{display:none}}' +
      '@media(prefers-reduced-motion:reduce){.bb-branch{animation:none}}';
  }

  var st = document.createElement('style');
  st.setAttribute('data-bb', 'autumn-decor');
  st.appendChild(document.createTextNode(css));
  (document.head || document.documentElement).appendChild(st);

  /* ----------------------------------------------------------------------
     Сборка
     ---------------------------------------------------------------------- */

  /* Верхний декор вешаем под шапку. Высоту меряем на месте: она разная
     на двух сайтах и меняется при появлении анонс-полосы. */
  function headerBottom() {
    var max = 0;
    (HEADERS[BB.site] || []).forEach(function (rec) {
      var el = document.querySelector('#' + rec + ' .t396__artboard') || document.getElementById(rec);
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.height && r.bottom > max) max = r.bottom;
    });
    return max || 64;
  }

  /* Квадратичная кривая: та же формула для провода и для того, что на нём висит. */
  function qy(t, y0, yc, y1) {
    return (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * yc + t * t * y1;
  }

  function buildGarland(box) {
    var w = box.offsetWidth || window.innerWidth;
    var n = Math.max(5, Math.round(w / g.step));
    var h = g.sag + g.bulb[1] + 16;
    var y0 = 3, yc = 3 + g.sag * 2;

    box.innerHTML =
      '<svg viewBox="0 0 100 ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
        '<path d="M0 ' + y0 + ' Q50 ' + yc + ' 100 ' + y0 + '" fill="none" ' +
          'stroke="' + g.wire + '" stroke-width="1.6" vector-effect="non-scaling-stroke"/>' +
      '</svg>';

    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n;
      var bulb = document.createElement('span');
      bulb.className = 'bb-bulb';
      bulb.style.left = (t * 100) + '%';
      bulb.style.top = qy(t, y0, yc, y0) + 'px';
      bulb.style.animationDuration =
        (g.flicker[0] + Math.random() * (g.flicker[1] - g.flicker[0])).toFixed(2) + 's';
      bulb.style.animationDelay = (-Math.random() * 5).toFixed(2) + 's';
      /* Тёплый ореол. box-shadow дешевле, чем svg-фильтр. */
      bulb.style.boxShadow = '0 0 9px 3px rgba(255,178,74,.55), 0 0 24px 9px rgba(255,150,40,.26)';
      box.appendChild(bulb);
    }
  }

  /* Ветка: изогнутый прут из угла и листья, посаженные ровно на него. */
  function buildBranch(box) {
    var W = br.width, H = br.height;
    var x0 = 0, y0 = 4, xc = W * 0.55, yc = H * 0.10, x1 = W * 0.96, y1 = H * 0.72;

    box.innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
        '<path d="M' + x0 + ' ' + y0 + ' Q' + xc + ' ' + yc + ' ' + x1 + ' ' + y1 + '" ' +
          'fill="none" stroke="' + br.stem + '" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M' + (W * 0.28) + ' ' + (H * 0.16) + ' q30 14 44 44" fill="none" ' +
          'stroke="' + br.stem + '" stroke-width="3" stroke-linecap="round" opacity=".85"/>' +
      '</svg>';

    for (var i = 0; i < br.leaves; i++) {
      var t = (i + 0.6) / (br.leaves + 0.2);
      var size = br.size[0] + Math.random() * (br.size[1] - br.size[0]);
      var leaf = document.createElement('i');
      leaf.style.backgroundImage = leafSvg(cfg.colors[i % cfg.colors.length]);
      leaf.style.width = size + 'px';
      leaf.style.height = size * 1.08 + 'px';
      leaf.style.left = (qy(t, x0, xc, x1) - size / 2) + 'px';
      leaf.style.top = qy(t, y0, yc, y1) + 'px';
      leaf.style.transform = 'rotate(' + (i % 2 ? 18 : -22) + 'deg)';
      leaf.style.opacity = 0.95;
      box.appendChild(leaf);
    }
  }

  function mount() {
    if (document.querySelector('.bb-autumn-vig')) return;

    var vig = document.createElement('div');
    vig.className = 'bb-autumn-vig';
    document.body.appendChild(vig);

    var tops = [];

    /* --- главный элемент: гирлянда или ветки --- */
    if (g) {
      var garland = document.createElement('div');
      garland.className = 'bb-garland';
      document.body.appendChild(garland);
      tops.push(garland);
      buildGarland(garland);
      window.addEventListener('resize', function () { buildGarland(garland); });
    }

    if (br) {
      ['l', 'r'].forEach(function (side) {
        var b = document.createElement('div');
        b.className = 'bb-branch bb-branch--' + side;
        document.body.appendChild(b);
        tops.push(b);
        buildBranch(b);
      });
    }

    function place() {
      var top = headerBottom();
      tops.forEach(function (el) { el.style.top = top + 'px'; });
    }
    place();
    window.addEventListener('resize', place);
    /* Шапка Tilda может доехать позже — перевешиваем ещё пару раз */
    setTimeout(place, 600);
    setTimeout(place, 1800);

    /* --- падающие листья --- */
    for (var i = 0; i < cfg.leaves; i++) {
      var leaf = document.createElement('div');
      var size = cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]);
      var dur = cfg.fall[0] + Math.random() * (cfg.fall[1] - cfg.fall[0]);
      var left = (i + 0.5) / cfg.leaves * 100 + (Math.random() * 10 - 5);

      leaf.className = 'bb-leaf';
      leaf.style.left = Math.max(1, Math.min(96, left)) + '%';
      leaf.style.width = size + 'px';
      leaf.style.height = size * 1.08 + 'px';
      leaf.style.backgroundImage = leafSvg(cfg.colors[i % cfg.colors.length]);
      leaf.style.animationDuration = dur + 's';
      leaf.style.animationDelay = (-Math.random() * dur) + 's';
      leaf.style.setProperty('--bb-wind', (Math.random() * cfg.wind * 2 - cfg.wind).toFixed(0) + 'px');
      document.body.appendChild(leaf);
    }

    /* --- натюрморт в нижнем углу: тыквы, жёлудь, опавшие листья --- */
    var c = cfg.corner;
    if (c) {
      var corner = document.createElement('div');
      corner.className = 'bb-corner';
      corner.style.bottom = (CORNER_BOTTOM[BB.site] || 0) + 'px';

      var pieces = [
        { svg: pumpkinSvg('#d0702a', '#e58a41', '#6f5a2c'), w: 80, l: 2,  b: 4, r: -4 },
        { svg: pumpkinSvg('#e08a3a', '#f0a054', '#6f5a2c'), w: 52, l: 68, b: 2, r: 6 }
      ].slice(0, c.pumpkins);

      if (c.acorn) pieces.push({ svg: acornSvg(), w: 21, l: 114, b: 6, r: 14 });

      for (var k = 0; k < c.leaves; k++) {
        pieces.push({
          svg: leafSvg(cfg.colors[(k + 1) % cfg.colors.length]),
          w: 21 + k * 3, l: 46 + k * 27, b: 0, r: -60 + k * 55, op: 0.88
        });
      }

      pieces.forEach(function (p) {
        var el = document.createElement('i');
        el.style.backgroundImage = p.svg;
        el.style.width = (p.w * c.scale) + 'px';
        el.style.height = (p.w * c.scale) + 'px';
        el.style.left = (p.l * c.scale) + 'px';
        el.style.bottom = (p.b * c.scale) + 'px';
        el.style.transform = 'rotate(' + p.r + 'deg)';
        if (p.op) el.style.opacity = p.op;
        corner.appendChild(el);
      });

      document.body.appendChild(corner);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
