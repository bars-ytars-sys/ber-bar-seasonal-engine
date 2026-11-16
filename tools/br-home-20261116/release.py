"""Код T123 для прода ecobr.ru: первый экран главной БР — вариант 1 (одобрен владельцем 16.11).

Собирает один HTML-файл для вставки в новый блок T123 над текущим первым экраном (Zero-блок rec2411016811,
который затем выключается). H1 сохраняет текст прода: «База отдыха «Берёзовая роща» в Подмосковье с питанием и SPA».
Фото раздаются с GitHub Pages из demo/assets/.

    python3 tools/br-home-20261116/release.py OUT_DIR [--source prod.html]
"""
from pathlib import Path
from urllib.request import Request, urlopen
import argparse, hashlib, json, re, shutil, sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PREV = ROOT / 'prevyu/lid/br-home-preview'
PAGES = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/'
ASSETS = {  # demo-файл -> имя в demo/assets
    'hero-pano-gen.webp': 'br-hero-pano-20261116.webp',
    'hero-pano-gen-mobile.webp': 'br-hero-pano-20261116-mobile.webp',
    'hero-spa-indoor.webp': 'br-hero-spa-20261116.webp',
    'hero-spa-indoor-mobile.webp': 'br-hero-spa-20261116-mobile.webp',
}
BOOKING = '#rec3032928101'   # блок «Онлайн бронирование» (модуль Bnovo) на главной ecobr.ru
H1_PROD = 'База отдыха «Берёзовая роща» в Подмосковье с питанием и SPA'

ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--source'); a = ap.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
if a.source:
    page = Path(a.source).read_text(encoding='utf-8')
else:
    with urlopen(Request('https://ecobr.ru/', headers={'User-Agent': 'Mozilla/5.0 (release check)'}), timeout=60) as r:
        page = r.read().decode('utf-8')
h1 = [re.sub(r'<[^>]+>', '', x).strip() for x in re.findall(r'<h1[^>]*>(.*?)</h1>', page, re.S)]
assert h1 == [H1_PROD], h1
assert 'id="rec2411016811"' in page and 'id="rec3032928101"' in page and '_bn_widget_' in page

for src, dst in ASSETS.items():
    shutil.copyfile(PREV / 'home-assets' / src, ROOT / 'demo/assets' / dst)

css = '\n'.join((PREV / f).read_text(encoding='utf-8') for f in ['br-hero-wow.css', 'var-b.css', 'var-h.css'])
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
css = '\n'.join(l.rstrip() for l in css.splitlines() if l.strip())
js = (PREV / 'br-hero-wow.js').read_text(encoding='utf-8')
# Прод ecobr.ru: шапка 60 px + новогодняя строка 47 px, нижняя панель «.панель-моб» 61 px, чат и плашка «Чёрной пятницы».
css += """
@media (max-width:960px){
.brx{--brx-head:60px;min-height:max(520px,calc(100svh - var(--brx-top,107px) - var(--brx-dock,61px)))}
.brx__copy{padding-bottom:112px}
}
body.brx-hero-in-view #brbf-launcher{opacity:0;visibility:hidden;pointer-events:none;transition:opacity .25s}
@media (max-width:960px) and (max-height:720px){.brx{min-height:max(480px,calc(100svh - var(--brx-top,107px) - var(--brx-dock,61px)))}.brx__copy{padding-bottom:108px}}"""
js += """
/* Прод: высота первого экрана = экран минус шапка и нижняя панель; плашка «Чёрной пятницы» не перекрывает первый экран. */
(() => {
  const hero = document.querySelector('[data-brx]'); if (!hero) return;
  const root = document.documentElement;
  function sync() {
    root.style.setProperty('--brx-top', Math.round(hero.getBoundingClientRect().top + scrollY) + 'px');
    const dock = document.querySelector('.панель-моб');
    root.style.setProperty('--brx-dock', (dock && getComputedStyle(dock).display !== 'none' ? Math.round(dock.getBoundingClientRect().height) : 0) + 'px');
  }
  let w = innerWidth;
  addEventListener('resize', () => { if (innerWidth !== w) { w = innerWidth; sync(); } });
  addEventListener('load', sync); [300, 1200, 2500].forEach(t => setTimeout(sync, t)); sync();
  if ('IntersectionObserver' in window) new IntersectionObserver(e => document.body.classList.toggle('brx-hero-in-view', e[0].isIntersecting), {rootMargin: '-120px 0px 0px 0px'}).observe(hero);
})();
"""

markup = (
    '<section class="brx brx--s1" id="br-home-start" data-brx aria-labelledby="br-home-title"><div class="brx__slides">'
    f'<picture class="brx__slide is-on" data-k="house"><source media="(max-width: 960px)" srcset="{PAGES}br-hero-pano-20261116-mobile.webp">'
    f'<img src="{PAGES}br-hero-pano-20261116.webp" alt="Дом «Панорама» в Берёзовой роще" width="1920" height="948" fetchpriority="high"></picture>'
    f'<picture class="brx__slide" data-k="spa"><source media="(max-width: 960px)" data-srcset="{PAGES}br-hero-spa-20261116-mobile.webp">'
    f'<img data-src="{PAGES}br-hero-spa-20261116.webp" alt="Крытый бассейн SPA-комплекса" width="942" height="1024" decoding="async"></picture>'
    '</div><div class="brx__copy">'
    '<h1 id="br-home-title" class="brx__h1"><span class="brx__h1-a">База отдыха</span> <span class="brx__h1-b">«Берёзовая роща»</span> '
    '<small>в Подмосковье с питанием и SPA</small></h1>'
    '<p class="brx__script">Ради нас берут выходной</p>'
    '<h2 class="brx__sub">SPA-комплекс, ферма и ресторан · 40 минут от Москвы</h2>'
    f'<div class="brx__row"><a class="brx__cta" href="{BOOKING}">Проверить даты</a>'
    '<a class="brx__ghost" href="https://ecobr.ru/doma">Все 22 дома</a></div>'
    '</div></section>')

code = ('<!-- БЕРЁЗОВАЯ РОЩА · ГЛАВНАЯ · ПЕРВЫЙ ЭКРАН · 16.11.2026 (вариант 1, демо 50fddaf).\n'
        '     Новый блок T123 ставится НАД текущим первым экраном (Zero-блок с H1 «База отдыха «Берёзовая роща» в Подмосковье с питанием и SPA»),\n'
        '     тот блок выключается. Шапка, SEO страницы и остальные блоки не меняются. -->\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Marck+Script&display=swap">\n'
        '<style>\n' + css + '\n</style>\n' + markup + '\n<script>\n' + js + '</script>\n')

text = re.sub(r'<[^>]+>', ' ', markup)
assert code.count('<h1') == 1 and re.sub(r'\s+', ' ', re.search(r'<h1[^>]*>(.*?)</h1>', code, re.S).group(1))
assert ' '.join(re.sub(r'<[^>]+>', ' ', re.search(r'<h1[^>]*>(.*?)</h1>', code, re.S).group(1)).split()) == H1_PROD
assert 'noindex' not in code and '../../' not in code and 'home-assets/' not in code
name = '01-БР-ГЛАВНАЯ-ПЕРВЫЙ-ЭКРАН-T123.html'
(out / name).write_text(code, encoding='utf-8')
(out / 'SHA256.json').write_text(json.dumps({name: hashlib.sha256(code.encode()).hexdigest()}, ensure_ascii=False, indent=2))
print('ok', len(code))
