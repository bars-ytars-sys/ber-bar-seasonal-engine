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
loader = '''<script id="br-demo-updates-loader">(()=>{const root=new URL('.',location.href);const j=document.createElement('script');j.src=new URL('br-demo-updates.js?v=20261107',root);j.defer=true;document.head.append(j);})();</script>'''
for name in ['br-glavnaya.html', 'br-new-year.html', 'br-doma.html']:
    path = root / 'prevyu/lid' / name
    text = subprocess.check_output(['git','show','HEAD:prevyu/lid/'+name],cwd=root,text=True) if options.from_head else path.read_text()
    text = re.sub(r'<style id="br-demo-updates-style">.*?</style>', '', text, flags=re.S)
    text = re.sub(r'<script id="br-demo-updates-loader">.*?</script>', '', text, flags=re.S)
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
    if name == 'br-doma.html':
        text = re.sub(r'<script\b[^>]*src="[^"]*/stay-(?:data|core|planner)\.js[^"]*"[^>]*></script>', '', text)
        text = re.sub(r'<link\b[^>]*href="[^"]*/stay-planner\.css[^"]*"[^>]*>', '', text)
        text = re.sub(r'<script id="br-catalog-picker-loader">.*?</script>', '', text, flags=re.S)
        text = re.sub(r'<script id="br-catalog-demo-loader">.*?</script>', '', text, flags=re.S)
        catalog = '''<script id="br-catalog-demo-loader">(()=>{const s=document.createElement('script');s.src=new URL('br-catalog-demo.js?v=20261107',location.href);s.defer=true;document.head.append(s);})();</script>'''
        text = text.replace('</head>', catalog + '</head>', 1)
    else:
        text = text.replace('</head>', loader + '</head>', 1)
        text = text.replace('</body>', style + '</body>', 1)
    if options.from_head:
        path = options.from_head / name
        path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
print('Prepared main without house calendars, catalog with BRStay, and winter demo')
