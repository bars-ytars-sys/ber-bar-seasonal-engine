"""Первый экран демки главной БР — вариант 1 (одобрен владельцем 16.11).

Накладывается на текущий prevyu/lid/br-home-preview/index.html (его продолжает менять Codex):
секция id="br-home-start" заменяется новой, подключаются br-hero-wow.css/js, var-b.css, var-h.css и шрифт Marck Script.
Повторный запуск безопасен.
    python3 tools/br-home-20261116/hero.py
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
P = ROOT / 'prevyu/lid/br-home-preview/index.html'
s = P.read_text(encoding='utf-8')

HERO = (
    '<section class="brx brx--s1" id="br-home-start" data-brx aria-labelledby="br-home-title"><div class="brx__slides">'
    '<picture class="brx__slide is-on" data-k="house"><source media="(max-width: 960px)" srcset="home-assets/hero-pano-gen-mobile.webp">'
    '<img src="home-assets/hero-pano-gen.webp?v=4" alt="Дом «Панорама» в Берёзовой роще" width="1920" height="948" fetchpriority="high"></picture>'
    '<picture class="brx__slide" data-k="spa"><source media="(max-width: 960px)" data-srcset="home-assets/hero-spa-indoor-mobile.webp">'
    '<img data-src="home-assets/hero-spa-indoor.webp" alt="Крытый бассейн SPA-комплекса" width="942" height="1024" decoding="async"></picture>'
    '</div><div class="brx__copy">'
    '<h1 id="br-home-title" class="brx__h1"><span class="brx__h1-a">База отдыха</span> <span class="brx__h1-b">«Берёзовая роща»</span> <small>в Подмосковье</small></h1>'
    '<p class="brx__script">Ради нас берут выходной</p>'
    '<div class="brx__row"><a class="brx__cta" href="#br-home-booking">Проверить даты</a>'
    '<a class="brx__ghost" href="https://ecobr.ru/doma">Все 22 дома</a></div>'
    '</div></section>')

i = s.index('id="br-home-start"')
a = s.rindex('<section', 0, i)
b = s.index('</section>', i) + len('</section>')
s = s[:a] + HERO + s[b:]

HEAD = ('<!-- BR-HERO-20261116 --><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Marck+Script&display=swap">'
        '<link rel="stylesheet" href="br-hero-wow.css?v=7"><link rel="stylesheet" href="var-b.css?v=6"><link rel="stylesheet" href="var-h.css?v=4">'
        '<script src="br-hero-wow.js?v=5" defer></script><!-- /BR-HERO-20261116 -->')
s = re.sub(r'<!-- BR-HERO-20261116 -->.*?<!-- /BR-HERO-20261116 -->', '', s, flags=re.S)
m = re.search(r'<script src="br-home-redesign\.js[^"]*" defer></script>', s)
assert m, 'нет br-home-redesign.js'
s = s[:m.end()] + HEAD + s[m.end():]

assert s.count('<h1') == 1 and 'noindex' in s and s.count('id="br-home-start"') == 1
P.write_text(s, encoding='utf-8')
print('hero v1 ok')
