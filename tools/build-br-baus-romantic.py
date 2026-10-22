"""Assemble a BR campaign demo while preserving the approved native shell."""
from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
pages=ROOT/'prevyu/lid';out=ROOT/'tools/out/br-baus-romantic-20261022'
source=(pages/'br-special.html').read_text()
start=re.search(r'<div\b[^>]*id="rec2122053751"',source).start()
end=source.index('<footer id="t-footer"')
content=(pages/'br-baus-romantic-main.html').read_text()
css=(pages/'br-baus-romantic.css').read_text();js=(pages/'br-baus-romantic.js').read_text()
html=source[:start]+f'<style id="brt-campaign-style">{css}</style>'+content+f'<script id="brt-campaign-script">{js}</script>'+source[end:]
html=re.sub(r'<title>.*?</title>','<title>Баус. Время для двоих — демо предложения | Берёзовая роща</title>',html,count=1,flags=re.S)
html=re.sub(r'<meta\b[^>]*(?:property="og:(?:title|description|url|image)"|name="description")[^>]*>','',html)
html=re.sub(r'<link\b[^>]*rel="canonical"[^>]*>','',html)
html=html.replace('</head>','<meta name="description" content="Демонстрационный макет: проживание в Баусе и программа Романтик в подарок. Условия предложения согласуются."></head>',1)
target=pages/'br-baus-romantic.html';target.write_text(html)
def section(s,tag,ident):return re.search(r'<'+tag+r'\b[^>]*id="'+ident+r'"[\s\S]*?</'+tag+r'>',s)[0]
proof={}
for tag,ident in [('header','t-header'),('footer','t-footer')]:
 a,b=section(source,tag,ident),section(html,tag,ident)
 assert a==b,ident+' was changed'
 proof[ident]={'unchanged':True,'sha256':hashlib.sha256(a.encode()).hexdigest()}
proof.update({'source':'prevyu/lid/br-special.html','output':'prevyu/lid/br-baus-romantic.html','demoNoindex':bool(re.search(r'name="robots" content="noindex,nofollow"',html)),'houseCards':html.count('data-brt-house='),'networkSubmission':False})
out.mkdir(parents=True,exist_ok=True);(out/'preservation.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2))
print(json.dumps(proof,ensure_ascii=False))
