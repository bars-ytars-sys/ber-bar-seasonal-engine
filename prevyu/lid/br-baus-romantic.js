/* Local demo interaction. No orders, leads, network writes or production changes. */
(()=>{
 'use strict';
 const root=document.getElementById('brt-main'),dialog=document.getElementById('brt-dialog');
 if(!root||!dialog)return;
 const house=document.getElementById('brt-house'),arrival=document.getElementById('brt-arrival'),departure=document.getElementById('brt-departure'),status=document.getElementById('brt-status'),output=document.getElementById('brt-output');
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const next=s=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+2);return iso(d);};
 const today=iso(new Date());arrival.min=today;departure.min=next(today);
 let returnFocus=null,bodyOverflow='';
 function open(button){returnFocus=button;house.value=button.dataset.brtHouse;output.hidden=true;output.textContent='';status.textContent='';bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.hidden=false;house.focus();}
 function close(){dialog.hidden=true;document.body.style.overflow=bodyOverflow;returnFocus?.focus();}
 document.addEventListener('click',e=>{
  const link=e.target.closest('[data-brt-anchor]');
  if(link&&root.contains(link)){
   const id=link.getAttribute('href').split('#').pop(),target=document.getElementById(id);
   if(target){e.preventDefault();e.stopImmediatePropagation();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}
   return;
  }
  const button=e.target.closest('[data-brt-house]');if(button&&root.contains(button)){e.preventDefault();open(button);}
 },true);
 root.querySelectorAll('[data-brt-anchor]').forEach(a=>{a.href=location.origin+location.pathname+a.getAttribute('href');});
 dialog.querySelector('.brt-dialog-close').addEventListener('click',close);
 dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
 dialog.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();close();return;}
  if(e.key!=='Tab')return;
  const items=[...dialog.querySelectorAll('button,input,select,a[href]')].filter(el=>!el.disabled&&!el.hidden),first=items[0],last=items.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 arrival.addEventListener('change',()=>{if(arrival.value){departure.min=next(arrival.value);if(departure.value&&departure.value<=arrival.value)departure.value='';}output.hidden=true;status.textContent='';});
 departure.addEventListener('change',()=>{output.hidden=true;status.textContent='';});
 house.addEventListener('change',()=>{output.hidden=true;status.textContent='';});
 document.getElementById('brt-preview-request').addEventListener('click',()=>{
  output.hidden=true;
  if(!arrival.value||!departure.value){status.textContent='Выберите дату заезда и выезда.';(!arrival.value?arrival:departure).focus();return;}
  if(arrival.value<today){status.textContent='Выберите заезд не раньше сегодняшнего дня.';return;}
  if(departure.value<next(arrival.value)){status.textContent='Подарок действует при проживании от 2 ночей. Выберите более поздний выезд.';departure.focus();return;}
  if(!arrival.checkValidity()||!departure.checkValidity()){status.textContent='Проверьте даты заезда и выезда.';return;}
  const format=s=>new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(s+'T12:00:00'));
  status.textContent='';
  output.textContent=`Ваш запрос\n\n${house.value} · 2 взрослых\nЗаезд: ${format(arrival.value)}\nВыезд: ${format(departure.value)}\n\nИнтересует предложение «Баус. Время для двоих» с программой «Романтик» в подарок. Прошу подтвердить наличие дома и условия акции.\n\nЗапрос сформирован, но не отправлен.`;
  output.hidden=false;output.scrollIntoView({behavior:'smooth',block:'nearest'});
 });
})();
