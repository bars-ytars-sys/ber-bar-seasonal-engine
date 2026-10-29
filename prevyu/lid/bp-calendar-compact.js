/* Presentation only: the original house/calendar nodes and booking handlers stay in place. */
(()=>{
 'use strict';
 let active=null,returnFocus=null;
 const calendarIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18"/></svg>';
 function unlock(){
  document.documentElement.classList.remove('bpc-calendar-open');
  if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
  returnFocus=null;active=null;
 }
 function update(card){
  const host=card.querySelector('.bpc-calendar-host'),price=card.querySelector('.bpc-compact-price'),dates=card.querySelector('.bpc-compact-dates'),button=card.querySelector('[data-calendar-open]');
  if(!host||!price||!button)return;
  const source=host.querySelector('.bpc-price-row>span');
  price.replaceChildren(...(source?[...source.childNodes].map(n=>n.cloneNode(true)):[document.createTextNode('Цены и доступность — в календаре')]));
  const arrival=host.querySelector('[data-pick="arrival"]>span')?.textContent;
  const departure=host.querySelector('[data-pick="departure"]>span')?.textContent;
  const selected=arrival&&arrival!=='Выбрать';
  const note=host.querySelector('.bpc-weekend-note strong');
  if(note&&note.textContent!=='Минимальный срок зависит от даты заезда')note.textContent='Минимальный срок зависит от даты заезда';
  const noteDetail=host.querySelector('.bpc-weekend-note span');
  if(noteDetail&&noteDetail.textContent!=='Выберите заезд — покажем условия.')noteDetail.textContent='Выберите заезд — покажем условия.';
  const text=selected?(departure&&departure!=='Выбрать'?host.querySelector('.bpc-hint')?.textContent:'Заезд '+arrival+' · выберите выезд'):'';
  if(dates.textContent!==text)dates.textContent=text||'';
  dates.hidden=!text;
  button.querySelector('span').textContent=selected?'Изменить даты':'Выбрать даты';
 }
 function enhance(card){
  if(card.classList.contains('bpc-compact-card'))return;
  const host=card.querySelector('.bpc-calendar-host'),body=card.querySelector('.bst-card-body'),name=card.querySelector('h3')?.textContent;
  if(!host||!body||!name)return;
  const id='bpc-dates-'+card.dataset.house;
  const summary=document.createElement('div');summary.className='bpc-compact-summary';
  summary.innerHTML='<p class="bpc-compact-price"></p><p class="bpc-compact-dates" hidden></p>';
  const open=document.createElement('button');open.type='button';open.className='bst-btn bpc-choose-dates';open.dataset.calendarOpen='';
  open.setAttribute('aria-haspopup','dialog');open.setAttribute('aria-controls',id);open.setAttribute('aria-expanded','false');
  open.innerHTML=calendarIcon+'<span>Выбрать даты</span>';
  const dialog=document.createElement('dialog');dialog.id=id;dialog.className='bst bpc-date-dialog';dialog.dataset.brand='bp';
  dialog.setAttribute('aria-labelledby',id+'-title');
  dialog.innerHTML='<header class="bpc-dialog-heading"><div><p>Свободные даты и цены</p><h2 id="'+id+'-title"></h2></div><button type="button" class="bpc-dialog-close" aria-label="Закрыть календарь">×</button></header><div class="bpc-dialog-content"></div>';
  dialog.querySelector('h2').textContent=name;
  host.before(summary,open);dialog.querySelector('.bpc-dialog-content').append(host);body.append(dialog);
  card.classList.add('bpc-compact-card');
  open.addEventListener('click',()=>{
   if(active&&active!==dialog)active.close();
   active=dialog;returnFocus=open;open.setAttribute('aria-expanded','true');
   document.documentElement.classList.add('bpc-calendar-open');dialog.showModal();
  });
  dialog.querySelector('.bpc-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{open.setAttribute('aria-expanded','false');if(active===dialog)unlock();});
  dialog.addEventListener('click',event=>{
   if(event.target!==dialog)return;
   const r=dialog.getBoundingClientRect();
   if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
  });
  update(card);
 }
 function init(){
  const section=document.querySelector('#bb-stay');if(!section)return;
  const intro=section.querySelector('.bst-intro');
  if(intro)intro.textContent='Укажите месяц и гостей, нажмите «Подобрать». Выберите дом и откройте его календарь кнопкой «Выбрать даты».';
  const grid=section.querySelector('.bst-grid');if(!grid)return;
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&active?.open){event.preventDefault();event.stopPropagation();active.close();}},{capture:true});
  const observer=new MutationObserver(records=>{
   if(active&&!active.isConnected)unlock();
   grid.querySelectorAll('.bpc-card:not(.bpc-compact-card)').forEach(enhance);
   const changed=new Set(records.map(r=>r.target.nodeType===1?r.target:r.target.parentElement).filter(e=>e.closest('.bpc-calendar-host')).map(e=>e.closest('.bpc-card')));
   changed.forEach(update);
  });
  grid.querySelectorAll('.bpc-card').forEach(enhance);
  observer.observe(grid,{childList:true,subtree:true,characterData:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
