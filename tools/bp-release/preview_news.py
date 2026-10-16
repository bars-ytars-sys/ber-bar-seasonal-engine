"""Render the real public news snapshot on review domains without Tilda's API."""
from html.parser import HTMLParser
from html import escape, unescape
import re

class Record(HTMLParser):
    def __init__(self,html,ident):
        super().__init__(convert_charrefs=False);self.ident=ident;self.depth=0;self.start=None;self.end=None
        self.offsets=[0]+[m.end() for m in re.finditer('\n',html)];self.feed(html)
    def pos(self):
        line,col=self.getpos();return self.offsets[line-1]+col
    def handle_starttag(self,tag,attrs):
        if tag=='div' and self.end is None:
            if not self.depth and dict(attrs).get('id')==self.ident:self.start=self.pos();self.depth=1
            elif self.depth:self.depth+=1
    def handle_endtag(self,tag):
        if tag=='div' and self.depth:
            self.depth-=1
            if not self.depth:self.end=self.pos()+6

def render_news(html,posts):
    record=Record(html,'rec2238104591');assert record.start is not None and record.end
    cards=[]
    plain=lambda value:escape(unescape(re.sub('<[^>]+>','',value or '')))
    for post in posts:
        assert post['url'].startswith('https://barskie-polya.ru/tpost/')
        date=post['date'][:10];display='.'.join(reversed(date.split('-')))
        cards.append('<article class="bp-review-news-card"><a href="'+escape(post['url'],quote=True)+'">'
            '<img src="'+escape(post['image'],quote=True)+'" alt="'+plain(post.get('imagealt') or post['title'])+'" width="640" height="480" loading="lazy">'
            '<div><h3>'+plain(post['title'])+'</h3><p>'+plain(post['descr'])+'</p>'
            '<time datetime="'+date+'">'+display+'</time><span>Читать новость →</span></div></a></article>')
    style='''<style>
    .bp-review-news{padding:0 24px 48px;background:#314c44;color:#eee5d5}
    .bp-review-news-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px;max-width:1200px;margin:auto}
    .bp-review-news-card{min-width:0;background:#243d34;border-radius:8px;overflow:hidden}
    .bp-review-news-card a{display:flex;flex-direction:column;height:100%;color:inherit!important;text-decoration:none!important;font:400 14px/1.55 Rubik,Arial,sans-serif}
    .bp-review-news-card img{display:block;aspect-ratio:4/3;object-fit:cover;width:100%;height:auto}
    .bp-review-news-card a>div{display:flex;flex:1;flex-direction:column;gap:12px;padding:20px}
    .bp-review-news-card h3{font:400 20px/1.3 Rubik,Arial,sans-serif;margin:0}
    .bp-review-news-card p{font-size:14px;margin:0;color:#d3ccbe}
    .bp-review-news-card time{display:block;margin-top:auto;font-size:12px;color:#c4c8bd}
    .bp-review-news-card span{color:#ee995d}.bp-review-news-card a:focus-visible{outline:2px solid #ee995d;outline-offset:-3px}
    @media(max-width:1000px){.bp-review-news-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:640px){.bp-review-news{padding:0 16px 32px}.bp-review-news-grid{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding-bottom:12px}.bp-review-news-grid::-webkit-scrollbar{display:none}.bp-review-news-card{flex:0 0 86%;scroll-snap-align:start}.bp-review-news-card h3{font-size:19px}.bp-review-news-card a>div{padding:18px}}
    </style>'''
    style=style.replace('grid-template-columns:repeat(4,',f'grid-template-columns:repeat({len(cards)},')
    replacement='<div id="rec2238104591" class="r t-rec" data-record-type="131">'+style+'<div class="bp-review-news"><div class="bp-review-news-grid">'+''.join(cards)+'</div></div></div>'
    return html[:record.start]+replacement+html[record.end:]
