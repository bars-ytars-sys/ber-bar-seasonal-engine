"""Read public HTML without executing scripts; shared by release preparation and QA."""
from html.parser import HTMLParser
import json, re

def normal(text):
    return ' '.join(text.split())

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.title=''; self.meta=[]; self.canonical=[]; self.headings=[]
        self.links=[]; self.forms=[]; self.schema=[]; self.text=[]
        self._title=False; self._heading=None; self._script=None; self._skip=0
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if tag=='title': self._title=True
        if tag=='meta': self.meta.append(attrs)
        if tag=='link' and attrs.get('rel')=='canonical': self.canonical.append(attrs.get('href'))
        if tag in ('h1','h2','h3'): self._heading={'tag':tag,'text':''}
        if tag=='a' and attrs.get('href'): self.links.append(attrs['href'])
        if tag=='form': self.forms.append(attrs.get('id'))
        if tag=='script': self._script={'type':attrs.get('type'),'text':''}
        if tag in ('script','style'): self._skip+=1

    def handle_endtag(self, tag):
        if tag=='title': self._title=False
        if self._heading and tag==self._heading['tag']:
            self._heading['text']=normal(self._heading['text'])
            self.headings.append(self._heading); self._heading=None
        if tag=='script' and self._script:
            if self._script['type']=='application/ld+json':
                self.schema.append(json.loads(self._script['text']))
            self._script=None
        if tag in ('script','style'): self._skip=max(0,self._skip-1)

    def handle_data(self, text):
        if self._title: self.title+=text
        if self._script: self._script['text']+=text
        if not self._skip:
            self.text.append(text)
            if self._heading: self._heading['text']+=text+' '

    def h1(self):
        return [h['text'] for h in self.headings if h['tag']=='h1']

    def head_signature(self):
        return {'title':self.title,'meta':self.meta,'canonical':self.canonical,'schema':self.schema}

    def blocked(self):
        return [m for m in self.meta if m.get('name','').lower() in ('robots','yandex','googlebot')
                and {'noindex','none'} & set(re.split(r'[,\s]+',m.get('content','').lower()))]

    def description(self):
        return next((m.get('content','') for m in self.meta if m.get('name')=='description'),'')
