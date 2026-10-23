import D from './data.js?v=20261023-house-photo-2';
import {createHousePhoto} from './house-photo.js';
import { motion, initExperience } from './experience.js?v=20261013-motion';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toLocaleString('ru-RU')+' ₽';
const positions=n=>n%10===1&&n%100!==11?'позиция':n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?'позиции':'позиций';
const icons={home:'M3 10l9-7 9 7v10H3z M9 20v-7h6v7',food:'M5 3v7m-3-7v4a3 3 0 0 0 6 0V3M5 10v11M16 3v18m0-18c5 2 5 8 0 9',bath:'M3 11h18v4a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6z M7 3c-2 3 2 3 0 6m5-6c-2 3 2 3 0 6m5-6c-2 3 2 3 0 6',map:'M9 4L3 2v17l6 3 6-3 6 3V5l-6-3z M9 4v18m6-20v17',chat:'M21 11a9 9 0 0 1-13 8l-5 2 2-5A9 9 0 1 1 21 11z M8 10h8m-8 4h5',wifi:'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20h.01',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',search:'M20 20l-5-5M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z',heart:'M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 8 8 14 7-6 12-10 8-14z',leaf:'M4 20c-1-8 1-14 16-16 0 13-6 17-13 14M4 20l11-11',gift:'M3 9h18v4H3z M5 13v8h14v-8M12 9v12M12 9C3 9 4 2 8 3c3 1 4 6 4 6zm0 0c9 0 8-7 4-6-3 1-4 6-4 6z',phone:'M5 3h4l1 5-2 2c2 3 3 4 6 6l2-2 5 1v4c-1 4-6 2-11-3S1 4 5 3z'};
const icon=n=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[n]||icons.leaf}"/></svg>`;
icons.book='M4 3h13a3 3 0 0 1 3 3v15H6a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1z M3 17h17M7 7h9m-9 4h6';
document.querySelectorAll('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}},save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
const q=new URL(location.href).searchParams,requested=q.get('house');
let house=requested!==null?(D.houses.some(h=>h.id===requested)?requested:''):read('bp-guest-house','');
if(!D.houses.some(h=>h.id===house))house='';
let tab=location.hash==='#pre'?'pre':'home',serviceCategory='Популярное',serviceExpanded=false,foodCategory='Все',foodSearch='';
let cart=read('bp-guest-cart',{});for(const id of Object.keys(cart)){if(!D.food.products.some(p=>p.id===id)||!Number.isInteger(cart[id])||cart[id]<1||cart[id]>20)delete cart[id]}
const H=()=>D.houses.find(h=>h.id===house),products=()=>D.food.products||[];
const updateHousePhoto=createHousePhoto({selector:'.hero-photo:not(.house-photo-next)',fallbackSrc:'assets/cover.webp',fallbackAlt:'Дом на территории Барских полей'});
const popup=$('sheet');let returnFocus=null,chatHistory=[],sheetToken=0;
function show(title,body,eyebrow='Ваш отдых'){
 const wasOpen=popup.open;++sheetToken;motion.stop(popup);if(!wasOpen)returnFocus=document.activeElement;$('sheet-title').textContent=title;$('sheet-eyebrow').textContent=eyebrow;popup.classList.remove('map-sheet');$('sheet-body').innerHTML=body;
 if(!wasOpen)popup.showModal();document.body.classList.add('modal-open');popup.scrollTop=0;motion.sheetOpen(popup,wasOpen);
}
function close(){if(!popup.open)return;const token=++sheetToken;motion.sheetClose(popup).then(()=>{if(token!==sheetToken)return;popup.close();if(returnFocus?.isConnected)returnFocus.focus()})}
popup.addEventListener('cancel',e=>{e.preventDefault();close()});
popup.addEventListener('close',()=>document.body.classList.remove('modal-open'));
$('close-sheet').onclick=close;popup.addEventListener('click',e=>{if(e.target===popup){const b=popup.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close()}});
document.addEventListener('guest:photo-error',()=>toast('Фото дома не загрузилось. Попробуйте выбрать дом ещё раз.'));
let toastTimer;function toast(t){$('toast').textContent=t;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3800)}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Скопировано. Можно вставить в сообщение.');return true}catch{toast('Выделите и скопируйте текст заявки ниже.');return false}}
function channelLinks(cls='outline-button',draft=false){return D.contacts.socials.filter(s=>['telegram','max','whatsapp'].includes(s.id)).map(s=>`<a class="${cls}" href="${esc(s.url)}" target="_blank" rel="noopener" ${draft?'data-draft-channel':''}>${esc(s.title)} ↗</a>`).join('')}
function contact(){show('Остаёмся на связи',`<p class="note">${esc(D.contacts.phone_role)} · ${esc(D.contacts.phone_hours)}.<br>Администраторы на территории — до ${esc(D.contacts.administrator_until)}.</p><div class="contact-list">${channelLinks()}<a class="outline-button" href="${esc(D.contacts.phone_url)}">${icon('phone')}${esc(D.contacts.phone)}</a></div><p class="note" style="margin-top:20px">Наши страницы</p><div class="contact-list">${D.contacts.socials.filter(s=>!['telegram','max','whatsapp'].includes(s.id)).map(s=>`<a class="outline-button" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`).join('')}</div><div class="form-actions"><button class="outline-button" data-chat>Спросить помощника по путеводителю →</button></div>`,'Связь с базой')}
function updateURL(forceTab=false){const u=new URL(location.href);if(house)u.searchParams.set('house',house);else u.searchParams.delete('house');if(forceTab||!['#food','#services','#map','#guide','#reviews','#main'].includes(u.hash))u.hash=tab;history.replaceState(null,'',u.pathname+u.search+u.hash);syncMobileScreen()}
const phoneViewport=matchMedia('(max-width:640px)');
function syncMobileScreen(scroll=false){
 const section=location.hash.slice(1),screen=['food','services','guide','map','reviews'].includes(section)?section:'home';
 document.body.dataset.mobileScreen=screen;
 document.querySelectorAll('.mobile-nav a').forEach(a=>{if(a.hash==='#'+(screen==='map'||screen==='reviews'?'home':screen))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 document.querySelector('.mobile-nav').style.setProperty('--nav-index',Math.max(0,['home','food','services','guide'].indexOf(screen)));
 if(scroll&&phoneViewport.matches)requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));
 motion.screen(screen,phoneViewport.matches);
}
phoneViewport.addEventListener('change',()=>syncMobileScreen(true));
function selectHouse(id){house=D.houses.some(h=>h.id===id)?id:'';save('bp-guest-house',house);updateURL();renderContext();renderServices();renderGuide($('guide-search').value);close()}
function houses(){show('Какой у вас дом?',`<p class="note" style="margin-bottom:16px">Выберите дом — покажем его время заезда, выезда и доступные услуги.</p><div class="house-choices"><button class="house-choice" data-house-choice="" aria-pressed="${!house}"><b>Вся территория</b><small>Общая информация о базе</small></button>${D.houses.map(h=>`<button class="house-choice" data-house-choice="${h.id}" aria-pressed="${house===h.id}"><b>${esc(h.name)}</b><small>До ${h.capacity} гостей · ${esc(h.bath)}</small></button>`).join('')}</div>`,'Ваш дом')}
function renderContext(){
 updateHousePhoto(H());
 const h=H(),ci=h?.checkin||D.stay.default_checkin,co=h?.checkout||D.stay.default_checkout;
 $('house-button').innerHTML=icon('home')+`<span class="house-title"><small>${h?'Ваш дом':'Для точной информации'}</small>${h?esc(h.name):'Выберите свой дом'}</span><span aria-hidden="true">⌄</span>`;
 $('mobile-house-name').textContent=h?h.name:'Выберите свой дом';
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tab));
 document.querySelector('.stay-tabs').style.setProperty('--tab-index',tab==='pre'?1:0);document.body.dataset.stayPhase=tab;
 $('welcome-copy').textContent=tab==='pre'?'Как добраться, что важно знать до заселения и чем дополнить отдых. Подготовьте всё к вашему приезду.':'Меню, баня и чан, прогулки и ответы на вопросы — под рукой, пока вы в «Барских полях».';
 $('quick').innerHTML=`${tab==='home'?`<article class="quick-card wifi"><div class="quick-label">${icon('wifi')}Интернет и Wi-Fi</div><strong>${h?esc(h.name):'Ваш дом на территории'}</strong><p>${esc(D.stay.wifi_note)}</p><button class="text-button" data-wifi>Уточнить сеть и пароль →</button></article>`:''}<article class="quick-card"><div class="quick-label">${icon('clock')}Заезд</div><strong>${h?'с '+ci:'15:00 / 16:00'}</strong><p>${h?esc(h.name):'Ривер / остальные дома'}</p></article><article class="quick-card"><div class="quick-label">${icon('clock')}Выезд</div><strong>${h?'до '+co:'12:00 / 13:00'}</strong><p>${h?esc(h.name):'Ривер / остальные дома'}</p></article><article class="quick-card contact"><div class="quick-label">${icon('chat')}Поможем с отдыхом</div><strong>На связи 9:00–24:00</strong><p>Telegram, MAX и WhatsApp</p><button class="text-button" data-contact>Написать или позвонить →</button></article>`;
 $('services-title').textContent=tab==='pre'?'Закажите к приезду':'Можно заказать';$('guide-title').textContent=tab==='pre'?'Перед поездкой':'О доме и территории';$('reviews').hidden=tab==='pre';
 $('quick').classList.toggle('before-arrival',tab==='pre');
 document.dispatchEvent(new CustomEvent('bp:context'));
}
const popular=['breakfast','tub','chalet-sauna','sauna','massage','buggy','bike'];
const serviceIcon=s=>s.category==='Еда'?'food':s.category==='Баня и чан'?'bath':s.category==='Досуг'?'leaf':'gift';
const priceLabel=s=>s.price===0?'Бесплатно':s.price==null?'Уточним стоимость':(['tub-filling','buggy','veranda'].includes(s.id)?'от ':'')+money(s.price);
function renderServices(){
 requestAnimationFrame(()=>motion.reveal($('service-grid').children));$('service-grid').scrollLeft=0;
 const cats=['Популярное',...new Set(D.services.map(s=>s.category)),'Все'];$('service-categories').innerHTML=cats.map(c=>`<button data-service-category="${esc(c)}" aria-pressed="${serviceCategory===c}">${esc(c)}</button>`).join('');
 let list=D.services.filter(s=>serviceCategory==='Все'||serviceCategory==='Популярное'?serviceCategory==='Все'||popular.includes(s.id):s.category===serviceCategory);
 const h=H();if(serviceCategory==='Популярное'&&h)list=list.filter(s=>!s.house_ids||s.house_ids.includes(h.id));
 const count=list.length;if(!serviceExpanded)list=list.slice(0,6);
 $('service-grid').innerHTML=list.map(s=>{const available=!h||!s.house_ids||s.house_ids.includes(h.id),unit=s.price===0?'Для гостей базы':String(s.unit||'').replace(/^₽\s*\/?\s*/,''),season=s.id==='veranda';return `<article class="service-card"><span class="service-icon">${icon(serviceIcon(s))}</span><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p>${!available?`<p class="season-note">Для домов: ${esc(s.house_ids.map(id=>D.houses.find(x=>x.id===id)?.name).join(', '))}.</p>`:''}${season?'<p class="season-note">Апрель–сентябрь. Согласуйте дату заранее.</p>':''}<strong class="service-price">${priceLabel(s)}</strong><small class="service-unit">${esc(unit||'Время согласуем с администратором')}</small><button class="primary-button" data-service="${s.id}" ${available?'':'disabled'}>${s.id==='food'?'Выбрать блюда':s.price===0?'Узнать подробнее':season?'Обсудить дату':'Заказать'}</button></article>`}).join('');
 $('more-services').hidden=serviceExpanded||count<=6;$('more-services').textContent=`Показать все услуги (${count})`;
}
function productInfo(id){
 const p=products().find(x=>x.id===id);if(!p)return;
 show(p.title,(p.image?'<img class="product-photo" src="'+esc(p.image)+'" alt="'+esc(p.title)+'">':'')+'<strong>'+money(p.price)+'</strong>'+(p.portion?'<p class="small">'+esc(p.portion+' '+(p.portion_unit||''))+'</p>':'')+(p.description?'<p class="product-description">'+esc(p.description)+'</p>':'')+'<div class="form-actions"><button class="primary-button" data-product-add="'+p.id+'">Добавить к заказу →</button></div>','Меню кухни');
}
function foodQty(id,delta){const n=Math.max(0,Math.min(20,(cart[id]||0)+delta));if(n)cart[id]=n;else delete cart[id];save('bp-guest-cart',cart);renderFood();motion.cart()}
function renderFood(){
 const cats=['Все',...new Set(products().map(p=>p.category).filter(Boolean))];$('food-categories').innerHTML=cats.map(c=>`<button data-food-category="${esc(c)}" aria-pressed="${foodCategory===c}">${esc(c)}</button>`).join('');
 const list=products().filter(p=>(foodCategory==='Все'||p.category===foodCategory)&&(!foodSearch||normalize(p.title+' '+p.description).includes(normalize(foodSearch))));
 $('food-grid').innerHTML=list.map(p=>`<article class="food-card"><div class="food-picture"><button class="food-info" data-product-info="${p.id}" aria-label="Подробнее: ${esc(p.title)}">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" width="320" height="240">`:icon('food')}</button></div><div class="food-body"><h3><button class="food-title" data-product-info="${p.id}">${esc(p.title)}</button></h3><p class="portion">${p.portion?esc(p.portion+' '+(p.portion_unit||'')):esc(p.category||'Из меню кухни')}</p><div class="food-row"><strong>${p.price==null?'По меню':money(p.price)}</strong>${cart[p.id]?`<div class="qty"><button data-food-remove="${p.id}" aria-label="Убрать одну порцию: ${esc(p.title)}">−</button><span>${cart[p.id]}</span><button data-food-add="${p.id}" aria-label="Добавить порцию: ${esc(p.title)}" ${cart[p.id]>=20?'disabled':''}>+</button></div>`:`<button class="add-food" data-food-add="${p.id}" aria-label="Добавить в заказ: ${esc(p.title)}">+</button>`}</div></div></article>`).join('');
 $('food-empty').hidden=!!list.length;const total=Object.values(cart).reduce((a,b)=>a+b,0),sum=products().reduce((a,p)=>a+(cart[p.id]||0)*(p.price||0),0);$('cart-panel').hidden=!total;document.body.classList.toggle('has-cart',total>0);$('cart-count').textContent=`В заказе: ${total} ${positions(total)}`;$('cart-sum').innerHTML=`<b>${money(sum)}</b><span> · доставку согласуем в чате</span>`;
}
const normalize=t=>String(t||'').toLowerCase().replace(/ё/g,'е').replace(/wi[\s-]*fi|вай[\s-]*фай/g,'wifi');
const queryWords=q=>normalize(q).replace(/[^а-яa-z0-9 -]/g,' ').split(/\s+/).filter(w=>w.length>2&&!['как','что','где','для','или','мне','нам'].includes(w)).map(w=>w.slice(0,5));
function sections(){const h=H();return D.sections.map(s=>s.id==='check'&&h?{...s,items:[`${h.name}: заезд с ${h.checkin}, выезд до ${h.checkout}.`,...s.items.filter(t=>!/^Ривер:|^Остальные/.test(t))]}:s.id==='pets'&&h&&!h.pets?{...s,items:['В Шале проживание с питомцами не предусмотрено. Если нужна помощь с размещением, свяжитесь с базой.']}:s)}
function renderGuide(query=''){
 const terms=queryWords(query),match=t=>terms.some(w=>normalize(t).includes(w)),highlight=t=>{let a=esc(t);for(const w of terms)a=a.replace(new RegExp('('+w+'[а-яёa-z0-9-]*)','gi'),'<mark>$1</mark>');return a};
 const visible=sections().filter(s=>terms.length?s.items.some(match)||match(s.title):s.tab===(tab==='pre'?'pre':'in')||s.id==='check'||s.id==='rules'||s.id==='pets');
 $('guide-sections').innerHTML=visible.map(s=>`<details ${terms.length?'open':''}><summary><span>${highlight(s.title)}${terms.length?`<span class="tag">${s.tab==='pre'?'Перед приездом':'В доме'}</span>`:''}</span></summary><ul>${s.items.map(t=>`<li>${highlight(t)}</li>`).join('')}</ul>${s.id==='area'?'<a class="text-button details-link" href="#map">Посмотреть карту территории →</a>':s.id==='food'?'<a class="text-button details-link" href="#food">Выбрать блюда →</a>':s.id==='wifi'?'<button class="text-button details-link" data-wifi>Уточнить сеть и пароль →</button>':''}</details>`).join('')||'<p class="empty">Пока не нашли ответ. Нажмите «Спросить о доме» или свяжитесь с администратором.</p>';
 $('clear-search').hidden=!query;
}
function houseSelect(){return `<label for="order-house">Ваш дом</label><select id="order-house" name="house"><option value="">${tab==='pre'?'Дом пока не выбран':'Выберите дом'}</option>${D.houses.map(h=>`<option value="${h.id}" ${house===h.id?'selected':''}>${esc(h.name)}</option>`).join('')}</select>`}
function orderService(id){
 const s=D.services.find(x=>x.id===id);if(!s)return;if(id==='food'){location.hash='food';$('food').scrollIntoView({behavior:'smooth'});return}
 const filling=['tub','tub-filling'].includes(id),fillDefault=id==='tub-filling'?D.tub_fillings.find(f=>f.price>=6500)?.id:'plain';
 show(s.title,`<p class="note">${esc(s.description)}</p><form id="order-form">${houseSelect()}${filling?`<label for="order-filling">Вариант чана</label><select id="order-filling">${D.tub_fillings.map(f=>`<option value="${f.id}" ${f.id===fillDefault?'selected':''}>${esc(f.title)} — ${money(f.price)}</option>`).join('')}</select>`:''}${['breakfast','massage'].includes(id)?'<label for="order-qty">Количество гостей</label><input id="order-qty" type="number" min="1" max="20" value="1" required>':''}<label for="order-time">Когда вам удобно</label><input id="order-time" maxlength="100" placeholder="Например, сегодня после 18:00"><label for="order-comment">Пожелания — необязательно</label><textarea id="order-comment" maxlength="500" placeholder="Что важно учесть"></textarea><p id="order-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="primary-button" type="submit">Подготовить заявку →</button><p class="note">Стоимость и время подтвердит администратор. Оплата — после согласования.</p></div></form>`,'Запрос услуги');
 $('order-form').onsubmit=e=>{e.preventDefault();const hid=$('order-house').value;if(!hid&&tab==='home')return orderError('Выберите дом, чтобы администратор понимал, куда нужна услуга.');if(s.house_ids&&hid&&!s.house_ids.includes(hid))return orderError('Эта услуга доступна в других домах. Уточните возможность у администратора.');const h=D.houses.find(x=>x.id===hid),fill=filling?D.tub_fillings.find(f=>f.id===$('order-filling').value):null,qty=Number($('order-qty')?.value||1);prepare([`Здравствуйте! Хочу заказать ${s.title.toLowerCase()} в «Барских полях».`,`Дом: ${h?.name||'пока не выбран'}.`,fill?`Вариант: ${fill.title} (${money(fill.price)}).`:'',qty>1?`Гостей: ${qty}.`:'',$('order-time').value.trim()?`Когда: ${$('order-time').value.trim()}.`:'',$('order-comment').value.trim()?`Пожелания: ${$('order-comment').value.trim()}`:'','Подтвердите, пожалуйста, время и стоимость.'].filter(Boolean).join('\n'))};
}
function orderError(t){$('order-error').hidden=false;$('order-error').textContent=t;$('order-error').scrollIntoView({block:'nearest'})}
function orderCart(){
 const items=products().filter(p=>cart[p.id]),sum=items.reduce((a,p)=>a+cart[p.id]*(p.price||0),0);if(!items.length)return;
 show('Заказ к вашему столу',`<div class="order-summary">${items.map(p=>`<div><span>${esc(p.title)} <small>× ${cart[p.id]}</small></span><strong>${money((p.price||0)*cart[p.id])}</strong></div>`).join('')}<div><strong>По меню</strong><strong>${money(sum)}</strong></div></div><form id="order-form">${houseSelect()}<label for="order-time">Когда доставить</label><input id="order-time" placeholder="Укажите удобное время" maxlength="100"><label for="order-comment">Пожелания к заказу</label><textarea id="order-comment" maxlength="500" placeholder="Например, предпочтения по блюдам"></textarea><p id="order-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="primary-button" type="submit">Подготовить заказ →</button><button class="outline-button" type="button" id="clear-cart">Очистить список блюд</button><p class="note">Администратор уточнит наличие блюд, время доставки и итоговую сумму.</p></div></form>`,'Меню кухни');
 $('clear-cart').onclick=()=>{cart={};save('bp-guest-cart',cart);renderFood();close()};
 $('order-form').onsubmit=e=>{e.preventDefault();const h=D.houses.find(x=>x.id===$('order-house').value);if(!h)return orderError('Укажите дом для доставки.');prepare([`Здравствуйте! Заказ из кухни «Барских полей» в ${h.name}:`,...items.map(p=>`• ${p.title} — ${cart[p.id]} шт. (${money((p.price||0)*cart[p.id])})`),`По меню: ${money(sum)}.`,$('order-time').value.trim()?`Когда: ${$('order-time').value.trim()}.`:'',$('order-comment').value.trim()?`Пожелания: ${$('order-comment').value.trim()}`:'','Подтвердите, пожалуйста, наличие блюд, время доставки и итоговую сумму.'].filter(Boolean).join('\n'))};
}
function prepare(text){show('Текст заявки готов',`<p class="note">Скопируйте текст и отправьте его в удобном чате. Администратор подтвердит ваш запрос.</p><label for="request-text">Можно дополнить сообщение перед отправкой</label><textarea id="request-text" class="request-text">${esc(text)}</textarea><div class="form-actions"><button class="primary-button" id="copy-request">Скопировать заявку</button></div><div class="messenger-actions">${channelLinks('outline-button',true)}</div><p class="note" style="margin-top:14px">После копирования откройте чат, вставьте сообщение и отправьте.</p>`,'Связь с администратором');$('copy-request').onclick=()=>copy($('request-text').value)}
function wifi(){prepare(`Здравствуйте! Подскажите, пожалуйста, название сети Wi-Fi и пароль${H()?' для дома «'+H().name+'»':' для моего дома'} в «Барских полях».`)}
function localAnswer(text){
 const t=normalize(text),h=H();if(/wi.?fi|вай|парол|интернет/.test(t))return D.stay.wifi_note+(h?' Ваш дом — '+h.name+'.':' Выберите свой дом вверху страницы.')+' Кнопка «Связь» откроет контакты базы.';
 if(/заезд|засел|выезд|выселен/.test(t))return h?`${h.name}: заезд с ${h.checkin}, выезд до ${h.checkout}. ${D.contacts.after_19}`:`Ривер: заезд с 15:00, выезд до 12:00. Остальные дома: 16:00 / 13:00. ${D.contacts.after_19}`;
 if(/кошк|собак|питом|животн/.test(t)&&h&&!h.pets)return 'В Шале проживание с питомцами не предусмотрено. Для согласования размещения свяжитесь с базой.';
 const terms=queryWords(t),rank=sections().map(s=>({s,score:terms.reduce((n,w)=>n+(normalize(s.title).includes(w)?3:0)+(s.items.some(i=>normalize(i).includes(w))?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 if(rank[0])return rank[0].s.items.slice(0,4).join('\n\n');return 'Этот вопрос лучше уточнить у администратора. Нажмите «Связь»: там Telegram, MAX, WhatsApp и телефон базы.';
}
function chat(){show('Спросите о вашем отдыхе',`<div class="chat-messages" id="chat-messages" role="log" aria-live="polite"></div><div class="chat-suggestions">${['Когда выезд?','Как заказать чан?','Какой пароль Wi-Fi?','Что есть на территории?'].map(q=>`<button data-question="${q}">${q}</button>`).join('')}</div><form class="chat-form" id="chat-form"><label class="sr-only" for="chat-input">Ваш вопрос</label><input id="chat-input" maxlength="300" placeholder="Напишите вопрос" autocomplete="off" required><button class="primary-button" aria-label="Задать вопрос">↑</button></form><p class="note" style="margin-top:14px">Ответы по путеводителю. Для заказа или уточнения услуги свяжитесь с администратором.</p>`,'Помощник гостя');if(!chatHistory.length)chatHistory.push({who:'assistant',text:'Я помогу найти информацию о доме, меню, бане и территории. Что хотите узнать?'});drawMessages();$('chat-form').onsubmit=e=>{e.preventDefault();ask($('chat-input').value.trim());$('chat-input').value=''}}
function drawMessages(){const box=$('chat-messages');if(!box)return;box.innerHTML='';for(const m of chatHistory){const e=document.createElement('p');e.className='chat-message '+m.who;e.textContent=m.text;box.append(e)}box.scrollTop=box.scrollHeight}
function ask(q){if(!q)return;chatHistory.push({who:'user',text:q},{who:'assistant',text:localAnswer(q)});drawMessages()}
function switchTab(value){tab=value==='pre'?'pre':'home';updateURL(true);renderContext();renderGuide($('guide-search').value);if(!phoneViewport.matches)$('quick').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'})}
document.addEventListener('click',e=>{
 const el=e.target.closest('button,a');if(!el)return;const d=el.dataset;
 if('contact'in d)contact();else if('chat'in d)chat();else if('houses'in d)houses();else if('wifi'in d)wifi();else if('houseChoice'in d)selectHouse(d.houseChoice);else if('tab'in d)switchTab(d.tab);
 else if('serviceCategory'in d){serviceCategory=d.serviceCategory;serviceExpanded=false;renderServices()}else if('service'in d)orderService(d.service);
 else if('productInfo'in d)productInfo(d.productInfo);else if('productAdd'in d){foodQty(d.productAdd,1);close();toast('Блюдо добавлено в список заказа.')}else if('foodCategory'in d){foodCategory=d.foodCategory;renderFood()}else if('foodAdd'in d)foodQty(d.foodAdd,1);else if('foodRemove'in d)foodQty(d.foodRemove,-1);
 else if('question'in d)ask(d.question);
 else if('draftChannel'in d){navigator.clipboard.writeText($('request-text').value).catch(()=>{});}
});
$('more-services').onclick=()=>{serviceExpanded=true;renderServices()};$('open-cart').onclick=orderCart;
$('guide-search').oninput=e=>renderGuide(e.target.value);$('clear-search').onclick=()=>{$('guide-search').value='';renderGuide();$('guide-search').focus()};
$('food-search').oninput=e=>{foodSearch=e.target.value;renderFood()};
$('open-map').onclick=()=>{show('Карта территории','<p class="note" style="margin-bottom:14px">На телефоне прокрутите карту по горизонтали, чтобы рассмотреть детали.</p><img src="assets/map.svg" alt="Официальная карта Барских полей">','Барские поля');popup.classList.add('map-sheet')};
$('yandex-route').href=D.map.route_yandex;$('gis-route').href=D.map.route_2gis;$('address').textContent=D.address;$('footer-phone').textContent=D.contacts.phone;$('footer-phone').href=D.contacts.phone_url;$('footer-hours').textContent=D.contacts.phone_hours;
$('social-links').innerHTML=D.contacts.socials.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('');
$('review-links').innerHTML=D.reviews.map(r=>`<a class="outline-button" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)} ↗</a>`).join('');
$('food-note').textContent=`Завтраки в будни — ${D.food.breakfast_hours}. В выходные — по согласованию. Блюда доставим в домик или BBQ-веранду.`;
window.addEventListener('hashchange',()=>{if(['#home','#pre','#reviews'].includes(location.hash)){tab=location.hash==='#pre'?'pre':'home';renderContext();renderGuide($('guide-search').value);if(location.hash==='#home'&&!phoneViewport.matches)$('main').scrollIntoView({block:'start'})}syncMobileScreen(true)});
updateURL();renderContext();renderServices();renderFood();renderGuide();
syncMobileScreen(true);
initExperience({data:D,sections,house:H,icon,close,wifi});
if(!phoneViewport.matches&&['#food','#services','#map','#guide','#reviews'].includes(location.hash))requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView({block:'start',behavior:'instant'}));
