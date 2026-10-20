import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Exercise the review guard before Tilda's own click handler can send a lead.
const source=fs.readFileSync(new URL('./preview-forms.js',import.meta.url),'utf8');
let passed=0;
const ok=fn=>{fn();passed++;};
class Element{setAttribute(name,value){this[name]=value;}}
class Form extends Element{
 querySelector(){return this.result||null;}
 append(box){this.result=box;}
}
class Resource extends Element{constructor(){super();this.tagName='IMG';}get src(){return this.value;}set src(value){this.value=value;}}
class XHR{open(method,url){this.url=url;}send(){this.sent=true;}abort(){this.aborted=true;}}
const listeners={},document={
 addEventListener(name,fn,capture){assert.equal(capture,true);listeners[name]=fn;},
 createElement(){return new Element();}
};
let errors=[],validated=0;
const context={document,Element,HTMLFormElement:Form,HTMLScriptElement:Resource,HTMLImageElement:Resource,HTMLIFrameElement:Resource,XMLHttpRequest:XHR,navigator:{sendBeacon:()=>false},window:{fetch:async url=>url,tildaForm:{hideErrors(){},validate(){validated++;return errors;},showErrors(form,found){form.errors=found;return found.length>0;}}}};
vm.runInNewContext(source,context);
const click=(form,type='submit')=>{
 const e={target:{closest:()=>({form,type})},preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};
 listeners.click(e);return e;
};
const form=new Form();
ok(()=>{errors=['required'];const e=click(form);assert.ok(e.prevented&&e.stopped);assert.equal(form.result,undefined);assert.equal(form.errors.length,1);});
ok(()=>{errors=[];click(form);assert.match(form.result.textContent,/Поля заполнены верно/);assert.equal(form.result.role,'status');});
ok(()=>{const before=validated,e=click(form,'button');assert.equal(validated,before);assert.equal(e.prevented,undefined);});
ok(()=>{errors=['phone'];click(form);assert.equal(form.result.hidden,true);});
ok(()=>{context.window.tildaForm=undefined;click(form);assert.match(form.result.textContent,/ещё загружается/);});
ok(()=>{const x=new XHR();x.open('POST','https://forms.tildacdn.com/procces/');x.send();assert.equal(x.aborted,true);assert.equal(x.sent,undefined);});
ok(()=>{const x=new XHR();x.open('GET','https://reservationsteps.ru/bookings/availability/');x.send();assert.equal(x.sent,true);});
ok(()=>{const image=new Resource();image.src='https://mc.yandex.ru/watch/123';assert.match(image.src,/^data:/);});
await assert.rejects(context.window.fetch('https://forms2.tilda.ws/procces/'));passed++;
assert.match(await context.window.fetch('https://reservationsteps.ru/rooms/'),/reservationsteps/);passed++;
ok(()=>{const input=new Element(),doc={readyState:'complete',querySelectorAll:()=>[input]};vm.runInNewContext(fs.readFileSync(new URL('./native-form-validation.js',import.meta.url),'utf8'),{document:doc});assert.equal(input['data-tilda-req'],'1');});
for(const file of ['bp-production-preview.html','bp-production-houses.html']){
 const html=fs.readFileSync(new URL('../../prevyu/lid/'+file,import.meta.url),'utf8');
 ok(()=>{assert.match(html,/noindex/);assert.match(html,/Поля заполнены верно/);assert.doesNotMatch(html,/alert\('Это проверочная демка/);});
}
const home=fs.readFileSync(new URL('../../prevyu/lid/bp-production-preview.html',import.meta.url),'utf8');
ok(()=>{assert.equal((home.match(/<article class="bp-review-news-card">/g)||[]).length,0);assert.doesNotMatch(home,/t_feed_init\('2238104591'/);assert.doesNotMatch(home,/<div id="rec22381(?:37661|04591)"/);});
console.log(`${passed} preview cases passed.`);
