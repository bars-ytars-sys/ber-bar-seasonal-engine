"""Демка главной «Барских полей» 14.11.2026: спокойный первый экран и простая «Чёрная пятница».

Основа — свежая действующая главная barskie-polya.ru (не старая демка 3eaf4da и не
отклонённая 9ca2160). Защита демки та же, что в tools/bp-release/build-preview.py:
noindex, формы без отправки лидов и аналитики, локальные копии файлов Тильды.
Меняются только два T123-блока: первый экран (rec5032272401) и карточка/окно
«Чёрной пятницы» в блоке акций (rec4596018801). Шапка, H1, SEO, подбор дат,
Bnovo и формы остаются как на проде.

    python3 tools/bp-home-20261114/build.py [--source prod.html]
"""
from pathlib import Path
from html import escape, unescape
from urllib.parse import urlsplit
from urllib.request import urlopen, Request
from datetime import datetime, timezone
import argparse, base64, gzip, hashlib, json, re

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'prevyu/lid'
HOME, CATALOG = 'bp-production-preview.html', 'bp-production-houses.html'
RECORD_OUT = ROOT / 'tools/out/bp-home-20261114'
ASSETS = '../../demo/assets/'  # демка на GitHub Pages; при переносе в Тильду — абсолютные адреса Pages

ap = argparse.ArgumentParser()
ap.add_argument('--source', help='сохранённый HTML действующей главной')
args = ap.parse_args()
if args.source:
    source = Path(args.source).read_text(encoding='utf-8')
else:
    req = Request('https://barskie-polya.ru/', headers={'User-Agent': 'Mozilla/5.0 (review build)'})
    with urlopen(req, timeout=60) as r:
        source = r.read().decode('utf-8')
    RECORD_OUT.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    (RECORD_OUT / f'prod-{stamp}.html').write_text(source, encoding='utf-8')
source_sha = hashlib.sha256(source.encode()).hexdigest()
html = source


def element(text, start, tag='div'):
    """Границы элемента, начинающегося в start (учёт вложенных одноимённых тегов)."""
    depth, i = 0, start
    pat = re.compile(r'<(/?)%s\b[^>]*>' % tag)
    for m in pat.finditer(text, start):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return start, m.end()
    raise AssertionError('незакрытый ' + tag)


def record(text, rid):
    i = text.index('<div id="%s"' % rid)
    return element(text, i)


def one(text, old, new):
    assert text.count(old) == 1, (old[:60], text.count(old))
    return text.replace(old, new)


# ---------- 1. Защита демки (как в build-preview.py) ----------
urls = sorted(set(re.findall(r'https://(?:static|static3|neo)\.tildacdn\.com/(?:js|css|ws)/[^\s"\'<>]+', html)))
urls.append('https://static.tildacdn.com/tild3262-6436-4764-a235-366133623239/photo.svg')
inline_art = [
    'https://static.tildacdn.com/tild3534-3964-4934-b366-373533633666/__.svg',
    'https://static.tildacdn.com/tild3465-6235-4235-a330-633831396535/____ight_1.svg',
    'https://static.tildacdn.com/tild3765-6136-4365-b030-396362323066/____ight.svg',
    'https://static.tildacdn.com/tild3638-6438-4366-b766-613130643330/_.svg',
    'https://static.tildacdn.com/tild3533-3034-4864-a235-613732613230/___.svg',
]
replacements = {}
for url in urls + inline_art:
    tail = urlsplit(url).path.lstrip('/')
    if tail.startswith('tild3262-'):
        tail = 'logo.svg'
    dest = OUT / 'bp-production-assets' / tail
    # Блоки страницы (ws/) меняются при каждой публикации — берём актуальную версию.
    if not dest.exists() or '/ws/' in url:
        with urlopen(url, timeout=60) as r:
            payload = r.read()
        if payload[:2] == b'\x1f\x8b':
            payload = gzip.decompress(payload)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(payload)
    replacements[url] = 'bp-production-assets/' + tail
for remote in inline_art:
    replacements[remote] = 'data:image/svg+xml;base64,' + base64.b64encode((OUT / replacements[remote]).read_bytes()).decode()
for remote in re.findall(r'https://fonts\.googleapis\.com/css2\?family=Rubik[^\s"\'<>]+', html):
    replacements[remote] = 'bp-production-assets/fonts/rubik.css'
