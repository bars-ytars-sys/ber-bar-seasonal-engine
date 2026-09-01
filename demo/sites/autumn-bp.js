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

  /* ========================= ТЕКУЩАЯ ФАЗА ================================= */
  var LEVEL = 1;
  /* ======================================================================== */

  var HEADERS = {
    eco: ['rec1729326481', 'rec1730117851'],
    bp:  ['rec1185050691']
  };

  var LEVELS = {
    /* --- ФАЗА 1 · ЛЁГКАЯ ОСЕНЬ (сентябрь) --------------------------------- */
    1: {
      /* Листья. Немного и крупные — так честнее, чем сыпать мелочью.
         Часть уходит в расфокус: даёт глубину и убирает ощущение стикеров. */
      leaves: {
        count: 12,
        size: [28, 58],
        fall: [17, 30],          /* секунд на пролёт */
        opacity: [0.52, 0.88],
        blur: 0.28,              /* доля листьев в расфокусе */
        drift: [40, 110]         /* амплитуда сноса, px */
      },

      /* Тёплые тона листвы: от зелёного, который ещё не сдался, до жжёной охры */
      palette: [
        ['#d8a24a', '#b0762a'],
        ['#c2762f', '#93501c'],
        ['#a8883a', '#7d6222'],
        ['#b4552f', '#7e3418'],
        ['#9aa04a', '#6f7530']
      ],

      vignette: 'rgba(120,74,26,.09)',
      glow: 'rgba(255,170,80,.10)',

      bp: {
        /* Боке-гирлянда: мягкие тёплые шары со свечением, а не кружки
           с чёткой границей. Провод — волосяная линия. */
        bokeh: {
          step: 66,
          sag: 26,
          size: [8, 14],
          halo: 4.2,             /* во сколько раз ореол больше горячего ядра */
          warm: '255,198,118',
          wire: 'rgba(20,16,10,.5)',
          pulse: [3.2, 6.4]
        }
      },
      eco: {
        /* Тёплый разлив света сверху — сентябрьское солнце сквозь листву.
           Тонкий луч на светлом сайте не читался вовсе, разлив работает. */
        wash: {
          height: 42,            /* vh */
          warm: 'rgba(255,176,86,.26)',
          soft: 'rgba(255,206,140,.10)'
        }
      }
    },

    /* --- ФАЗА 2 · ОСЕНЬ ОСЕНЬ (конец сентября) ----------------------------
       НЕ ЗАПОЛНЯТЬ ЗАРАНЕЕ. Когда попросят: гуще листопад, насыщеннее
       палитра, вторая гирлянда у «Полей», тёплый луч сильнее у «Рощи».
       Плюс за пределами блока — осенние фото на обложках и сезонные
       подборки домов через onlyrooms. */
    2: null,

    /* --- ФАЗА 3 · ОСЕНЬ ПЕРЕХОДИТ В ЗИМУ (начало ноября) ------------------
       НЕ ЗАПОЛНЯТЬ ЗАРАНЕЕ. Холодная примесь, последние листья, иней,
       огни уходят в холодный белый. Стыкуется с newyear (15 ноября). */
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
  var bokeh = mine.bokeh, wash = mine.wash;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  /* ------------------------------ ЛИСТЬЯ -------------------------------- */
  /* Один чистый силуэт вместо самодельной ботаники: попытка нарисовать
     клён путём от руки даёт звёздочку, а не лист. Овальный лист с носиком
     и черешком читается однозначно и выглядит спокойно. Разнообразие даёт
     не форма, а размер, наклон, цвет и глубина резьбы по краю. */
  function leafPath(notch) {
    var d = 'M32 5 C44 17 50 29 50 39 C50 51 42 59 32 59 C22 59 14 51 14 39 C14 29 20 17 32 5Z';
    if (!notch) return d;
    /* Лёгкая волна по краю — намёк на резной лист, без попытки в реализм */
    return 'M32 5 C40 14 45 21 47 28 C49 31 47 34 49 38 C50 49 42 59 32 59 ' +
           'C22 59 14 49 15 38 C17 34 15 31 17 28 C19 21 24 14 32 5Z';
  }

  function leafSvg(from, to, notch) {
    var id = 'g' + Math.random().toString(36).slice(2, 7);
    return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
        '<defs><linearGradient id="' + id + '" x1="0.1" y1="0" x2="0.9" y2="1">' +
          '<stop offset="0" stop-color="' + from + '"/>' +
          '<stop offset="1" stop-color="' + to + '"/></linearGradient></defs>' +
        '<path d="M32 57v6" stroke="' + to + '" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
        '<path d="' + leafPath(notch) + '" fill="url(#' + id + ')"/>' +
        '<path d="M32 12v42" stroke="' + to + '" stroke-opacity=".45" stroke-width="1.4" fill="none"/>' +
        '<path d="M32 24l-9 7M32 24l9 7M32 36l-8 7M32 36l8 7" stroke="' + to + '" ' +
          'stroke-opacity=".3" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
      '</svg>') + '")';
  }

  /* ----------------------------------------------------------------------
     Стили
     ---------------------------------------------------------------------- */
  var L = cfg.leaves;
  var css =
    '.bb-autumn-vig{position:fixed;inset:0;z-index:4;pointer-events:none;' +
      'background:' +
        'radial-gradient(75% 46% at 16% 106%,' + cfg.glow + ',transparent 74%),' +
        'radial-gradient(130% 100% at 50% 0%,transparent 56%,' + cfg.vignette + ' 100%)}' +

    /* Два слоя движения: внешний падает, внутренний сносит вбок и вращает.
       Одной анимацией такого не получить — лист летел бы по прямой. */
    '.bb-leaf{position:fixed;top:-14vh;z-index:5;pointer-events:none;' +
      'will-change:transform;animation:bbFall linear infinite}' +
    '.bb-leaf b{display:block;width:100%;height:100%;background-repeat:no-repeat;' +
      'background-size:contain;will-change:transform;' +
      'animation:bbDrift ease-in-out infinite alternate}' +
    '@keyframes bbFall{to{transform:translate3d(0,126vh,0)}}' +
    '@keyframes bbDrift{' +
      'from{transform:translateX(calc(var(--bb-drift) * -1)) rotate(-24deg)}' +
      'to{transform:translateX(var(--bb-drift)) rotate(28deg)}}' +

    '@media(max-width:639px){.bb-leaf{display:none}}' +
    '@media(prefers-reduced-motion:reduce){.bb-leaf{display:none}}';

  if (bokeh) {
    css +=
      '.bb-garland{position:fixed;left:0;right:0;z-index:8;pointer-events:none;' +
        'height:' + (bokeh.sag + 40) + 'px}' +
      '.bb-garland svg{position:absolute;inset:0;width:100%;height:100%}' +
      /* Настоящий огонёк — это горячее ядро плюс мягкий ореол вокруг.
         Один размытый градиент даёт пятно, а не свет. Ореол — сам элемент,
         ядро — ::after. Режим screen заставляет свет складываться с фоном,
         как на фотографии; на тёмно-зелёном фоне «Полей» это и нужно. */
      '.bb-bokeh{position:absolute;border-radius:50%;transform:translate(-50%,-50%);' +
        'mix-blend-mode:screen;' +
        'background:radial-gradient(circle,' +
          'rgba(' + bokeh.warm + ',.75) 0%,' +
          'rgba(' + bokeh.warm + ',.34) 30%,' +
          'rgba(' + bokeh.warm + ',.10) 55%,' +
          'rgba(' + bokeh.warm + ',0) 76%);' +
        'will-change:opacity,transform;' +
        'animation:bbPulse ease-in-out infinite alternate}' +
      '.bb-bokeh::after{content:"";position:absolute;left:50%;top:50%;' +
        'width:var(--bb-core);height:var(--bb-core);margin:calc(var(--bb-core) / -2) 0 0 ' +
        'calc(var(--bb-core) / -2);border-radius:50%;' +
        'background:radial-gradient(circle,#fff6e2 0%,rgba(' + bokeh.warm + ',.95) 55%,' +
          'rgba(' + bokeh.warm + ',0) 100%);' +
        'box-shadow:0 0 10px 2px rgba(' + bokeh.warm + ',.6)}' +
      '@keyframes bbPulse{from{opacity:.7;transform:translate(-50%,-50%) scale(.94)}' +
        'to{opacity:1;transform:translate(-50%,-50%) scale(1.05)}}' +
      '@media(prefers-reduced-motion:reduce){.bb-bokeh{animation:none;opacity:.95}}';
  }

  if (wash) {
    /* Разлив тёплого света сверху. Диагональ даёт ощущение низкого
       сентябрьского солнца, а не равномерной подсветки. */
    css +=
      '.bb-wash{position:fixed;left:0;right:0;height:' + wash.height + 'vh;z-index:4;' +
        'pointer-events:none;' +
        'background:' +
          'linear-gradient(180deg,' + wash.warm + ' 0%,' + wash.soft + ' 46%,transparent 100%),' +
          'radial-gradient(70% 120% at 78% -10%,' + wash.warm + ',transparent 70%);' +
        'animation:bbWash 18s ease-in-out infinite alternate}' +
      '@keyframes bbWash{from{opacity:.82}to{opacity:1}}' +
      '@media(prefers-reduced-motion:reduce){.bb-wash{animation:none}}';
  }

  var st = document.createElement('style');
  st.setAttribute('data-bb', 'autumn-decor');
  st.appendChild(document.createTextNode(css));
  (document.head || document.documentElement).appendChild(st);

  /* ----------------------------------------------------------------------
     Сборка
     ---------------------------------------------------------------------- */
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

  function qy(t, y0, yc, y1) {
    return (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * yc + t * t * y1;
  }

  function buildGarland(box) {
    var w = box.offsetWidth || window.innerWidth;
    var n = Math.max(6, Math.round(w / bokeh.step));
    var h = bokeh.sag + 40;
    var y0 = 6, yc = 6 + bokeh.sag * 2;

    box.innerHTML =
      '<svg viewBox="0 0 100 ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
        '<path d="M0 ' + y0 + ' Q50 ' + yc + ' 100 ' + y0 + '" fill="none" ' +
          'stroke="' + bokeh.wire + '" stroke-width="1.2" vector-effect="non-scaling-stroke"/>' +
      '</svg>';

    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n;
      var core = rnd(bokeh.size[0], bokeh.size[1]);
      var dot = document.createElement('span');
      dot.className = 'bb-bokeh';
      /* Сам огонёк маленький, но фон-градиент гаснет к краю — получается
         мягкое пятно света, а не диск с обводкой. */
      dot.style.width = dot.style.height = (core * bokeh.halo).toFixed(1) + 'px';
      dot.style.setProperty('--bb-core', core.toFixed(1) + 'px');
      dot.style.left = (t * 100) + '%';
      dot.style.top = (qy(t, y0, yc, y0) + core * 0.9) + 'px';
      dot.style.animationDuration = rnd(bokeh.pulse[0], bokeh.pulse[1]).toFixed(2) + 's';
      dot.style.animationDelay = (-Math.random() * 6).toFixed(2) + 's';
      box.appendChild(dot);
    }
  }

  function mount() {
    if (document.querySelector('.bb-autumn-vig')) return;

    var vig = document.createElement('div');
    vig.className = 'bb-autumn-vig';
    document.body.appendChild(vig);

    var tops = [];

    if (bokeh) {
      var garland = document.createElement('div');
      garland.className = 'bb-garland';
      document.body.appendChild(garland);
      tops.push(garland);
      buildGarland(garland);
      window.addEventListener('resize', function () { buildGarland(garland); });
    }

    if (wash) {
      var w = document.createElement('div');
      w.className = 'bb-wash';
      document.body.appendChild(w);
      tops.push(w);
    }

    function place() {
      var top = headerBottom();
      tops.forEach(function (el) { el.style.top = top + 'px'; });
    }
    place();
    window.addEventListener('resize', place);
    setTimeout(place, 600);
    setTimeout(place, 1800);

    /* --- листья --- */
    for (var i = 0; i < L.count; i++) {
      var size = rnd(L.size[0], L.size[1]);
      var dur = rnd(L.fall[0], L.fall[1]);
      var pal = cfg.palette[i % cfg.palette.length];
      var far = Math.random() < L.blur;      /* дальний план — в расфокусе */

      var wrap = document.createElement('div');
      wrap.className = 'bb-leaf';
      wrap.style.left = Math.max(1, Math.min(95, (i + 0.5) / L.count * 100 + rnd(-6, 6))) + '%';
      wrap.style.width = size + 'px';
      wrap.style.height = size + 'px';
      wrap.style.animationDuration = dur + 's';
      wrap.style.animationDelay = (-Math.random() * dur) + 's';
      wrap.style.opacity = far ? L.opacity[0] : rnd(L.opacity[0] + 0.1, L.opacity[1]);
      if (far) wrap.style.filter = 'blur(1.6px)';

      var inner = document.createElement('b');
      inner.style.backgroundImage = leafSvg(pal[0], pal[1], i % 3 === 0);
      inner.style.animationDuration = rnd(3.4, 6.2).toFixed(2) + 's';
      inner.style.animationDelay = (-Math.random() * 4).toFixed(2) + 's';
      inner.style.setProperty('--bb-drift', rnd(L.drift[0], L.drift[1]).toFixed(0) + 'px');

      wrap.appendChild(inner);
      document.body.appendChild(wrap);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
