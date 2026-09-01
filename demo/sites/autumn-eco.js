/* Осенние элементы для витрины. Собрано из seasonal-engine/ автоматически,
   правьте компоненты, а не этот файл. База: ЭкоБаза «Берёзовая роща» */

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
window.BB.site = "eco";
window.BB.season = 'autumn';
document.documentElement.setAttribute('data-site', "eco");
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
      id: "eco-2026-09-osen",
      text: "Бархатный сезон: −20% на будни в сентябре. Промокод OSEN20",
      cta: "Выбрать даты",
      href: "/booking?dfrom=mon&dto=thu&adults=2&promoCode=OSEN20",
      from:  '2020-01-01',
      until: '2035-12-31'
    },
    bp: {
      enabled: true,
      id:    'bp-2026-11-sert',
      text:  'Подарочные сертификаты 10 / 20 / 30 тыс. — успеть до Нового года',
      cta:   'Купить сертификат',
      href:  '/sertifikaty',
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

window.BB_AUTUMN_ASSETS = (function () {
  var me = document.currentScript && document.currentScript.src;
  var base = me ? me.replace(/sites\/[^/]*$/, "assets/") : "demo/assets/";
  return {
    strip: {
      eco: { src: base + "garland-eco.webp", bg: "#f6efdc" },
      bp:  { src: base + "garland-bp.webp", bg: "#36523e" }
    },
    leaves: {
      eco: [base + "leaf-birch.webp"],
      bp:  [base + "leaf-maple.webp", base + "leaf-oak.webp"]
    }
  };
})();

(function () {
  'use strict';
  var BB = window.BB || {};
  if (!BB.num) { console.warn('BB: блок 1 не подключён — осенние элементы выключены'); return; }

  /* =========================================================================
     ССЫЛКИ НА КАРТИНКИ. Подставить после загрузки в Файлы Tilda.
     ========================================================================= */
  var ASSETS = window.BB_AUTUMN_ASSETS || {
    /* Гирлянда нарисована на фоне цвета самой базы и ставится ПОЛОСОЙ В ПОТОК
       сразу под шапкой — как обычный блок. Поверх фотографии её вешать нельзя:
       непрозрачная полоса закроет обложку. */
    /* Декор у баз РАЗНЫЙ и подобран под каждую:
       «Барские поля» — тёмно-зелёный вечерний сайт, дерево, чаны: гирлянда
         с горящими лампами, красный клён и дуб в листопаде;
       «Берёзовая роща» — светлая и воздушная, и название про рощу:
         берёзовые ветви с золотой листвой, жёлтый берёзовый лист. */
    strip: {
      eco: { src: 'demo/assets/garland-eco.webp', bg: '#f6efdc' },
      bp:  { src: 'demo/assets/garland-bp.webp', bg: '#36523e' }
    },
    leaves: {
      eco: ['demo/assets/leaf-birch.webp'],
      bp:  ['demo/assets/leaf-maple.webp', 'demo/assets/leaf-oak.webp']
    }
  };

  /* ========================= ТЕКУЩАЯ ФАЗА ================================= */
  var LEVEL = 1;
  /* ======================================================================== */

  var HEADERS = {
    eco: ['rec1729326481', 'rec1730117851'],
    bp:  ['rec1185050691']
  };

  var LEVELS = {
    /* --- ФАЗА 1 · ЛЁГКАЯ ОСЕНЬ (сентябрь) ---------------------------------
       Осень «только началась»: гирлянда и считаные листья. Листья мелкие
       намеренно — крупные читаются как стикеры поверх фотографий. */
    1: {
      garland: { height: 132, opacity: 0.95 },
      /* Листьев мало и они приглушены: на фотографиях яркая листва
         выбивается и читается как наклейка. */
      leaves: { count: 4, size: [18, 30], fall: [19, 31], opacity: [0.32, 0.55], drift: [30, 80] }
    },

    /* --- ФАЗА 2 · ОСЕНЬ ОСЕНЬ (конец сентября) ----------------------------
       НЕ ЗАПОЛНЯТЬ ЗАРАНЕЕ. Когда попросят: листьев больше и крупнее,
       вторая гирлянда, осенние фотографии на обложках, сезонные подборки
       домов через onlyrooms. */
    2: null,

    /* --- ФАЗА 3 · ОСЕНЬ ПЕРЕХОДИТ В ЗИМУ (начало ноября) ------------------
       НЕ ЗАПОЛНЯТЬ ЗАРАНЕЕ. Последние листья, холодная примесь, лампы
       уходят в холодный белый. Стыкуется с newyear (15 ноября). */
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

  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var L = cfg.leaves;

  var css =
    '.bb-garland{width:100%;height:' + cfg.garland.height + 'px;pointer-events:none;' +
      'background-repeat:no-repeat;background-position:center center;background-size:cover}' +

    /* Два слоя движения: внешний падает, внутренний сносит вбок и вращает.
       Одной анимацией лист летел бы по прямой. */
    '.bb-leaf{position:fixed;top:-12vh;z-index:6;pointer-events:none;' +
      'will-change:transform;animation:bbFall linear infinite}' +
    '.bb-leaf b{display:block;width:100%;height:100%;background-repeat:no-repeat;' +
      'background-size:contain;will-change:transform;' +
      'animation:bbDrift ease-in-out infinite alternate}' +
    '@keyframes bbFall{to{transform:translate3d(0,122vh,0)}}' +
    '@keyframes bbDrift{' +
      'from{transform:translateX(calc(var(--bb-drift) * -1)) rotate(-30deg)}' +
      'to{transform:translateX(var(--bb-drift)) rotate(34deg)}}' +

    /* На телефоне листья не сыплем: трафик у баз мобильный. Гирлянду
       оставляем — она и есть осенний признак. */
    '@media(max-width:639px){.bb-leaf{display:none}' +
      '.bb-garland{height:' + Math.round(cfg.garland.height * 0.6) + 'px}}' +
    '@media(prefers-reduced-motion:reduce){.bb-leaf{display:none}}';

  var st = document.createElement('style');
  st.setAttribute('data-bb', 'autumn-decor');
  st.appendChild(document.createTextNode(css));
  (document.head || document.documentElement).appendChild(st);

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

  function mount() {
    if (document.querySelector('.bb-garland')) return;

    /* Полоса с гирляндой убрана: между шапкой и обложкой она читалась
       как мёртвый кусок фона и ломала первый экран. */

    for (var i = 0; i < L.count; i++) {
      var size = rnd(L.size[0], L.size[1]);
      var dur = rnd(L.fall[0], L.fall[1]);

      var wrap = document.createElement('div');
      wrap.className = 'bb-leaf';
      wrap.style.left = Math.max(1, Math.min(95, (i + 0.5) / L.count * 100 + rnd(-7, 7))) + '%';
      wrap.style.width = size + 'px';
      wrap.style.height = size + 'px';
      wrap.style.animationDuration = dur + 's';
      wrap.style.animationDelay = (-Math.random() * dur) + 's';
      wrap.style.opacity = rnd(L.opacity[0], L.opacity[1]);

      var inner = document.createElement('b');
      inner.style.backgroundImage = 'url("' + leafSet[i % leafSet.length] + '")';
      inner.style.animationDuration = rnd(3.2, 6).toFixed(2) + 's';
      inner.style.animationDelay = (-Math.random() * 4).toFixed(2) + 's';
      inner.style.setProperty('--bb-drift', rnd(L.drift[0], L.drift[1]).toFixed(0) + 'px');

      wrap.appendChild(inner);
      document.body.appendChild(wrap);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