for url, local in sorted(replacements.items(), key=lambda kv: -len(kv[0])):
    html = html.replace(url, local)
html = html.replace('https://static3.tildacdn.com/tild3262-6436-4764-a235-366133623239/photo.svg', 'bp-production-assets/logo.svg')

preview_forms = (ROOT / 'tools/bp-release/preview-forms.js').read_text()
# Демка не шлёт и статистику Тильды (stat.tildaapi.com/event).
preview_forms = one(preview_forms, r'stat\.tildacdn|tildastat', r'stat\.tildacdn|stat\.tildaapi|tildastat')
calm_css = (OUT / 'bp-home-calm.css').read_text()
calm_js = (OUT / 'bp-home-calm.js').read_text()
head = ('<meta name="robots" content="noindex,nofollow">'
        '<script>window.BPPreviewRoutes=' + json.dumps({'home': HOME, 'catalog': CATALOG, 'winter': 'bp-new-year.html'}) + ';</script>'
        '<script>' + preview_forms + '</script>'
        '<style>.bp-preview-form-result{margin-top:18px;padding:16px;border:1px solid #ee995d;border-radius:8px;background:#eee5d5;color:#28413a;font:400 14px/1.5 Rubik,Arial,sans-serif}.bp-preview-form-result[hidden]{display:none}</style>'
        '<link rel="preload" as="image" href="../../demo/assets/bp-home-chalet-light-mobile-20261114.webp" media="(max-width:640px)">'
        '<link rel="preload" as="image" href="../../demo/assets/bp-home-chalet-light-20261114.webp" media="(min-width:641px)">'
        '<script>' + calm_js + '</script>')
html = html.replace('<head>', '<head>' + head, 1)


def href(match):
    value = unescape(match[2])
    if value == '/houses':
        target = CATALOG
    elif value == '/' or value.startswith('/?') or value.startswith('/#'):
        target = HOME + value[1:]
    elif value.startswith('/') and not value.startswith('//'):
        target = 'https://barskie-polya.ru' + value
    else:
        return match[0]
    return 'href=' + match[1] + escape(target, quote=True) + match[1]


html = re.sub(r'<script\b[^>]*>.*?</script>|<[^>]+>',
              lambda m: m[0] if m[0].startswith('<script') else re.sub(r'href=(["\'])(.*?)\1', href, m[0]),
              html, flags=re.S)
html = html.replace("const catalogueHref='/houses';", "const catalogueHref='" + CATALOG + "';")
html = html.replace("a.href='/#bb-stay'", "a.href='" + HOME + "#bb-stay'")
html = html.replace("a.href='/houses'", "a.href='" + CATALOG + "'")
for number in ['1', '4']:
    html = html.replace('https://barskie-polya.ru/gardens/garden' + number, 'bp-gardens.html?v=20261021b#bp-garden' + number)

# ---------- 2. Первый экран ----------
s, e = record(html, 'rec5032272401')
hero = html[s:e]
h1 = re.search(r'<h1 class="bp-hero__eyebrow">(.*?)</h1>', hero).group(1)
assert h1 == 'База отдыха «Барские поля» в Подмосковье', h1
assert 'Дом от 9 900 ₽ за ночь в будни' in hero and 'href="#popup:quiz"' in hero
m_start = hero.index('<div class="bp-hero__medals"')
medals = hero[slice(*element(hero, m_start))]
medals = medals.replace('class="bp-hero__medals"', 'class="bp-calm__awards"', 1)
medals = re.sub(r'<br\s*/?>', ' ', medals)
medals = one(medals, '<strong class="bp-hero__top30">ТОП-30</strong><small>отелей по версии Siva Travel</small>',
             '<strong class="bp-hero__top30">ТОП-30 отелей</strong><small>по версии Siva Travel</small>')
