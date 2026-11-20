/* BP demo only. The native header bar and the booking widget are untouched. */
(()=>{
 'use strict';
 const fallback=[{"id":"chalet","name":"Шале","url":"https://barskie-polya.ru/chalet","capacity":5},{"id":"barski","name":"Барский дом","url":"https://barskie-polya.ru/barski","capacity":6},{"id":"barnhause1","name":"Барнхаус 1","url":"https://barskie-polya.ru/barnhauses/barnhause1","capacity":6},{"id":"garden1","name":"Гарден 1","url":"https://barskie-polya.ru/gardens/garden1","capacity":4},{"id":"river1","name":"Ривер 1","url":"https://barskie-polya.ru/rivers/river1","capacity":4},{"id":"river2","name":"Ривер 2","url":"https://barskie-polya.ru/rivers/river2","capacity":4},{"id":"river3","name":"Ривер 3","url":"https://barskie-polya.ru/rivers/river3","capacity":4},{"id":"river4","name":"Ривер 4","url":"https://barskie-polya.ru/rivers/river4","capacity":4},{"id":"river5","name":"Ривер 5","url":"https://barskie-polya.ru/rivers/river5","capacity":4},{"id":"river6","name":"Ривер 6","url":"https://barskie-polya.ru/rivers/river6","capacity":4},{"id":"garden2","name":"Гарден 2","url":"https://barskie-polya.ru/gardens/garden2","capacity":4},{"id":"garden3","name":"Гарден 3","url":"https://barskie-polya.ru/gardens/garden3","capacity":4},{"id":"garden4","name":"Гарден 4","url":"https://barskie-polya.ru/gardens/garden4","capacity":4},{"id":"garden5","name":"Гарден 5","url":"https://barskie-polya.ru/gardens/garden5","capacity":4},{"id":"barnhause2","name":"Барнхаус 2","url":"https://barskie-polya.ru/barnhauses/barnhause2","capacity":6}];
 const script=document.currentScript,root=new URL('../../../',script.src);
 const catalogue=new URL('prevyu/lid/bp-winter-houses-20261119.html',root);
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const order=['chalet','barski','barnhause1','barnhause2','garden1','garden2','garden3','garden4','garden5','river1','river2','river3','river4','river5','river6'];
 let dialog,trigger;
 function houseURL(h){
  const u=new URL('prevyu/lid/bp-winter-homes-20261120'+new URL(h.url).pathname.replace(/\/$/,'')+'/',root);
  const form=document.querySelector('#bb-stay .bpds-form'),q=new URLSearchParams(location.search);
  const arrival=form?.querySelector('[data-arrival]')?.value||q.get('arrival'),departure=form?.querySelector('[data-departure]')?.value||q.get('departure');
  if(arrival&&departure&&arrival<departure){
   u.searchParams.set('arrival',arrival);u.searchParams.set('departure',departure);
   const adults=form?.querySelector('[data-adults]')?.value||q.get('adults')||'2';
   const ages=form?[...form.querySelectorAll('[data-child-age]')].map(e=>e.value):[];
   if(ages.every(a=>a!=='')){u.searchParams.set('adults',adults);u.searchParams.set('children',form?JSON.stringify(ages.map(Number)):q.get('children')||'[]');}
  }
  return u.href;
 }
 function position(){
  if(!dialog||!trigger)return;
  if(innerWidth<=640){for(const key of['top','left','right','bottom','width','maxHeight'])dialog.style[key]='';return;}
  const r=trigger.getBoundingClientRect(),width=Math.min(390,innerWidth-32),left=Math.max(16,Math.min(r.left,innerWidth-width-16));
  const top=Math.max(16,Math.min(r.bottom+8,innerHeight-420));
  Object.assign(dialog.style,{top:top+'px',left:left+'px',right:'auto',bottom:'auto',width:width+'px',maxHeight:(innerHeight-top-16)+'px'});
 }
 function show(opener){
  if(dialog.open){dialog.close();return;}
  trigger=opener;
  const houses=[...(window.BBStayData?.bp||fallback)].sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
  dialog.querySelector('ul').innerHTML=houses.map(h=>`<li><a class="bp-house-index-link" data-menu-house="${escape(h.id)}" href="${escape(houseURL(h))}"><span>${escape(h.name)}</span><small>до ${h.capacity} гостей</small></a></li>`).join('');
  position();trigger.setAttribute('aria-expanded','true');dialog.showModal();dialog.querySelector('button').focus({preventScroll:true});
 }
 function mount(){
  const menu=document.getElementById('rec1185050696');if(!menu||document.getElementById('bp-house-index-dialog'))return;
  const buttons=[...menu.querySelectorAll('a[href]')].filter(a=>a.textContent.includes('Все дома и цены'));if(!buttons.length)return;
  dialog=document.createElement('dialog');dialog.id='bp-house-index-dialog';dialog.setAttribute('aria-labelledby','bp-house-index-title');
  dialog.innerHTML=`<div class="bp-house-index-header"><p class="bp-house-index-title" id="bp-house-index-title">Все 15 домов</p><button type="button" class="bp-house-index-close" aria-label="Закрыть список домов">×</button></div><nav class="bp-house-index-body" aria-label="Дома Барских полей"><ul></ul></nav><p class="bp-house-index-footer"><a class="bp-house-index-catalogue" href="${escape(catalogue.href)}">Каталог с фотографиями →</a></p>`;
  document.body.append(dialog);
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  window.addEventListener('keydown',e=>{if(dialog.open&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();dialog.close();}},true);
  dialog.addEventListener('cancel',e=>{e.preventDefault();dialog.close();});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{trigger?.setAttribute('aria-expanded','false');trigger?.focus({preventScroll:true});});
  for(const a of buttons){
   a.href='#bp-house-index-dialog';a.dataset.bpHouseIndexTrigger='';a.setAttribute('role','button');a.setAttribute('aria-haspopup','dialog');a.setAttribute('aria-controls',dialog.id);a.setAttribute('aria-expanded','false');
   const label=a.querySelector('.tn-atom__button-text');if(label)label.innerHTML='Все 15 домов<span class="bp-house-index-caret" aria-hidden="true">⌄</span>';
   a.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();show(a);}});
  }
  window.addEventListener('click',e=>{const a=e.target.closest?.('[data-bp-house-index-trigger]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();show(a);},true);
  addEventListener('resize',()=>{if(dialog.open)position();},{passive:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
