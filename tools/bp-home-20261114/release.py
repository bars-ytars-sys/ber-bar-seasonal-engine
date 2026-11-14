"""Код двух T123-блоков главной barskie-polya.ru для переноса в Тильду (демо d05c518).

По умолчанию берёт код блоков с живой главной (между <!-- nominify begin/end -->).
Если код в редакторе отличается не только пробелами — передать точные копии из редактора:

    python3 release.py OUT_DIR [--hero hero-editor.html] [--promo promo-editor.html] [--source prod.html]

В OUT_DIR: 01-…-T123.html и 02-…-T123.html (вставить целиком вместо старого кода),
base/ — исходный код, на который наложены правки.
"""
from pathlib import Path
from urllib.request import urlopen, Request
import argparse, hashlib, json, re, sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
import calm

ASSETS = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/'

ap = argparse.ArgumentParser()
ap.add_argument('out')
ap.add_argument('--hero')
ap.add_argument('--promo')
ap.add_argument('--source')
a = ap.parse_args()
out = Path(a.out)
(out / 'base').mkdir(parents=True, exist_ok=True)

if a.source:
    page = Path(a.source).read_text(encoding='utf-8')
else:
    with urlopen(Request('https://barskie-polya.ru/', headers={'User-Agent': 'Mozilla/5.0 (release check)'}), timeout=60) as r:
        page = r.read().decode('utf-8')


def live_code(rid):
    i = page.index('<div id="%s"' % rid)
    s, e = calm.element(page, i)
    rec = page[s:e]
    b = rec.index('<!-- nominify begin -->') + len('<!-- nominify begin -->')
    return rec[b:rec.rindex('<!-- nominify end -->')].strip()


hero_base = Path(a.hero).read_text(encoding='utf-8') if a.hero else live_code('rec5032272401')
promo_base = Path(a.promo).read_text(encoding='utf-8') if a.promo else live_code('rec4596018801')

css = (ROOT / 'prevyu/lid/bp-home-calm.css').read_text(encoding='utf-8')
js = (ROOT / 'prevyu/lid/bp-home-calm.js').read_text(encoding='utf-8')
cut = css.index('/* Плавающая плашка акции')
hero_css, promo_css = css[:cut].rstrip() + '\n', css[cut:]

hero_new = calm.hero(hero_base, ASSETS).strip()
hero_new = ('<!-- ГЛАВНАЯ БП · ПЕРВЫЙ ЭКРАН · 14.11.2026 (демо d05c518). Вставить целиком вместо прежнего кода блока.\n'
            '     Шапка, H1 и SEO не меняются; фото — реальное Шале с GitHub Pages, свет в окнах добавлен. -->\n'
            + hero_new + '\n<style>\n' + hero_css + '</style>\n<script>\n' + js + '</script>\n')
promo_new = calm.promo(promo_base).strip()
promo_new = promo_new + '\n<style>\n/* 14.11.2026: «Чёрная пятница» — простая карточка, окно и таймер одной строкой */\n' + promo_css + '</style>\n'

for text, name in [(hero_new, 'hero'), (promo_new, 'promo')]:
    assert '/houses' in text or name == 'promo'
    assert 'bars-ytars-sys.github.io' in text
    assert '../../demo/assets' not in text and 'bp-production-houses.html' not in text and 'noindex' not in text
assert hero_new.count('<h1') == 1 and '>' + calm.H1 + '</h1>' in hero_new
assert 'data-bb-planner' in hero_new and 'href="#popup:quiz"' in hero_new
assert promo_new.count('data-bp-black-friday') >= 2 and 'bpCalmAutoShow' in promo_new

files = {
    '01-ГЛАВНАЯ-ПЕРВЫЙ-ЭКРАН-T123.html': hero_new,
    '02-ГЛАВНАЯ-АКЦИИ-ЧЁРНАЯ-ПЯТНИЦА-T123.html': promo_new,
    'base/01-первый-экран-было.html': hero_base,
    'base/02-акции-было.html': promo_base,
}
for name, text in files.items():
    (out / name).write_text(text, encoding='utf-8')
(out / 'SHA256.json').write_text(json.dumps({n: hashlib.sha256(t.encode()).hexdigest() for n, t in files.items()}, ensure_ascii=False, indent=2))
print('ok', {n: len(t) for n, t in files.items()})