catalogue = re.search(r'<a class="bp-hero__catalogue" href="([^"]+)"', hero).group(1)
# Три факта с сайта (каталог 15 домов; блок «О домах»), иконки — тонкая линия в цвете БП.
ICON = '<svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{}</svg>'
FACTS = (
    '<ul class="bp-calm__facts">'
    '<li>' + ICON.format('<path d="M4 34h32"/><path d="M8 34V20l9-7 9 7v14"/><path d="M14 34v-7h6v7"/><path d="M32 34v-5"/><path d="M32 9l-4.5 9h9z"/><path d="M32 14l-5.5 11h11z"/>') + '<span>15 домов в лесу</span></li>'
    '<li>' + ICON.format('<path d="M7 22h26"/><path d="M9 22l1.6 12h18.8L31 22"/><path d="M10 28h20"/><path d="M15 18c-2-3 2-5 0-8"/><path d="M20 18c-2-3 2-5 0-8"/><path d="M25 18c-2-3 2-5 0-8"/>') + '<span>Терраса и банный чан у каждого дома</span></li>'
    '<li>' + ICON.format('<path d="M7 34V21l13-9 13 9v13z"/><path d="M7 25.5h26"/><path d="M7 29.8h26"/><path d="M17 34v-6h6v6"/><path d="M27 17.5V11h3v8.6"/><path d="M28.5 8c-1.5-2 1.5-3 0-5"/>') + '<span>Дома с собственной баней</span></li>'
    '</ul>')
new_hero = (
    '<div id="bp-production-hero" class="r t-rec bp-hero-record bp-calm-record">'
    '<div class="bp-calm">'
    '<picture class="bp-calm__photo">'
    '<source media="(max-width:640px)" srcset="' + ASSETS + 'bp-home-chalet-light-mobile-20261114.webp" width="1086" height="1448">'
    '<img src="' + ASSETS + 'bp-home-chalet-light-20261114.webp" width="1680" height="1120" alt="Шале «Барских полей»: дом с террасой в лесу" fetchpriority="high" decoding="async">'
    '</picture><div class="bp-calm__shade" aria-hidden="true"></div>'
    '<div class="bp-calm__content">'
    '<h1 class="bp-calm__eyebrow">' + h1 + '</h1>'
    '<p class="bp-calm__title">Уединённый отдых в лесу</p>'
    '<p class="bp-calm__lead">Дома с полностью или частично огороженной территорией. Час от Москвы по Новорижскому шоссе.</p>'
    '<div class="bp-calm__cta"><a class="bp-calm__btn" href="#bb-stay" data-bb-planner>Выбрать дом</a>'
    '<span class="bp-calm__price"><b>от 9 900 ₽</b>за ночь в будни</span></div>'
    '<p class="bp-calm__links"><a href="' + catalogue + '">Каталог всех домов</a><a href="#popup:quiz">Сертификат за опрос</a></p>'
    '</div></div>' + FACTS + medals + '</div>')
inner_s = hero.index('<div id="bp-production-hero"')
inner = hero[slice(*element(hero, inner_s))]
hero = hero.replace(inner, new_hero)
html = html[:s] + hero + html[e:]

# ---------- 3. «Чёрная пятница» ----------
s, e = record(html, 'rec4596018801')
promo = html[s:e]
card_s = promo.index('<!-- BP-BLACK-FRIDAY-CARD:START -->')
card_e = promo.index('<!-- BP-BLACK-FRIDAY-CARD:END -->')
card = promo[card_s:card_e]
photo = re.search(r'<div class="bo-pic bo-bf__photo">.*?</div>', card, re.S).group(0)
timer = card[slice(*element(card, card.index('<div class="bo-bf__countdown"')))]
assert 'data-start="2026-11-10T00:00:00+03:00" data-end="2026-11-17T00:00:00+03:00"' in timer
for label, short in [('дней', 'д'), ('часов', 'ч'), ('минут', 'м'), ('секунд', 'с')]:
    timer = one(timer, '<small>' + label + '</small>', '<small>' + short + '</small>')
assert 'с 10 по 16 ноября включительно' in card and 'до 30 ноября включительно' in card
new_card = (
    '<!-- BP-BLACK-FRIDAY-CARD:START -->'
    '<article class="bo-card bo-bf" id="bo-black-friday" aria-labelledby="bo-bf-title">' + photo +
    '<div class="bo-body">'
    '<h3 class="bo-t" id="bo-bf-title">Чёрная пятница</h3>'
    '<p class="bp-calm-bf__gift">Чан в подарок</p>'
    '<p class="bp-calm-bf__lead">Для новых броней с 10 по 16 ноября на 2 ночи в будни. Проживание — до 30 ноября включительно.</p>'
    + timer +
    '<a class="bo-btn" href="#zayavka" data-bp-black-friday aria-label="Подобрать дом по акции «Чёрная пятница»">Подобрать дом по акции</a>'
    '<p class="bo-terms">Бронь нужно оформить с 10 по 16 ноября включительно. В подарок — классический чан без наполнения. '
    'На ранее оформленные брони акция не распространяется. Акции не суммируются.</p>'
    '</div></article>')
