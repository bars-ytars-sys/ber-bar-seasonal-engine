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
ap.add_argument('--variant', default='chalet', help='chalet (одобрено) | aerial (вид сверху, отдельная страница)')
args = ap.parse_args()
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import calm
(DESK, _, _), (MOB, _, _), _, _, _ = calm.PHOTOS[args.variant][0]
if args.variant != 'chalet':
    HOME = 'bp-production-preview-%s.html' % args.variant
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
if args.variant == 'slides':
    calm_css += (OUT / 'bp-home-slides.css').read_text()
    calm_js += (OUT / 'bp-home-slides.js').read_text()
head = ('<meta name="robots" content="noindex,nofollow">'
        '<script>window.BPPreviewRoutes=' + json.dumps({'home': HOME, 'catalog': CATALOG, 'winter': 'bp-new-year.html'}) + ';</script>'
        '<script>' + preview_forms + '</script>'
        '<style>.bp-preview-form-result{margin-top:18px;padding:16px;border:1px solid #ee995d;border-radius:8px;background:#eee5d5;color:#28413a;font:400 14px/1.5 Rubik,Arial,sans-serif}.bp-preview-form-result[hidden]{display:none}</style>'
        '<link rel="preload" as="image" href="../../demo/assets/' + MOB + '" media="(max-width:640px)">'
        '<link rel="preload" as="image" href="../../demo/assets/' + DESK + '" media="(min-width:641px)">'
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

# ---------- 2–3. Первый экран и «Чёрная пятница» (общие правки calm.py) ----------
h1 = calm.H1
s, e = record(html, 'rec5032272401')
html = html[:s] + calm.hero(html[s:e], ASSETS, args.variant) + html[e:]
s, e = record(html, 'rec4596018801')
html = html[:s] + calm.promo(html[s:e]) + html[e:]

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
(OUT / HOME.replace('.html', '.json')).write_text(json.dumps(meta, ensure_ascii=False, indent=2))
print('Built', HOME, len(html), 'bytes; source', source_sha[:12])
