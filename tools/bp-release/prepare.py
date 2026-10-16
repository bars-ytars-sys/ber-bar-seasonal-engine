"""Build isolated Tilda production blocks; never edits the public demo or publishes."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
import re,json,shutil,hashlib
from seo import Page
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'tilda/bp-production-20261015'
AS=OUT/'assets';AS.mkdir(parents=True,exist_ok=True)
SRC=ROOT/'prevyu/lid';demo=(SRC/'bp-glavnaya.html').read_text()
BASELINE=ROOT/'tools/out/bp-seo-review-20261016/live.html'
live=BASELINE.read_text()
live_page=Page(live)
assert len(live_page.h1())==1, 'Release requires a single verified live H1.'
live_h1=live_page.h1()[0]
class Records(HTMLParser):
 def __init__(self,s):
  super().__init__(convert_charrefs=False);self.s=s;self.offsets=[0]+[m.end() for m in re.finditer('\n',s)];self.stack=[];self.spans={};self.feed(s)
 def pos(self):l,c=self.getpos();return self.offsets[l-1]+c
 def handle_starttag(self,t,a):
  if t=='div':self.stack.append((dict(a),self.pos()))
 def handle_endtag(self,t):
  if t=='div' and self.stack:
   a,start=self.stack.pop();ident=a.get('id','')
   if re.fullmatch(r'rec\d+',ident):self.spans[ident]=(start,self.pos()+6)
records=Records(live).spans
# Release assets are independent from demo assets. No source demo guards are copied.
for name in ['stay-core.js','bp-calendar.js','bp-stay.js','stay-planner.css','bp-calendar.css','bp-layout.js']:
 shutil.copyfile(SRC/name,AS/name)
shutil.copyfile(ROOT/'tools/bp-release/native-navigation.js',AS/'native-navigation.js')
shutil.copyfile(ROOT/'tools/bp-release/native-header.css',AS/'native-header.css')
shutil.copyfile(ROOT/'tools/bp-release/native-form-validation.js',AS/'native-form-validation.js')
data=json.loads((SRC/'stay-data.js').read_text().split('=',1)[1].strip().rstrip(';'))
# No static rates in the release: the public calendar provides current base rates.
for h in data['bp']:
 for k in list(h):
  if 'price' in k.lower() or k in ['weekday','weekend']:h.pop(k)
(AS/'stay-data.js').write_text('window.BBStayData = '+json.dumps({'bp':data['bp']},ensure_ascii=False)+';\n')
core=(AS/'stay-core.js').read_text()
core=core.replace("String(Math.min(10,Math.max(1,Number(state.guests)||2)))","String(party.adults)")
core=core.replace("    const uid=brand===", "    const party=validateParty(state,houses);\n    const uid=brand===")
core=core.replace("    u.searchParams.set('dfrom',date(state.arrival));", "    u.searchParams.set('children',JSON.stringify(party.children));\n    u.searchParams.set('dfrom',date(state.arrival));")
core=core.replace("  function availabilityUrl(brand, state, houses) {", """  function validateParty(state,houses=[]) {
    const adults=Number(state.adults??2),children=state.children??[];
    if(!Number.isInteger(adults)||adults<1||adults>6||!Array.isArray(children)||children.some(a=>!Number.isInteger(a)||a<0||a>17)||adults+children.length>6)throw new Error('Укажите взрослых и возраст каждого ребёнка. В одном доме — до 6 гостей.');
    if(houses.some(h=>h.capacity<adults+children.length))throw new Error('Выбранный дом не вмещает всех гостей.');
    return {adults,children};
  }
  function availabilityUrl(brand, state, houses) {""")
core=core.replace('matches,bookingUrl,availabilityUrl','matches,bookingUrl,availabilityUrl,validateParty')
(AS/'stay-core.js').write_text(core)
cal=(AS/'bp-calendar.js').read_text()
cal=cal.replace("if(!closed.closed_dates_with_reasons||!prices.min_prices||typeof prices.min_prices!=='object')", "const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);\n   if(!object(closed?.closed_dates_with_reasons)||!object(closed.closed_dates_with_reasons.closed_dates)||!object(prices?.min_prices))")
cal=cal.replace('closed.closed_dates_with_reasons.closed_dates||{}','closed.closed_dates_with_reasons.closed_dates')
cal=cal.replace("if(!arrival||!departure||departure<=arrival)","if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(arrival||'')||!/^\\d{4}-\\d{2}-\\d{2}$/.test(departure||'')||iso(date(arrival))!==arrival||iso(date(departure))!==departure||departure<=arrival)")
(AS/'bp-calendar.js').write_text(cal)
stay=(AS/'bp-stay.js').read_text()
stay=stay.replace("const state={guests:2,", "const state={adults:2,children:[],guests:2,")
a=stay.index(' const catalogueHref=');b=stay.index(' function mount()',a)
stay=stay[:a]+" const catalogueHref='/houses';\n"+stay[b:]
stay=stay.replace("  const target=document.querySelector('#bp-doma');if(!target)return;\n  section=document.createElement('section');section.id='bb-stay';section.className='bst bst-section bpc-section';section.dataset.brand='bp';", "  section=document.querySelector('#bb-stay');if(!section)return;")
stay=stay.replace('<label>Всего гостей<select data-guests>${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${i===1?\'selected\':\'\'}>${i+1}</option>`).join(\'\')}</select></label>', '<label>Взрослые<select data-adults aria-label="Взрослые">${Array.from({length:6},(_,i)=>`<option value="${i+1}" ${i===1?\'selected\':\'\'}>${i+1}</option>`).join(\'\')}</select></label><label>Дети<select data-children aria-label="Количество детей">${Array.from({length:5},(_,i)=>`<option value="${i}">${i===0?\'Без детей\':i}</option>`).join(\'\')}</select></label>')
stay=stay.replace('</div><details class="bst-preferences" open>','</div><div class="bpc-child-ages" aria-live="polite"></div><details class="bst-preferences" open>',1)
a=stay.index('  target.before(section);');b=stay.index("  document.querySelectorAll('a[href=\"#bb-podbor",a)
stay=stay[:a]+stay[b:]
stay=stay.replace("a[href=\"#bp-doma\"],a[href=\"https://barskie-polya.ru/#houses\"]", "a[href=\"#bp-doma\"],a[href=\"https://barskie-polya.ru/#houses\"],a[href=\"#houses\"]")
stay=stay.replace("a[data-bb-planner],a[href=\"#bb-stay\"]", "a[data-bb-planner],a[href=\"#bb-stay\"],a[href=\"#houses\"]")
stay=stay.replace("if(e.target.matches('[data-guests]')){draft.guests=Number(e.target.value);pending();}", """if(e.target.matches('[data-adults],[data-children]')){
   draft.adults=Number(section.querySelector('[data-adults]').value);
   const select=section.querySelector('[data-children]'),max=6-draft.adults;
   [...select.options].forEach(o=>o.disabled=Number(o.value)>max);
   const count=Math.min(Number(select.value),max);select.value=String(count);
   draft.children=Array.from({length:count},(_,i)=>draft.children[i]??null);draft.guests=draft.adults+count;
   childAges();pending();
  }
  if(e.target.matches('[data-child-age]')){draft.children[Number(e.target.dataset.childAge)]=e.target.value===''?null:Number(e.target.value);pending();}""")
stay=stay.replace(" function pending(){", """ function childAges(){section.querySelector('.bpc-child-ages').innerHTML=draft.children.map((age,i)=>`<label>Возраст ребёнка ${i+1}<select data-child-age="${i}" aria-label="Возраст ребёнка ${i+1}"><option value="">Укажите возраст</option>${Array.from({length:18},(_,a)=>`<option value="${a}" ${age===a?'selected':''}>${a===0?'До года':a}</option>`).join('')}</select></label>`).join('');}
 function pending(){""")
stay=stay.replace(" function apply(){Object.assign(state,{guests:draft.guests,", " function apply(){try{core.validateParty(draft);}catch(e){section.querySelector('.bpc-apply-note').textContent=e.message;section.querySelector('[data-child-age]')?.focus();return;}Object.assign(state,{adults:draft.adults,children:[...draft.children],guests:draft.guests,")
# When draft changes, prevent booking for stale guest counts.
stay=stay.replace("function pending(){section", "function pending(){section.querySelectorAll('[data-book]').forEach(b=>b.disabled=true);section")
stay=stay.replace("let section,limit=3,globalMonth=firstMonth,observer;", "let section,limit=3,globalMonth=firstMonth;")
stay=stay.replace("render();if((window.BBStayInitialHash||location.hash)==='#bb-stay')section.scrollIntoView();", "render();if(['#bb-stay','#houses'].includes(location.hash))section.scrollIntoView();")
(AS/'bp-stay.js').write_text(stay)
layout=(AS/'bp-layout.js').read_text()
layout=layout.replace('<span class="bp-heading-garland"><img src="${garland}" alt="" width="383" height="163" loading="lazy"></span>','<span class="bp-heading-garland" style="background-image:url(${garland})"></span>')
layout=layout.replace('<span class="bp-heading-forest"><img src="${forest}" alt="" width="417" height="129" loading="lazy"></span>','<span class="bp-heading-forest" style="background-image:url(${forest})"></span>')
layout=layout.replace('<span class="bp-heading-garland bp-heading-garland--right"><img src="${garland}" alt="" width="383" height="163" loading="lazy"></span>','<span class="bp-heading-garland bp-heading-garland--right" style="background-image:url(${garland})"></span>')
(AS/'bp-layout.js').write_text(layout)
print('Release source assets prepared:',AS)
# CSS parser keeps only component styles and its font faces; native Tilda header stays untouched.
def filter_css(css):
 css=re.sub(r'/\*.*?\*/','',css,flags=re.S);result=[];i=0
 while i<len(css):
  p=css.find('{',i)
  if p<0:break
  head=css[i:p].strip();depth=1;q=p+1;quote=None
  while q<len(css) and depth:
   ch=css[q]
   if quote:
    if ch==quote and css[q-1]!='\\':quote=None
   elif ch in "\"'":quote=ch
   elif ch=='{':depth+=1
   elif ch=='}':depth-=1
   q+=1
  body=css[p+1:q-1]
  if head.startswith('@media') or head.startswith('@supports'):
   inner=filter_css(body)
   if inner:result.append(head+'{'+inner+'}')
  elif head.startswith('@font-face'):result.append(head+'{'+body+'}')
  elif not head.startswith('@'):
   sels=[s.strip() for s in head.split(',') if '.bp-hero' in s or s.strip()==':root']
   if sels:result.append(','.join(sels)+'{'+body+'}')
  i=q
 return '\n'.join(result)
basic=re.search(r'<style id="bp-hero-custom-style">(.*?)</style>',demo,re.S)[1]
hero_css=filter_css(basic+'\n'+(SRC/'bp-hero-authentic.css').read_text())
hero_css+='''
.bp-hero__eyebrow{display:block!important;font:400 12px/1.5 'BPProductionRubik',Arial,sans-serif;letter-spacing:.1em;margin:0 0 14px;color:#eee5d5;max-width:100%}
.bp-hero__logo-icon{display:none!important}
.bp-home-intro{box-sizing:border-box;background:#28413a;color:#eee5d5;padding:30px max(20px,calc((100% - 1100px)/2));font:400 16px/1.65 'BPProductionRubik',Arial,sans-serif;text-align:center}
.bp-home-intro p{max-width:940px;margin:0 auto 12px}.bp-home-intro p:last-of-type{color:#d3ccbe;font-size:14px}.bp-home-intro nav{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 20px;margin-top:18px}.bp-home-intro a{color:#f1bb8e!important;text-decoration:underline;text-underline-offset:4px;font-size:14px}
.bp-hero{min-height:650px;height:calc(var(--bp-screen,100svh) - var(--bp-header-height,76px) - var(--bp-bottom-height,0px))}
@media(max-width:640px){.bp-hero{min-height:550px;height:auto;padding:24px 18px 30px}body:has(#bp-production-hero) #rec1916160711{display:none!important}.bp-hero__eyebrow{font-size:9px;margin-bottom:12px}.bp-hero__medals{flex-wrap:nowrap;gap:16px}.bp-hero__medal{flex:0 0 64px;width:64px;height:64px}.bp-hero__content{max-width:100%}.bp-hero__actions{grid-template-columns:1fr;width:100%;max-width:360px}.bp-hero__title{font-size:clamp(28px,7.7vw,42px)}.bp-hero__lead{font-size:14px}.bp-hero__catalogue{justify-self:center}}
@media(max-width:360px){.bp-hero{min-height:560px}.bp-hero__lead{font-size:13px}.bp-hero__price-sub{font-size:11px}}
'''
(AS/'hero.css').write_text(hero_css)
# The production header is the unchanged native header from the live page.
hero=demo.split('<!-- BP-HERO-FULLSCREEN:START -->',1)[1].split('<!-- BP-HERO-FULLSCREEN:END -->',1)[0]
hero=hero.replace('id="rec1538220631"','id="bp-production-hero"').replace('data-record-type="396"','')
# Keep the exact production H1 visible; the large visual slogan remains in place.
hero,n=re.subn(r'<p class="bp-hero__eyebrow">.*?</p>',lambda _: '<h1 class="bp-hero__eyebrow">'+escape(live_h1)+'</h1>',hero,count=1,flags=re.S)
assert n==1, 'Missing hero eyebrow for the preserved H1.'
hero,n=re.subn(r'<h1 class="bp-hero__title">(.*?)</h1>',r'<p class="bp-hero__title">\1</p>',hero,count=1,flags=re.S)
assert n==1, 'Missing visual hero title.'
hero=re.sub(r'\s+data-(desktop|mobile)-mp4="[^"]*"','',hero)
hero=hero.replace('href="bp-houses.html"','href="/houses"')
# The standalone production block must keep its main action without demo scripts.
hero=hero.replace('<div class="bp-hero__actions">','<div class="bp-hero__actions"><a class="bp-hero__btn bp-hero__btn--primary" href="#bb-stay" data-bb-planner>Выбрать дом</a>',1)
poster='https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/bp-hero-new-houses-20261010-poster.webp'
hero=hero.replace('class="bp-hero__bg"','class="bp-hero__bg" style="background-image:url('+poster+')"').replace('preload="none"','preload="none" poster="'+poster+'"')
strip=demo.split('<!-- BB-POLOSKA:START',1)[1];strip=strip[strip.index('<section'):strip.index('<!-- BB-POLOSKA:END')]
strip=re.sub(r'\s+onerror="[^"]*"','',strip)
video='''(()=>{const v=document.querySelector('.bp-hero__video'),hero=document.querySelector('.bp-hero-record');if(!v||!hero)return;
const mobile=matchMedia('(max-width:640px)').matches,assets='https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/';
v.poster=assets+'bp-hero-new-houses-20261010'+(mobile?'-mobile':'')+'-poster.webp';hero.querySelector('.bp-hero__bg').style.backgroundImage='url("'+v.poster+'")';
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches,save=navigator.connection?.saveData;
if(!reduced&&!save){v.src=assets+'bp-hero-new-houses-20261010'+(mobile?'-mobile':'')+'.mp4';v.play().catch(()=>{});}
let inView=true;function playback(){if(!v.src)return;if(document.hidden||!inView)v.pause();else v.play().catch(()=>{});}
if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;document.body.classList.toggle('bp-hero-in-view',inView);playback();}).observe(hero);
document.addEventListener('visibilitychange',playback);
function sync(){const header=document.querySelector('#rec1185050691 .t396__artboard'),nav=document.querySelector('.t975');const h=header?.getBoundingClientRect().height||76,b=nav&&getComputedStyle(nav).display!=='none'?nav.getBoundingClientRect().height:0;document.documentElement.style.setProperty('--bp-screen',innerHeight+'px');document.documentElement.style.setProperty('--bp-header-height',h+'px');document.documentElement.style.setProperty('--bp-bottom-height',b+'px');}
window.addEventListener('resize',sync);window.addEventListener('load',sync);sync();})();'''
(AS/'hero.js').write_text(video)
override='''
.bpc-section .bpc-toolbar{grid-template-columns:minmax(180px,2fr) minmax(90px,1fr) minmax(110px,1fr) 150px;max-width:960px;align-items:end}
.bp-heading-art>span{background-position:center;background-size:contain;background-repeat:no-repeat}\n.bpc-child-ages{max-width:960px;margin:0 auto 18px;display:flex;flex-wrap:wrap;justify-content:center;gap:12px}.bpc-child-ages:empty{display:none}.bpc-child-ages label{flex:0 1 180px;text-align:left}
.bpc-section .bpc-apply-note{min-height:20px;max-width:960px;margin:12px auto!important;color:#efd0ac}
#bb-stay{padding-top:24px}.bp-home-intro{padding-top:24px;padding-bottom:18px}
#bb-stay .bp-heading-art{display:none}
.bp-section-heading{padding-top:24px;padding-bottom:26px}
.bp-heading-art{height:56px;margin-bottom:14px;max-width:560px}
.bp-heading-art>span{height:56px}.bp-heading-art>.bp-heading-forest{height:40px}
@media(max-width:640px){#bb-stay{padding-top:20px}.bp-section-heading{padding-top:20px;padding-bottom:22px}.bp-heading-art,.bp-heading-art>span{height:36px}.bp-heading-art{margin-bottom:12px}.bp-heading-art>.bp-heading-forest{height:28px}}
#bb-stay,#houses{scroll-margin-top:100px}.bst-card .bst-house-details{min-height:58px}
@media(max-width:640px){.bpc-section .bpc-toolbar{grid-template-columns:1fr 1fr;gap:12px}.bpc-toolbar>label:first-child,.bpc-toolbar>.bpc-apply{grid-column:1/-1}.bpc-child-ages label{flex:1 1 130px}.bpc-section{padding-left:16px;padding-right:16px}.bpc-section .bst-card-body{padding:16px}.bst-card .bst-house-details{min-height:0}}
'''
with (AS/'bp-calendar.css').open('a') as f:f.write(override)
# State changes cannot re-enable a booking button before party selection is applied.
s=(AS/'bp-stay.js').read_text().replace('let section,limit=3,globalMonth=firstMonth;','let section,limit=3,globalMonth=firstMonth,dirty=false;')
s=s.replace("enabled=!!s.data&&!s.error&&!s.loading&&", "enabled=!dirty&&!!s.data&&!s.error&&!s.loading&&")
s=s.replace("function pending(){section", "function pending(){dirty=true;section")
s=s.replace("function apply(){try{", "function apply(){try{")
s=s.replace("Object.assign(state,{adults:draft.adults", "dirty=false;Object.assign(state,{adults:draft.adults")
s=s.replace("if(!s.arrival||!s.departure||s.loading)return;", "if(dirty||!s.arrival||!s.departure||s.loading)return;")
(AS/'bp-stay.js').write_text(s)
def js(name):return '<script>\n'+(AS/name).read_text().replace('</script','<\\/script')+'\n</script>'
def css(name):return '<style>\n'+(AS/name).read_text()+'\n</style>'
# Static house descriptions and detail links remain available to search engines/no-JS clients.
catalog=(SRC/'bp-houses.html').read_text();main=re.search(r'<main>(.*?)</main>',catalog,re.S)[1]
main=main.replace('bp-glavnaya.html','/').replace('href="/?house=','href="/?house=')
static_cards=re.search(r'<div class="bph-grid">(.*)</div>',main,re.S)[1]
for h in data['bp']:
 static_cards=static_cards.replace('/?house='+h['id']+'#bb-stay','https://reservationsteps.ru/rooms/index/17f7bf8e-d176-4c55-83a8-a1c0cd6187ae?lang=ru&amp;onlyrooms='+str(h['roomId']))
static_cards=static_cards.replace('<h2>','<h3>').replace('</h2>','</h3>')
fallback='<div class="bst-inner"><p class="bst-eyebrow">Барские поля</p><h2>Свободные даты и цены</h2><p>15 домов для отдыха в Подмосковье. Даты отдыха — до 1 февраля 2027 включительно.</p><p><a href="/booking">Проверить даты в модуле бронирования</a> · <a href="/houses">Все дома и фотографии</a></p><div class="bph-grid">'+static_cards+'</div></div>'
# A real target for old inbound /#houses links.
calendar='<div id="houses"></div><section id="bb-stay" class="bst bst-section bpc-section" data-brand="bp">'+fallback+'</section>'
# Preserve the useful former introduction outside the JS-replaced booking component.
intro_page=Page(live[slice(*records['rec1185039476'])])
intro_text=[h['text'] for h in intro_page.headings if h['tag']=='h2'][:2]
assert len(intro_text)==2 and intro_text[0].startswith('В каждом доме'), 'Live house introduction changed.'
categories=[('/chalet','Шале'),('/barski','Барский дом'),('/barnhauses','Барнхаус'),('/gardens','Гарден'),('/rivers','Ривер'),('/maps','Карта территории')]
intro='<section class="bp-home-intro" aria-label="Дома для отдыха в лесу">'+''.join('<p>'+escape(t)+'</p>' for t in intro_text)+'<nav aria-label="Категории домов">'+''.join('<a href="'+u+'">'+t+'</a>' for u,t in categories)+'</nav></section>'
block='<!-- Барские поля: производственная версия. Без перехвата форм и noindex. -->\n'+css('hero.css')+css('native-header.css')+css('stay-planner.css')+css('bp-calendar.css')+hero+strip+intro+calendar+js('hero.js')+js('stay-data.js')+js('stay-core.js')+js('bp-calendar.js')+js('bp-stay.js')+js('bp-layout.js')+js('native-navigation.js')+js('native-form-validation.js')
block=block.replace('<section id="bb-stay"','<style>#bb-stay .bph-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:24px;margin-top:24px}#bb-stay .bph-card{border:1px solid #54685b;border-radius:12px;overflow:hidden}#bb-stay .bph-card img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover}#bb-stay .bph-body{padding:18px}#bb-stay .bph-body a{display:block;margin-top:12px;color:#ee995d}</style><section id="bb-stay"',1)
(OUT/'01-ГЛАВНАЯ-T123.html').write_text(block)
catcss=re.search(r'<style>(.*?)</style>',catalog,re.S)[1]
# Scope generic rules so they do not alter native header, menu, footer or popups.
catcss=catcss.replace('*{','.bph-catalog *{').replace('body{','.bph-catalog{').replace('main{','.bph-catalog{').replace('h1,h2{','.bph-catalog h1,.bph-catalog h2{').replace('main>p{','.bph-catalog>p{').replace('h2{font-size','.bph-catalog h2{font-size').replace('h1{font-size','.bph-catalog h1{font-size')
catmain='<main class="bph-catalog">'+main+'</main>'
catblock=css('hero.css')+css('native-header.css')+'<style>'+catcss+'</style>'+catmain+js('native-navigation.js')+js('native-form-validation.js')
(OUT/'02-КАТАЛОГ-T123.html').write_text(catblock)
programs=(ROOT/'tilda/57-BP-PROGRAMMY-PLASHKI.html').read_text()
(OUT/'04-ПРОГРАММЫ-T123.html').write_text(programs)
# Local preview is derived from live HTML, retaining all native forms, services and navigation.
removed=['rec1538220631','rec1635506171','rec1185039476','rec2463129641','rec4154334901','rec1241556951']
preview=live
for rid in sorted(removed,key=lambda rid:records[rid][0],reverse=True):
 a,b=records[rid];preview=preview[:a]+(block if rid=='rec1538220631' else '')+preview[b:]
program_spans=Records(preview).spans
a,b=program_spans['rec4154336601'];preview=preview[:a]+'<div id="rec4154336601" class="r t-rec" data-record-type="131">'+programs+'</div>'+preview[b:]
preview=preview.replace('<html','<html lang="ru"',1)
PRE=ROOT/'tools/out/bp-production-20261015';(PRE/'index.html').write_text(preview)
# Catalogue preview uses the SAME real header/menu/footer and popups, without the landing body.
keep={'rec1185058671','rec1185050691','rec1188566526','rec1185050696','rec1190836936','rec1185050701','rec1798395461','rec2238427471','rec2345357451','rec684880488','rec1916160711','rec2806976901','rec924514671','rec1655233561','rec1932662561','rec1185068801','rec2431201361','rec1187647461','rec1241543791','rec1241543786'}
keep.add('rec924517561')  # Native rules popup linked from the shared footer.
catpreview=live
for rid,(a,b) in sorted(records.items(),key=lambda v:v[1][0],reverse=True):
 if rid not in keep:catpreview=catpreview[:a]+(catblock if rid=='rec1538220631' else '')+catpreview[b:]
catalog_seo=json.loads((OUT/'03-SEO-КАТАЛОГ.json').read_text())
catpreview=re.sub(r'<title>.*?</title>','<title>'+escape(catalog_seo['title'])+'</title>',catpreview,count=1,flags=re.S)
catpreview=re.sub(r'(<link rel="canonical" href=")[^"]+',lambda m:m[1]+catalog_seo['canonical'],catpreview,count=1)
# Preview the exact intended catalog settings, rather than the inherited homepage snippet.
def catalog_meta(m):
 tag=m[0]
 if re.search(r'(?:name|property)="(?:description|og:description|twitter:description)"',tag):value=catalog_seo['description']
 elif re.search(r'(?:name|property)="(?:og:title|twitter:title)"',tag):value=catalog_seo['title']
 elif re.search(r'property="og:url"',tag):value=catalog_seo['canonical']
 else:return tag
 return re.sub(r'content="[^"]*"','content="'+escape(value,quote=True)+'"',tag)
catpreview=re.sub(r'<meta\b[^>]*>',catalog_meta,catpreview)
catpreview=catpreview.replace('<html','<html lang="ru"',1)
(PRE/'houses.html').write_text(catpreview)
manifest={'built':'2026-10-16','home':'https://barskie-polya.ru/','catalog':'https://barskie-polya.ru/houses','disabled_records':removed,'replacement_program_record':'rec4154336601','native_forms_preserved':re.findall(r'<form[^>]+id="([^"]+)"',live),'source_demo':'77bf906 + задачи Леры 16.10.2026','booking_until_inclusive':'2027-02-01','noindex_in_production':False,'publishing':'manual-tilda-owner'}
manifest.update({'preserved_h1':live_h1,'baseline':str(BASELINE.relative_to(ROOT)),'baseline_sha256':hashlib.sha256(live.encode()).hexdigest(),'catalog_first_required':True,'home_head_preserved':True,'house_intro_preserved':intro_text})
manifest['native_navigation_preserved']=True
manifest['quiz_consent_required']=True
(OUT/'06-SEO-ГЛАВНАЯ.json').write_text(json.dumps(live_page.head_signature()|{'h1':live_h1},ensure_ascii=False,indent=2))
robots=(ROOT/'tools/out/bp-seo-review-20261016/robots.txt').read_text()
lines=robots.splitlines(keepends=True)
removed_robots=[line.strip() for line in lines if re.fullmatch(r'\s*Disallow:\s*/houses\s*',line)]
assert len(removed_robots)==2, 'Review the current robots before preparing the catalog change.'
(OUT/'05-ROBOTS-ОЖИДАЕМЫЙ.txt').write_text(''.join(line for line in lines if not re.fullmatch(r'\s*Disallow:\s*/houses\s*',line)))
(OUT/'05-ROBOTS-ИЗМЕНЕНИЯ.json').write_text(json.dumps({'remove_only':{'User-Agent: *':'Disallow: /houses','User-Agent: Yandex':'Disallow: /houses'},'all_other_rules':'preserve','source_sha256':hashlib.sha256(robots.encode()).hexdigest()},ensure_ascii=False,indent=2))
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(OUT/'checks').mkdir(exist_ok=True)
for name in ['seo.py','check-seo.py']:
 shutil.copyfile(ROOT/'tools/bp-release'/name,OUT/'checks'/name)
print('Built three T123 blocks and live-based local preview.')
