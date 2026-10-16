"""Publishable GitHub Pages review copy; production T123 blocks stay untouched."""
from pathlib import Path
from html import escape, unescape
from urllib.parse import urlsplit
from urllib.request import urlopen
from concurrent.futures import ThreadPoolExecutor
import json, re, hashlib, gzip

ROOT=Path(__file__).resolve().parents[2]
PRE=ROOT/'tools/out/bp-production-20261015'
OUT=ROOT/'prevyu/lid'
HOME='bp-production-preview.html'
CATALOG='bp-production-houses.html'
source=(OUT/'bp-glavnaya.html').read_text()
# Tilda's browser-side CDN fallback can delay scripts on preview domains. Keep
# the already-public export dependencies beside the GitHub review pages.
native=''.join((PRE/name).read_text() for name in ['index.html','houses.html'])
urls=sorted(set(re.findall(r'https://(?:static|static3|neo)\.tildacdn\.com/(?:js|css|ws)/[^\s\"\'<>]+',native)))
urls.append('https://static.tildacdn.com/tild3262-6436-4764-a235-366133623239/photo.svg')
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
guard=re.search(r'<script>\(function\(\)\{var ЗАПРЕТ=.*?</script>',source,re.S)
assert guard, 'The existing demo transport guard is required.'
head='<meta name="robots" content="noindex,nofollow">'+guard[0]+'''<script>
document.addEventListener('submit',function(event){
 event.preventDefault();event.stopImmediatePropagation();
 alert('Это предпросмотр: заявки отсюда не отправляются.');
},true);
</script>'''

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
    for url,local in replacements.items():html=html.replace(url,local)
    html=html.replace('https://static3.tildacdn.com/tild3262-6436-4764-a235-366133623239/photo.svg','bp-production-assets/logo.svg')
    html=html.replace('<head>','<head>'+head,1)
    html=re.sub(r'href=([\"\'])(.*?)\1',href,html)
    html=html.replace("const catalogueHref='/houses';","const catalogueHref='"+CATALOG+"';")
    html=html.replace("a.href='/#bb-stay'","a.href='"+HOME+"#bb-stay'")
    html=html.replace("a.href='/houses'","a.href='"+CATALOG+"'")
    assert 'content="noindex,nofollow"' in html
    assert 'заявки отсюда не отправляются' in html
    assert 'https://barskie-polya.ru/houses' in html if target==CATALOG else 'id="bp-production-hero"' in html
    (OUT/target).write_text(html)
    files[target]=hashlib.sha256(html.encode()).hexdigest()
(OUT/'bp-production-preview.json').write_text(json.dumps({'date':'2026-10-16','homepage':HOME,'catalog':CATALOG,'production_changed':False,'search_indexing':False,'lead_submissions':False,'files':files},ensure_ascii=False,indent=2))
print('Built protected review pages:',HOME,CATALOG)
