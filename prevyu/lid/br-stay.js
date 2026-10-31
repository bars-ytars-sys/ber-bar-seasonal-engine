/* First-stage BR demo: scenarios, compact cards, real calendar check, native Bnovo checkout. */
(() => {
  'use strict';
  const D=window.BRStayData,C=window.BRStayCore;
  if(!D?.houses?.length||!C)return;
  const houses=D.houses,assetBase=window.BRStayAssetBase||new URL('.',document.currentScript.src).href;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
  const key='br-stay-demo-v2',api=C.createApi(),scenarios=[['all','Любой отдых','home'],['couple','Вдвоём','heart'],['family','С детьми','family'],['friends','С друзьями','friends']];
  const paths={home:'M3 10 12 3l9 7v11H3Z M9 21v-8h6v8',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',family:'M3 21v-3a4 4 0 0 1 8 0v3 M14 21v-2a3 3 0 0 1 6 0v2 M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M17 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',friends:'M2 21v-2a4 4 0 0 1 8 0v2 M14 21v-2a4 4 0 0 1 8 0v2 M6 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6',arrow:'M4 12h16 M14 6l6 6-6 6'};
  const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.home}"/></svg>`;
  const defaults={arrival:'',departure:'',adults:2,children:[],scenario:'all',bath:false,tub:false,pets:false,selected:'',searched:false};
  let saved={};try{saved=JSON.parse(sessionStorage.getItem(key)||'{}');}catch{}
  let state={...defaults,...saved};
  state.adults=Math.min(10,Math.max(1,Number(state.adults)||2));
  state.children=Array.isArray(state.children)?state.children.slice(0,5).map(a=>Number.isInteger(a)&&a>=0&&a<=17?a:null):[];
  if(!scenarios.some(([id])=>id===state.scenario))state.scenario='all';
  if(!houses.some(h=>h.id===state.selected))state.selected='';
  for(const name of ['bath','tub','pets'])state[name]=state[name]===true;
  if(C.dateError(state)){state.arrival='';state.departure='';state.searched=false;}
  const initialSearch=state.searched&&!C.partyError(state);
  let section,dialog,houseCalendar=null,returnFocus=null,results=null,busy=false,version=0,limit=6,done=0,total=0,pendingHouse='';
  const save=()=>{try{sessionStorage.setItem(key,JSON.stringify(state));}catch{}};
  const day=s=>new Date(s+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
  const nightWord=n=>n%100>=11&&n%100<=14?'ночей':n%10===1?'ночь':n%10>=2&&n%10<=4?'ночи':'ночей';
  const houseWord=n=>n%100>=11&&n%100<=14?'домов':n%10===1?'дом':n%10>=2&&n%10<=4?'дома':'домов';
  const trip=()=>state.arrival&&state.departure?`${day(state.arrival)} — ${day(state.departure)} · ${C.guests(state)} гост${C.guests(state)===1?'ь':C.guests(state)<5?'я':'ей'}`:'Выберите даты, чтобы проверить наличие';
  const options=(n,max,start=1)=>Array.from({length:max-start+1},(_,i)=>`<option value="${i+start}" ${n===i+start?'selected':''}>${i+start}</option>`).join('');
  function candidates(){
    return houses.filter(h=>C.matches(h,state)).sort((a,b)=>Number(b.id===state.selected)-Number(a.id===state.selected));
  }
  function image(h){return new URL(h.image,assetBase).href;}
  function card(h){
    const r=results?.get(h.id),ready=r?.status==='available';
    const price=ready?(r.priceFrom?`<strong>от ${money(r.priceFrom)}</strong><small>за ${r.nights} ${nightWord(r.nights)} · базовая цена за ${r.baseGuests} гостей</small>`:'<strong class="brp-undated">Стоимость — в Bnovo</strong>'):'<strong class="brp-undated">Стоимость на ваши даты</strong><small>Проверим наличие перед бронированием</small>';
    const facts=[h.detail,h.bath?'Своя баня':'',h.tub?'Банный чан':''].filter(Boolean).join(' · ');
    return `<article class="brp-card" data-house="${h.id}" data-selected="${state.selected===h.id}"><a class="brp-photo" href="${esc(h.url)}" target="_blank" rel="noopener" aria-label="${esc(h.name)} — фото и описание"><img src="${esc(image(h))}" alt="${esc(h.name)}" width="600" height="375" loading="lazy"><span class="brp-capacity">До ${h.capacity} гостей</span></a><div class="brp-card-body"><h3>${esc(h.name)}</h3><p class="brp-card-facts">${esc(facts)}</p>${ready?'<p class="brp-card-ready">Есть заезд на выбранные даты</p>':''}<div class="brp-card-price">${price}</div><div class="brp-card-actions${ready?' brp-card-actions-ready':''}">${ready?`<a class="brp-btn" data-book="${h.id}" href="${esc(C.bookingUrl(state,h))}">Забронировать ${icon('arrow')}</a>`:`<button class="brp-btn" type="button" data-dates="${h.id}">Выбрать даты ${icon('arrow')}</button>`}${ready?`<div class="brp-card-links"><button class="brp-link" type="button" data-dates="${h.id}">Изменить даты</button><a class="brp-link" href="${esc(h.url)}" target="_blank" rel="noopener">О доме ↗</a></div>`:`<a class="brp-link" href="${esc(h.url)}" target="_blank" rel="noopener">О доме ↗</a>`}</div></div></article>`;
  }
  function context(){
    const text={all:'Выберите дом по вместимости и важным для вас удобствам.',couple:'Небольшие дома для отдыха вдвоём. Выберите даты, чтобы проверить наличие.',family:'Дома от 3 гостей. Укажите возраст детей — передадим его в бронирование.',friends:'Просторные дома от 5 гостей. Укажите, сколько человек поедет.'};
    section.querySelector('[data-context]').textContent=text[state.scenario];
  }
  function renderChildren(){
    section.querySelector('[data-ages]').innerHTML=state.children.map((a,i)=>`<label>Возраст ребёнка ${i+1}<select data-age="${i}" aria-label="Возраст ребёнка ${i+1}"><option value="" ${a===null?'selected':''}>Выберите</option>${Array.from({length:18},(_,age)=>`<option value="${age}" ${a===age?'selected':''}>${age===0?'До 1 года':age}</option>`).join('')}</select></label>`).join('');
  }
  function sync(){
    for(const name of ['arrival','departure','adults'])section.querySelector(`[data-field="${name}"]`).value=state[name];
    section.querySelector('[data-field="child-count"]').value=state.children.length;
    section.querySelector('[data-field="departure"]').min=state.arrival?C.add(state.arrival,1):C.add(C.today(),1);
    section.querySelectorAll('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.scenario===state.scenario)));
    section.querySelectorAll('[data-pref]').forEach(b=>b.setAttribute('aria-pressed',String(state[b.dataset.pref])));
    context();renderChildren();
  }
  function renderResults(){
    const list=candidates(),available=results?list.filter(h=>results.get(h.id)?.status==='available'):list;
    const unknown=results?list.filter(h=>results.get(h.id)?.status==='unknown'):[];
    section.querySelector('[data-count]').textContent=busy?`Проверяем даты: ${done} из ${total}`:results?`На ваши даты: ${available.length} ${houseWord(available.length)}`:`По пожеланиям: ${list.length} ${houseWord(list.length)}`;
    section.querySelector('[data-trip]').textContent=trip();
    section.querySelector('[data-progress]').hidden=!busy;
    section.querySelector('[data-progress] span').style.width=(total?done/total*100:0)+'%';
    section.querySelector('[data-grid]').innerHTML=busy?'':available.slice(0,limit).map(card).join('');
    const empty=section.querySelector('[data-empty]');empty.hidden=busy||available.length>0;
    if(!empty.hidden){
      const title=!list.length?'Под эти пожелания дом не найден':unknown.length?'Часть домов пока не удалось проверить':'На эти даты нет подходящего заезда';
      const text=!list.length?'Измените количество гостей или снимите часть фильтров. Для большой компании можно выбрать несколько домов.':unknown.length?'Не показываем непроверенные дома как свободные или занятые. Повторите проверку или откройте Bnovo.':'Попробуйте соседние даты или другой формат отдыха. Условия минимального проживания проверяем по Bnovo.';
      empty.innerHTML=`<h3>${title}</h3><p>${text}</p><button class="brp-btn" type="button" data-action="${!list.length?'reset':'edit-dates'}">${!list.length?'Сбросить пожелания':'Изменить даты'}</button>`;
    }
    const partial=section.querySelector('[data-partial]');partial.hidden=!unknown.length;
    partial.innerHTML=unknown.length?`Не удалось проверить: ${unknown.length}. Непроверенные дома не включены в результат. <button class="brp-link" type="button" data-action="retry">Повторить</button>${!C.dateError(state)&&!C.partyError(state)?` · <a class="brp-link" href="${esc(C.bookingUrl(state))}">Все варианты в Bnovo ↗</a>`:''}`:'';
    section.querySelector('[data-more-wrap]').hidden=busy||available.length<=limit;
    section.querySelector('[data-action="search"]').disabled=busy;
    section.querySelector('[data-action="search"]').textContent=busy?'Проверяем…':'Показать свободные дома';
    section.querySelector('[data-price-note]').hidden=!results||!available.length;
    section.querySelector('[data-grid]').setAttribute('aria-busy',String(busy));
  }
  function feedback(text){const e=section.querySelector('[data-error]');e.textContent=text;e.hidden=!text;}
  function invalidate(){version++;busy=false;results=null;state.searched=false;limit=6;feedback('');save();renderResults();}
  async function search(fresh=false){
    const error=C.dateError(state)||C.partyError(state);feedback(error);
    if(error){section.querySelector(C.partyError(state)?'[data-ages] select, [data-field="adults"]':'[data-field="arrival"]').focus();return false;}
    const request={...state,children:[...state.children]},list=candidates(),v=++version;
    results=null;busy=true;done=0;total=list.length;renderResults();
    const next=new Map();
    await Promise.all(list.map(async h=>{
      let r;try{r=await api.load(h,request,fresh);}catch{r={status:'unknown',reason:'Bnovo временно не ответил.'};}
      if(v!==version)return;next.set(h.id,r);done++;
      section.querySelector('[data-count]').textContent=`Проверяем даты: ${done} из ${total}`;
      section.querySelector('[data-progress] span').style.width=(total?done/total*100:100)+'%';
    }));
    if(v!==version)return false;
    busy=false;results=next;state.searched=true;save();renderResults();
    if(state.selected){
      const card=section.querySelector(`[data-house="${state.selected}"]`);
      if(pendingHouse&&card)card.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'center'});
    }
    pendingHouse='';return true;
  }
  function closeDialog(){dialog.close();}
  function openDates(house=''){
    pendingHouse=house;
    if(house){state.selected=house;save();}
    returnFocus=document.activeElement;
    const h=houses.find(h=>h.id===house);
    if(h&&window.BRStayCalendar){
      dialog.innerHTML=`<div class="brp-dialog-head"><h2 id="brp-dialog-title">${esc(h.name)}</h2><button class="brp-close" type="button" data-dialog-close aria-label="Закрыть выбор дат">×</button></div><p>Календарь дома · ${state.adults} взрослых${state.children.length?' · детей: '+state.children.length:''}</p><div data-house-calendar></div>`;
      houseCalendar=window.BRStayCalendar.mount(dialog.querySelector('[data-house-calendar]'),{house:h,api,value:state,onChange:dates=>{Object.assign(state,dates);invalidate();sync();},onApply:()=>{closeDialog();search();}});
      dialog.showModal();document.documentElement.classList.add('brp-dialog-open');dialog.querySelector('[data-dialog-close]').focus();return;
    }
    dialog.innerHTML=`<div class="brp-dialog-head"><h2 id="brp-dialog-title">${h?esc(h.name):'Даты вашего отдыха'}</h2><button class="brp-close" type="button" data-dialog-close aria-label="Закрыть выбор дат">×</button></div><p>Выберите заезд и выезд. Условия проживания проверим в Bnovo.</p><div class="brp-dialog-fields"><label>Заезд<input type="date" data-dialog-date="arrival" min="${C.today()}" value="${esc(state.arrival)}"></label><label>Выезд<input type="date" data-dialog-date="departure" min="${state.arrival?C.add(state.arrival,1):C.add(C.today(),1)}" value="${esc(state.departure)}"></label></div><p>${state.adults} взрослых${state.children.length?' · детей: '+state.children.length:''}. Состав гостей можно изменить в подборе.</p><p class="brp-error" role="alert" data-dialog-error hidden></p><button class="brp-btn" type="button" data-dialog-apply>Проверить свободные дома</button><button class="brp-link" type="button" data-dialog-close>Вернуться к подбору</button>`;
    dialog.showModal();document.documentElement.classList.add('brp-dialog-open');dialog.querySelector('[data-dialog-date="arrival"]').focus();
  }
  function mount(){
    const target=document.getElementById('rec1950785651')||document.getElementById('rec2851363001');
    if(!target||document.querySelector('.brp-section'))return;
    section=document.createElement('section');section.id='bb-stay';section.className='brp brp-section';section.setAttribute('aria-labelledby','brp-title');
    section.innerHTML=`<div class="brp-inner"><p class="brp-eyebrow">Берёзовая роща · 22 дома</p><h2 id="brp-title">Найдите дом для своего отдыха</h2><p class="brp-intro">Вдвоём, с детьми или друзьями. Выберите даты и важные удобства — покажем подходящие варианты.</p><div class="brp-scenarios" aria-label="Формат отдыха">${scenarios.map(([id,label,i])=>`<button class="brp-chip" type="button" data-scenario="${id}" aria-pressed="${state.scenario===id}">${icon(i)}${label}</button>`).join('')}</div><div class="brp-search" role="search" aria-label="Подбор дома"><div class="brp-fields"><label>Заезд<input type="date" data-field="arrival" min="${C.today()}" aria-label="Заезд"></label><label>Выезд<input type="date" data-field="departure" min="${C.add(C.today(),1)}" aria-label="Выезд"></label><label>Взрослые<select data-field="adults" aria-label="Взрослые">${options(state.adults,10)}</select></label><label>Дети до 18 лет<select data-field="child-count" aria-label="Дети до 18 лет">${options(state.children.length,5,0)}</select></label><button class="brp-btn" type="button" data-action="search">Показать свободные дома</button></div><div class="brp-age-fields" data-ages></div><div class="brp-prefs" aria-label="Удобства дома"><button class="brp-chip" type="button" data-pref="bath" aria-pressed="${state.bath}">Своя баня</button><button class="brp-chip" type="button" data-pref="tub" aria-pressed="${state.tub}">Банный чан</button><button class="brp-chip" type="button" data-pref="pets" aria-pressed="${state.pets}">С питомцем</button><button class="brp-link" type="button" data-action="reset">Сбросить пожелания</button></div><p class="brp-context" data-context></p><p class="brp-error" role="alert" data-error hidden></p><div class="brp-search-note"><span>Наличие проверяем по календарю Bnovo</span><button type="button" data-action="undated">Пока без дат</button></div></div><div class="brp-results-head"><p class="brp-count"><span data-count role="status" aria-live="polite"></span><span class="brp-trip" data-trip></span></p><button class="brp-link" type="button" data-action="edit-dates">Изменить даты</button></div><div class="brp-progress" data-progress hidden><span></span></div><div class="brp-grid" data-grid></div><div class="brp-empty" data-empty hidden></div><div class="brp-partial" data-partial role="status" hidden></div><div class="brp-more" data-more-wrap hidden><button class="brp-chip" type="button" data-action="more">Показать ещё дома ↓</button></div><p class="brp-footnote" data-price-note hidden>В карточках — ориентир стоимости проживания за указанный базовый состав гостей. Окончательную стоимость, дополнительные места и условия тарифа рассчитает Bnovo. Баня, чан и питание оплачиваются отдельно, если выбранный тариф не включает их.</p><div class="brp-help"><p>Нужна помощь с выбором?</p><a class="brp-link" href="tel:+74951202008">+7 (495) 120-20-08</a><a class="brp-link" href="https://t.me/ecobazabr" target="_blank" rel="noopener">Написать в Telegram ↗</a></div></div>`;
    target.before(section);
    // Replace only the old booking/picker presentation, retaining all original nodes.
    ['rec1950785651','rec3032928101','rec9990000001','rec1684467611','rec2851363001'].forEach(id=>document.getElementById(id)?.classList.add('brp-superseded'));
    dialog=document.createElement('dialog');dialog.className='brp brp-dialog';dialog.setAttribute('aria-labelledby','brp-dialog-title');document.body.append(dialog);
    dialog.addEventListener('close',()=>{houseCalendar?.destroy();houseCalendar=null;document.documentElement.classList.remove('brp-dialog-open');const next=returnFocus?.isConnected?returnFocus:section.querySelector(`[data-house="${state.selected}"] [data-dates]`)||section.querySelector('[data-action="search"]');next?.focus({preventScroll:true});returnFocus=null;});
    dialog.addEventListener('click',e=>{
      if(e.target===dialog||e.target.closest('[data-dialog-close]')){closeDialog();return;}
      if(e.target.closest('[data-dialog-apply]')){
        const proposal={...state,arrival:dialog.querySelector('[data-dialog-date="arrival"]').value,departure:dialog.querySelector('[data-dialog-date="departure"]').value};
        const error=C.dateError(proposal)||C.partyError(proposal),out=dialog.querySelector('[data-dialog-error]');out.hidden=!error;out.textContent=error;
        if(error)return;Object.assign(state,proposal);closeDialog();invalidate();sync();search();
      }
    });
    dialog.addEventListener('change',e=>{if(e.target.matches('[data-dialog-date="arrival"]'))dialog.querySelector('[data-dialog-date="departure"]').min=C.add(e.target.value||C.today(),1);});
    section.addEventListener('change',e=>{
      const field=e.target.dataset.field;
      if(field==='child-count'){const n=Number(e.target.value);state.children=Array.from({length:n},(_,i)=>state.children[i]??null);renderChildren();}
      else if(field==='adults')state.adults=Number(e.target.value);
      else if(field==='arrival'||field==='departure'){state[field]=e.target.value;if(field==='arrival')section.querySelector('[data-field="departure"]').min=state.arrival?C.add(state.arrival,1):C.add(C.today(),1);}
      else if('age' in e.target.dataset)state.children[Number(e.target.dataset.age)]=e.target.value===''?null:Number(e.target.value);
      else return;
      invalidate();
    });
    section.addEventListener('click',e=>{
      const b=e.target.closest('button,a[data-book]');if(!b)return;
      const d=b.dataset;
      if(d.book){state.selected=d.book;save();return;}
      if(d.scenario){state.scenario=d.scenario;state.selected='';invalidate();sync();return;}
      if(d.pref){state[d.pref]=!state[d.pref];invalidate();sync();return;}
      if('dates' in d){openDates(d.dates);return;}
      if(d.action==='search'){pendingHouse='';search();}
      if(d.action==='retry')search(true);
      if(d.action==='edit-dates')openDates();
      if(d.action==='more'){limit+=6;renderResults();}
      if(d.action==='undated'){state.arrival='';state.departure='';invalidate();sync();}
      if(d.action==='reset'){state.scenario='all';state.bath=false;state.tub=false;state.pets=false;state.selected='';invalidate();sync();}
    });
    sync();renderResults();
    if(initialSearch)search();
    if(window.BBStayInitialHash==='#bb-stay')section.scrollIntoView({block:'start'});
  }
  if(document.readyState==='loading'){
    // Tilda's unrelated deferred CDN widgets must not postpone the new picker.
    const observer=new MutationObserver(()=>{
      if(!document.getElementById('rec2851363001'))return;
      mount();if(document.querySelector('.brp-section'))observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    document.addEventListener('DOMContentLoaded',()=>{mount();observer.disconnect();},{once:true});
    if(document.getElementById('rec2851363001')){mount();observer.disconnect();}
  }else mount();
})();
