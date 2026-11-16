"""Перенос демки главной БР на прод ecobr.ru (кроме первого экрана — он уже на проде).

Собирает три блока T123 из prevyu/lid/br-home-preview (демка Codex + правки 16.11) и копию живой главной
с этими блоками, новым порядком и выключенными блоками — для проверки до публикации.

    python3 tools/br-home-20261116/xfer.py OUT_DIR [--source prod.html]

Порядок на проде после переноса:
  первый экран T123 → 02 (быстрые ссылки + «Свободные даты и цены») → Bnovo rec3032928101 →
  03 («Наши дома» + заголовок «Специальные предложения») → акции rec3546311701 → 04 («Чем заняться» + скрипты) →
  дома по типам rec2851363001 → карта rec1841838861 + rec2856176101 → впечатления rec4153838101 → SPA rec2263527021 →
  rec2056178221 → подвал rec1745536501 → FAQ rec2710401401 + rec2710223901 → SEO-текст rec3717893401.
Выключаются (не удаляются): rec1910740261, rec1950785651, rec1684467611, rec1758781921, rec2069485181, rec2258842451, rec2258813491.
"""
from pathlib import Path
from urllib.request import Request, urlopen
import argparse, hashlib, json, re, shutil

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PREV = ROOT / 'prevyu/lid/br-home-preview'
ASSET_DIR = 'br-home-20261116'
PAGES = f'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/{ASSET_DIR}/'
OFF = ['rec1910740261', 'rec1950785651', 'rec1684467611', 'rec1758781921', 'rec2069485181', 'rec2258842451', 'rec2258813491']
HERO = 'rec5893605301'
BOOK = 'rec3032928101'
OFFERS = 'rec3546311701'

ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--source'); a = ap.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
if a.source:
    prod = Path(a.source).read_text(encoding='utf-8')
else:
    with urlopen(Request('https://ecobr.ru/', headers={'User-Agent': 'Mozilla/5.0 (release check)'}), timeout=60) as r:
        prod = r.read().decode('utf-8')
demo = (PREV / 'index.html').read_text(encoding='utf-8')


def section(html, sid, tag='section'):
    i = html.index(f'id="{sid}"'); s = html.rindex(f'<{tag}', 0, i); depth = 0
    for m in re.finditer(rf'<{tag}\b|</{tag}>', html[s:]):
        depth += 1 if m.group(0).startswith(f'<{tag}') else -1
        if depth == 0:
            return html[s:s + m.end()]
    raise ValueError(sid)


used = set()
def assets(html):
    def sub(m):
        used.add(m.group(1)); return PAGES + m.group(1)
    return re.sub(r'home-assets/([A-Za-z0-9_.-]+)', sub, html)


# --- разметка из демки
nav = demo[demo.index('<nav class="brh brh-quick-links"'):]
nav = nav[:nav.index('</nav>') + 6].replace('href="#br-home-spa"', 'href="#rec2263527021"')
booking = section(demo, 'br-home-booking')
r0 = booking.index(f'<div id="{BOOK}"'); r1 = booking.index('<!-- nominify end -->', r0)
r1 = booking.index('</div> </div> </div> </div>', r1) + len('</div> </div> </div> </div>')
booking = booking[:r0] + f'<div class="brh-slot" data-brh-slot="{BOOK}"></div>' + booking[r1:]
houses = section(demo, 'br-home-houses')
MORE = ('<a class="brh-card brh-house brh-house--more" href="https://ecobr.ru/doma">'
        '<span class="brh-more__num">+17</span><span class="brh-more__title">Остальные дома</span>'
        '<span class="brh-more__text">Всего на базе 22 дома: смотрите все в каталоге</span>'
        '<span class="brh-more__btn">Весь каталог <span aria-hidden="true">→</span></span></a>')
k = houses.rindex('</article>') + len('</article>')
houses = houses[:k] + '\n' + MORE + houses[k:]
offers = section(demo, 'br-home-offers')
activities = section(demo, 'br-home-activities').replace('href="#br-home-spa"', 'href="#rec2263527021"')
for x in (nav, booking, houses, offers, activities):
    assert '<h1' not in x and 'noindex' not in x

# --- стили: демо-CSS, класс страницы вместо «preview-home-redesign»; правки 16.11
css = (PREV / 'br-home-redesign.css').read_text(encoding='utf-8').replace('preview-home-redesign', 'brh-page')
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
css += """
/* 16.11: чат не ложится на «Показать наличие», пока на экране блок бронирования */
body.brh-booking-in-view #rec1841867761 .t898__btn:not(:has(.t898__btn_input:checked)){opacity:0;visibility:hidden;pointer-events:none;transition:opacity .2s,visibility .2s}
/* 16.11: последняя карточка ленты домов — «Остальные дома» */
.brh .brh-house--more{display:flex;flex-direction:column;justify-content:flex-end;gap:10px;min-height:100%;padding:26px 22px;border-radius:16px;
  background:linear-gradient(160deg,#1d4a3c 0%,#10342a 100%);color:#fff !important;text-decoration:none}
.brh .brh-house--more:hover{background:linear-gradient(160deg,#235847 0%,#133d31 100%)}
.brh-more__num{font:400 clamp(54px,5vw,76px)/1 'DespairDisplay',Arial,sans-serif;color:#2ed8a3}
.brh-more__title{font:700 clamp(21px,2vw,27px)/1.15 'DespairDisplay',Arial,sans-serif;text-transform:uppercase}
.brh-more__text{font:400 15px/1.4 'TildaSans',Arial,sans-serif;color:rgba(255,255,255,.82)}
.brh-more__btn{display:inline-flex;align-self:flex-start;align-items:center;gap:8px;min-height:42px;margin-top:6px;padding:0 16px;border-radius:7px;
  background:#2ed8a3;color:#1a1b19;font:700 12px/1.25 'DespairDisplay',Arial,sans-serif;text-transform:uppercase}
"""
OFFERS_FIT = (HERE / 'offers-fit.css')
if OFFERS_FIT.exists():
    css += '\n' + OFFERS_FIT.read_text(encoding='utf-8')