promo = promo[:card_s] + new_card + promo[card_e:]

# Окно: те же факты, без повторов и лишних уровней текста.
body_s = promo.index('<div class="bp-bf-popup__body">')
body = promo[slice(*element(promo, body_s))]
new_body = (
    '<div class="bp-bf-popup__body">'
    '<h2 id="bp-bf-popup-title">Чёрная пятница</h2>'
    '<p class="bp-calm-bf__gift">Чан в подарок</p>'
    '<p class="bp-calm-bf__lead" id="bp-bf-popup-conditions">Для новых броней с 10 по 16 ноября на 2 ночи в будни. Проживание — до 30 ноября включительно.</p>'
    '<div data-bf-popup-timer-slot></div>'
    '<a class="bo-btn bp-bf-popup__cta" href="#zayavka" data-bp-black-friday>Подобрать дом по акции</a>'
    '<p class="bp-bf-popup__fine">В подарок — классический чан без наполнения. На ранее оформленные брони акция не распространяется. Акции не суммируются.</p>'
    '</div>')
promo = promo.replace(body, new_body)
promo = one(promo, 'setTimeout(autoShow, 4500);', '(window.bpCalmAutoShow || (run => setTimeout(run, 4500)))(autoShow);')
promo = one(promo, "description.textContent = 'Чёрная пятница в «Барских полях»: 10–16 ноября. Классический чан без наполнения в подарок только при оформлении новой брони с 10 по 16 ноября включительно на 2 ночи в будни с проживанием до 30 ноября включительно. На ранее оформленные брони акция не распространяется. Акции не суммируются. Оставьте контакты — поможем выбрать дом и даты.';",
            "description.textContent = 'Для новых броней с 10 по 16 ноября на 2 ночи в будни, проживание до 30 ноября. Оставьте контакты — подберём дом и даты.';")
promo = one(promo, "'До конца Чёрной пятницы'", "'До конца акции'")
promo = one(promo, "'До начала Чёрной пятницы'", "'До начала акции'")
promo = one(promo, '<p class="bo-bf__countdown-label" data-bf-countdown-label>До начала Чёрной пятницы</p>',
            '<p class="bo-bf__countdown-label" data-bf-countdown-label>До конца акции</p>')
html = html[:s] + promo + html[e:]

# Стили — последними в документе, чтобы перекрыть прежние правила блоков.
html = one(html, '</body>', '<style id="bp-home-calm-20261114">' + calm_css + '</style></body>')

# ---------- 4. Проверки ----------
assert 'content="noindex,nofollow"' in html
assert 'В демке заявка не отправляется.' in html
assert len(re.findall(r'<h1\b', html)) == 1 and '>' + h1 + '</h1>' in html
assert re.search(r'<title>База отдыха «Барские поля» в Подмосковье — домики в лесу</title>', html)
for rid in ['rec1185050691', 'rec1185050696', 'rec5032383501', 'rec2806976901', 'rec924514671', 'rec1655233561']:
    record(html, rid)  # родные блоки на месте
assert html.count('data-bp-black-friday') >= 2 and 'data-bb-planner' in html

(OUT / HOME).write_text(html, encoding='utf-8')
meta = {
    'date': '2026-11-14', 'homepage': HOME, 'catalog': CATALOG,
    'base': 'live https://barskie-polya.ru/ ' + source_sha,
    'changed_records': ['rec5032272401 first screen', 'rec4596018801 Black Friday card and popup'],
    'production_changed': False, 'search_indexing': False, 'lead_submissions': False,
    'files': {HOME: hashlib.sha256(html.encode()).hexdigest()},
}
(OUT / 'bp-production-preview.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2))
print('Built', HOME, len(html), 'bytes; source', source_sha[:12])
