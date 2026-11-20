"""BP demo only: keep houses visible before the first availability search."""
from pathlib import Path
import re
import json, os
from start_mode import apply_default
ROOT=Path(__file__).resolve().parents[3]
PAGE=ROOT/'prevyu/lid/bp-winter-20261119.html'

def apply(source):
    marker='/* BP HOUSE DISCOVERY 20261120 */'
    if marker in source:return source
    pattern=r'(<script\b[^>]*>)(.*?)(</script>)'
    matches=[m for m in re.finditer(pattern,source,re.S) if 'const houses=window.BBStayData?.bp,core=window.BBStayCore' in m[2]]
    assert len(matches)==1
    m=matches[0];code=m[2]
    replacements={
        "const dated=mode==='dates',all=selected(true),list=dated&&!results?[]:selected(),":
        "const dated=mode==='dates',hasResults=dated&&results!==null,all=selected(true),list=selected(),",
        "section.querySelector('.bpds-trip').textContent=dated?(hasDates()?trip()+' · '+nightsLabel(calendar.nights(state.arrival,state.departure)):'Выберите даты выше'):'Выберите дом';":
        "section.querySelector('.bpds-trip').textContent=dated&&hasDates()?trip()+' · '+nightsLabel(calendar.nights(state.arrival,state.departure)):'Выберите дом';",
        "section.querySelector('.bpc-count').textContent=searching?'Ищем подходящие дома…':dated?(results?`${list.length} ${list.length===1?'вариант':'вариантов'} для вашего отдыха`:'Нажмите «Найти дом», чтобы посмотреть варианты.'):`${all.length} из ${houses.length} домов подходят по гостям и удобствам`;":
        "section.querySelector('.bpc-count').textContent=searching?'Ищем подходящие дома…':hasResults?`${list.length} ${list.length===1?'вариант':'вариантов'} для вашего отдыха`:hasDates()?'Даты выбраны. Нажмите «Найти дом», чтобы проверить наличие.':`${all.length} из ${houses.length} домов подходят по гостям и удобствам`;",
        "list.slice(0,limit).map(h=>dated?resultCard(h,results.get(h.id)):houseCard(h))":
        "list.slice(0,limit).map(h=>hasResults?resultCard(h,results.get(h.id)):houseCard(h))",
        "if(!dated&&!list.length)section.querySelector('.bst-grid').innerHTML=":
        "if(!hasResults&&!list.length)section.querySelector('.bst-grid').innerHTML=",
        "if(!dated)for(const h of list.slice(0,limit))draw(h);":
        "if(!hasResults)for(const h of list.slice(0,limit))draw(h);",
    }
    for old,new in replacements.items():
        assert code.count(old)==1,old
        code=code.replace(old,new)
    return source[:m.start(2)]+marker+code+source[m.end(2):]

def apply_scroll(source):
    if '/* BP PLANNER SCROLL 20261120' in source:return source
    old="const go=()=>section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});"
    assert source.count(old)==1
    source=source.replace(old,'const go=()=>scrollToPlanner();')
    anchor=' function mount(){\n  section=document.querySelector(\'#bb-stay\');'
    assert source.count(anchor)==1
    helper=(Path(__file__).parent/'planner-scroll.js').read_text()
    return source.replace(anchor,helper+'\n'+anchor)

if __name__=='__main__':
    before=PAGE.read_text();after=apply_scroll(apply_default(apply(before)))
    assert before.split('</head>',1)[0]==after.split('</head>',1)[0]
    PAGE.write_text(after)
    folder=Path(__file__).resolve().parent
    data=json.loads(re.search(r'window\.BBStayData\s*=\s*(\{[^\n]+\});',after)[1])['bp']
    records=[{k:h[k] for k in ('id','name','url','capacity')} for h in data]
    (folder/'menu.js').write_text((folder/'menu-template.js').read_text().replace('__BP_HOUSES__',json.dumps(records,ensure_ascii=False,separators=(',',':'))))
    files=[PAGE,ROOT/'prevyu/lid/bp-winter-houses-20261119.html',*sorted((ROOT/'prevyu/lid/bp-winter-homes-20261120').rglob('index.html'))]
    for page in files:
        source=page.read_text();head=source.split('</head>',1)[0]
        source=re.sub(r'<link id="bp-demo-house-menu-css"[^>]*>\s*<script id="bp-demo-house-menu-js"[^>]*></script>','',source)
        source=re.sub(r'<link id="bp-demo-calendar-motion-css"[^>]*>','',source)
        css=os.path.relpath(folder/'menu.css',page.parent);js=os.path.relpath(folder/'menu.js',page.parent)
        tags=f'<link id="bp-demo-house-menu-css" rel="stylesheet" href="{css}"><script id="bp-demo-house-menu-js" src="{js}" async></script>'
        source=source.replace('</body>',tags+'</body>')
        assert source.split('</head>',1)[0]==head
        page.write_text(source)
    print('Prepared demo house menus:',len(files))
