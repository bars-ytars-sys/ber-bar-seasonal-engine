"""Первый экран демки главной БР (prevyu/lid/br-home-preview/index.html): дом «Панорама» вместо фото SPA.

Идемпотентно накладывает правку на текущий index.html (его продолжает менять Codex):
галерея первого экрана -> фото «Панорамы» и её банного чана, подписи-ссылки, стили br-hero-panorama.css.
    python3 tools/br-home-20261116/hero.py
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
P = ROOT / 'prevyu/lid/br-home-preview/index.html'
s = P.read_text(encoding='utf-8')

a = s.index('<div class="brh-hero__gallery" aria-hidden="true">')
b = s.index('<div class="brh-hero__copy">', a)
gallery = (
    '<div class="brh-hero__gallery" aria-hidden="true">'
    '<picture class="brh-hero__visual" data-brh-visual="panorama">'
    '<source media="(max-width: 960px)" srcset="home-assets/hero-pano-house-mobile.webp">'
    '<img class="brh-hero__photo" src="home-assets/hero-pano-house.webp" alt="" width="1680" height="1120" fetchpriority="high"></picture>'
    '<picture class="brh-hero__visual" data-brh-visual="spa">'
    '<source media="(max-width: 960px)" srcset="home-assets/hero-pano-tub-mobile.webp">'
    '<img class="brh-hero__photo" src="home-assets/hero-pano-tub.webp" alt="" width="1122" height="825" decoding="async" fetchpriority="low"></picture>'
    '</div> '
    '<div class="brh-hero__captions">'
    '<a class="brh-hero__caption" data-for="panorama" href="https://ecobr.ru/doma/panorama">Дом «Панорама» · до 8 гостей →</a>'
    '<a class="brh-hero__caption" data-for="spa" href="https://ecobr.ru/doma/panorama">Банный чан у дома «Панорама» →</a>'
    '</div>')
old = s[a:b]
old = re.sub(r'<div class="brh-hero__captions">.*?</div>', '', old, flags=re.S)
s = s[:a] + gallery + s[b:]
s = re.sub(r'(</div> <div class="brh-hero__captions">.*?</div>)(<div class="brh-hero__captions">.*?</div>)', r'\1', s, flags=re.S)

link = '<link rel="stylesheet" href="br-hero-panorama.css?v=2">'
s = re.sub(r'<link rel="stylesheet" href="br-hero-panorama\.css[^"]*">', '', s)
m = re.search(r'<link rel="stylesheet" href="br-home-redesign\.css[^"]*">', s)
assert m, 'нет br-home-redesign.css'
s = s[:m.end()] + link + s[m.end():]
assert s.count('data-brh-visual=') == 2 and s.count('brh-hero__captions') == 1
P.write_text(s, encoding='utf-8')
print('hero ok')
