
/* Two clear starting points, one handoff with the chosen dates and guests. */
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
 let section,tripDialog,tripDraft,tripReturnFocus,limit=6,globalMonth=firstMonth,dirty=false,results=null,searching=false,requestVersion=0,showUnavailable=false;
 const S=window.BPDateSearch,initialURL=new URL(window.BBStayInitialURL||location.href),views=new Map();
 let activeHouse=initialURL.searchParams.get('house');if(!houses.some(h=>h.id===activeHouse))activeHouse='';
 let mode=activeHouse?'houses':'dates',validationAttempted=false;
 const state={adults:2,children:[],guests:2,bath:false,tub:false,pets:false,fenced:false,arrival:'',departure:''},draft=state;
 const returning=window.BPBookingReturn?.selection(initialURL.search,houses,today,bookingEnd);
 if(returning){Object.assign(state,{adults:returning.adults,children:returning.children,guests:returning.guests,arrival:returning.arrival,departure:returning.departure});globalMonth=returning.month;}
 const storageKey='bp-date-search-trip-v1';
 function restoreTrip(){try{const t=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(t&&!S.dateError(t,today,bookingEnd)&&t.arrival&&t.departure){core.validateParty(t);Object.assign(state,{arrival:t.arrival,departure:t.departure,adults:t.adults,children:t.children,guests:t.adults+t.children.length});globalMonth=t.arrival.slice(0,7);mode=t.mode==='houses'?'houses':'dates';activeHouse=mode==='houses'&&houses.some(h=>h.id===t.house)?t.house:'';return true;}}catch{}return false;}
 if(!returning)restoreTrip();
 function remember(trip=state){try{sessionStorage.setItem(storageKey,JSON.stringify({arrival:trip.arrival,departure:trip.departure,adults:trip.adults,children:trip.children,mode,house:activeHouse}));}catch{}}
 const view=h=>{if(!views.has(h.id)){const saved=mode==='houses'&&state.arrival&&state.departure&&!S.dateError(state,today,bookingEnd);views.set(h.id,{month:saved?state.arrival.slice(0,7):globalMonth,arrival:saved?state.arrival:'',departure:saved?state.departure:'',picking:saved?'complete':'arrival',data:null,inventory:{closed:{},prices:{}},error:'',loading:false,version:0,loadedMonth:''});}return views.get(h.id);};
 const selected=(all=false)=>S.visible(houses,{...state,house:activeHouse},results,all||showUnavailable);
 const catalogueHref='bp-production-houses.html';
 const hasDates=()=>!!state.arrival&&!!state.departure&&!S.dateError(state,today,bookingEnd);
 const partyValid=()=>{try{core.validateParty(state);return true;}catch{return false;}};
 const canCheckout=()=>hasDates()&&partyValid();
 const trip=()=>hasDates()?shortDay(state.arrival)+' — '+shortDay(state.departure):'Даты пока не выбраны';
 const nightsLabel=n=>`${n} ${n%10===1&&n%100!==11?'ночь':n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?'ночи':'ночей'}`;
 const partyLabel=()=>`${state.adults} ${state.adults===1?'взрослый':'взрослых'}${state.children.length?' · дети: '+state.children.map(a=>a===null?'возраст не указан':a===0?'до года':a+' лет').join(', '):''}`;
 const dateIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18"/></svg>';
 const tripField=(key,label)=>`<div class="bpds-date-field"><span>${label}</span><input type="hidden" data-${key}><button type="button" class="bpds-date-control" data-open-trip="${key}" aria-haspopup="dialog" aria-controls="bpds-trip-calendar"><span data-date-label="${key}">Выбрать дату</span>${dateIcon}</button></div>`;
 function checkout(h){
  core.validateParty(state,h?[h]:[]);
  if(h)return window.BPBookingReturn.checkoutUrl({...state},h);
  const u=new URL('https://barskie-polya.ru/booking');
  for(const [k,v]of Object.entries({dfrom:state.arrival,dto:state.departure,adults:state.adults,children:JSON.stringify(state.children),scroll_to_rooms:1}))u.searchParams.set(k,v);
  return u.href;
 }
 function mount(){
  section=document.querySelector('#bb-stay');if(!section||!S)return;section.dataset.dateSearch='20261102';
  section.innerHTML=`<div class="bst-inner">
   <p class="bst-eyebrow">Барские поля</p><div class="bpc-section-heading"><h2>Свободные даты и цены</h2></div>
   <p class="bst-intro">Выберите даты и гостей — подберём дома для вашего отдыха.</p>
   <div class="bpds-modes" role="group" aria-label="С чего начать подбор">
    <button type="button" data-mode="dates" aria-pressed="true">По датам</button>
    <button type="button" data-mode="houses" aria-pressed="false">Сначала выбрать дом</button>
   </div>
   <form class="bpds-form" aria-label="Подбор дома по датам">
    <p class="bpds-form-label">Когда и с кем хотите отдохнуть?</p>
    <div class="bpds-fields">
     ${tripField('arrival','Заезд')}
     ${tripField('departure','Выезд')}
     <label>Взрослые<select data-adults aria-label="Взрослые">${Array.from({length:6},(_,i)=>`<option value="${i+1}" ${i===1?'selected':''}>${i+1}</option>`).join('')}</select></label>
     <label>Дети<select data-children aria-label="Количество детей">${Array.from({length:5},(_,i)=>`<option value="${i}">${i===0?'Без детей':i}</option>`).join('')}</select></label>
     <div class="bpc-child-ages" aria-live="polite"></div>
     <button type="submit" class="bst-btn bpds-submit" data-search>Найти дом</button>
    </div>
    <p class="bpds-form-hint">Дом заранее выбирать не нужно. Проверим все подходящие варианты.</p>
    <p class="bpds-error" role="alert" hidden></p>
   </form>
   <dialog id="bpds-trip-calendar" class="bst bpc-date-dialog bpds-trip-dialog" data-brand="bp" aria-labelledby="bpds-trip-title"><header class="bpc-dialog-heading"><div><p>Барские поля</p><h2 id="bpds-trip-title">Даты отдыха</h2></div><button type="button" class="bpc-dialog-close" data-trip-close aria-label="Закрыть выбор дат">×</button></header><div class="bpds-trip-body"></div><footer class="bpds-trip-footer"><button type="button" class="bst-link" data-trip-clear>Сбросить</button><button type="button" class="bst-btn" data-trip-apply>Применить даты</button></footer></dialog>
   <details class="bst-preferences"><summary>Удобства дома</summary><div class="bst-filters">${Object.entries(S.filterLabels).map(([k,t])=>`<button type="button" class="bst-pill" data-filter="${k}" aria-pressed="false">${t}</button>`).join('')}</div></details>
   <div class="bpds-active" aria-live="polite"></div><p class="bpc-apply-note" role="status"></p>
   <div class="bpds-results-head"><div><p class="bpds-trip"></p><p class="bpds-party"></p><p class="bpc-count" role="status" aria-live="polite"></p></div><div class="bpds-result-actions"><button type="button" class="bst-link" data-edit-dates>Изменить даты</button><button type="button" class="bst-link" data-reset>Сбросить удобства</button></div></div>
   <div class="bpds-all-options" hidden><a class="bst-secondary" data-all-booking data-checkout>Все варианты и цены на эти даты →</a><p>Можно сравнить все дома и забронировать подходящий. Даты и гости сохранятся.</p></div>
   <div class="bpds-uncertain" hidden></div><div class="bst-grid"></div>
   <div class="bst-more"><button type="button" class="bst-secondary" data-more>Показать ещё дома</button></div><div class="bpds-other" hidden></div>
   <div class="bst-simple-help"><p>Поможем подобрать отдых</p><a href="tel:+74951503908" class="bst-link">+7 (495) 150-39-08</a></div>
   <p class="bpc-window bpds-footer-note">Даты отдыха — до 1 февраля 2027 включительно. <a href="${catalogueHref}">Каталог всех 15 домов →</a></p>
  </div>`;
  tripDialog=section.querySelector('#bpds-trip-calendar');
  tripDialog.addEventListener('close',()=>{if(tripDialog.open)return;if(!document.querySelector('dialog[open]'))document.documentElement.classList.remove('bpc-calendar-open');tripReturnFocus?.focus({preventScroll:true});});
  tripDialog.addEventListener('cancel',e=>{e.preventDefault();tripDialog.close();});
  tripDialog.addEventListener('click',e=>{if(e.target!==tripDialog)return;const r=tripDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)tripDialog.close();});
  tripDialog.addEventListener('keydown',tripKeys);
  section.querySelector('.bpds-form').addEventListener('submit',e=>{e.preventDefault();if(mode==='dates')search();});
  syncControls();

  document.querySelectorAll('a[href="#bb-podbor"],a[href="#rec2241691831"],a[href="#rec1185039476"],a[href="https://barskie-polya.ru/booking"],a[href="/booking"]').forEach(a=>{a.href='#bb-stay';a.dataset.bbPlanner='';});
  document.querySelectorAll('a[href="#bp-doma"],a[href="https://barskie-polya.ru/#houses"],a[href="#houses"]').forEach(a=>{a.href=catalogueHref;delete a.dataset.bbPlanner;});
  document.querySelectorAll('a[href="bp-houses.html"],a[href="houses.html"]').forEach(a=>{a.href=catalogueHref;});
  section.addEventListener('click',onClick);section.addEventListener('change',onChange);
  window.addEventListener('click',e=>{const a=e.target.closest?.('a[data-bb-planner],a[href="#bb-stay"],a[href="#houses"]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();const menu=a.closest('#rec1185050696'),close=menu?.querySelector('[data-elem-id="1752787864116"]');if(close)close.click();const go=()=>section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});if(close)setTimeout(go,420);else go();},{capture:true});
  render();if(mode==='dates'&&hasDates())search();if(['#bb-stay','#houses'].includes(location.hash))section.scrollIntoView();
 }
 function syncControls(){if(!section)return;for(const key of ['arrival','departure']){section.querySelector(`[data-${key}]`).value=state[key];const button=section.querySelector(`[data-open-trip="${key}"]`);button.querySelector('[data-date-label]').textContent=state[key]?shortDay(state[key]):'Выбрать дату';button.setAttribute('aria-label',(key==='arrival'?'Заезд: ':'Выезд: ')+(state[key]?dayLabel(state[key]):'выбрать дату'));}section.querySelector('[data-adults]').value=String(state.adults);const children=section.querySelector('[data-children]');children.value=String(state.children.length);[...children.options].forEach(o=>o.disabled=Number(o.value)>Math.min(4,6-state.adults));childAges();}
 const tripMonth=day=>day.slice(0,7)<firstMonth?firstMonth:day.slice(0,7)>lastMonth?lastMonth:day.slice(0,7);
 function openTrip(which,opener){
  tripReturnFocus=opener||section.querySelector(`[data-open-trip="${which}"]`);
  const focus=state[which]||state.arrival||today;
  tripDraft={arrival:state.arrival,departure:state.departure,picking:which==='departure'&&state.arrival?'departure':'arrival',month:tripMonth(focus),focus};
  drawTrip();document.documentElement.classList.add('bpc-calendar-open');tripDialog.showModal();tripDialog.querySelector(`[data-trip-day="${focus}"]:not(:disabled)`)?.focus({preventScroll:true});
 }
 function drawTrip(focusDay){
  const s=tripDraft,first=s.month+'-01',[y,m]=s.month.split('-').map(Number),count=new Date(y,m,0).getDate(),offset=(new Date(y,m-1,1).getDay()+6)%7;
  const complete=s.arrival&&s.departure&&!S.dateError(s,today,bookingEnd);
  const focus=focusDay||s.focus||s.arrival||today;
  const hint=complete?`${dayLabel(s.arrival)} — ${dayLabel(s.departure)} · ${nightsLabel(calendar.nights(s.arrival,s.departure))}`:s.picking==='departure'?'Теперь выберите дату выезда.':'Выберите дату заезда.';
  tripDialog.querySelector('.bpds-trip-body').innerHTML=`<div class="bpds-trip-picks">${['arrival','departure'].map((key,i)=>`<button type="button" data-trip-pick="${key}" aria-pressed="${s.picking===key}" ${key==='departure'&&!s.arrival?'disabled':''}><small>${i+1}. ${i===0?'Заезд':'Выезд'}</small><span>${s[key]?shortDay(s[key]):'Выбрать дату'}</span></button>`).join('')}</div><p class="bpds-trip-hint" role="status" aria-live="polite">${hint}</p>
   <div class="bpds-trip-month"><button type="button" data-trip-step="-1" aria-label="Предыдущий месяц" ${s.month===firstMonth?'disabled':''}>‹</button><strong>${monthLabel(s.month)}</strong><button type="button" data-trip-step="1" aria-label="Следующий месяц" ${s.month===lastMonth?'disabled':''}>›</button></div>
   <div class="bpds-trip-week" aria-hidden="true">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=>`<span>${d}</span>`).join('')}</div><div class="bpds-trip-days" role="group" aria-label="Дни месяца">${'<span></span>'.repeat(offset)}${Array.from({length:42-offset},(_,i)=>{
    const d=calendar.add(first,i),disabled=d<today||d>bookingEnd||d===bookingEnd&&s.picking!=='departure',chosen=d===s.arrival||d===s.departure,range=s.departure&&d>s.arrival&&d<s.departure;
    return `<button type="button" data-trip-day="${d}" tabindex="${d===focus&&!disabled?'0':'-1'}" aria-label="${dayLabel(d)}${chosen?d===s.arrival?', заезд':', выезд':''}" aria-pressed="${chosen}" class="${chosen?'is-chosen':''} ${range?'is-range':''} ${i>=count?'is-adjacent':''}" ${disabled?'disabled':''}>${Number(d.slice(-2))}${i>=count?'<small>'+new Intl.DateTimeFormat('ru-RU',{month:'short'}).format(new Date(d+'T12:00:00'))+'</small>':''}</button>`;
   }).join('')}</div><p class="bpds-trip-note">После выбора дат проверим подходящие дома.</p>`;
  const removing=s.cleared&&!s.arrival&&!s.departure&&hasDates();
  tripDialog.querySelector('[data-trip-apply]').disabled=!complete&&!removing;
  tripDialog.querySelector('[data-trip-apply]').textContent=removing?'Убрать даты':'Применить даты';
  if(focusDay)tripDialog.querySelector(`[data-trip-day="${focusDay}"]:not(:disabled)`)?.focus({preventScroll:true});
 }
 function stepTrip(step){const index=months.indexOf(tripDraft.month)+step;if(!months[index])return;tripDraft.month=months[index];const first=tripDraft.month+'-01';tripDraft.focus=first<today?today:first;drawTrip(tripDraft.focus);}
 function tripKeys(e){
  const button=e.target.closest('[data-trip-day]');if(!button)return;
  if(e.key==='PageDown'||e.key==='PageUp'){e.preventDefault();stepTrip(e.key==='PageDown'?1:-1);return;}
  const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];if(!delta)return;
  e.preventDefault();const day=calendar.add(button.dataset.tripDay,delta);if(day<today||day>bookingEnd||day===bookingEnd&&tripDraft.picking!=='departure')return;tripDraft.month=tripMonth(day);tripDraft.focus=day;drawTrip(day);
 }
 function applyTrip(){
  const removing=tripDraft.cleared&&!tripDraft.arrival&&!tripDraft.departure;
  if(!removing&&(!tripDraft.arrival||!tripDraft.departure||S.dateError(tripDraft,today,bookingEnd)))return;
  state.arrival=tripDraft.arrival;state.departure=tripDraft.departure;globalMonth=state.arrival?state.arrival.slice(0,7):firstMonth;clearResults();showError('');
  for(const v of views.values()){v.version++;v.loading=false;v.month=globalMonth;v.arrival='';v.departure='';v.picking='arrival';v.loadedMonth='';v.error='';}
  syncControls();render();if(removing){try{sessionStorage.removeItem(storageKey);}catch{}}else if(partyValid())remember();tripDialog.close();
 }
 function updateFilters(){
  section.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(!!state[b.dataset.filter])));
  const active=S.activeFilters(state);
  section.querySelector('.bpds-active').innerHTML=(activeHouse?`<button type="button" data-all-houses>Выбран один дом · показать остальные ×</button>`:'')+active.map(f=>`<button type="button" data-remove-filter="${f.key}">${esc(f.label)} ×</button>`).join('');
  section.querySelector('.bpds-active').hidden=!active.length&&!activeHouse;
  section.querySelector('[data-reset]').hidden=!active.length;
 }
 function resultCard(h,r){
  const status=r.status,available=status==='available',unavailable=status==='unavailable';
  const price=r.priceFrom?`<strong>от ${r.priceFrom.toLocaleString('ru-RU')} ₽</strong> за ${nightsLabel(calendar.nights(state.arrival,state.departure))}`:'Стоимость — на следующем шаге';
  return `<article class="bst-card bpc-card bpc-compact-card bpds-result-card" data-house="${h.id}" data-availability="${status}">
   <a class="bst-photo" href="${esc(h.url)}" aria-label="${esc(h.name)} — фотографии"><img src="${esc(h.image.replace('/static.tildacdn.com/','/static.tildacdn.info/'))}" alt="${esc(h.name)}" loading="lazy" width="600" height="450"></a>
   <div class="bst-card-body"><h3>${esc(h.name)}</h3><p class="bst-card-tag">До ${h.capacity} гостей · ${esc(h.bathLabel)}</p><p class="bst-house-details">${esc(h.rooms)}<br>Территория: ${esc(h.territory.toLowerCase())}</p>
   <p class="bpds-status bpds-status--${status}">${available?'Заезд доступен на выбранные даты':unavailable?esc(r.reason):'Доступность уточнится при бронировании'}</p>
   <p class="bpds-card-price">${price}</p>${r.priceFrom?'<small class="bpds-price-note">Предварительная стоимость. Итог — для вашего состава гостей при бронировании.</small>':''}
   ${unavailable?'<button type="button" class="bst-secondary" data-edit-dates>Выбрать другие даты</button>':`<a class="bst-btn bpds-book" data-checkout href="${esc(checkout(h))}">К бронированию →</a>`}
   <a class="bst-link bpc-photo-link" href="${esc(h.url)}">Фото и описание дома →</a></div></article>`;
 }
 function houseCard(h){
  return `<article class="bst-card bpc-card" data-house="${h.id}" data-availability="undated"><a class="bst-photo" href="${esc(h.url)}" aria-label="${esc(h.name)} — фотографии"><img src="${esc(h.image.replace('/static.tildacdn.com/','/static.tildacdn.info/'))}" alt="${esc(h.name)}" loading="lazy" width="600" height="450"></a><div class="bst-card-body"><h3>${esc(h.name)}</h3><p class="bst-card-tag">До ${h.capacity} гостей · ${esc(h.bathLabel)}</p><p class="bst-house-details">${esc(h.rooms)}<br>Территория: ${esc(h.territory.toLowerCase())}</p><div class="bpc-calendar-host"></div><a class="bst-link bpc-photo-link" href="${esc(h.url)}">Фото и описание дома →</a></div></article>`;
 }
 function render(){
  const dated=mode==='dates',all=selected(true),list=dated&&!results?[]:selected(),unknown=all.filter(h=>results?.get(h.id)?.status==='unknown'),closed=all.filter(h=>results?.get(h.id)?.status==='unavailable');
  section.dataset.searchMode=mode;section.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  section.querySelector('.bpds-form-label').textContent=dated?'Когда и с кем хотите отдохнуть?':'Сколько гостей приедет?';
  section.querySelector('.bpds-form-hint').textContent=dated?'Дом заранее выбирать не нужно. Проверим все подходящие варианты.':'Выберите дом ниже и откройте «Даты и цены». Даты можно применить ко всем домам.';
  section.querySelector('[data-search]').hidden=!dated;section.querySelectorAll('.bpds-date-field').forEach(el=>el.hidden=!dated);
  updateFilters();section.querySelector('.bpds-trip').textContent=dated?(hasDates()?trip()+' · '+nightsLabel(calendar.nights(state.arrival,state.departure)):'Выберите даты выше'):'Выберите дом';
  section.querySelector('.bpds-party').textContent=partyLabel();
  section.querySelector('.bpc-count').textContent=searching?'Ищем подходящие дома…':dated?(results?`${list.length} ${list.length===1?'вариант':'вариантов'} для вашего отдыха`:'Нажмите «Найти дом», чтобы посмотреть варианты.'):`${all.length} из ${houses.length} домов подходят по гостям и удобствам`;
  section.querySelector('[data-edit-dates]').hidden=!dated||!hasDates();
  section.querySelector('.bst-grid').setAttribute('aria-busy',String(searching));
  section.querySelector('[data-search]').disabled=searching;section.querySelector('[data-search]').textContent=searching?'Ищем дома…':'Найти дом';
  const general=section.querySelector('.bpds-all-options');general.hidden=!dated||!canCheckout();if(!general.hidden)section.querySelector('[data-all-booking]').href=checkout();
  const note=section.querySelector('.bpds-uncertain');note.hidden=!dated||!results||!unknown.length;
  if(!note.hidden)note.innerHTML='<span>Для части домов доступность и точная цена уточнятся на следующем шаге. Их можно проверить кнопкой «К бронированию».</span>';
  section.querySelector('.bst-grid').innerHTML=searching?'<p class="bpds-loading">Проверяем дома на ваши даты. Все варианты и цены также доступны по кнопке выше.</p>':list.slice(0,limit).map(h=>dated?resultCard(h,results.get(h.id)):houseCard(h)).join('');
  if(!searching&&results&&!list.length)section.querySelector('.bst-grid').innerHTML=`<div class="bpc-empty">${all.length?'Календарь не подтвердил подходящий заезд. Посмотрите все варианты и цены по кнопке выше или измените даты.':'По выбранным удобствам и числу гостей домов не найдено. Сбросьте удобства или измените число гостей.'}</div>`;
  if(!dated&&!list.length)section.querySelector('.bst-grid').innerHTML='<div class="bpc-empty">По выбранным удобствам и числу гостей домов не найдено. Сбросьте удобства или измените число гостей.</div>';
  section.querySelector('.bst-more').hidden=searching||limit>=list.length;
  const other=section.querySelector('.bpds-other');other.hidden=!dated||searching||!closed.length;
  other.innerHTML=closed.length?`<button type="button" class="bst-link" data-show-other>${showUnavailable?'Скрыть остальные дома':'Посмотреть остальные дома'} (${closed.length})</button>`:'';
  if(!dated)for(const h of list.slice(0,limit))draw(h);
 }
 function editDates(){openTrip('arrival');}
 function setMode(next){
  mode=next;activeHouse='';validationAttempted=false;clearResults();showError('');syncControls();render();if(mode==='dates'&&hasDates()&&partyValid())search();
 }
 function clearResults(){requestVersion++;searching=false;results=null;showUnavailable=false;limit=6;section.querySelector('.bpc-apply-note').textContent='';}
 async function search(){
  validationAttempted=true;const error=S.dateError(state,today,bookingEnd);try{core.validateParty(state);}catch(e){showError(e.message);return;}
  if(error||!hasDates()){showError(error||'Выберите даты заезда и выезда.');return;}
  mode='dates';activeHouse='';showError('');const token=++requestVersion,request={...state,children:[...state.children]},candidates=S.visible(houses,{...request,house:activeHouse},null),next=new Map();
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
  try{core.validateParty(state);}catch(e){render();if(validationAttempted)showError(e.message);return;}
  if(mode==='dates'&&hasDates()&&!S.dateError(state,today,bookingEnd))search();else render();
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
  let hint=s.loading?'Проверяем доступность…':s.data?'Выберите заезд, затем выезд':'Нажмите «Повторить», чтобы загрузить даты',button='К бронированию →',enabled=false;
  if(s.arrival&&!s.departure){hint='Теперь выберите день выезда.';const r=calendar.rule(s.data||{closed:{},prices:{}},s.arrival);if(r.minimum>1)hint+=` От ${r.minimum} ночей. Выезд — не раньше ${dayLabel(calendar.add(s.arrival,r.minimum))}.`;}
  if(s.arrival&&s.departure){const n=calendar.nights(s.arrival,s.departure),word=n%10===1&&n%100!==11?'ночь':n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?'ночи':'ночей';hint=`${dayLabel(s.arrival)} — ${dayLabel(s.departure)} · ${n} ${word}`;button='К бронированию →';enabled=partyValid()&&!!s.data&&!s.error&&!s.loading&&S.inspect(calendar,s.data,s.arrival,s.departure).status!=='unavailable';}
  if(s.arrival&&s.picking==='arrival')hint='Выберите новый день заезда';
  if(s.departure&&s.picking==='departure')hint='Выберите новый день выезда';
  const picks=`<div class="bpc-selection"><button type="button" data-pick="arrival" aria-label="Заезд: ${s.arrival?dayLabel(s.arrival):'выбрать дату'}" class="${s.picking==='arrival'?'is-active':''}"><small>1. Заезд</small><span>${s.arrival?shortDay(s.arrival):'Выбрать'}</span></button><span class="bpc-selection-arrow" aria-hidden="true">→</span><button type="button" data-pick="departure" aria-label="Выезд: ${s.departure?dayLabel(s.departure):'выбрать дату'}" class="${s.picking==='departure'?'is-active':''}" ${s.arrival?'':'disabled'}><small>2. Выезд</small><span>${s.departure?shortDay(s.departure):'Выбрать'}</span></button></div>`;
  const prices=s.data?Object.entries(s.data.prices).filter(([d,v])=>d.startsWith(s.month)&&d>=today&&v?.p>0&&calendar.rule(s.data,d).available).map(([,v])=>v.p):[];
  const quote=s.arrival&&s.departure&&s.data?S.inspect(calendar,s.data,s.arrival,s.departure):null;
  const priceText=quote?(quote.priceFrom?'от <strong>'+quote.priceFrom.toLocaleString('ru-RU')+' ₽</strong> за весь период':'Стоимость — при бронировании'):(s.arrival&&s.departure?'Стоимость — при бронировании':prices.length?'от <strong>'+Math.min(...prices).toLocaleString('ru-RU')+' ₽</strong> / ночь':'Выберите даты, чтобы узнать стоимость');
  const priceNote=quote?'Итоговая стоимость — для вашего состава гостей при бронировании.':'Цена за двоих. Итог — при бронировании.';
  el.innerHTML=`<div class="bpc-calendar">${heading}<p class="bpc-weekend-note"><strong>${s.picking==='departure'?'Сейчас выбираете выезд':s.arrival&&s.departure?'Даты выбраны':'Выберите дату заезда'}</strong><span>${s.picking==='departure'?'Для другого заезда нажмите «1. Заезд». Неподходящий выезд не означает, что дом занят.':'Минимальный срок зависит от даты. Точная стоимость появится на следующем шаге.'}</span></p>${picks}<p class="bpc-hint" aria-live="polite">${hint}</p>${content}<div class="bpc-card-legend"><span><i class="bpc-key-free"></i>Свободно</span><span><i class="bpc-key-closed"></i>${s.picking==='departure'&&s.arrival?'Не подходит для выезда':'Нет заезда'}</span></div></div><div class="bpc-price-row"><span>${priceText}</span>${s.arrival?'<button type="button" class="bst-link bpc-clear" data-clear>Сбросить даты</button>':''}</div>${quote||prices.length?'<small class="bpc-rate-note">'+priceNote+'</small>':''}<p class="bpc-error" role="alert" ${s.error?'':'hidden'}>${esc(s.error)} ${s.error&&s.arrival&&s.departure?'<a href="'+esc(window.BPBookingReturn.checkoutUrl({...state,arrival:s.arrival,departure:s.departure},h))+'">Продолжить бронирование →</a>':''} ${s.error&&!s.loading?'<button type="button" class="bst-link" data-retry>Повторить</button>':''}</p><button type="button" class="bst-btn bpc-book" data-book ${enabled?'':'disabled'}>${button}</button><button type="button" class="bst-secondary bpds-apply-dates" data-apply-dates ${enabled?'':'disabled'}>Найти все дома на эти даты</button><small class="bpc-note">${enabled?'На следующем шаге — подтверждение доступности, точная цена и бронирование.':'Выберите заезд и выезд. Для смены заезда нажмите «1. Заезд». Неподходящий выезд не означает занятость дома.'}</small>`;
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
  }catch{s.error='Не удалось перепроверить даты. Откройте модуль бронирования по ссылке ниже.';const note=section.querySelector(`[data-house="${h.id}"] .bpds-status`);if(note)note.innerHTML=esc(s.error)+' <a href="'+esc(window.BPBookingReturn.checkoutUrl({...state,arrival:s.arrival,departure:s.departure},h))+'">Продолжить бронирование →</a>';}
  finally{s.loading=false;draw(h);}
 }
 function onChange(e){
  if(e.target.matches('[data-arrival],[data-departure]')){
   state.arrival=section.querySelector('[data-arrival]').value;state.departure=section.querySelector('[data-departure]').value;
   section.querySelector('[data-departure]').min=state.arrival?calendar.add(state.arrival,1):calendar.add(today,1);
   clearResults();globalMonth=core.validDate(state.arrival)?state.arrival.slice(0,7):firstMonth;for(const v of views.values()){v.version++;v.loading=false;v.month=globalMonth;v.arrival='';v.departure='';v.picking='arrival';v.loadedMonth='';v.error='';}render();showError(validationAttempted||state.arrival&&state.departure?S.dateError(state,today,bookingEnd):'');return;
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
  const link=e.target.closest('a[data-checkout]');if(link){remember();return;}
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if('openTrip'in d){openTrip(d.openTrip,b);return;}
  if('tripClose'in d){tripDialog.close();return;}
  if('tripStep'in d){stepTrip(Number(d.tripStep));return;}
  if('tripPick'in d){tripDraft.picking=d.tripPick;const focus=tripDraft[d.tripPick]||tripDraft.arrival||today;tripDraft.month=tripMonth(focus);tripDraft.focus=focus;drawTrip(focus);return;}
  if('tripDay'in d){const next=S.selectTripDay(tripDraft,d.tripDay,today,bookingEnd);if(next){Object.assign(tripDraft,next,{month:tripMonth(d.tripDay),focus:d.tripDay});drawTrip(d.tripDay);}return;}
  if('tripClear'in d){tripDraft={arrival:'',departure:'',picking:'arrival',month:firstMonth,focus:today,cleared:true};drawTrip(today);return;}
  if('tripApply'in d){applyTrip();return;}
  if('mode'in d){setMode(d.mode);return;}
  if('editDates'in d){editDates();return;}
  if('applyDates'in d){const h=houses.find(h=>h.id===b.closest('[data-house]')?.dataset.house),v=h&&view(h);if(v?.arrival&&v.departure){state.arrival=v.arrival;state.departure=v.departure;globalMonth=v.arrival.slice(0,7);setMode('dates');remember();section.querySelector('.bpds-results-head').scrollIntoView({behavior:'smooth',block:'start'});}return;}
  if('allHouses'in d){activeHouse='';criteriaChanged();return;}
  if('filter'in d||'removeFilter'in d){const key=d.filter||d.removeFilter;state[key]=!state[key];criteriaChanged();return;}
  if('reset'in d){for(const key of Object.keys(S.filterLabels))state[key]=false;activeHouse='';criteriaChanged();return;}
  if('more'in d){limit+=6;render();return;}
  if('showOther'in d){showUnavailable=!showUnavailable;render();return;}
  const h=houses.find(h=>h.id===b.closest('[data-house]')?.dataset.house);if(!h)return;const s=view(h);
  if('calendarOpen'in d){if(hasDates()&&!s.arrival&&!S.dateError(state,today,bookingEnd)){s.arrival=state.arrival;s.departure=state.departure;s.month=state.arrival.slice(0,7);s.picking='complete';}load(h);}
  if('book'in d)book(h);
  if('day'in d)choose(h,d.day);
  if('clear'in d){s.arrival='';s.departure='';s.picking='arrival';s.error='';draw(h);}
  if('pick'in d){s.picking=d.pick;if(s.arrival&&s.month!==s.arrival.slice(0,7)){s.month=s.arrival.slice(0,7);s.loadedMonth='';load(h);}s.error='';draw(h);}
  if('retry'in d)load(h,true);
  if('monthStep'in d){const index=months.indexOf(s.month)+Number(d.monthStep);if(months[index]){s.version++;s.loading=false;s.month=months[index];s.data=null;s.error='';draw(h);load(h);}}
 }
 window.addEventListener('pageshow',event=>{const refresh=event.persisted&&restoreTrip();requestAnimationFrame(()=>{syncControls();if(refresh&&section){clearResults();if(mode==='dates'&&hasDates())search();else render();}});});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();

