"""Read-only release gates: local, catalog-first, and published homepage."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
from urllib.robotparser import RobotFileParser
import argparse, json, re, sys
from seo import Page, normal

HERE=Path(__file__).resolve().parent
PACK=HERE.parent if (HERE.parent/'manifest.json').exists() else HERE.parents[1]/'tilda/bp-production-20261015'
ROOT=next((p for p in HERE.parents if (p/'tools/bp-release/prepare.py').is_file()),None)
manifest=json.loads((PACK/'manifest.json').read_text())
expected=json.loads((PACK/'06-SEO-ГЛАВНАЯ.json').read_text())
catalog=json.loads((PACK/'03-SEO-КАТАЛОГ.json').read_text())
HOME=manifest['home']; CATALOG=manifest['catalog']
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--stage',choices=['local','catalog','live'],default='local' if ROOT else 'catalog')
parser.add_argument('--output',type=Path)
args=parser.parse_args(); checks=[]

def check(name, passed, detail=''):
    checks.append({'check':name,'passed':bool(passed),'detail':detail})

def fetch(url):
    try:
        with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; BP-release-check/1.0)'}),timeout=30) as r:
            return r.status, r.url, r.read().decode('utf-8','replace'), dict(r.headers)
    except HTTPError as e:
        return e.code, e.url, '', dict(e.headers)
    except Exception as e:
        return 0, url, '', {'error':str(e)}

def paths(page):
    return {urlsplit(urljoin(HOME,u)).path for u in page.links if urlsplit(urljoin(HOME,u)).hostname==urlsplit(HOME).hostname}

def header_blocks(headers):
    value=next((v for k,v in headers.items() if k.lower()=='x-robots-tag'),'')
    return bool(re.search(r'(?:^|[,;:\s])(?:noindex|none)(?:$|[,;\s])',value,re.I))

def head_matches(page):
    return page.head_signature()=={k:expected[k] for k in ['title','meta','canonical','schema']}

def check_home(page,html):
    check('Главная: прежние title/meta/canonical/JSON-LD',head_matches(page))
    check('Главная: единственный H1 полностью совпадает с продом',page.h1()==[expected['h1']],str(page.h1()))
    check('Главная: пять родных форм сохранены',page.forms==manifest['native_forms_preserved'])
    check('Главная: нет запрета индексации',not page.blocked())
    check('Главная: исходный HTML содержит все 15 домов',len(re.findall(r'<article\b[^>]*class="bph-card"',html))==15)
    intro=re.search(r'<section class="bp-home-intro".*?</section>',html,re.S)
    intro_text=normal(' '.join(Page(intro[0]).text)) if intro else ''
    check('Главная: прежнее описание домов сохраняется вне JS-календаря',all(t in intro_text for t in manifest['house_intro_preserved']))
    check('Главная: действуют старый якорь #houses и новый #bb-stay','id="houses"' in html and 'id="bb-stay"' in html)
    check('Главная: основная кнопка ведёт в календарь без демо-скриптов',bool(re.search(r'<a[^>]+class="bp-hero__btn bp-hero__btn--primary"[^>]+href="#bb-stay"',html)))

def check_catalog(page,html,headers=None):
    check('Каталог: правильный title и description',page.title==catalog['title'] and page.description()==catalog['description'])
    check('Каталог: canonical указывает на /houses',page.canonical==[CATALOG])
    check('Каталог: один H1',page.h1()==['Каталог домов'])
    check('Каталог: нет meta/X-Robots-Tag noindex',not page.blocked() and not header_blocks(headers or {}))
    check('Каталог: 15 статических карточек домов',len(re.findall(r'<article\b[^>]*class="bph-card"',html))==15)
    selections=re.findall(r'href="/\?house=([^"&#]+)#bb-stay"',html)
    check('Каталог: 15 разных домов ведут на главную с выбранным домом',len(set(selections))==15)
    check('Каталог: нет ссылок на демку/локальные HTML',not re.search(r'href="(?:bp-|houses\.html|http://127\.)',html))

if args.stage=='local':
    if ROOT is None:
        parser.error('Локальная проверка запускается из проекта; из архива используйте --stage catalog или --stage live.')
    preview=ROOT/'tools/out/bp-production-20261015'
    html=(preview/'index.html').read_text(); home=Page(html)
    check_home(home,html)
    cat_html=(preview/'houses.html').read_text(); check_catalog(Page(cat_html),cat_html)
    baseline=Page((ROOT/manifest['baseline']).read_text())
    check('Существующие внутренние адреса не удалены',paths(baseline)<=paths(home),str(sorted(paths(baseline)-paths(home))))
    robots=(PACK/'05-ROBOTS-ОЖИДАЕМЫЙ.txt').read_text()
    original=(ROOT/'tools/out/bp-seo-review-20261016/robots.txt').read_text()
    wanted=[s for s in original.splitlines() if not re.fullmatch(r'\s*Disallow:\s*/houses\s*',s)]
    check('robots: удалён только запрет /houses, остальные правила сохранены',robots.splitlines()==wanted)
    for file in ['01-ГЛАВНАЯ-T123.html','02-КАТАЛОГ-T123.html','04-ПРОГРАММЫ-T123.html']:
        s=(PACK/file).read_text();s=re.sub(r'<!--.*?-->','',s,flags=re.S)
        check(file+': нет демо-перехвата заявок и запрета индексации',not re.search(r'noindex|demo-polish|__qa_form|XMLHttpRequest\.prototype|BBStayDemoGuard',s,re.I))
else:
    status,final,html,headers=fetch(CATALOG)
    check('Каталог: HTTP 200 по правильному адресу',status==200 and final.rstrip('/')==CATALOG,str(status)+' '+final)
    if status==200: check_catalog(Page(html),html,headers)
    status,_,robots,_=fetch(urljoin(HOME,'robots.txt'))
    check('robots.txt доступен',status==200,str(status))
    status,_,sitemap,_=fetch(urljoin(HOME,'sitemap.xml'))
    check('sitemap.xml доступен',status==200,str(status))
    check('Каталог указан в опубликованном sitemap',CATALOG in re.findall(r'<loc>(.*?)</loc>',sitemap))
    status,_,html,headers=fetch(HOME)
    check('Главная доступна и не закрыта HTTP-заголовком',status==200 and not header_blocks(headers),str(status))
    if status==200:
        if args.stage=='live': check_home(Page(html),html)
        else:
            page=Page(html)
            check('Главная до переноса: прежние SEO-поля и H1',head_matches(page) and page.h1()==[expected['h1']])

rules=RobotFileParser();rules.parse(robots.splitlines())
for ua in ['YandexBot','Googlebot','*']:
    check('robots: '+ua+' может обходить /houses',rules.can_fetch(ua,CATALOG))

result={'stage':args.stage,'passed':all(c['passed'] for c in checks),'checks':checks,'production_changed':False}
if args.output:
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2))
for c in checks:
    print(('OK   ' if c['passed'] else 'FAIL ')+c['check']+(': '+c['detail'] if c['detail'] else ''))
print(('ГОТОВО' if result['passed'] else 'НЕ ПУБЛИКОВАТЬ ГЛАВНУЮ')+' — '+str(sum(c['passed'] for c in checks))+'/'+str(len(checks)))
sys.exit(0 if result['passed'] else 1)
