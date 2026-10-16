/* Review only: native Tilda validation, with no external lead delivery. */
(()=>{
 'use strict';
 const blocked=/mc\.yandex|forms?\d*\.tilda|tildaforms|tildaapi\.[^/]+\/procces|amocrm|stat\.tildacdn|tildastat/i;
 const isBlocked=url=>blocked.test(String(url&&url.url||url));
 if(typeof module!=='undefined'&&module.exports){module.exports={isBlocked};return;}
 const open=XMLHttpRequest.prototype.open,send=XMLHttpRequest.prototype.send;
 XMLHttpRequest.prototype.open=function(method,url,...args){this.bpPreviewBlocked=isBlocked(url);return open.call(this,method,url,...args);};
 XMLHttpRequest.prototype.send=function(...args){if(this.bpPreviewBlocked){this.abort();return;}return send.apply(this,args);};
 if(window.fetch){const fetch=window.fetch;window.fetch=function(url,...args){if(isBlocked(url))return Promise.reject(new Error('Preview: external delivery disabled'));return fetch.call(this,url,...args);};}
 if(navigator.sendBeacon){const beacon=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=(url,data)=>isBlocked(url)?true:beacon(url,data);}
 const empty={IMG:'data:image/gif;base64,R0lGODlhAQABAAAAACw=',SCRIPT:'data:text/javascript,',IFRAME:'about:blank'};
 const safe=(el,url)=>isBlocked(url)?(empty[el.tagName]||url):url;
 for(const type of [HTMLScriptElement,HTMLImageElement,HTMLIFrameElement]){
  const d=Object.getOwnPropertyDescriptor(type.prototype,'src');if(!d?.set)continue;
  Object.defineProperty(type.prototype,'src',{get:d.get,set:function(url){d.set.call(this,safe(this,url));},configurable:true});
 }
 const setAttribute=Element.prototype.setAttribute;
 Element.prototype.setAttribute=function(name,value){return setAttribute.call(this,name,/^src$/i.test(name)?safe(this,value):value);};
 function notice(form,text){
  let box=form.querySelector('.bp-preview-form-result');
  if(!box){box=document.createElement('div');box.className='bp-preview-form-result';box.setAttribute('role','status');box.setAttribute('aria-live','polite');form.append(box);}
  box.textContent=text;box.hidden=false;
 }
 function check(event,form){
  event.preventDefault();event.stopImmediatePropagation();
  const old=form.querySelector('.bp-preview-form-result');if(old)old.hidden=true;
  const api=window.tildaForm;
  if(!api?.validate||!api?.showErrors){notice(form,'Форма ещё загружается. Попробуйте ещё раз.');return;}
  api.hideErrors(form);
  const errors=api.validate(form);if(api.showErrors(form,errors))return;
  notice(form,'Поля заполнены верно. В демке заявка не отправляется.');
 }
 // Tilda also starts AJAX submission from a button click, before submit fires.
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('button,input[type="submit"]');
  if(button?.type==='submit'&&button.form)check(event,button.form);
 },true);
 document.addEventListener('submit',event=>{if(event.target instanceof HTMLFormElement)check(event,event.target);},true);
})();