css = '\n'.join(l.rstrip() for l in css.splitlines() if l.strip())

js = (PREV / 'br-home-redesign.js').read_text(encoding='utf-8')
js += """
/* 16.11: чат прячется, пока на экране блок бронирования (на компьютере он ложился на «Показать наличие») */
(() => {
  const panel = document.querySelector('#br-home-booking .brh-booking__panel');
  if (!panel || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => document.body.classList.toggle('brh-booking-in-view', e.isIntersecting)).observe(panel);
})();
"""

MOVE = (f'<script>(function(){{var s=document.querySelector(\'[data-brh-slot="{BOOK}"]\'),r=document.getElementById(\'{BOOK}\');'
        'if(s&&r)s.parentNode.replaceChild(r,s);})();</script>')

head = '<!-- БЕРЁЗОВАЯ РОЩА · ГЛАВНАЯ · ПЕРЕНОС ДЕМКИ · 16.11.2026 · блок {n} из 3. {what} -->\n'
code = {
    '02': head.format(n=1, what='Сразу под первым экраном; под ним — блок Bnovo rec3032928101.')
          + '<script>document.body.classList.add(\'brh-page\');(function(){var c=document.querySelector(\'.brx__cta[href="#rec3032928101"]\');if(c)c.setAttribute(\'href\',\'#br-home-booking\');})();</script>\n<style>\n' + css + '\n</style>\n' + assets(nav) + '\n' + assets(booking) + '\n',
    '03': head.format(n=2, what='Сразу под блоком Bnovo rec3032928101; под ним — акции rec3546311701.')
          + MOVE + '\n' + assets(houses) + '\n' + assets(offers) + '\n',
    '04': head.format(n=3, what='Сразу под акциями rec3546311701.')
          + assets(activities) + '\n<script>\n' + js + '</script>\n',
}
names = {'02': '02-БР-ГЛАВНАЯ-БРОНЬ-T123.html', '03': '03-БР-ГЛАВНАЯ-ДОМА-АКЦИИ-T123.html', '04': '04-БР-ГЛАВНАЯ-ЧЕМ-ЗАНЯТЬСЯ-T123.html'}
for key, text in code.items():
    assert 'home-assets/' not in text and '../' not in text and '<h1' not in text, key
    (out / names[key]).write_text(text, encoding='utf-8')
(out / 'SHA256.json').write_text(json.dumps({names[k]: hashlib.sha256(v.encode()).hexdigest() for k, v in code.items()}, ensure_ascii=False, indent=2))

dst = ROOT / 'demo/assets' / ASSET_DIR; dst.mkdir(parents=True, exist_ok=True)
for f in sorted(used):
    shutil.copyfile(PREV / 'home-assets' / f, dst / f)

# --- копия живой главной после переноса
ms = list(re.finditer(r'<div id="(rec\d+)" class="r t-rec', prod))
end = prod.index('<!--/allrecords-->')
end = prod.rindex('</div>', 0, end)  # закрывающий allrecords
chunks = {}
order = []
for i, m in enumerate(ms):
    e = ms[i + 1].start() if i + 1 < len(ms) else None
    chunks[m.group(1)] = prod[m.start():e] if e else None
    order.append(m.group(1))
last = order[-1]
tail_start = ms[-1].start()
# последний блок заканчивается перед подвалом страницы (footer)
foot = prod.index('<footer', tail_start) if '<footer' in prod[tail_start:] else end
chunks[last] = prod[tail_start:foot]
footer = prod[foot:]
for r in OFF + ['rec2411016811']:
    assert r not in chunks or r in OFF, r
need = [HERO, BOOK, OFFERS, 'rec2851363001', 'rec1841838861', 'rec2856176101', 'rec4153838101', 'rec2263527021',
        'rec2056178221', 'rec1745536501', 'rec2710401401', 'rec2710223901', 'rec3717893401']
for r in need:
    assert r in chunks, r


def t123(rid, body):
    return (f'<div id="{rid}" class="r t-rec" style=" " data-animationappear="off" data-record-type="131"> <!-- T123 --> '
            '<div class="t123"> <div class="t-container_100 "> <div class="t-width t-width_100 "> <!-- nominify begin --> '
            + body + ' <!-- nominify end --> </div> </div> </div> </div> ')


content = [r for r in order if r not in OFF]
moved = [BOOK, OFFERS, 'rec1841838861', 'rec2856176101', 'rec3717893401']
rest = [r for r in content if r not in moved]
new = []
for r in rest:
    if r == 'rec4153838101':
        new += ['rec1841838861', 'rec2856176101']
    new.append(r)
    if r == HERO:
        new += ['NEW02', BOOK, 'NEW03', OFFERS, 'NEW04']
    if r == 'rec2710223901':
        new.append('rec3717893401')
chunks['NEW02'] = t123('rec9000000002', code['02'])
chunks['NEW03'] = t123('rec9000000003', code['03'])
chunks['NEW04'] = t123('rec9000000004', code['04'])
sim = prod[:ms[0].start()] + ''.join(chunks[r] for r in new) + footer
assert sim.count('<h1') == 1
(out / 'sim.html').write_text(sim, encoding='utf-8')
(out / 'order.json').write_text(json.dumps(new, ensure_ascii=False))
print('ok', {k: len(v) for k, v in code.items()}, 'assets', len(used))
