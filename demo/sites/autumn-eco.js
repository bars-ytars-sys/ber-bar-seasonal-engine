
window.AUTUMN = {
  intensity: 1,        // плотность листопада: 0.2 … 2
  wind: 0.4,           // снос вбок
  zIndex: 900,         // 900 — листья за фиксированным меню, 1000 — поверх него
  corners: 'auto',     // ветки в углах: 'auto' | ['rec812345678','rec812345901'] | []
  cornersSkip: [],     // блоки, которые пропустить в режиме 'auto'
  branchAfter: [],     // веточка-разделитель после этих блоков
  reveal: []           // плавное появление блока при скролле
};


/* ===== ОСЕННИЙ СЛОЙ ДЛЯ ТИЛЬДЫ — скрипт =====
   Работает с уже опубликованными блоками Тильды: ничего в вёрстке
   не переписывает, классы навешивает сам по id записей (rec…).

   НАСТРОЙКИ — window.AUTUMN, задаются ДО подключения скрипта:
     intensity   плотность листопада, 0.2 … 2
     wind        сила бокового сноса
     zIndex      слой листопада (900 — под меню Тильды, 1000 — над ним)
     corners     'auto' | ['rec123456','rec123457'] | []  — ветки в углах
     cornersSkip ['rec123456']  — какие записи пропустить в режиме auto
     branchAfter ['rec123456']  — после каких записей вставить веточку
     reveal      ['rec123456']  — какие записи плавно проявлять при скролле
   ================================================================ */
