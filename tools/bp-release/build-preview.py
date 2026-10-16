"""Publishable GitHub Pages review copy; production T123 blocks stay untouched."""
from pathlib import Path
from html import escape, unescape
from urllib.parse import urlsplit
from urllib.request import urlopen
from concurrent.futures import ThreadPoolExecutor
import json, re, hashlib, gzip, base64
from preview_news import render_news

ROOT=Path(__file__).resolve().parents[2]
PRE=ROOT/'tools/out/bp-production-20261015'
OUT=ROOT/'prevyu/lid'
HOME='bp-production-preview.html'
CATALOG='bp-production-houses.html'
# Tilda's browser-side CDN fallback can delay scripts on preview domains. Keep
# the already-public export dependencies beside the GitHub review pages.
native=''.join((PRE/name).read_text() for name in ['index.html','houses.html'])
urls=sorted(set(re.findall(r'https://(?:static|static3|neo)\.tildacdn\.com/(?:js|css|ws)/[^\s\"\'<>]+',native)))
urls.append('https://static.tildacdn.com/tild3262-6436-4764-a235-366133623239/photo.svg')
# Keep section decorations local. Header icons retain their original production
# URLs and native rendering, as explicitly requested by the owner.
inline_art=[
 'https://static.tildacdn.com/tild3638-6438-4366-b766-613130643330/_.svg',
 'https://static.tildacdn.com/tild3533-3034-4864-a235-613732613230/___.svg',
]
urls.extend(inline_art)
news=json.loads((ROOT/'tools/bp-release/news-source.json').read_text())
urls.extend(post['image'] for post in news['posts'])
def asset(url):
    parsed=urlsplit(url);tail=parsed.path.lstrip('/')
    if tail.startswith('tild3262-'):tail='logo.svg'
    dest=OUT/'bp-production-assets'/tail
    if not dest.exists():
        with urlopen(url,timeout=30) as r:payload=r.read()
        if payload[:2]==b'\x1f\x8b':payload=gzip.decompress(payload)
        dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(payload)
    return url,'bp-production-assets/'+tail
replacements=dict(ThreadPoolExecutor(max_workers=6).map(asset,urls))
# CSS custom properties can be consumed in an external Tilda stylesheet. A
# relative --icon URL would then resolve inside ws/project8177746/. Embed the
# original small SVGs to keep both inline and external consumers independent
# of the stylesheet URL, in public review and localhost alike.
for remote in inline_art:
    replacements[remote]='data:image/svg+xml;base64,'+base64.b64encode((OUT/replacements[remote]).read_bytes()).decode()
# Cache the same Rubik faces requested by the production header. A review
# domain must not silently fall back to Arial when Google Fonts is delayed.
font_css_url='https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&subset=latin,cyrillic&display=swap'
font_css_path=OUT/'bp-production-assets/fonts/rubik.css'
if not font_css_path.exists():
    with urlopen(font_css_url,timeout=30) as r:font_css=r.read().decode()
    font_urls=sorted(set(re.findall(r'https://fonts\.gstatic\.com/[^\s\"\')]+',font_css)))
    font_replacements=dict(ThreadPoolExecutor(max_workers=6).map(asset,font_urls))
    for remote,local in font_replacements.items():
        # CSS is in fonts/, while gstatic paths retain their s/rubik/... layout.
        font_css=font_css.replace(remote,'../'+local.removeprefix('bp-production-assets/'))
    font_css_path.parent.mkdir(parents=True,exist_ok=True);font_css_path.write_text(font_css)
for remote in re.findall(r'https://fonts\.googleapis\.com/css2\?family=Rubik[^\s\"\'<>]+',native):
    replacements[remote]='bp-production-assets/fonts/rubik.css'
preview_forms=(ROOT/'tools/bp-release/preview-forms.js').read_text()
head='<meta name="robots" content="noindex,nofollow"><script>window.BPPreviewRoutes='+json.dumps({'home':HOME,'catalog':CATALOG,'winter':'bp-new-year.html'})+';</script><script>'+preview_forms+'</script><style>.bp-preview-form-result{margin-top:18px;padding:16px;border:1px solid #ee995d;border-radius:8px;background:#eee5d5;color:#28413a;font:400 14px/1.5 Rubik,Arial,sans-serif}.bp-preview-form-result[hidden]{display:none}</style>'

def href(match):
    value=unescape(match[2])
    if value=='/houses': target=CATALOG
    elif value=='/' or value.startswith('/?') or value.startswith('/#'): target=HOME+value[1:]
    elif value.startswith('/') and not value.startswith('//'): target='https://barskie-polya.ru'+value
    else: return match[0]
    return 'href='+match[1]+escape(target,quote=True)+match[1]

files={}
for original,target in [('index.html',HOME),('houses.html',CATALOG)]:
    html=(PRE/original).read_text()
    if original=='index.html':html=render_news(html,news['posts'])
    for url,local in replacements.items():html=html.replace(url,local)
    html=html.replace('https://static3.tildacdn.com/tild3262-6436-4764-a235-366133623239/photo.svg','bp-production-assets/logo.svg')
    html=html.replace('<head>','<head>'+head,1)
    # Rewrite actual HTML attributes, never selectors or HTML embedded in scripts.
    html=re.sub(r'<script\b[^>]*>.*?</script>|<[^>]+>',lambda m:m[0] if m[0].startswith('<script') else re.sub(r'href=([\"\'])(.*?)\1',href,m[0]),html,flags=re.S)
    html=html.replace("const catalogueHref='/houses';","const catalogueHref='"+CATALOG+"';")
    html=html.replace("a.href='/#bb-stay'","a.href='"+HOME+"#bb-stay'")
    html=html.replace("a.href='/houses'","a.href='"+CATALOG+"'")
    assert 'content="noindex,nofollow"' in html
    assert 'В демке заявка не отправляется.' in html
    assert 'https://barskie-polya.ru/houses' in html if target==CATALOG else 'id="bp-production-hero"' in html
    (OUT/target).write_text(html)
    files[target]=hashlib.sha256(html.encode()).hexdigest()
(OUT/'bp-production-preview.json').write_text(json.dumps({'date':'2026-10-16','homepage':HOME,'catalog':CATALOG,'production_changed':False,'search_indexing':False,'lead_submissions':False,'native_form_validation':True,'news_snapshot':news['fetched_at'],'files':files},ensure_ascii=False,indent=2))
print('Built protected review pages:',HOME,CATALOG)
