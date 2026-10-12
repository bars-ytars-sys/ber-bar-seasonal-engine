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
 let section,limit=3,globalMonth=firstMonth,observer;
 const initialURL=new URL(window.BBStayInitialURL||location.href);
 let activeHouse=initialURL.searchParams.get('house');if(!houses.some(h=>h.id===activeHouse))activeHouse='';
 const state={guests:2,bath:false,tub:false,pets:false,fenced:false},draft={...state,month:globalMonth},views=new Map();
 const view=h=>{if(!views.has(h.id))views.set(h.id,{month:globalMonth,arrival:'',departure:'',picking:'arrival',data:null,inventory:{closed:{},prices:{}},error:'',loading:false,version:0,loadedMonth:''});return views.get(h.id);};
 const selected=()=>houses.filter(h=>(!activeHouse||h.id===activeHouse)&&core.matches(h,state));
 const catalogueHref=location.hostname.endsWith('.chatgpt.site')||initialURL.pathname==='/index.html'||initialURL.pathname==='/'?new URL('/houses.html',location.origin).href:new URL('bp-houses.html',initialURL).href;
 function mount(){
  const target=document.querySelector('#bp-doma');if(!target)return;
  section=document.createElement('section');section.id='bb-stay';section.className='bst bst-section bpc-section';section.dataset.brand='bp';
  section.innerHTML=`<div class="bst-inner"><p class="bst-eyebrow">Барские поля</p><div class="bpc-section-heading"><h2>Свободные даты и цены</h2></div><p class="bst-intro">Укажите месяц и гостей, нажмите «Подобрать». Затем выберите заезд и выезд в календаре дома.</p><p class="bpc-window">Даты отдыха — до 1 февраля 2027 включительно.</p><a class="bst-link bpc-catalogue-link" href="${catalogueHref}">Каталог всех 15 домов →</a><div class="bpc-toolbar"><label>Месяц отдыха<select data-month-all aria-label="Месяц отдыха">${options(globalMonth)}</select></label><label>Всего гостей<select data-guests>${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${i===1?'selected':''}>${i+1}</option>`).join('')}</select></label><button type="button" class="bst-btn bpc-apply" data-apply>Подобрать</button></div><details class="bst-preferences"><summary>Что важно для отдыха</summary><div class="bst-filters">${[['bath','Своя баня'],['tub','Банный чан'],['pets','С питомцем'],['fenced','Огороженная территория']].map(([k,t])=>`<button type="button" class="bst-pill" data-filter="${k}" aria-pressed="false">${t}</button>`).join('')}<button type="button" class="bst-link" data-reset>Сбросить</button></div></details><p class="bpc-apply-note" role="status"></p><p class="bpc-count" role="status"></p><div class="bst-grid"></div><div class="bst-more"><button type="button" class="bst-secondary" data-more>Посмотреть ещё дома</button></div><div class="bst-simple-help"><p>Нужна помощь с выбором?</p><a href="#popup:quiz" class="bst-link">Пройти опрос — получить сертификат</a><a href="tel:+74951503908" class="bst-link">+7 (495) 150-39-08</a></div></div>`;
  target.before(section);target.classList.add('bst-replaced');const record=target.closest('.r'),hero=document.querySelector('.bp-hero-record'),strip=document.getElementById('bb-poloska');
  if(hero&&strip){strip.classList.remove('bst-replaced');hero.after(strip);}if(record&&hero)(strip||hero).after(record);
  for(const id of ['bb-podbor','rec9990000001','rec1185039476','rec2463129641','rec1241556951','rec1635506171'])document.getElementById(id)?.classList.add('bst-replaced');
  document.querySelectorAll('a[href="#bb-podbor"],a[href="#rec2241691831"],a[href="#rec1185039476"],a[href="https://barskie-polya.ru/booking"],a[href="/booking"]').forEach(a=>{a.href='#bb-stay';a.dataset.bbPlanner='';});
  document.querySelectorAll('a[href="#bp-doma"],a[href="https://barskie-polya.ru/#houses"]').forEach(a=>{a.href=catalogueHref;delete a.dataset.bbPlanner;});
  document.querySelectorAll('a[href="bp-houses.html"],a[href="houses.html"]').forEach(a=>{a.href=catalogueHref;});
  section.addEventListener('click',onClick);section.addEventListener('change',onChange);
  window.addEventListener('click',e=>{const a=e.target.closest?.('a[data-bb-planner],a[href="#bb-stay"]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});},{capture:true});
  render();if((window.BBStayInitialHash||location.hash)==='#bb-stay')section.scrollIntoView();
 }
 function render(){
  const list=selected();section.querySelector('.bpc-count').innerHTML=`${activeHouse?'Выбран дом из каталога. <button type="button" class="bst-link" data-all-houses>Показать остальные</button>':`${list.length} домов по вашим пожеланиям · ${monthLabel(globalMonth)}`}`;
  section.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',!!draft[b.dataset.filter]));
  section.querySelector('.bst-grid').innerHTML=list.slice(0,limit).map(h=>`<article class="bst-card bpc-card" data-house="${h.id}"><a class="bst-photo" href="${esc(h.url)}" aria-label="${esc(h.name)} — фотографии"><img src="${esc(h.image.replace('/static.tildacdn.com/','/static.tildacdn.info/'))}" alt="${esc(h.name)}" loading="lazy" width="600" height="450"></a><div class="bst-card-body"><h3>${esc(h.name)}</h3><p class="bst-card-tag">До ${h.capacity} гостей · ${esc(h.bathLabel)}</p><p class="bst-house-details">${esc(h.rooms)}<br>Территория: ${esc(h.territory.toLowerCase())}</p><div class="bpc-calendar-host"></div><a class="bst-link bpc-photo-link" href="${esc(h.url)}">Фотографии и планировка →</a></div></article>`).join('');
  if(!list.length)section.querySelector('.bst-grid').innerHTML='<p class="bpc-empty">По этим пожеланиям нет подходящих домов. Измените число гостей или удобства.</p>';
  section.querySelector('.bst-more').hidden=limit>=list.length;
  for(const h of list.slice(0,limit)){draw(h);load(h);}
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
  if(s.arrival&&!s.departure){hint='Теперь выберите день выезда.';const r=calendar.rule(s.data||{closed:{},prices:{}},s.arrival);if(r.minimum>1)hint+=` От ${r.minimum} ночей.`;}
  if(s.arrival&&s.departure){const n=calendar.nights(s.arrival,s.departure),word=n%10===1&&n%100!==11?'ночь':n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?'ночи':'ночей';hint=`${dayLabel(s.arrival)} — ${dayLabel(s.departure)} · ${n} ${word}`;button='Забронировать эти даты';enabled=!!s.data&&!s.error&&!s.loading&&!calendar.validate(s.data,s.arrival,s.departure,today);}
  if(s.arrival&&s.picking==='arrival')hint='Выберите новый день заезда';
  if(s.departure&&s.picking==='departure')hint='Выберите новый день выезда';
  const picks=`<div class="bpc-selection"><button type="button" data-pick="arrival" aria-label="Заезд: ${s.arrival?dayLabel(s.arrival):'выбрать дату'}" class="${s.picking==='arrival'?'is-active':''}"><small>Заезд</small><span>${s.arrival?shortDay(s.arrival):'Выбрать'}</span></button><span class="bpc-selection-arrow" aria-hidden="true">→</span><button type="button" data-pick="departure" aria-label="Выезд: ${s.departure?dayLabel(s.departure):'выбрать дату'}" class="${s.picking==='departure'?'is-active':''}" ${s.arrival?'':'disabled'}><small>Выезд</small><span>${s.departure?shortDay(s.departure):'Выбрать'}</span></button></div>`;
  const prices=s.data?Object.entries(s.data.prices).filter(([d,v])=>d.startsWith(s.month)&&d>=today&&v?.p>0&&calendar.rule(s.data,d).available).map(([,v])=>v.p):[];
  el.innerHTML=`<div class="bpc-calendar">${heading}${picks}<p class="bpc-hint" aria-live="polite">${hint}</p>${content}<div class="bpc-card-legend"><span><i class="bpc-key-free"></i>Свободно</span><span><i class="bpc-key-closed"></i>Нет заезда</span></div></div><div class="bpc-price-row"><span>${prices.length?'от <strong>'+Math.min(...prices).toLocaleString('ru-RU')+' ₽</strong> / ночь':'Цены уточняются'}</span>${s.arrival?'<button type="button" class="bst-link bpc-clear" data-clear>Сбросить даты</button>':''}</div>${prices.length?'<small class="bpc-rate-note">Цена за двоих. Итог — при бронировании.</small>':''}<p class="bpc-error" role="alert" ${s.error?'':'hidden'}>${esc(s.error)} ${s.error&&!s.loading?'<button type="button" class="bst-link" data-retry>Повторить</button>':''}</p><button type="button" class="bst-btn bpc-book" data-book ${enabled?'':'disabled'}>${button}</button><small class="bpc-note">${enabled?'Дом и даты уже выбраны. Останется оформить бронирование.':'Для бронирования выберите заезд и выезд в календаре.'}</small>`;
 }
 function day(h,d,adjacent=false){
  const s=view(h),r=calendar.rule(s.data||{closed:{},prices:{}},d),pickingEnd=s.arrival&&s.picking==='departure',end=pickingEnd&&d>s.arrival&&s.data&&!calendar.validate(s.data,s.arrival,d,today);
  const blocked=s.loading||!s.data||d<today||d>bookingEnd||(pickingEnd?(!end&&d!==s.arrival):(!r.available||adjacent||d>=bookingEnd)),chosen=d===s.arrival||d===s.departure,inRange=s.departure&&d>s.arrival&&d<s.departure;
  const status=d<today?'past':r.noArrival?'closed':r.available?'free':'unknown';
  const label=`${dayLabel(d)}. ${r.available?'Свободно':r.noArrival?'Заезд недоступен':'Нужно уточнить доступность'}${r.minimum>1?'. От '+r.minimum+' ночей':''}${r.price?'. От '+r.price+' рублей за ночь':''}${end?'. Можно выбрать для выезда':''}`;
  const n=Number(d.slice(-2));return `<button type="button" class="bpc-day bpc-day--${status} ${adjacent?'bpc-day--adjacent':''} ${chosen?'bpc-day--chosen':''} ${inRange?'bpc-day--range':''}" data-day="${d}" aria-label="${esc(label)}" aria-pressed="${!!chosen}" ${blocked?'disabled':''}><span>${n}${adjacent?'<small>'+new Intl.DateTimeFormat('ru-RU',{month:'short'}).format(new Date(d+'T12:00:00'))+'</small>':''}</span></button>`;
 }
 async function choose(h,d){
  const s=view(h);if(s.loading||!s.data)return;s.error='';
  if(!s.arrival||s.picking!=='departure'||d===s.arrival){if(!calendar.rule(s.data,d).available)return;s.arrival=d;s.departure='';s.picking='departure';}
  else{const error=calendar.validate(s.data,s.arrival,d,today);if(error)s.error=error;else{s.departure=d;s.picking='complete';}}
  draw(h);
 }
 async function book(h){
  const s=view(h);if(!s.arrival||!s.departure||s.loading)return;s.loading=true;s.error='';draw(h);
  try{const data=await calendar.loadStay(h.roomId,s.arrival,s.departure);s.data=data;const error=calendar.validate(data,s.arrival,s.departure,today);if(error){s.error=error;return;}location.assign(core.availabilityUrl('bp',{...state,arrival:s.arrival,departure:s.departure},[h]));}
  catch{s.error='Не удалось перепроверить даты. Попробуйте ещё раз.';}
  finally{s.loading=false;draw(h);}
 }
 function onChange(e){
  if(e.target.matches('[data-guests]')){draft.guests=Number(e.target.value);pending();}
  if(e.target.matches('[data-month-all]')){draft.month=e.target.value;pending();}
  if(e.target.matches('[data-month]')){const h=houses.find(h=>h.id===e.target.closest('[data-house]').dataset.house);const s=view(h);if(s.departure){s.arrival='';s.departure='';s.picking='arrival';}s.version++;s.loading=false;s.month=e.target.value;s.data=null;s.error='';load(h);}
 }
 function pending(){section.querySelector('.bpc-apply-note').textContent='Условия изменены. Нажмите «Подобрать».';}
 function apply(){Object.assign(state,{guests:draft.guests,bath:draft.bath,tub:draft.tub,pets:draft.pets,fenced:draft.fenced});globalMonth=draft.month;limit=3;for(const h of houses){const s=view(h);if(s.month!==globalMonth){s.version++;s.loading=false;s.month=globalMonth;s.data=null;s.arrival='';s.departure='';s.picking='arrival';s.error='';}}section.querySelector('.bpc-apply-note').textContent='';render();section.querySelector('.bpc-count').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}
 function onClick(e){
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if('apply'in d){apply();return;}
  if('allHouses'in d){activeHouse='';apply();return;}
  if('filter'in d){draft[d.filter]=!draft[d.filter];b.setAttribute('aria-pressed',!!draft[d.filter]);pending();return;}
  if('reset'in d){draft.bath=false;draft.tub=false;draft.pets=false;draft.fenced=false;section.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed','false'));pending();return;}
  if('more'in d){limit+=3;render();return;}
  const h=houses.find(h=>h.id===b.closest('[data-house]')?.dataset.house);if(!h)return;const s=view(h);
  if('day'in d)choose(h,d.day);
  if('clear'in d){s.arrival='';s.departure='';s.picking='arrival';s.error='';draw(h);}
  if('pick'in d){s.picking=d.pick;s.error='';draw(h);}
  if('retry'in d)load(h,true);
  if('book'in d)book(h);
  if('monthStep'in d){const index=months.indexOf(s.month)+Number(d.monthStep);if(months[index]){if(s.departure){s.arrival='';s.departure='';s.picking='arrival';}s.version++;s.loading=false;s.month=months[index];s.data=null;s.error='';load(h);}}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
