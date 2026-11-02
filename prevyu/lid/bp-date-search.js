
/* One flow: house -> its live monthly calendar -> confirmed booking. */
(()=>{
 'use strict';
 const houses=window.BBStayData?.bp,core=window.BBStayCore,calendar=window.BPCalendar;if(!houses||!core||!calendar)return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const monthLabel=m=>new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(new Date(m+'-01T12:00:00')).replace(' г.','');
 const dayLabel=d=>new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(new Date(d+'T12:00:00'));
 const shortDay=d=>new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(new Date(d+'T12:00:00'));
 const today=calendar.iso(new Date()),firstMonth=today.slice(0,7),bookingEnd=calendar.bookingEnd,lastMonth=calendar.add(bookingEnd,-1).slice(0,7),months=[];
 for(let m=firstMonth;m<=lastMonth;){months.push(m);const d=new Date(m+'-01T12:00:00');d.setMonth(d.getMonth()+1);m=calendar.iso(d).slice(0,7);}
 const options=m=>months.map(value=>`<option value="${value}" ${value===m?'selected':''}>${monthLabel(value)}</option>`).join('');
 let section,limit=6,globalMonth=firstMonth,dirty=false,results=null,searching=false,requestVersion=0,showUnavailable=false;
 const S=window.BPDateSearch,initialURL=new URL(window.BBStayInitialURL||location.href),views=new Map();
 let activeHouse=initialURL.searchParams.get('house');if(!houses.some(h=>h.id===activeHouse))activeHouse='';
 const state={adults:2,children:[],guests:2,bath:false,tub:false,pets:false,fenced:false,arrival:'',departure:''},draft=state;
 const returning=window.BPBookingReturn?.selection(initialURL.search,houses,today,bookingEnd);
 if(returning){Object.assign(state,{adults:returning.adults,children:returning.children,guests:returning.guests,arrival:returning.arrival,departure:returning.departure});globalMonth=returning.month;}
 const storageKey='bp-date-search-trip-v1';
 function restoreTrip(){try{const t=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(t&&!S.dateError(t,today,bookingEnd)&&t.arrival&&t.departure){core.validateParty(t);Object.assign(state,{arrival:t.arrival,departure:t.departure,adults:t.adults,children:t.children,guests:t.adults+t.children.length});globalMonth=t.arrival.slice(0,7);return true;}}catch{}return false;}
 if(!returning)restoreTrip();
 function remember(trip=state){try{sessionStorage.setItem(storageKey,JSON.stringify({arrival:trip.arrival,departure:trip.departure,adults:trip.adults,children:trip.children}));}catch{}}
 const view=h=>{if(!views.has(h.id))views.set(h.id,{month:globalMonth,arrival:'',departure:'',picking:'arrival',data:null,inventory:{closed:{},prices:{}},error:'',loading:false,version:0,loadedMonth:''});return views.get(h.id);};
 const selected=(all=false)=>S.visible(houses,{...state,house:activeHouse},results,all||showUnavailable);
 const catalogueHref='bp-production-houses.html';
 const hasDates=()=>!!state.arrival&&!!state.departure&&!S.dateError(state,today,bookingEnd);
 const partyValid=()=>{try{core.validateParty(state);return true;}catch{return false;}};
 const canCheckout=()=>hasDates()&&partyValid();
 const trip=()=>hasDates()?shortDay(state.arrival)+' — '+shortDay(state.departure):'Даты пока не выбраны';
 function checkout(h){
  core.validateParty(state,h?[h]:[]);
  if(h)return window.BPBookingReturn.checkoutUrl({...state},h);
  const u=new URL('https://barskie-polya.ru/booking');
  for(const [k,v]of Object.entries({dfrom:state.arrival,dto:state.departure,adults:state.adults,children:JSON.stringify(state.children),scroll_to_rooms:1}))u.searchParams.set(k,v);
  return u.href;
 }
 function mount(){
  section=document.querySelector('#bb-stay');if(!section||!S)return;section.dataset.dateSearch='20261102';
  section.innerHTML=`<div class="bst-inner"><p class="bst-eyebrow">Барские поля</p><div class="bpc-section-heading"><h2>Свободные даты и цены</h2></div><p class="bst-intro">Сначала выберите даты — покажем подходящие дома. Или начните с дома и откройте его календарь.</p><p class="bpc-window">Даты отдыха — до 1 февраля 2027 включительно.</p><a class="bst-link bpc-catalogue-link" href="${catalogueHref}">Каталог всех 15 домов →</a><form class="bpds-form" aria-label="Подбор дома по датам"><div class="bpds-fields"><label>Заезд<input type="date" data-arrival aria-label="Дата заезда" min="${today}" max="${calendar.add(bookingEnd,-1)}"></label><label>Выезд<input type="date" data-departure aria-label="Дата выезда" min="${calendar.add(today,1)}" max="${bookingEnd}"></label><label>Взрослые<select data-adults aria-label="Взрослые">${Array.from({length:6},(_,i)=>`<option value="${i+1}" ${i===1?'selected':''}>${i+1}</option>`).join('')}</select></label><label>Дети<select data-children aria-label="Количество детей">${Array.from({length:5},(_,i)=>`<option value="${i}">${i===0?'Без детей':i}</option>`).join('')}</select></label><button type="submit" class="bst-btn bpds-submit" data-search>Показать дома на эти даты</button></div><div class="bpc-child-ages" aria-live="polite"></div><div class="bpds-form-bottom"><span>Даты можно выбрать в разных месяцах</span><button type="button" class="bst-link" data-undated>Пока без дат — посмотреть дома</button></div><p class="bpds-error" role="alert" hidden></p></form><details class="bst-preferences"><summary>Удобства дома</summary><div class="bst-filters">${Object.entries(S.filterLabels).map(([k,t])=>`<button type="button" class="bst-pill" data-filter="${k}" aria-pressed="false">${t}</button>`).join('')}</div></details><div class="bpds-active" aria-live="polite"></div><p class="bpc-apply-note" role="status"></p><div class="bpds-results-head"><div><p class="bpds-trip"></p><p class="bpc-count" role="status" aria-live="polite"></p></div><button type="button" class="bst-link" data-reset>Сбросить удобства</button></div><div class="bpds-uncertain" hidden></div><div class="bst-grid"></div><div class="bst-more"><button type="button" class="bst-secondary" data-more>Показать ещё дома</button></div><div class="bpds-other" hidden></div><div class="bst-simple-help"><p>Нужна помощь с выбором?</p><a href="https://barskie-polya.ru/booking?adults=2" data-module class="bst-link">Открыть модуль бронирования →</a><a href="tel:+74951503908" class="bst-link">+7 (495) 150-39-08</a></div></div>`;
  section.querySelector('.bpds-form').addEventListener('submit',e=>{e.preventDefault();search();});
  section.querySelector('[data-arrival]').value=state.arrival;section.querySelector('[data-departure]').value=state.departure;

  document.querySelectorAll('a[href="#bb-podbor"],a[href="#rec2241691831"],a[href="#rec1185039476"],a[href="https://barskie-polya.ru/booking"],a[href="/booking"]').forEach(a=>{a.href='#bb-stay';a.dataset.bbPlanner='';});
  document.querySelectorAll('a[href="#bp-doma"],a[href="https://barskie-polya.ru/#houses"],a[href="#houses"]').forEach(a=>{a.href=catalogueHref;delete a.dataset.bbPlanner;});
  document.querySelectorAll('a[href="bp-houses.html"],a[href="houses.html"]').forEach(a=>{a.href=catalogueHref;});
  section.addEventListener('click',onClick);section.addEventListener('change',onChange);
  window.addEventListener('click',e=>{const a=e.target.closest?.('a[data-bb-planner],a[href="#bb-stay"],a[href="#houses"]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();const menu=a.closest('#rec1185050696'),close=menu?.querySelector('[data-elem-id="1752787864116"]');if(close)close.click();const go=()=>section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});if(close)setTimeout(go,420);else go();},{capture:true});
  render();if(hasDates())search();if(['#bb-stay','#houses'].includes(location.hash))section.scrollIntoView();
 }
 function syncControls(){if(!section)return;section.querySelector('[data-arrival]').value=state.arrival;section.querySelector('[data-departure]').value=state.departure;section.querySelector('[data-departure]').min=state.arrival?calendar.add(state.arrival,1):calendar.add(today,1);section.querySelector('[data-adults]').value=String(state.adults);section.querySelector('[data-children]').value=String(state.children.length);childAges();}
 function updateFilters(){
  section.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(!!state[b.dataset.filter])));
  const active=S.activeFilters(state);
  section.querySelector('.bpds-active').innerHTML=(activeHouse?`<button type="button" data-all-houses>Выбран один дом · показать остальные ×</button>`:'')+active.map(f=>`<button type="button" data-remove-filter="${f.key}">${esc(f.label)} ×</button>`).join('');
  section.querySelector('.bpds-active').hidden=!active.length&&!activeHouse;
  section.querySelector('[data-reset]').hidden=!active.length;
 }
 function render(){
  const list=selected(),all=selected(true),unknown=all.filter(h=>results?.get(h.id)?.status==='unknown'),available=all.filter(h=>results?.get(h.id)?.status==='available'),closed=all.filter(h=>results?.get(h.id)?.status==='unavailable');
  updateFilters();section.querySelector('.bpds-trip').textContent=trip();
  section.querySelector('.bpc-count').textContent=searching?'Проверяем даты в Bnovo…':results?`${available.length} доступны · ${unknown.length} ${unknown.length===1?'требует':'требуют'} проверки${closed.length?' · '+closed.length+' не подходят на эти даты':''}`:`${all.length} из ${houses.length} домов по вашим пожеланиям · наличие проверим по датам`;
  section.querySelector('.bst-grid').setAttribute('aria-busy',String(searching));
  section.querySelector('[data-search]').disabled=searching;
  section.querySelector('[data-search]').textContent=searching?'Проверяем…':'Показать дома на эти даты';
  const note=section.querySelector('.bpds-uncertain');note.hidden=!results||!unknown.length;
  if(!note.hidden)note.innerHTML=`<strong>${unknown.length} ${unknown.length===1?'дом требует':'домов требуют'} проверки в модуле бронирования.</strong><span>Отсутствие цены в календаре не означает, что дом занят. Праздничные тарифы проверим на весь период.</span><a href="${esc(checkout())}">Проверить все дома на эти даты →</a>`;
  section.querySelector('.bst-grid').innerHTML=searching?'<p class="bpds-loading">Проверяем все подходящие дома. Пожалуйста, подождите.</p>':list.slice(0,limit).map(h=>{
   const r=results?.get(h.id),status=r?.status||'undated';
   const badge=r?`<p class="bpds-status bpds-status--${status}">${status==='available'?'Есть заезд на выбранные даты':status==='unknown'?'Наличие подтвердит модуль бронирования':esc(r.reason)}</p>`:'';
   const action=r&&status!=='unavailable'?(status==='unknown'?`<a class="bst-btn bpds-book" data-native-check href="${esc(checkout(h))}">Проверить в модуле бронирования</a>`:`<button type="button" class="bst-btn bpds-book" data-book-card>Забронировать эти даты</button>`):'';
   return `<article class="bst-card bpc-card" data-house="${h.id}" data-availability="${status}"><a class="bst-photo" href="${esc(h.url)}" aria-label="${esc(h.name)} — фотографии"><img src="${esc(h.image.replace('/static.tildacdn.com/','/static.tildacdn.info/'))}" alt="${esc(h.name)}" loading="lazy" width="600" height="450"></a><div class="bst-card-body"><h3>${esc(h.name)}</h3><p class="bst-card-tag">До ${h.capacity} гостей · ${esc(h.bathLabel)}</p><p class="bst-house-details">${esc(h.rooms)}<br>Территория: ${esc(h.territory.toLowerCase())}</p>${badge}${action}<div class="bpc-calendar-host"></div><a class="bst-link bpc-photo-link" href="${esc(h.url)}">Фотографии и планировка →</a></div></article>`;
  }).join('');
  if(!searching&&!list.length)section.querySelector('.bst-grid').innerHTML=`<div class="bpc-empty">${all.length?'На эти даты календарь не подтвердил подходящий заезд. Проверьте предложения в модуле бронирования или измените даты.':'Нет домов с таким сочетанием удобств и числом гостей. Сбросьте фильтры.'}${canCheckout()?`<a class="bst-link" href="${esc(checkout())}">Проверить в модуле бронирования →</a>`:''}</div>`;
  section.querySelector('.bst-more').hidden=searching||limit>=list.length;
  const other=section.querySelector('.bpds-other');other.hidden=searching||!closed.length;
  other.innerHTML=closed.length?`<button type="button" class="bst-link" data-show-other>${showUnavailable?'Скрыть неподходящие':'Показать также неподходящие на эти даты'} (${closed.length})</button>`:'';
  for(const h of list.slice(0,limit))draw(h);
  const moduleLink=section.querySelector('[data-module]');if(partyValid()){moduleLink.href=hasDates()?checkout():'https://barskie-polya.ru/booking?'+new URLSearchParams({adults:state.adults,children:JSON.stringify(state.children)});moduleLink.removeAttribute('aria-disabled');moduleLink.textContent='Открыть модуль бронирования →';}else{moduleLink.removeAttribute('href');moduleLink.setAttribute('aria-disabled','true');moduleLink.textContent='Для перехода укажите возраст детей';}
 }
 function clearResults(){requestVersion++;searching=false;results=null;showUnavailable=false;limit=6;section.querySelector('.bpc-apply-note').textContent='';}
 async function search(){
  const error=S.dateError(state,today,bookingEnd);try{core.validateParty(state);}catch(e){showError(e.message);return;}
  if(error||!hasDates()){showError(error||'Выберите даты заезда и выезда.');return;}
  showError('');const token=++requestVersion,request={...state,children:[...state.children]},candidates=S.visible(houses,{...request,house:activeHouse},null),next=new Map();
  searching=true;results=null;showUnavailable=false;limit=6;globalMonth=request.arrival.slice(0,7);render();let done=0;
  await Promise.all(candidates.map(async h=>{
   let data,r;try{data=await calendar.loadStay(h.roomId,request.arrival,request.departure);r=S.inspect(calendar,data,request.arrival,request.departure);}catch{r={status:'unknown',reason:'Календарь временно не ответил. Проверьте дом в модуле бронирования.'};}
   if(token!==requestVersion)return;next.set(h.id,r);done++;
   const v=view(h);v.version++;v.loading=false;v.arrival=request.arrival;v.departure=request.departure;v.month=globalMonth;v.picking='complete';v.error='';v.loadedMonth='';v.data=data||null;v.inventory=data?{closed:{...data.closed},prices:{...data.prices}}:{closed:{},prices:{}};
   section.querySelector('.bpc-count').textContent=`Проверяем даты: ${done} из ${candidates.length} домов`;
  }));
  if(token!==requestVersion)return;results=next;searching=false;remember();render();
 }
 function showError(text){const el=section.querySelector('.bpds-error');el.textContent=text;el.hidden=!text;}
 function criteriaChanged(){
  clearResults();showError('');updateFilters();
  try{core.validateParty(state);}catch(e){render();showError(e.message);return;}
  if(hasDates()&&!S.dateError(state,today,bookingEnd))search();else render();
 }
 function host(h){return section.querySelector(`[data-house="${h.id}"] .bpc-calendar-host`);}
 async function load(h,fresh=false){
  const s=view(h),month=s.month;if(s.loading||(!fresh&&s.loadedMonth===month&&s.data))return;const request=++s.version;s.loading=true;s.error='';draw(h);
  try{const data=await calendar.load(h.roomId,month,fresh);if(s.version!==request)return;
   for(const part of ['closed','prices']){for(const d of Object.keys(s.inventory[part]))if(d>=data.from&&d<data.to)delete s.inventory[part][d];Object.assign(s.inventory[part],data[part]);}s.data=s.inventory;s.loadedMonth=month;
  }
  catch{if(s.version!==request)return;s.data=null;s.error='Календарь временно не загрузился. Попробуйте ещё раз.';}
  finally{if(s.version===request){s.loading=false;draw(h);}}
 }
 function draw(h){
  const el=host(h);if(!el)return;const s=view(h),[y,m]=s.month.split('-').map(Number),days=new Date(y,m,0).getDate(),offset=(new Date(y,m-1,1).getDay()+6)%7;
  const heading=`<div class="bpc-month"><button type="button" data-month-step="-1" aria-label="Предыдущий месяц" ${s.month===months[0]?'disabled':''}>‹</button><select data-month aria-label="Месяц для ${esc(h.name)}">${options(s.month)}</select><button type="button" data-month-step="1" aria-label="Следующий месяц" ${s.month===months.at(-1)?'disabled':''}>›</button></div>`;
  const first=s.month+'-01';
  let content=`<div class="bpc-week" aria-hidden="true">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=>`<span>${d}</span>`).join('')}</div><div class="bpc-days" aria-busy="${s.loading}">${'<span></span>'.repeat(offset)}${Array.from({length:42-offset},(_,i)=>day(h,calendar.add(first,i),i>=days)).join('')}</div>`;
  let hint=s.loading?'Проверяем доступность…':s.data?'Выберите заезд, затем выезд':'Нажмите «Повторить», чтобы загрузить даты',button='Забронировать',enabled=false;
  if(s.arrival&&!s.departure){hint='Теперь выберите день выезда.';const r=calendar.rule(s.data||{closed:{},prices:{}},s.arrival);if(r.minimum>1)hint+=` От ${r.minimum} ночей. Выезд — не раньше ${dayLabel(calendar.add(s.arrival,r.minimum))}.`;}
  if(s.arrival&&s.departure){const n=calendar.nights(s.arrival,s.departure),word=n%10===1&&n%100!==11?'ночь':n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?'ночи':'ночей';hint=`${dayLabel(s.arrival)} — ${dayLabel(s.departure)} · ${n} ${word}`;button='Забронировать эти даты';enabled=partyValid()&&!!s.data&&!s.error&&!s.loading&&S.inspect(calendar,s.data,s.arrival,s.departure).status!=='unavailable';if(enabled&&S.inspect(calendar,s.data,s.arrival,s.departure).status==='unknown')button='Проверить эти даты в модуле';}
  if(s.arrival&&s.picking==='arrival')hint='Выберите новый день заезда';
  if(s.departure&&s.picking==='departure')hint='Выберите новый день выезда';
  const picks=`<div class="bpc-selection"><button type="button" data-pick="arrival" aria-label="Заезд: ${s.arrival?dayLabel(s.arrival):'выбрать дату'}" class="${s.picking==='arrival'?'is-active':''}"><small>1. Заезд</small><span>${s.arrival?shortDay(s.arrival):'Выбрать'}</span></button><span class="bpc-selection-arrow" aria-hidden="true">→</span><button type="button" data-pick="departure" aria-label="Выезд: ${s.departure?dayLabel(s.departure):'выбрать дату'}" class="${s.picking==='departure'?'is-active':''}" ${s.arrival?'':'disabled'}><small>2. Выезд</small><span>${s.departure?shortDay(s.departure):'Выбрать'}</span></button></div>`;
  const prices=s.data?Object.entries(s.data.prices).filter(([d,v])=>d.startsWith(s.month)&&d>=today&&v?.p>0&&calendar.rule(s.data,d).available).map(([,v])=>v.p):[];
  const quote=s.arrival&&s.departure&&s.data?S.inspect(calendar,s.data,s.arrival,s.departure):null;
  const priceText=quote?(quote.priceFrom?'от <strong>'+quote.priceFrom.toLocaleString('ru-RU')+' ₽</strong> за весь период':'Тариф на эти даты — в Bnovo'):(prices.length?'от <strong>'+Math.min(...prices).toLocaleString('ru-RU')+' ₽</strong> / ночь':'Выберите даты, чтобы узнать стоимость');
  const priceNote=quote?'Тариф и итоговую стоимость на выбранный состав гостей подтвердит Bnovo.':'Цена за двоих. Итог — при бронировании.';
  el.innerHTML=`<div class="bpc-calendar">${heading}<p class="bpc-weekend-note"><strong>${s.picking==='departure'?'Сейчас выбираете выезд':s.arrival&&s.departure?'Даты выбраны':'Выберите дату заезда'}</strong><span>${s.picking==='departure'?'Для другого заезда нажмите «1. Заезд». Неподходящий выезд не означает, что дом занят.':'Минимальный срок зависит от даты. Праздничные тарифы проверим в модуле бронирования.'}</span></p>${picks}<p class="bpc-hint" aria-live="polite">${hint}</p>${content}<div class="bpc-card-legend"><span><i class="bpc-key-free"></i>Свободно</span><span><i class="bpc-key-closed"></i>${s.picking==='departure'&&s.arrival?'Не подходит для выезда':'Нет заезда'}</span></div></div><div class="bpc-price-row"><span>${priceText}</span>${s.arrival?'<button type="button" class="bst-link bpc-clear" data-clear>Сбросить даты</button>':''}</div>${quote||prices.length?'<small class="bpc-rate-note">'+priceNote+'</small>':''}<p class="bpc-error" role="alert" ${s.error?'':'hidden'}>${esc(s.error)} ${s.error&&s.arrival&&s.departure?'<a href="'+esc(window.BPBookingReturn.checkoutUrl({...state,arrival:s.arrival,departure:s.departure},h))+'">Открыть модуль бронирования →</a>':''} ${s.error&&!s.loading?'<button type="button" class="bst-link" data-retry>Повторить</button>':''}</p><button type="button" class="bst-btn bpc-book" data-book ${enabled?'':'disabled'}>${button}</button><small class="bpc-note">${enabled?'Дом и даты передадим в модуль бронирования. Итоговую доступность и тариф подтвердит Bnovo.':'Выберите заезд и выезд. Для смены заезда нажмите «1. Заезд». Неподходящий выезд не означает занятость дома.'}</small>`;
 }
 function day(h,d,adjacent=false){
  const s=view(h),r=calendar.rule(s.data||{closed:{},prices:{}},d),pickingEnd=s.arrival&&s.picking==='departure';
  const result=pickingEnd&&d>s.arrival&&s.data?S.inspect(calendar,s.data,s.arrival,d):null;
  const selectable=pickingEnd?(d===s.arrival||result&&result.status!=='unavailable'):r.known&&!r.noArrival;
  const blocked=s.loading||!s.data||d<today||d>bookingEnd||!selectable||!pickingEnd&&d>=bookingEnd,chosen=d===s.arrival||d===s.departure,inRange=s.departure&&d>s.arrival&&d<s.departure;
  const status=d<today?'past':pickingEnd&&d!==s.arrival?(result?.status==='available'?'free':result?.status==='unknown'?'unknown':'not-checkout'):r.noArrival?'closed':r.available?'free':'unknown';
  const availability=pickingEnd&&d!==s.arrival?(result?.status==='available'?'Можно выбрать для выезда':result?.status==='unknown'?'Выезд: наличие подтвердит модуль бронирования':'Не подходит для выезда с выбранным заездом'):(r.available?'Доступен заезд':r.noArrival?'Заезд недоступен':'Наличие подтвердит модуль бронирования');
  const label=`${dayLabel(d)}. ${availability}${!pickingEnd&&r.minimum>1?'. От '+r.minimum+' ночей':''}`;
  return `<button type="button" class="bpc-day bpc-day--${status} ${adjacent?'bpc-day--adjacent':''} ${chosen?'bpc-day--chosen':''} ${inRange?'bpc-day--range':''}" data-day="${d}" aria-label="${esc(label)}" aria-pressed="${!!chosen}" ${blocked?'disabled':''}><span>${Number(d.slice(-2))}${adjacent?'<small>'+new Intl.DateTimeFormat('ru-RU',{month:'short'}).format(new Date(d+'T12:00:00'))+'</small>':''}</span></button>`;
 }
 async function choose(h,d){
  const s=view(h);if(s.loading||!s.data)return;
  const selection=S.nextSelection(calendar,s,d,s.data);if(!selection)return;
  const changed=selection.month!==s.month;Object.assign(s,selection,{error:''});
  draw(h);if(changed&&months.includes(s.month))await load(h);
 }
 async function book(h){
  const s=view(h);if(!s.arrival||!s.departure||s.loading)return;s.loading=true;s.error='';draw(h);
  try{
   core.validateParty(state,[h]);const data=await calendar.loadStay(h.roomId,s.arrival,s.departure);s.data=data;
   const result=S.inspect(calendar,data,s.arrival,s.departure);
   if(result.status==='unavailable'){s.error=result.reason;return;}
   remember({...state,arrival:s.arrival,departure:s.departure});location.assign(window.BPBookingReturn.checkoutUrl({...state,arrival:s.arrival,departure:s.departure},h));
  }catch{s.error='Не удалось перепроверить даты. Откройте модуль бронирования по ссылке ниже.';const note=section.querySelector(`[data-house="${h.id}"] .bpds-status`);if(note)note.innerHTML=esc(s.error)+' <a href="'+esc(window.BPBookingReturn.checkoutUrl({...state,arrival:s.arrival,departure:s.departure},h))+'">Открыть модуль бронирования →</a>';}
  finally{s.loading=false;draw(h);}
 }
 function onChange(e){
  if(e.target.matches('[data-arrival],[data-departure]')){
   state.arrival=section.querySelector('[data-arrival]').value;state.departure=section.querySelector('[data-departure]').value;
   section.querySelector('[data-departure]').min=state.arrival?calendar.add(state.arrival,1):calendar.add(today,1);
   clearResults();globalMonth=core.validDate(state.arrival)?state.arrival.slice(0,7):firstMonth;for(const v of views.values()){v.version++;v.loading=false;v.month=globalMonth;v.arrival='';v.departure='';v.picking='arrival';v.loadedMonth='';v.error='';}render();showError(S.dateError(state,today,bookingEnd));return;
  }
  if(e.target.matches('[data-adults],[data-children]')){
   state.adults=Number(section.querySelector('[data-adults]').value);const select=section.querySelector('[data-children]'),max=Math.min(4,6-state.adults);
   [...select.options].forEach(o=>o.disabled=Number(o.value)>max);const count=Math.min(Number(select.value),max);select.value=String(count);
   state.children=Array.from({length:count},(_,i)=>state.children[i]??null);state.guests=state.adults+count;childAges();criteriaChanged();
  }
  if(e.target.matches('[data-child-age]')){state.children[Number(e.target.dataset.childAge)]=e.target.value===''?null:Number(e.target.value);criteriaChanged();}
  if(e.target.matches('[data-month]')){const h=houses.find(h=>h.id===e.target.closest('[data-house]').dataset.house),s=view(h);s.version++;s.loading=false;s.month=e.target.value;s.data=null;s.error='';draw(h);load(h);}
 }
 function childAges(){section.querySelector('.bpc-child-ages').innerHTML=draft.children.map((age,i)=>`<label>Возраст ребёнка ${i+1}<select data-child-age="${i}" aria-label="Возраст ребёнка ${i+1}"><option value="">Укажите возраст</option>${Array.from({length:18},(_,a)=>`<option value="${a}" ${age===a?'selected':''}>${a===0?'До года':a}</option>`).join('')}</select></label>`).join('');}
 function onClick(e){
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if('allHouses'in d){activeHouse='';criteriaChanged();return;}
  if('filter'in d||'removeFilter'in d){const key=d.filter||d.removeFilter;state[key]=!state[key];criteriaChanged();return;}
  if('reset'in d){for(const key of Object.keys(S.filterLabels))state[key]=false;activeHouse='';criteriaChanged();return;}
  if('undated'in d){try{sessionStorage.removeItem(storageKey);}catch{}clearResults();state.arrival='';state.departure='';section.querySelector('[data-arrival]').value='';section.querySelector('[data-departure]').value='';for(const v of views.values()){v.arrival='';v.departure='';v.picking='arrival';v.error='';}showError('');render();return;}
  if('more'in d){limit+=6;render();return;}
  if('showOther'in d){showUnavailable=!showUnavailable;render();return;}
  const h=houses.find(h=>h.id===b.closest('[data-house]')?.dataset.house);if(!h)return;const s=view(h);
  if('calendarOpen'in d){if(hasDates()&&!s.arrival&&!S.dateError(state,today,bookingEnd)){s.arrival=state.arrival;s.departure=state.departure;s.month=state.arrival.slice(0,7);s.picking='complete';}load(h);}
  if('bookCard'in d){if(results?.get(h.id)?.status==='unknown')location.assign(checkout(h));else book(h);}
  if('book'in d)book(h);
  if('day'in d)choose(h,d.day);
  if('clear'in d){s.arrival='';s.departure='';s.picking='arrival';s.error='';draw(h);}
  if('pick'in d){s.picking=d.pick;if(s.arrival&&s.month!==s.arrival.slice(0,7)){s.month=s.arrival.slice(0,7);s.loadedMonth='';load(h);}s.error='';draw(h);}
  if('retry'in d)load(h,true);
  if('monthStep'in d){const index=months.indexOf(s.month)+Number(d.monthStep);if(months[index]){s.version++;s.loading=false;s.month=months[index];s.data=null;s.error='';draw(h);load(h);}}
 }
 window.addEventListener('pageshow',event=>{const refresh=event.persisted&&restoreTrip();requestAnimationFrame(()=>{syncControls();if(refresh&&section){clearResults();if(hasDates())search();else render();}});});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

