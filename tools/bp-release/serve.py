"""Loopback-only preview with a local form sink; never included in Tilda blocks."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import json,urllib.parse,urllib.request,re,gzip
ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'tools/out/bp-production-20261015'
CACHE={}
def mirrored(s):
 s=re.sub(r'https://(?:static|static3|neo)\.tildacdn\.com/((?:js|css|ws)/)',r'/__cdn/\1',s)
 s=re.sub(r'https://(?:static|static3)\.tildacdn\.com/tild3262-6436-4764-a235-366133623239/photo.svg',r'/__bp_logo.svg',s)
 return re.sub(r'(data-success-url=["\'])https://barskie-polya\.ru/(?:thanks|uspeshno)',r'\1http://127.0.0.1:4196/thanks',s)
HARNESS='''<script>/* LOCAL QA ONLY: intercept Tilda lead POSTs before native SDK loads. */
(()=>{const lead=url=>/forms?\\d*\\.tilda|tilda\\.cc\\/.*(?:procces|process|form)/i.test(String(url));const open=XMLHttpRequest.prototype.open,send=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.open=function(method,url,...args){this.qaLead=/^(POST)$/i.test(method)&&lead(url);return open.call(this,method,this.qaLead?'/__qa_form':url,...args);};XMLHttpRequest.prototype.send=function(body){return send.call(this,body);};const original=window.fetch;window.fetch=function(url,opts){if(opts?.method?.toUpperCase()==='POST'&&lead(url))return original('/__qa_form',opts);return original(url,opts);};})();</script>'''
class H(SimpleHTTPRequestHandler):
 def do_GET(self):
  path=urllib.parse.urlsplit(self.path).path
  if path=='/__bp_logo.svg':
   try:
    if path not in CACHE:CACHE[path]=urllib.request.urlopen('https://static.tildacdn.com/tild3262-6436-4764-a235-366133623239/photo.svg',timeout=20).read()
    b=CACHE[path];self.send_response(200);self.send_header('Content-Type','image/svg+xml');self.end_headers();self.wfile.write(b)
   except Exception:self.send_error(502)
   return
  if path.startswith('/__cdn/'):
   tail=self.path[len('/__cdn/'):];url='https://static.tildacdn.com/'+tail
   try:
    if url not in CACHE:
     bundled=ROOT/'prevyu/lid/bp-production-assets'/urllib.parse.urlsplit(tail).path
     payload=bundled.read_bytes() if bundled.exists() else urllib.request.urlopen(url,timeout=20).read();CACHE[url]=gzip.decompress(payload) if payload[:2]==b'\x1f\x8b' else payload
    b=CACHE[url];self.send_response(200);self.send_header('Content-Type','text/css' if '.css' in path else 'text/javascript');self.end_headers();self.wfile.write(b)
   except Exception:self.send_error(502)
   return
  if path in ['/eco','/eco-full']:
   b=mirrored((ROOT/('tools/out/eco-layout-20261015/preview-full.html' if path=='/eco-full' else 'tools/out/eco-layout-20261015/preview.html')).read_text()).encode();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('X-Robots-Tag','noindex');self.end_headers();self.wfile.write(b);return
  if path in ['/','/houses']:
   s=mirrored((BASE/('houses.html' if path=='/houses' else 'index.html')).read_text()).replace('<head>','<head>'+HARNESS,1)
   b=s.encode();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('X-Robots-Tag','noindex, nofollow');self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b);return
  if path in ['/thanks','/uspeshno']:
   b=b'<h1>LOCAL QA: form received</h1>';self.send_response(200);self.end_headers();self.wfile.write(b);return
  self.path=str(urllib.parse.unquote(path)).lstrip('/');return super().do_GET()
 def do_POST(self):
  if self.path!='/__qa_form':self.send_error(405);return
  body=self.rfile.read(int(self.headers.get('Content-Length','0')));(BASE/'local-form-payload.txt').write_bytes(body)
  mode=BASE/'qa-form-mode.txt'
  event={'form':urllib.parse.parse_qs(body.decode()).get('tildaspec-formid'), 'keys':sorted(urllib.parse.parse_qs(body.decode())), 'mode':mode.read_text().strip() if mode.exists() else 'success'}
  with (BASE/'qa-form-events.jsonl').open('a') as f:f.write(json.dumps(event,ensure_ascii=False)+'\n')
  if event['mode']=='error':
   self.send_response(503);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(b'{"error":"LOCAL_QA_TEMPORARY_ERROR"}');return
  b=json.dumps({'error':'','success':'ok','results':{'result':'success'},'message':'OK','tranid':'qa-local-only'}).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(b)
 def log_message(self,*args):pass
if __name__=='__main__':
 import os
 os.chdir(ROOT)
 print('BP production preview: http://127.0.0.1:4196',flush=True)
 ThreadingHTTPServer(('127.0.0.1',4196),H).serve_forever()
