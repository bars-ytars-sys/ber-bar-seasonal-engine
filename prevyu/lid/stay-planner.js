/* Demo enhancement; no requests, CRM submissions or live-inventory simulation. */
(() => {
  'use strict';
  const script=document.currentScript, brand=script?.dataset.brand;
  const houses=window.BBStayData?.[brand], core=window.BBStayCore;
  if (!houses || !core) return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
  const plural=(n,one,few,many)=>n%100>=11&&n%100<=14?many:n%10===1?one:n%10>=2&&n%10<=4?few:many;
  const origin=brand==='br'?'https://ecobr.ru':'https://barskie-polya.ru';
  const key='bb-stay-v1-'+brand;
  let saved={};try{saved=JSON.parse(sessionStorage.getItem(key)||'{}');}catch{}
  const state={arrival:'',departure:'',guests:2,bath:false,pets:false,fenced:false,...saved};
  state.guests=Math.min(10,Math.max(1,Number(state.guests)||2));
  if(core.dateError(state)){state.arrival='';state.departure='';}
  let selected=new Set(),limit=6,section,dialog,lastFocus;
  const save=()=>{try{sessionStorage.setItem(key,JSON.stringify(state));}catch{}};
  // Local events are available for a later analytics integration; never include PII.
  const event=(name,detail={})=>document.dispatchEvent(new CustomEvent('bb:stay',{detail:{name,brand,...detail}}));
  const dateLabel=v=>v?new Date(v+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'}):'';
  const summary=h=>[h?.name,state.arrival&&state.departure?`${dateLabel(state.arrival)} — ${dateLabel(state.departure)}`:'Даты подберём',`${state.guests} ${plural(state.guests,'гость','гостя','гостей')}`,state.bath?'Своя баня':'',state.fenced?'Огороженная территория':'',state.pets?'С питомцем':''].filter(Boolean).join(' · ');
  function siteLink(h){
    const route=window.__bbPreview?.urls?.[h.url];
    if(route)return location.origin+route;
    const name=brand==='br'?({'panorama':'br-dom-panorama.html','aframe-white':'br-dom-aframe-white.html'}[h.id]):null;
    return name?new URL(name,script.src).href:h.url;
  }
  const options=(value,max=10)=>Array.from({length:max},(_,i)=>`<option value="${i+1}" ${Number(value)===i+1?'selected':''}>${i+1}</option>`).join('');
  const dates=(prefix)=>`<div class="bst-fields"><label>Заезд<input id="${prefix}-arrival" data-state="arrival" type="date" min="${core.iso(new Date())}" value="${esc(state.arrival)}"></label><label>Выезд<input id="${prefix}-departure" data-state="departure" type="date" min="${core.iso(new Date())}" value="${esc(state.departure)}"></label><label>Всего гостей<select id="${prefix}-guests" data-state="guests">${options(state.guests)}</select></label></div>`;
  const actions=(h)=>`<button class="bst-btn" type="button" data-book="${h.id}">Даты и точная стоимость</button><div class="bst-card-row"><a class="bst-link" href="${esc(siteLink(h))}">Фото и описание</a><button type="button" class="bst-compare-toggle" data-compare="${h.id}" aria-pressed="${selected.has(h.id)}">${selected.has(h.id)?'✓ В сравнении':'+ Сравнить'}</button></div>`;
  function card(h){return `<article class="bst-card" data-house="${h.id}"><a class="bst-photo" href="${esc(siteLink(h))}" aria-label="${esc(h.name)} — фото и описание"><img loading="lazy" width="600" height="450" src="${esc(h.image.replace('/static.tildacdn.com/','/static.tildacdn.info/'))}" alt="${esc(h.name)}"></a><div class="bst-card-body"><h3>${esc(h.name)}</h3><p class="bst-card-tag">До ${h.capacity} гостей · ${esc(h.bathLabel)}</p><ul class="bst-facts"><li>${esc(h.rooms)}</li><li>${esc(h.territory)}</li><li>${h.pets?'Можно с питомцем · за доплату':'Без питомцев'}</li></ul><div class="bst-price"><strong>от ${money(h.price)}</strong> / ночь<small>Будни, за двоих · выходные от ${money(h.weekend)}</small><button class="bst-link" type="button" data-cost="${h.id}">Что входит в стоимость</button></div><div class="bst-card-actions">${actions(h)}</div></div></article>`;}
  function filters(){return `<div class="bst-filters" aria-label="Пожелания к дому"><button type="button" class="bst-pill" data-filter="bath" aria-pressed="${state.bath}">Своя баня</button>${brand==='bp'?`<button type="button" class="bst-pill" data-filter="fenced" aria-pressed="${state.fenced}">Огороженная территория</button>`:''}<button type="button" class="bst-pill" data-filter="pets" aria-pressed="${state.pets}">С питомцем</button><button type="button" class="bst-link" data-reset>Сбросить</button></div>`;}
  const assist=()=>`<div class="bst-assist"><div><h3>Не нашли свой вариант?</h3><p>Подберём другой дом, соседние даты или несколько домов для вашей компании. Ваши пожелания уже будут в запросе.</p></div><button type="button" class="bst-btn" data-lead>Помогите с подбором</button></div>`;
  function mount(){
    const mode=script.dataset.page;
    const target=mode==='br-glavnaya'?document.querySelector('#rec2851363001'):mode==='br-doma'?document.querySelector('#rec1841670091'):mode==='bp-glavnaya'?document.querySelector('#bp-doma'):null;
    if(target){
      section=document.createElement('section');section.id='bb-stay';section.className='bst bst-section';section.dataset.brand=brand;
      section.innerHTML=`<div class="bst-inner"><p class="bst-eyebrow">${brand==='br'?'Берёзовая роща · 22 дома':'Барские поля · 15 домов'}</p><h2>Какой дом подойдёт вам?</h2><p class="bst-intro">${brand==='br'?'Вдвоём, с детьми или большой компанией. Выберите важное для себя и сравните дома перед поездкой.':'Тихие выходные на своей территории. Выберите дом с баней, огороженным двором или местом для всей компании.'}</p><div class="bst-controls">${dates('bst')}<div class="bst-presets"><button type="button" class="bst-link" data-weekend>Ближайшие выходные</button><button type="button" class="bst-link" data-undated>Пока без дат</button><small>В числе гостей учитывайте детей.</small></div>${filters()}<p class="bst-error" role="alert" data-error hidden></p></div><div class="bst-results-bar"><p data-count role="status"></p><button class="bst-link" type="button" data-lead>Помочь с выбором</button></div><div class="bst-grid"></div><div class="bst-more"><button type="button" class="bst-secondary" data-more>Показать ещё дома</button></div><div class="bst-compare-bar" hidden><span data-selection></span><button type="button" class="bst-link" data-clear>Очистить</button><button type="button" class="bst-btn" data-show-compare>Сравнить дома</button></div>${assist()}<div class="bst-benefits"><div><h3>${brand==='br'?'Ресторан и SPA рядом':'Еда с доставкой к дому'}</h3><p>${brand==='br'?'Дополните поездку завтраком, бассейном или парением. Питание и SPA выбираются отдельно.':'В домах есть кухня. Если готовить не хочется, блюда доставят к вашей двери.'}</p><a class="bst-link" href="${origin+(brand==='br'?'/spa':'/menu')}">${brand==='br'?'Посмотреть SPA':'Посмотреть меню'}</a></div><div><h3>Чан — только для вас</h3><p>Банный чан у дома оплачивается отдельно: от 5 500 ₽ без наполнения. Наполнение и время подготовим по вашему запросу.</p><button type="button" class="bst-link" data-lead>Добавить к отдыху</button></div><div><h3>Условия до бронирования</h3><p>Стоимость на ваши даты, предоплата и правила отмены видны в выбранном тарифе. Проверьте их перед оплатой.</p><button type="button" class="bst-link" data-book-all>Проверить даты</button></div></div><p class="bst-notice">В карточках — стартовые цены со страниц домов за двух гостей. Дополнительные гости, питание, баня и чан оплачиваются отдельно. Доступность и итоговая сумма — в онлайн-бронировании.</p></div>`;
      target.before(section);target.classList.add('bst-replaced');
      section.querySelector('.bst-grid').before(section.querySelector('.bst-compare-bar'));render();
      // Keep the original anchors and surrounding content, without a second catalogue.
      const oldLead=document.getElementById('bb-podbor');
      if(oldLead){if(mode!=='br-doma'){const compact=document.createElement('div');compact.className='bst bst-section';compact.dataset.brand=brand;compact.style.paddingTop='8px';compact.style.paddingBottom='20px';compact.innerHTML=`<div class="bst-inner">${assist()}</div>`;oldLead.before(compact);}oldLead.classList.add('bst-replaced');}
    }
    dialog=document.createElement('dialog');dialog.className='bst';dialog.dataset.brand=brand;dialog.setAttribute('aria-labelledby','bst-dialog-title');document.body.append(dialog);
    dialog.addEventListener('close',()=>{document.documentElement.style.overflow=previousOverflow;lastFocus?.focus();});
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
    document.addEventListener('change',onChange);
    // Capture before Tilda's old quiz/podbor listeners. Only our controls are handled.
    window.addEventListener('click',onClick,true);
    window.addEventListener('submit',e=>{if(e.target.id==='bst-lead-form'){e.preventDefault();e.stopImmediatePropagation();submitLead();}},true);
    if(section && (window.BBStayInitialHash||location.hash)==='#bb-stay'){
      let interacted=false;
      window.addEventListener('pointerdown',()=>{interacted=true;},{once:true});
      section.scrollIntoView();
      // Tilda scales the blocks above the catalogue while loading.
      window.addEventListener('load',()=>{if(!interacted)requestAnimationFrame(()=>section.scrollIntoView());},{once:true});
    }
  }
  function render(){
    if(!section)return;
    const found=houses.filter(h=>core.matches(h,state));
    section.querySelector('.bst-grid').innerHTML=found.slice(0,limit).map(card).join('');
    section.querySelector('[data-count]').textContent=found.length?`${found.length} ${plural(found.length,'дом','дома','домов')} по вашим пожеланиям · доступность проверим на даты`:'По этим пожеланиям домов не найдено. Сбросьте фильтры или попросите нас подобрать несколько домов.';
    section.querySelector('[data-more]').hidden=limit>=found.length;
    const bar=section.querySelector('.bst-compare-bar');bar.hidden=!selected.size;
    section.querySelector('[data-selection]').textContent=`В сравнении: ${selected.size} из 3`;
    section.querySelector('[data-show-compare]').disabled=selected.size<2;
    section.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(!!state[b.dataset.filter])));
    const err=section.querySelector('[data-error]');err.textContent=core.dateError(state);err.hidden=!err.textContent;
  }
  function syncFields(){document.querySelectorAll('.bst [data-state]').forEach(i=>{i.value=state[i.dataset.state]||'';});}
  function onChange(e){
    if(!e.target.closest('.bst'))return;
    const name=e.target.dataset.state;if(!name){if(e.target.id==='bst-adults')updateBookingLink();return;}
    state[name]=name==='guests'?Number(e.target.value):e.target.value;
    if(name==='arrival'&&state.arrival&&(!state.departure||state.departure<=state.arrival)){const d=new Date(state.arrival+'T12:00:00');d.setDate(d.getDate()+2);state.departure=core.iso(d);}
    limit=6;save();syncFields();render();updateBookingLink();
    dialog?.querySelectorAll('[data-summary]').forEach(el=>{const h=houses.find(h=>h.id===el.dataset.summary);el.textContent=summary(h);});
  }
  function updateBookingLink(){const a=dialog?.querySelector('[data-go-book]');if(!a)return;const h=houses.find(h=>h.id===a.dataset.goBook);a.href=core.bookingUrl(brand,{...state,adults:Number(dialog.querySelector('#bst-adults').value)},h);}
  let previousOverflow='';
  function open(title,html){
    if(!dialog.open){lastFocus=document.activeElement;previousOverflow=document.documentElement.style.overflow;}
    dialog.innerHTML=`<div class="bst-dialog-head"><h2 id="bst-dialog-title">${title}</h2><button type="button" class="bst-close" data-close aria-label="Закрыть окно">×</button></div><div class="bst-dialog-body">${html}</div>`;
    if(!dialog.open)dialog.showModal();document.documentElement.style.overflow='hidden';dialog.scrollTop=0;dialog.querySelector('[data-close]').focus();
  }
  function cost(h){
    event('cost_open',{house:h.id});
    open(`${esc(h.name)}: стоимость отдыха`,`<p class="bst-summary">Будни от <b>${money(h.price)}</b> / ночь · выходные от <b>${money(h.weekend)}</b> / ночь. За двух гостей.</p><div class="bst-cost"><div><h3>В проживании</h3><p>${esc(h.included)}.</p>${brand==='bp'?'<p>Кухня с посудой и техникой, спальные места, свой участок и мангальная зона.</p>':'<p>Оснащение и планировка показаны на странице выбранного дома.</p>'}</div><div><h3>По вашему желанию</h3><p>Чан без наполнения — от 5 500 ₽. С наполнением — от 6 500 ₽.</p>${h.bath?'<p>Своя баня / сауна — отдельно от проживания.</p>':''}<p>${brand==='br'?'Питание в ресторане, SPA и программы отдыха':'Питание с доставкой к дому'} — отдельно.</p><p>${h.pets?'Проживание с питомцем — за доплату.':'В этом доме проживание с питомцами не предусмотрено.'}</p></div></div><p class="bst-intro">Итог зависит от дат, состава гостей и выбранных услуг. Условия предоплаты и отмены покажем вместе с тарифом до оплаты.</p><div class="bst-actions"><button type="button" class="bst-btn" data-book="${h.id}">Посмотреть цену на мои даты</button><button type="button" class="bst-secondary" data-lead="${h.id}">Рассчитать отдых с менеджером</button></div>`);
  }
  function compare(){
    const list=houses.filter(h=>selected.has(h.id));if(list.length<2)return;
    event('compare_open',{houses:list.map(h=>h.id)});
    const row=(title,fn)=>`<tr><th scope="row">${title}</th>${list.map(h=>`<td>${fn(h)}</td>`).join('')}</tr>`;
    open('Сравните перед выбором',`<div class="bst-table-wrap"><table><thead><tr><th scope="col">Что важно</th>${list.map(h=>`<th scope="col"><img src="${esc(h.image.replace('/static.tildacdn.com/','/static.tildacdn.info/'))}" alt=""><b>${esc(h.name)}</b><br><button type="button" class="bst-link" data-remove="${h.id}">Убрать из сравнения</button></th>`).join('')}</tr></thead><tbody>${row('Размещение',h=>`До ${h.capacity} гостей<br>${esc(h.rooms)}`)}${row('Территория',h=>esc(h.territory))}${row('Баня и чан',h=>(h.bath?'Своя баня / сауна и чан':'Чан у дома')+'<small>Оплачиваются отдельно</small>')}${row('С питомцем',h=>h.pets?'Да, за доплату':'Без питомцев')}${row('В будни / выходные',h=>`${money(h.price)} / ${money(h.weekend)}<small>От, за ночь, двое гостей</small>`)}${row('Что входит',h=>esc(h.included))}${row('Ваши даты',h=>`<button type="button" class="bst-btn" data-book="${h.id}">Даты и стоимость</button>`)} </tbody></table></div><small>На телефоне таблицу можно прокрутить в сторону. Услуги и дополнительные гости оплачиваются отдельно.</small>`);
  }
  function book(h){
    open(h?`${esc(h.name)}: даты отдыха`:'Подберите даты отдыха',`<p class="bst-summary" data-summary="${h?.id||''}">${esc(summary(h))}</p>${dates('bst-book')}<p class="bst-error" data-book-error role="alert" hidden></p><div class="bst-lead-grid"><label>Из них взрослых<select id="bst-adults">${options(Math.min(state.guests,state.adults||state.guests))}</select></label><div><small>Если едете с детьми, на следующем шаге добавьте их и укажите возраст — так стоимость будет рассчитана правильно.</small></div></div><div class="bst-actions"><a class="bst-btn" data-go-book="${h?.id||''}" href="${esc(core.bookingUrl(brand,{...state,adults:Math.min(state.guests,state.adults||state.guests)},h))}" target="_blank" rel="noopener">Проверить свободные даты</a><button type="button" class="bst-secondary" data-lead="${h?.id||''}">Нет подходящих дат? Помогите найти</button></div><small>Откроется онлайн-бронирование ${brand==='br'?'«Берёзовой рощи»':'«Барских полей»'} с выбранным домом и датами. Дополнительные услуги выбираются отдельно.</small>`);
  }
  function lead(h){
    event('lead_open',{house:h?.id||'any'});
    open('Подберём дом под ваш отдых',`<form id="bst-lead-form"><p class="bst-summary" data-summary="${h?.id||''}">${esc(summary(h))}</p>${dates('bst-lead')}<div class="bst-lead-grid"><label>Ваше имя <small>Необязательно</small><input name="guest_name" autocomplete="given-name" maxlength="60" placeholder="Как к вам обращаться"></label><label>Телефон для связи<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required pattern="[+0-9() \-]{10,22}" placeholder="+7 (___) ___-__-__"></label></div><label>Что ещё учесть? <small>Возраст детей, бюджет, питомец, чан или баня</small><textarea name="wishes" maxlength="1000" placeholder="Например: двое взрослых и ребёнок 5 лет, хотим чан вечером"></textarea></label><label class="bst-consent"><input type="checkbox" name="consent" required><span>Согласен на обработку персональных данных согласно <a href="${origin}/privacy" target="_blank" rel="noopener">политике конфиденциальности</a>.</span></label><p class="bst-error" data-lead-error role="alert" hidden></p><button type="button" class="bst-btn" data-submit-lead>Получить варианты и стоимость</button><small>Демоверсия: заявки не отправляются. В рабочей версии менеджер получит выбранный дом, даты, состав гостей и пожелания.</small><input type="hidden" name="house" value="${esc(h?.id||'')}"></form>`);
  }
  function submitLead(){
    const form=dialog.querySelector('#bst-lead-form');if(!form)return;
    const error=core.dateError(state),digits=form.elements.phone.value.replace(/\D/g,'');
    const invalid=error || (digits.length<10||digits.length>11?'Проверьте номер телефона.':'');
    const feedback=form.querySelector('[data-lead-error]');feedback.textContent=invalid;feedback.hidden=!invalid;
    if(invalid||!form.reportValidity())return;
    const h=houses.find(h=>h.id===form.elements.house.value),wishes=form.elements.wishes.value.trim();
    // Deliberately local only. Do not persist or emit phone, name or free text.
    event('lead_demo_complete',{house:h?.id||'any'});
    open('Запрос собран',`<div class="bst-success"><h3>Вот что увидит менеджер</h3><p>${esc(summary(h))}</p>${wishes?`<p style="margin-top:12px">${esc(wishes)}</p>`:''}<p style="margin-top:18px">Это демо: заявка не отправлена. В рабочей версии мы предложим подходящие дома, стоимость и ближайшие даты, если нужные заняты.</p></div><div class="bst-actions" style="margin-top:22px"><button type="button" class="bst-btn" data-close>Вернуться к домам</button></div>`);
  }
  function onClick(e){
    const legacy=e.target.closest?.('a[href="#popup:quiz"],a[href="#bb-podbor"]');
    if(legacy&&section){e.preventDefault();e.stopImmediatePropagation();if(legacy.getAttribute('href')==='#popup:quiz'){section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});section.querySelector('input').focus({preventScroll:true});}else{if(legacy.getAttribute('data-bbп-г')==='7+'){state.guests=7;save();syncFields();render();}lead();}return;}
    const b=e.target.closest?.('.bst button,.bst [data-go-book]');if(!b)return;
    if(!('goBook' in b.dataset)){e.preventDefault();e.stopImmediatePropagation();}
    const d=b.dataset,h=houses.find(h=>h.id===(d.cost||d.book||d.lead||d.goBook));
    if('close'in d){dialog.close();return;}
    if('cost'in d){cost(h);return;}
    if('book'in d||'bookAll'in d){book(h);return;}
    if('lead'in d){lead(h);return;}
    if('submitLead'in d){submitLead();return;}
    if('goBook'in d){
      const err=core.dateError(state)||(h&&state.guests>h.capacity?`В этом доме до ${h.capacity} гостей. Выберите другой дом или измените число гостей.`:'');const out=dialog.querySelector('[data-book-error]');out.textContent=err;out.hidden=!err;if(err){e.preventDefault();return;}
      state.adults=Number(dialog.querySelector('#bst-adults').value);if(state.adults>state.guests){out.textContent='Взрослых не может быть больше общего числа гостей.';out.hidden=false;e.preventDefault();return;}
      save();event('booking_click',{house:h?.id||'any'});
      b.href=core.bookingUrl(brand,state,h);return;
    }
    if('compare'in d){if(selected.has(d.compare))selected.delete(d.compare);else if(selected.size<3)selected.add(d.compare);else{open('В сравнении уже три дома','<p>Уберите один из выбранных домов, чтобы добавить другой.</p><div class="bst-actions" style="margin-top:20px"><button type="button" class="bst-btn" data-show-compare>Открыть сравнение</button><button type="button" class="bst-secondary" data-close>Вернуться к выбору</button></div>');return;}render();section.querySelector(`[data-compare="${d.compare}"]`)?.focus({preventScroll:true});return;}
    if('showCompare'in d){compare();return;}
    if('remove'in d){selected.delete(d.remove);render();if(selected.size>=2)compare();else dialog.close();return;}
    if('clear'in d){selected.clear();render();return;}
    if('more'in d){limit+=6;render();return;}
    if('filter'in d)state[d.filter]=!state[d.filter];
    if('reset'in d){state.bath=false;state.pets=false;state.fenced=false;state.guests=2;}
    if('undated'in d){state.arrival='';state.departure='';}
    if('weekend'in d){const dt=new Date();dt.setDate(dt.getDate()+((5-dt.getDay()+7)%7));state.arrival=core.iso(dt);dt.setDate(dt.getDate()+2);state.departure=core.iso(dt);}
    limit=6;save();syncFields();render();event('filter_change',{guests:state.guests,bath:state.bath,pets:state.pets,fenced:state.fenced});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