(function () {
  'use strict';

  var cfg = Object.assign({
    intensity: 1,
    wind: 0.4,
    zIndex: 900,
    minWidth: 480,
    corners: 'auto',
    cornersSkip: [],
    branchAfter: [],
    reveal: [],
    colors: ['#D9A441', '#C98A2E', '#B4661F', '#9E3B23', '#7E8C3C', '#E7C878']
  }, window.AUTUMN || {});

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var NS = 'http://www.w3.org/2000/svg';
  var id = function (s) { return String(s).replace(/^#/, ''); };

  /* ---------- 1. формы листьев (единичные координаты) ---------- */
  function birch(c) {
    c.beginPath();
    c.moveTo(0, -0.5);
    c.bezierCurveTo(0.34, -0.24, 0.29, 0.27, 0, 0.48);
    c.bezierCurveTo(-0.29, 0.27, -0.34, -0.24, 0, -0.5);
    c.closePath();
  }
  function lobed(lobes, depth, stretch) {
    return function (c) {
      c.beginPath();
      for (var i = 0; i <= 80; i++) {
        var a = i / 80 * Math.PI * 2 - Math.PI / 2;
        var r = 0.30 + depth * Math.cos(lobes * a) + 0.05 * Math.cos(2 * lobes * a);
        var x = Math.cos(a) * r, y = Math.sin(a) * r * stretch;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.closePath();
    };
  }
  var SHAPES = [birch, lobed(5, 0.20, 1.02), lobed(7, 0.09, 1.28)];

  /* ---------- 2. листопад ---------- */
  var cv = document.getElementById('au-canvas');
  if (!cv) {
    cv = document.createElement('canvas');
    cv.id = 'au-canvas';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
  }
  cv.style.zIndex = cfg.zIndex;

  var ctx = cv.getContext('2d');
  var W = 0, H = 0, dpr = 1, leaves = [], last = 0, raf = null, running = false;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function make(fresh) {
    var z = rnd(0.35, 1);
    return {
      x: rnd(-0.05, 1.05) * W,
      y: fresh ? rnd(-0.2, 1) * H : rnd(-0.35, -0.02) * H,
      z: z,
      size: 11 + 23 * z,
      alpha: 0.22 + 0.5 * z,
      color: cfg.colors[(Math.random() * cfg.colors.length) | 0],
      shape: SHAPES[(Math.random() * SHAPES.length) | 0],
      rot: rnd(0, Math.PI * 2),
      spin: rnd(-0.5, 0.5),
      flip: rnd(0, Math.PI * 2),
      flipSpd: rnd(0.5, 1.5),
      sway: rnd(0, Math.PI * 2),
      swaySpd: rnd(0.4, 1.0),
      swayAmp: rnd(14, 46) * z
    };
  }

  function target() {
    return Math.round(Math.min(46, Math.max(12, W / 34)) * cfg.intensity);
  }
  function fillLeaves() {
    var n = target();
    while (leaves.length < n) leaves.push(make(true));
    if (leaves.length > n) leaves.length = n;
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fillLeaves();
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((t - last) / 1000, 0.05); last = t;
    ctx.clearRect(0, 0, W, H);
    var wind = cfg.wind * (0.7 + 0.5 * Math.sin(t * 0.00012));

    for (var i = 0; i < leaves.length; i++) {
      var p = leaves[i];
      p.sway += p.swaySpd * dt;
      p.rot += p.spin * dt;
      p.flip += p.flipSpd * dt;
      p.y += (16 + 54 * p.z) * dt;
      p.x += (Math.cos(p.sway) * p.swayAmp + wind * 34 * p.z) * dt;

      if (p.y - p.size > H) { leaves[i] = make(false); continue; }
      if (p.x < -p.size * 2) p.x = W + p.size;
      if (p.x > W + p.size * 2) p.x = -p.size;

      var squash = Math.max(0.12, Math.abs(Math.cos(p.flip)));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.size * squash, p.size);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      p.shape(ctx);
      ctx.fill();
      ctx.globalAlpha = p.alpha * 0.5;
      ctx.strokeStyle = 'rgba(60,40,10,.85)';
      ctx.lineWidth = 0.035;
      ctx.beginPath();
      ctx.moveTo(0, 0.56); ctx.lineTo(0, -0.34);
      ctx.stroke();
      ctx.restore();
    }
  }

  function start() {
    if (running || reduce.matches || window.innerWidth < cfg.minWidth) return;
    running = true; last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    if (W && H) ctx.clearRect(0, 0, W, H);
  }

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });
  if (reduce.addEventListener) {
    reduce.addEventListener('change', function () { reduce.matches ? stop() : start(); });
  }
  resize();
  start();

  /* ---------- 3. веточка с листьями (SVG, рисуется кодом) ---------- */
  function sprigSVG() {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 140');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');

    var stem = document.createElementNS(NS, 'path');
    stem.setAttribute('d', 'M2 6 C 48 22, 92 48, 132 92 C 146 108, 160 122, 178 132');
    stem.setAttribute('stroke', 'currentColor');
    stem.setAttribute('stroke-width', '2.4');
    stem.setAttribute('fill', 'none');
    stem.setAttribute('stroke-linecap', 'round');
    svg.appendChild(stem);

    for (var i = 0; i < 11; i++) {
      var t = 0.10 + i * 0.082;
      var x = 2 + 176 * t + 14 * Math.sin(t * 3.1);
      var y = 6 + 126 * Math.pow(t, 1.35);
      var side = i % 2 ? 1 : -1;
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('transform',
        'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' +
        (side * (34 + i * 6)).toFixed(0) + ') scale(' +
        (0.9 + 0.35 * Math.sin(i * 1.7)).toFixed(2) + ')');
      var leaf = document.createElementNS(NS, 'path');
      leaf.setAttribute('d', 'M0 0 C 10 -9, 26 -9, 34 0 C 26 9, 10 9, 0 0 Z');
      g.appendChild(leaf);
      svg.appendChild(g);
    }
    return svg;
  }

  function addSprig(rec, pos) {
    if (!rec) return;
    rec.classList.add('au-corner');
    var s = sprigSVG();
    s.setAttribute('class', 'au-sprig');
    s.setAttribute('data-pos', pos);
    rec.insertBefore(s, rec.firstChild);
  }

  var POS = ['tr', 'bl', 'br', 'tl'];

  function applyCorners() {
    if (Array.isArray(cfg.corners)) {
      cfg.corners.forEach(function (rid, i) {
        addSprig(document.getElementById(id(rid)), POS[i % POS.length]);
      });
      return;
    }
    if (cfg.corners !== 'auto') return;

    var recs = [].slice.call(document.querySelectorAll('.t-rec')).filter(function (r) {
      if (cfg.cornersSkip.indexOf(r.id) > -1) return false;
      if (r.querySelector('.t-menu__nav, .t-menusub, .t-popup, .t-popup__container')) return false;
      if (r.classList.contains('t-records')) return false;
      return r.offsetHeight > 260;
    });
    var k = 0;
    recs.forEach(function (r, i) {
      if (i % 2) return;              // через один блок — чтобы не пестрило
      addSprig(r, POS[k++ % POS.length]);
    });
  }

  /* ---------- 4. веточки-разделители ---------- */
  function branchSVG(n) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 600 40');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('fill', 'currentColor');

    var stem = document.createElementNS(NS, 'path');
    stem.setAttribute('d', 'M40 20 C 180 6, 420 34, 560 20');
    stem.setAttribute('stroke', 'currentColor');
    stem.setAttribute('stroke-width', '1.4');
    stem.setAttribute('fill', 'none');
    stem.setAttribute('stroke-linecap', 'round');
    svg.appendChild(stem);

    for (var i = 0; i < n; i++) {
      var t = (i + 0.5) / n;
      var x = 40 + 520 * t;
      var y = 20 - 14 * Math.sin(Math.PI * t) * (t < 0.5 ? 1 : -1) * 0.55;
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) +
        ') rotate(' + ((i % 2 ? -1 : 1) * (30 + 18 * Math.sin(i))).toFixed(0) + ') scale(0.62)');
      var leaf = document.createElementNS(NS, 'path');
      leaf.setAttribute('d', 'M0 0 C 9 -8, 24 -8, 32 0 C 24 8, 9 8, 0 0 Z');
      g.appendChild(leaf);
      svg.appendChild(g);
    }
    return svg;
  }

  function applyBranches() {
    // уже размеченные вручную
    [].slice.call(document.querySelectorAll('.au-branch:empty')).forEach(function (el) {
      el.appendChild(branchSVG(parseInt(el.getAttribute('data-leaves') || '8', 10)));
    });
    // после указанных записей Тильды
    cfg.branchAfter.forEach(function (rid) {
      var rec = document.getElementById(id(rid));
      if (!rec) return;
      var d = document.createElement('div');
      d.className = 'au-branch';
      d.appendChild(branchSVG(9));
      rec.parentNode.insertBefore(d, rec.nextSibling);
    });
  }

  /* ---------- 5. появление при скролле ---------- */
  function applyReveal() {
    cfg.reveal.forEach(function (rid) {
      var rec = document.getElementById(id(rid));
      if (rec) rec.classList.add('au-reveal');
    });
    var targets = document.querySelectorAll('.au-reveal');
    if (!targets.length) return;
    if (!('IntersectionObserver' in window) || reduce.matches) {
      [].forEach.call(targets, function (el) { el.classList.add('au-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('au-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    [].forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------- запуск после отрисовки блоков Тильды ---------- */
  function decorate() {
    applyCorners();
    applyBranches();
    applyReveal();
  }
  if (document.readyState === 'complete') {
    setTimeout(decorate, 300);
  } else {
    window.addEventListener('load', function () { setTimeout(decorate, 300); });
  }

  window.autumnLayer = {
    start: start,
    stop: stop,
    decorate: decorate,
    setIntensity: function (v) { cfg.intensity = v; fillLeaves(); }
  };
})();

(function () {
  var HTML = "<!-- ТЁПЛАЯ ОСЕНЬ — блок с акциями для ecobr.ru\n     Тильда → Библиотека → Другое → T123 (HTML-код) → вставить целиком.\n\n     КУДА СТАВИТЬ: на главной, на место блока с заголовком\n     «Ради нас берут выходной!» (это запись rec1694735441).\n     Сам заголовок в том блоке меняется в редакторе Тильды\n     на «Тёплая осень» — это делается мышкой, код для этого не нужен.\n\n     Ничего чужого не переопределяет: все стили на классах to-*.\n     Шрифты и цвета наследуются от сайта, поэтому блок выглядит родным.\n\n     ССЫЛКИ КНОПОК ведут прямо в модуль бронирования с подставленными\n     датами и промокодом — проверено на живом модуле Bnovo.\n     -->\n<div class=\"to-wrap\">\n  <!-- Заголовка здесь нет намеренно: его роль играет заголовок блока\n       сверху, который в Тильде меняется на «Тёплая осень». Иначе\n       на странице оказываются два одинаковых заголовка подряд. -->\n  <p class=\"to-lead\">\n    Банные ритуалы с самоваром, ароматный чан и раннее бронирование\n    на осенние каникулы.\n  </p>\n\n  <div class=\"to-grid\">\n\n    <!-- 1. Банный отдых с самоваром: две программы внутри -->\n    <article class=\"to-card to-card--wide\">\n      <h3 class=\"to-t\">Банный отдых с самоваром</h3>\n\n      <div class=\"to-sub\">\n        <div class=\"to-sub__head\">\n          <span class=\"to-sub__name\">В берёзовом пару</span>\n          <span class=\"to-price\">8 000 ₽<small>Панорама — 12 000 ₽</small></span>\n        </div>\n        <ul class=\"to-list\">\n          <li>Баня и банные шапки</li>\n          <li>Самовар и алтайский травяной чай</li>\n          <li>Мёд, сушки или орехи — на выбор</li>\n          <li>Вода 0,5 л на каждого гостя</li>\n        </ul>\n      </div>\n\n      <div class=\"to-sub\">\n        <div class=\"to-sub__head\">\n          <span class=\"to-sub__name\">Баня по-русски</span>\n          <span class=\"to-price\">15 000 ₽</span>\n        </div>\n        <ul class=\"to-list\">\n          <li>Баня, берёзовые веники, банные шапки</li>\n          <li>Самовар и алтайский травяной чай</li>\n          <li>Мёд, сушки или орехи — на выбор</li>\n          <li>Вода 0,5 л на каждого гостя</li>\n          <li>Холодный чан</li>\n        </ul>\n      </div>\n\n      <a class=\"to-btn\" href=\"https://ecobr.ru/booking?dfrom=fri&amp;dto=sun&amp;adults=2&amp;scroll_to_rooms=1\">\n        Выбрать даты и забронировать\n      </a>\n    </article>\n\n    <!-- 2. Ароматная осень -->\n    <article class=\"to-card\">\n      <h3 class=\"to-t\">Ароматная осень</h3>\n      <p class=\"to-d\">Ароматное наполнение в чан — в подарок.</p>\n      <ul class=\"to-list\">\n        <li>Действует на брони, заезд которых попадает в период акции</li>\n      </ul>\n      <div class=\"to-promo\" data-code=\"ОСЕНЬ2026\">\n        <span>ОСЕНЬ2026</span><small>нажмите, чтобы скопировать</small>\n      </div>\n      <a class=\"to-btn\" href=\"https://ecobr.ru/booking?dfrom=fri&amp;dto=sun&amp;adults=2&amp;promoCode=%D0%9E%D0%A1%D0%95%D0%9D%D0%AC2026&amp;scroll_to_rooms=1\">\n        Забронировать с промокодом\n      </a>\n    </article>\n\n    <!-- 3. Осенние каникулы -->\n    <article class=\"to-card\">\n      <h3 class=\"to-t\">Осенние каникулы в Берёзовой Роще</h3>\n      <p class=\"to-d\">Раннее бронирование пакета «Осенние каникулы».</p>\n      <p class=\"to-big\">Скидка 10%</p>\n      <ul class=\"to-list\">\n        <li>При бронировании на официальном сайте до 15.09.2026</li>\n      </ul>\n      <p class=\"to-fine\">\n        При бронировании пакета «Осенние каникулы» дарим скидку 20% —\n        при заключении договора и внесении предоплаты до 15 сентября.\n        Предложение действует до 15 сентября.\n        Период каникул: с 23 октября по 4 ноября 2026 года.\n      </p>\n      <a class=\"to-btn\" href=\"https://ecobr.ru/booking?dfrom=2026-10-23&amp;dto=2026-10-26&amp;adults=2&amp;children=2&amp;scroll_to_rooms=1\">\n        Забронировать каникулы\n      </a>\n    </article>\n\n  </div>\n</div>\n\n<style>\n/* Блок наследует шрифты сайта, поэтому смотрится родным.\n   Собственные цвета — только акцент кнопки и тонкие линии. */\n.to-wrap{\n  --to-accent:#2ed8a3;\n  --to-ink:#1a1b19;\n  --to-muted:#6c7370;\n  --to-line:#e4e7e5;\n  --to-card:#ffffff;\n  max-width:1200px;margin:0 auto;padding:0 20px;\n  font:16px/1.55 inherit;color:var(--to-ink);box-sizing:border-box;\n}\n.to-wrap *{box-sizing:border-box}\n\n.to-lead{color:var(--to-muted);margin:0 0 26px;max-width:62ch;font-size:16.5px}\n\n.to-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:start}\n.to-card--wide{grid-row:span 2}\n\n.to-card{\n  background:var(--to-card);border:1px solid var(--to-line);border-radius:16px;\n  padding:26px 26px 24px;display:flex;flex-direction:column;height:100%;\n}\n.to-t{font:inherit;font-weight:600;font-size:20px;line-height:1.25;margin:0 0 8px}\n.to-d{color:var(--to-muted);margin:0 0 14px}\n\n.to-sub{padding:18px 0;border-top:1px solid var(--to-line)}\n.to-sub:first-of-type{border-top:0;padding-top:4px}\n.to-sub__head{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:10px}\n.to-sub__name{font-weight:600;font-size:17px}\n.to-price{\n  margin-left:auto;font-weight:700;font-size:22px;white-space:nowrap;\n  display:flex;flex-direction:column;align-items:flex-end;line-height:1.15;\n}\n.to-price small{font-weight:400;font-size:12.5px;color:var(--to-muted);white-space:nowrap}\n\n.to-big{font-weight:700;font-size:30px;margin:2px 0 10px}\n\n.to-list{list-style:none;margin:0 0 16px;padding:0}\n.to-list li{position:relative;padding-left:20px;margin-bottom:7px;font-size:15px}\n.to-list li::before{\n  content:\"\";position:absolute;left:2px;top:9px;width:7px;height:7px;\n  border-radius:50%;background:var(--to-accent);\n}\n\n.to-promo{\n  display:inline-flex;align-items:center;gap:10px;align-self:flex-start;\n  border:1px dashed var(--to-accent);border-radius:10px;padding:9px 14px;\n  margin:0 0 16px;cursor:pointer;font-weight:600;\n}\n.to-promo small{font-weight:400;font-size:12.5px;color:var(--to-muted)}\n.to-promo.is-copied{border-style:solid;background:#f0faf6}\n\n.to-fine{font-size:13px;line-height:1.5;color:var(--to-muted);margin:0 0 16px}\n\n.to-btn{\n  margin-top:auto;display:block;text-align:center;text-decoration:none;\n  background:var(--to-accent);color:#0d2b22;font-weight:700;font-size:15px;\n  padding:15px 18px;border-radius:12px;letter-spacing:.01em;\n}\n.to-btn:hover{filter:brightness(.94)}\n\n@media(max-width:1023px){\n  .to-grid{grid-template-columns:1fr 1fr}\n  .to-card--wide{grid-column:1 / -1;grid-row:auto}\n}\n@media(max-width:639px){\n  .to-wrap{padding:0 14px}\n  .to-grid{grid-template-columns:1fr;gap:14px}\n  .to-card{padding:22px 20px}\n  .to-price{margin-left:0;align-items:flex-start}\n  .to-sub__head{gap:6px}\n}\n</style>\n\n<script>\n/* Промокод копируется по клику — гость не переписывает его руками\n   и не ошибается на шаге бронирования. */\n(function () {\n  var el = document.querySelector('.to-promo');\n  if (!el) return;\n  el.addEventListener('click', function () {\n    var code = el.getAttribute('data-code');\n    var done = function () {\n      el.classList.add('is-copied');\n      el.querySelector('small').textContent = 'скопировано';\n    };\n    if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, done);\n    else done();\n  });\n})();\n</script>\n";
  function mount() {
    if (document.getElementById("to-host")) return;
    var target = document.getElementById("rec1694735441");
    if (!target || !target.parentNode) return;

    var h = target.querySelector('[field="tn_text_1765543910875"]');
    if (h) h.textContent = "Тёплая осень";

    var host = document.createElement("div");
    host.id = "to-host";
    host.style.cssText = "padding:10px 0 56px";
    host.innerHTML = HTML;
    target.parentNode.insertBefore(host, target.nextSibling);

    host.querySelectorAll("script").forEach(function (old) {
      var neo = document.createElement("script");
      neo.text = old.textContent;
      old.parentNode.replaceChild(neo, old);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();