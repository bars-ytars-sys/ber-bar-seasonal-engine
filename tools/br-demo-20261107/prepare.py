"""Refresh only the scoped presentation assets of the two BR demo pages."""
from pathlib import Path
import re
import argparse
import subprocess

root = Path(__file__).resolve().parents[2]
args = argparse.ArgumentParser()
args.add_argument('--from-head', type=Path, help='Prepare an isolated Git package from HEAD; preserve unrelated working changes')
options = args.parse_args()
css = (root / 'prevyu/lid/br-demo-updates.css').read_text()
style = '<style id="br-demo-updates-style">' + css + '</style>'
loader = '''<script id="br-demo-updates-loader">(()=>{const root=new URL('.',location.href);const j=document.createElement('script');j.src=new URL('br-demo-updates.js?v=20261107b',root);j.defer=true;document.head.append(j);})();</script>'''
shell_css = (root / 'prevyu/lid/br-demo-shell.css').read_text().replace('../../demo/assets/', 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/')
shell = '<style id="br-demo-shell-style">' + shell_css + '</style>'
header = '''<script id="br-demo-header-loader">(()=>{const j=document.createElement('script');j.src=new URL('br-demo-header.js?v=20261107b',location.href);document.head.append(j);})();</script>'''
for name in ['br-glavnaya.html', 'br-new-year.html', 'br-doma.html']:
    path = root / 'prevyu/lid' / name
    text = subprocess.check_output(['git','show','HEAD:prevyu/lid/'+name],cwd=root,text=True) if options.from_head else path.read_text()
    native_catalog = name == 'br-doma.html' and 'window.BRStayData = {' in text
    text = re.sub(r'<style id="br-demo-updates-style">.*?</style>', '', text, flags=re.S)
    text = re.sub(r'<script id="br-demo-updates-loader">.*?</script>', '', text, flags=re.S)
    text = re.sub(r'<style id="br-demo-shell-style">.*?</style>', '', text, flags=re.S)
    text = re.sub(r'<script id="br-demo-header-loader">.*?</script>', '', text, flags=re.S)
    text = re.sub(r'<script id="brd-poster-loader">.*?</script>', '', text, flags=re.S)
    # Old snapshots briefly changed the URL to /doma or /new-year; that breaks
    # relative demo assets and can send a GitHub Pages visit to a missing route.
    text = re.sub(r'<script>\(function\(\)\{try\{var был=location.href;history\.replaceState.*?</script>', '', text, flags=re.S)
    assert '</head>' in text and '</body>' in text
    # The winter template resets every descendant in a body-level style.
    # Keep our component styles after that reset without changing native CSS.
    if name == 'br-glavnaya.html':
        # Restore native hero badges, remove both experimental trust presentations.
        # Load house data for the photo rail, never the calendar/picker engine here.
        def main_tag(match):
            tag = match.group(0)
            if 'bb-br-trust' in tag or ('BRStayAssetBase' in tag and 'br-stay-calendar.js' in tag):
                return ''
            return tag
        text = re.sub(r'<(?:style|script)\b[^>]*>.*?</(?:style|script)>', main_tag, text, flags=re.S)
        # The booking iframe is far below the first screen. Load it near its
        # viewport instead of holding the initial page load open.
        text = re.sub(r'<script\b[^>]*src="//widget\.reservationsteps\.ru/js/bnovo\.js"[^>]*></script>', '', text)
        def lazy_bnovo(match):
            source = match.group(0)
            if 'Bnovo_Widget.init' not in source or 'id="brd-lazy-bnovo"' in source:
                return source
            source = re.sub(r'^<script\b[^>]*>|</script>$', '', source)
            return '''<script id="brd-lazy-bnovo">(()=>{const initBnovo=()=>{''' + source + '''};
let started=false;const target=document.getElementById('rec3032928101');
const start=()=>{if(started)return;started=true;if(window.Bnovo_Widget){initBnovo();return;}const script=document.createElement('script');script.src='https://widget.reservationsteps.ru/js/bnovo.js';script.onload=initBnovo;script.onerror=()=>{const a=document.createElement('a');a.href='https://ecobr.ru/booking';a.textContent='Открыть бронирование →';a.style.cssText='display:block;padding:24px;text-align:center;color:#15966b';target.append(a);};document.head.append(script);};
if(target&&'IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();start();}},{rootMargin:'400px'});observer.observe(target);}else start();})();</script>'''
        text = re.sub(r'<script\b[^>]*>.*?</script>', lazy_bnovo, text, flags=re.S)
        text = re.sub(r'<link id="brd-hero-preload"[^>]*>', '', text)
        poster='''<script id="brd-poster-loader">(()=>{const url=new URL('../../demo/assets/br-demo-prod-hero.webp',location.href).href;document.documentElement.style.setProperty('--brd-hero-poster','url("'+url+'")');const l=document.createElement('link');l.rel='preload';l.as='image';l.href=url;l.fetchPriority='high';document.head.append(l);})();</script>'''
        text = text.replace('</head>',poster+'</head>',1)
    text = re.sub(r'<iframe\b(?![^>]*loading=)', '<iframe loading="lazy"', text)
    text = re.sub(r'(<link\b[^>]*href="https://static\.tildacdn\.com/css/fonts-tildasans\.css"[^>]*)(/?>)', lambda m:m.group(1).rstrip('/')+' media="print" onload="this.media=\'all\'"'+m.group(2) if 'onload=' not in m.group(1) else m.group(0), text)
    text = text.replace('</head>', shell + header + '</head>', 1)
    if name == 'br-doma.html' and not native_catalog:
        text = re.sub(r'<script\b[^>]*src="[^"]*/stay-(?:data|core|planner)\.js[^"]*"[^>]*></script>', '', text)
        text = re.sub(r'<link\b[^>]*href="[^"]*/stay-planner\.css[^"]*"[^>]*>', '', text)
        text = re.sub(r'<script id="br-catalog-picker-loader">.*?</script>', '', text, flags=re.S)
        text = re.sub(r'<script id="br-catalog-demo-loader">.*?</script>', '', text, flags=re.S)
        catalog = '''<script id="br-catalog-demo-loader">(()=>{const s=document.createElement('script');s.src=new URL('br-catalog-demo.js?v=20261107',location.href);s.defer=true;document.head.append(s);})();</script>'''
        text = text.replace('</head>', catalog + '</head>', 1)
    elif name != 'br-doma.html':
        text = text.replace('</head>', loader + '</head>', 1)
        text = text.replace('</body>', style + '</body>', 1)
    if options.from_head:
        path = options.from_head / name
        path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
print('Prepared main without house calendars, catalog with BRStay, and winter demo')
