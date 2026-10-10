/* One entry point for BP: dates first, public Bnovo results, optional undated browsing. */
(() => {
  'use strict';
  const houses=window.BBStayData?.bp,core=window.BBStayCore;
  if(!houses||!core)return;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>new Intl.NumberFormat('ru-RU').format(v)+' ₽';
  let section,mode='dates',limit=3,room=null,currentUrl='',saved={};
  try{saved=JSON.parse(sessionStorage.getItem('bb-stay-v2-bp')||'{}');}catch{}
  const state={arrival:'',departure:'',guests:2,bath:false,tub:false,pets:false,fenced:false,...saved};
  state.guests=Math.max(1,Math.min(10,Number(state.guests)||2));
  if(core.dateError(state)){state.arrival='';state.departure='';}
  const save=()=>{try{sessionStorage.setItem('bb-stay-v2-bp',JSON.stringify(state));}catch{}};
  const smooth=()=>matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth';
  function mount(){
    const target=document.querySelector('#bp-doma');if(!target)return;
    section=document.createElement('section');section.id='bb-stay';section.className='bst bst-section bst-unified';section.dataset.brand='bp';
    section.innerHTML=`<div class="bst-inner"><p class="bst-eyebrow">Ваш отдых в Барских полях</p><h2>Выбрать дом</h2><p class="bst-intro">Укажите даты — посмотрите, что свободно и сколько стоит отдых.</p><div class="bst-mode" role="tablist" aria-label="Как посмотреть дома"><button id="bst-dates-tab" role="tab" aria-selected="true" aria-controls="bst-dates-panel" data-mode="dates">На мои даты</button><button id="bst-browse-tab" role="tab" aria-selected="false" aria-controls="bst-browse-panel" data-mode="browse" tabindex="-1">Все дома · без дат</button></div><div id="bst-dates-panel" role="tabpanel" aria-labelledby="bst-dates-tab"><div class="bst-controls"><div class="bst-fields"><label>Заезд<input data-state="arrival" type="date" min="${core.iso(new Date())}"></label><label>Выезд<input data-state="departure" type="date" min="${core.iso(new Date())}"></label><label>Всего гостей<select data-state="guests">${Array.from({length:10},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}</select></label></div><div class="bst-presets"><button class="bst-link" type="button" data-weekend>Ближайшие выходные</button><button class="bst-link" type="button" data-weekdays>Ближайшие будни</button><small>Учитывайте детей; возраст уточним при бронировании.</small></div><details class="bst-preferences"><summary>Что важно для отдыха</summary><div class="bst-filters">${[['bath','Своя баня'],['tub','Банный чан'],['pets','С питомцем'],['fenced','Огороженный двор']].map(([k,t])=>`<button type="button" class="bst-pill" data-filter="${k}" aria-pressed="false">${t}</button>`).join('')}<button type="button" class="bst-link" data-reset>Сбросить</button></div></details><button type="button" class="bst-btn bst-search" data-search>Проверить наличие и цены</button><p class="bst-error" role="alert" data-error hidden></p></div><div class="bst-live" aria-live="polite"><div class="bst-date-prompt"><span aria-hidden="true">01 / 02 / 03</span><h3>Даты → свободный дом → бронирование</h3><p>Один список с актуальными ценами. Если нужные дни заняты, покажем доступные даты рядом.</p></div></div></div><div id="bst-browse-panel" role="tabpanel" aria-labelledby="bst-browse-tab" hidden><p class="bst-browse-note">Сначала познакомьтесь с домами. Наличие и стоимость проверим, когда выберете даты.</p><div class="bst-grid"></div><div class="bst-more"><button type="button" class="bst-secondary" data-more>Посмотреть ещё</button></div></div><div class="bst-simple-help"><p>Нужен совет или несколько домов рядом?</p><a href="#popup:quiz" class="bst-link">Помощь с выбором →</a><a href="tel:+74951503908" class="bst-link">+7 (495) 150-39-08</a></div></div>`;
    target.before(section);target.classList.add('bst-replaced');
    const record=target.closest('.r'),hero=document.querySelector('.bp-hero-record');
    if(record&&hero)hero.after(record);
    // Remove repeated catalogue titles, lead teasers and the moving category menu.
    for(const id of ['bb-poloska','bb-podbor','rec9990000001','rec1185039476','rec2463129641','rec1241556951'])document.getElementById(id)?.classList.add('bst-replaced');
    // Existing mobile ordering moves this record; keep the single chooser in it.
    document.querySelectorAll('a[href="#bb-podbor"],a[href="#bp-doma"],a[href="#rec2241691831"],a[href="#rec1185039476"],a[href="https://barskie-polya.ru/booking"],a[href="/booking"]').forEach(a=>{a.href='#bb-stay';a.dataset.bbPlanner='';});
    const menu=document.querySelector('#rec1185050696');
    menu?.querySelectorAll('.tn-atom').forEach(e=>{if(e.textContent.trim()==='Категория домов')e.textContent='Дома и бронирование';if(e.textContent.trim()==='Все дома и цены')e.textContent='Выбрать дом';});
    section.addEventListener('click',onClick);section.addEventListener('change',onChange);
    section.querySelector('.bst-mode').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();mode=e.key==='Home'?'dates':e.key==='End'?'browse':mode==='dates'?'browse':'dates';render();section.querySelector(`[data-mode="${mode}"]`).focus();});
    window.addEventListener('click',e=>{const a=e.target.closest?.('a[data-bb-planner],a[href="#bb-podbor"],a[href="#bb-stay"],a[href="/booking"],a[href="https://barskie-polya.ru/booking"]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();mode='dates';render();section.scrollIntoView({behavior:smooth()});},{capture:true});
    sync();render();if(state.arrival&&state.departure)search();
    if((window.BBStayInitialHash||location.hash)==='#bb-stay')section.scrollIntoView();
  }
  function sync(){section.querySelectorAll('[data-state]').forEach(e=>{e.value=state[e.dataset.state]||'';});}
  function render(){
    section.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===mode;b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1;});
    section.querySelector('#bst-dates-panel').hidden=mode!=='dates';section.querySelector('#bst-browse-panel').hidden=mode!=='browse';
    section.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',!!state[b.dataset.filter]));
    if(mode==='browse'){
      section.querySelector('.bst-grid').innerHTML=houses.slice(0,limit).map(h=>`<article class="bst-card" data-house="${h.id}"><a class="bst-photo" href="${esc(h.url)}" aria-label="${esc(h.name)} — фотографии"><img src="${esc(h.image.replace('/static.tildacdn.com/','/static.tildacdn.info/'))}" alt="${esc(h.name)}" loading="lazy" width="600" height="450"></a><div class="bst-card-body"><h3>${esc(h.name)}</h3><p class="bst-card-tag">До ${h.capacity} гостей · ${esc(h.bathLabel)}</p><p class="bst-house-details">${esc(h.rooms)}<br>${esc(h.territory)}</p><div class="bst-price"><strong>от ${money(h.price)}</strong> / ночь<small>Будни, за двоих. Чан и баня — отдельно.</small></div><div class="bst-card-actions"><button type="button" class="bst-btn" data-house-dates="${h.id}">Свободные даты и цена</button><a class="bst-link" href="${esc(h.url)}">Фотографии и планировка →</a></div></div></article>`).join('');
      section.querySelector('.bst-more').hidden=limit>=houses.length;
    }
  }
  function resetLive(){currentUrl='';room=null;section.querySelector('.bst-live').innerHTML='<div class="bst-date-prompt"><h3>Выберите заезд и выезд</h3><p>Проверим наличие и стоимость на ваши даты.</p></div>';}
  function search(){
    const error=core.dateError(state)||(!state.arrival||!state.departure?'Укажите заезд и выезд.':'');
    const out=section.querySelector('[data-error]');out.textContent=error;out.hidden=!error;
    if(error){resetLive();return;}
    const found=houses.filter(h=>core.matches(h,state)&&(!room||h.id===room));
    const live=section.querySelector('.bst-live');
    if(!found.length){currentUrl='';live.innerHTML='<div class="bst-date-prompt"><h3>По этим пожеланиям нет подходящих домов</h3><p>Измените число гостей или удобства — проверим другие варианты.</p><button class="bst-link" type="button" data-reset>Сбросить пожелания</button></div>';return;}
    const url=core.availabilityUrl('bp',state,found);if(url===currentUrl)return;currentUrl=url;
    const h=room?houses.find(h=>h.id===room):null;
    live.innerHTML=`<div class="bst-live-heading"><div><p class="bst-eyebrow">Наличие и цены сейчас</p><h3>${h?esc(h.name):'Варианты на ваши даты'}</h3><p>Свободные дома и итоговая стоимость — ниже. Для занятых домов доступны соседние даты.</p>${h?'<button type="button" class="bst-link" data-all-results>Показать все подходящие варианты</button>':''}</div><a href="${esc(url)}" class="bst-link" target="_blank" rel="noopener">На весь экран ↗</a></div><p class="bst-loading" role="status">Проверяем наличие…</p>`;
    const frame=document.createElement('iframe');frame.title=h?`Свободные даты ${h.name}`:'Свободные дома, ближайшие даты и бронирование';frame.className='bst-live-frame';frame.src=url+'#content_block';
    frame.addEventListener('load',()=>{live.querySelector('.bst-loading')?.remove();});live.append(frame);
  }
  function onChange(e){const k=e.target.dataset.state;if(!k)return;state[k]=k==='guests'?Number(e.target.value):e.target.value;
    if(k==='arrival'&&state.arrival&&(!state.departure||state.departure<=state.arrival)){const d=new Date(state.arrival+'T12:00:00');d.setDate(d.getDate()+2);state.departure=core.iso(d);}
    save();sync();if(state.arrival&&state.departure)search();else resetLive();
  }
  function onClick(e){const b=e.target.closest('button');if(!b)return;const d=b.dataset;
    if('mode'in d){mode=d.mode;render();return;}
    if('more'in d){limit+=3;render();return;}
    if('houseDates'in d){room=d.houseDates;mode='dates';render();section.scrollIntoView({behavior:smooth()});if(!state.arrival||!state.departure){const dt=new Date();state.arrival=core.iso(dt);dt.setDate(dt.getDate()+2);state.departure=core.iso(dt);save();sync();}search();return;}
    if('allResults'in d){room=null;search();return;}
    if('search'in d){search();return;}
    if('filter'in d)state[d.filter]=!state[d.filter];
    if('reset'in d){state.bath=false;state.tub=false;state.pets=false;state.fenced=false;room=null;}
    if('weekend'in d||'weekdays'in d){const dt=new Date(),day='weekend'in d?5:1;dt.setDate(dt.getDate()+((day-dt.getDay()+7)%7));state.arrival=core.iso(dt);dt.setDate(dt.getDate()+2);state.departure=core.iso(dt);}
    save();sync();render();if(state.arrival&&state.departure)search();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
