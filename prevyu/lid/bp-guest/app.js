import D from './data.js?v=20261027-contact';
import {availableForHouse,requestTarget,supplySelection} from './guest-rules.js?v=20261026-menu';
import {createHousePhoto} from './house-photo.js';
import {createInteractiveMap} from './interactive-map.js?v=20261029-light';
import territoryMap from './map-data.js?v=20261029-light';
import { motion, initExperience } from './experience.js?v=20261026-menu';
let mapController=null,pendingHouseAction='';
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
let tab=location.hash==='#pre'?'pre':location.hash==='#after'?'after':'home',serviceCategory='Популярное',serviceExpanded=false,foodCategory='Все',foodSearch='';
let cart=read('bp-guest-cart',{});for(const id of Object.keys(cart)){if(!D.food.products.some(p=>p.id===id)||!Number.isInteger(cart[id])||cart[id]<1||cart[id]>20)delete cart[id]}
const H=()=>D.houses.find(h=>h.id===house),products=()=>D.food.products||[];
const updateHousePhoto=createHousePhoto({selector:'.hero-photo:not(.house-photo-next)',fallbackSrc:'assets/cover.webp',fallbackAlt:'Дом на территории Барских полей'});
const popup=$('sheet');let returnFocus=null,chatHistory=[],sheetToken=0;
function show(title,body,eyebrow='Ваш отдых'){
 const wasOpen=popup.open;++sheetToken;motion.stop(popup);if(!wasOpen)returnFocus=document.activeElement;$('sheet-title').textContent=title;$('sheet-eyebrow').textContent=eyebrow;popup.classList.remove('map-sheet','house-photo-sheet');$('sheet-body').innerHTML=body;
 if(!wasOpen)popup.showModal();document.body.classList.add('modal-open');popup.scrollTop=0;motion.sheetOpen(popup,wasOpen);
}
function close(){pendingHouseAction='';if(!popup.open)return Promise.resolve();const token=++sheetToken;return motion.sheetClose(popup).then(()=>{if(token!==sheetToken)return;popup.close();if(returnFocus?.isConnected)returnFocus.focus()})}
popup.addEventListener('cancel',e=>{e.preventDefault();close()});
popup.addEventListener('close',()=>{if(!popup.open)document.body.classList.remove('modal-open')});
$('close-sheet').onclick=close;popup.addEventListener('click',e=>{if(e.target===popup){const b=popup.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close()}});
document.addEventListener('guest:photo-error',()=>toast('Фото дома не загрузилось. Попробуйте выбрать дом ещё раз.'));
let toastTimer;function toast(t){$('toast').textContent=t;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3800)}
async function copy(text,notice='Скопировано. Можно вставить в сообщение.'){try{await navigator.clipboard.writeText(text);toast(notice);return true}catch{toast('Не удалось скопировать. Выделите нужный текст и скопируйте вручную.');return false}}
function channelLinks(cls='outline-button',draft=false){return D.contacts.socials.filter(s=>['telegram','max','whatsapp'].includes(s.id)).map(s=>`<a class="${cls}" href="${esc(s.url)}" target="_blank" rel="noopener" ${draft?'data-draft-channel':''}>${esc(s.title)} ↗</a>`).join('')}
function contact(kind='all'){
 const a=D.contacts.administrator;
 const administrator=`<section class="contact-group"><p class="eyebrow">Администратор базы</p><h3>${esc(a.names)}</h3><p class="note">На территории: ${esc(a.hours)}. Уголь, решётки, розжиг и другие принадлежности.</p><a class="outline-button" href="${esc(a.phone_url)}">${icon('phone')}${esc(a.phone)}</a></section>`;
 const booking=`<section class="contact-group"><p class="eyebrow">Отдел бронирования</p><h3>Чаны, программы и ваш следующий отдых</h3><p class="note">${esc(D.contacts.phone_hours)}.</p><div class="contact-list">${channelLinks()}<a class="outline-button" href="${esc(D.contacts.phone_url)}">${icon('phone')}${esc(D.contacts.phone)}</a></div></section>`;
 show(kind==='booking'?'Отдел бронирования':'Остаёмся на связи',(kind==='booking'?booking:administrator+booking)+`<p class="note" style="margin-top:20px">Наши страницы</p><div class="contact-list">${D.contacts.socials.filter(item=>!['telegram','max','whatsapp'].includes(item.id)).map(item=>`<a class="outline-button" href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.title)} ↗</a>`).join('')}</div><div class="form-actions"><button class="outline-button" data-chat>Спросить помощника →</button></div>`,'Барские поля');
}
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
function selectHouse(id){
 house=D.houses.some(h=>h.id===id)?id:'';save('bp-guest-house',house);updateURL();renderContext();renderServices();renderGuide($('guide-search').value);
 const next=pendingHouseAction;close().then(()=>{if(next==='wifi'&&!popup.open)wifi()});
}
function houses(next=''){pendingHouseAction=next;show('Какой у вас дом?',`<p class="note" style="margin-bottom:16px">Выберите дом — покажем время заезда, выезда, Wi-Fi и услуги именно для него.</p><div class="house-choices"><button class="house-choice" data-house-choice="" aria-pressed="${!house}"><b>Вся территория</b><small>Общая информация о базе</small></button>${D.houses.map(h=>`<button class="house-choice" data-house-choice="${h.id}" aria-pressed="${house===h.id}"><b>${esc(h.name)}</b><small>До ${h.capacity} гостей · ${esc(h.bath)}</small></button>`).join('')}</div>`,'Ваш дом');}
function showHousePhoto(id=house){const h=D.houses.find(item=>item.id===id);if(!h)return houses();show(h.name,`<img class="house-full-photo" src="${esc(h.image)}" alt="${esc(h.name)} — фото дома"><p class="note">До ${h.capacity} гостей · ${esc(h.bath)}</p><a class="outline-button" href="${esc(h.url)}" target="_blank" rel="noopener">Страница дома ↗</a>`,'Фото вашего дома');popup.classList.add('house-photo-sheet');}
function renderAfterStay(){
 $('after-stay').innerHTML=`<div class="after-intro"><p class="eyebrow">До новых встреч</p><h2>Спасибо, что выбрали нас</h2><p>Надеемся, вы увезли с собой тепло, тишину и хорошие воспоминания. Будем рады видеть вас снова в «Барских полях».</p></div><article class="return-coupon"><img loading="lazy" decoding="async" src="assets/guest-coupon.png" alt="Купон на 3 000 рублей на дополнительные услуги при следующем приезде" width="1080" height="1350"><div><h3>Для вашего следующего отдыха</h3><p>${esc(D.afterstay.scope)}. ${esc(D.afterstay.terms)}</p><div class="coupon-code"><small>Ваш купон</small><strong>${esc(D.afterstay.code)}</strong><button class="text-button" data-copy-coupon>Скопировать код</button></div><div class="form-actions"><a class="primary-button" href="assets/guest-coupon.png" download="Барские-поля-купон-3000.png">Сохранить купон ↓</a><button class="outline-button" data-booking-contact>Обсудить следующий приезд</button></div></div></article><article class="winter-card"><span class="service-icon">${icon('gift')}</span><div><p class="eyebrow">Впереди — зима</p><h3>Новый год по-барски</h3><p>Готовим зимнюю горку и каток. Об открытии расскажем отдельно, а новогодний отдых уже можно спланировать.</p><a class="text-button" href="https://barskie-polya.ru/new-year" target="_blank" rel="noopener">Посмотреть Новый год ↗</a></div></article><div class="after-reviews"><h3>Как прошёл ваш отдых?</h3><p>Будем благодарны за несколько слов о вашем приезде.</p>${D.reviews.map(r=>`<a class="outline-button" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)} ↗</a>`).join('')}</div>`;
}

function renderContext(){
 mapController?.setSelected(house);updateHousePhoto(H());
 const h=H(),ci=h?.checkin||D.stay.default_checkin,co=h?.checkout||D.stay.default_checkout,a=D.contacts.administrator;
 $('house-button').innerHTML=icon('home')+`<span class="house-title"><small>${h?'Ваш дом':'Для точной информации'}</small>${h?esc(h.name):'Выберите свой дом'}</span><span aria-hidden="true">⌄</span>`;
 $('mobile-house-name').textContent=h?h.name:'Выберите свой дом';$('hero-photo-open').hidden=!h;
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===tab));
 document.querySelector('.stay-tabs').style.setProperty('--tab-index',['home','pre','after'].indexOf(tab));document.body.dataset.stayPhase=tab;
 $('welcome-title').innerHTML=tab==='after'?'До новых<br>встреч.':'Ваш отдых,<br>по-барски.';
 $('welcome-copy').textContent=tab==='after'?'Спасибо за ваш выбор. Сохранили для вас подарок на следующий приезд.':tab==='pre'?'Дорога, заселение и программы к вашему приезду.':'Питание, баня, чан и ответы на вопросы — под рукой.';
 $('after-stay').hidden=tab!=='after';
 $('quick').innerHTML=`${tab==='home'?`<article class="quick-card wifi"><div class="quick-label">${icon('wifi')}Wi-Fi</div><strong>${h?esc(h.name):'Ваш дом на территории'}</strong><p>${esc(D.stay.wifi_note)}</p><button class="text-button" data-wifi>Логин и пароль →</button></article>`:''}<article class="quick-card"><div class="quick-label">${icon('clock')}Заезд</div><strong>${h?'после '+ci:'15:00 / 16:00'}</strong><p>${h?esc(h.name):'RIVER / остальные дома'}</p></article><article class="quick-card"><div class="quick-label">${icon('clock')}Выезд</div><strong>${h?'до '+co:'12:00 / 13:00'}</strong><p>${h?esc(h.name):'RIVER / остальные дома'}</p></article><article class="quick-card contact"><div class="quick-label">${icon('chat')}Отдел бронирования</div><strong>На связи 9:00–24:00</strong><p>Чаны, программы и бронирование отдыха</p><button class="text-button" data-booking-contact>Написать или позвонить →</button></article>`;
 $('administrator-contact').innerHTML=`<div>${icon('phone')}<span><b>Администратор базы · ${esc(a.hours)}</b><small>${esc(a.names)}</small></span></div><a href="${esc(a.phone_url)}">${esc(a.phone)}</a>`;
 $('services-title').textContent=tab==='pre'?'Подготовьте отдых к приезду':'Можно заказать';$('guide-title').textContent=tab==='pre'?'Перед поездкой':'О доме и территории';$('reviews').hidden=tab==='pre';$('quick').classList.toggle('before-arrival',tab==='pre');
 document.dispatchEvent(new CustomEvent('bp:context'));
}
const popular=['breakfast','tub','chalet-sauna','sauna','bike'];
const serviceIcon=s=>s.category==='Еда'?'food':s.category==='Баня и чан'||s.category==='Бани и сауны'?'bath':s.category==='Досуг'||s.kind==='goods'?'leaf':'gift';
const priceLabel=s=>s.price===0?'Бесплатно':s.price==null?'По согласованию':(s.price_prefix==='от'?'от ':'')+money(s.price);
function renderServices(){
 requestAnimationFrame(()=>motion.reveal($('service-grid').children));$('service-grid').scrollLeft=0;
 const cats=['Популярное',...new Set(D.services.map(s=>s.category)),'Все'];$('service-categories').innerHTML=cats.map(c=>`<button data-service-category="${esc(c)}" aria-pressed="${serviceCategory===c}">${esc(c)}</button>`).join('');
 let list=D.services.filter(s=>availableForHouse(s,house)&&(serviceCategory==='Все'||serviceCategory==='Популярное'?serviceCategory==='Все'||popular.includes(s.id)&&!s.advance:s.category===serviceCategory));
 const count=list.length;if(!serviceExpanded)list=list.slice(0,6);
 $('service-grid').innerHTML=list.map(s=>{const unit=s.price===0?'Для гостей базы':String(s.unit||'').replace(/^₽\s*\/?\s*/,''),action=s.advance?`<p class="advance-note">${esc(s.advance_note)}</p><a class="text-button" href="${esc(s.source)}" target="_blank" rel="noopener">Подробнее на сайте ↗</a>`:`<button class="primary-button" data-service="${s.id}">${s.kind==='goods'?'Выбрать':s.id==='breakfast'?'Выбрать питание':s.price===0?'Узнать подробнее':'Заказать'}</button>`;return `<article class="service-card" data-service-card="${s.id}"><span class="service-icon">${icon(serviceIcon(s))}</span><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p><strong class="service-price">${priceLabel(s)}</strong><small class="service-unit">${esc(unit||'Время согласуем с отделом бронирования')}</small>${action}</article>`}).join('')||`<div class="service-empty"><h3>${house?'В вашем доме нет отдельной бани':'Сначала выберите свой дом'}</h3><p>${house?'Для отдыха у дома можно заказать банный чан.':'Покажем баню и сауну, доступные именно в вашем доме.'}</p><button class="outline-button" ${house?'data-service-category="Баня и чан"':'data-houses'}>${house?'Посмотреть чаны':'Выбрать дом'}</button></div>`;
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
function sections(){const h=H();return D.sections.map(s=>s.id==='check'&&h?{...s,items:[`${h.name}: заезд после ${h.checkin}, выезд до ${h.checkout}.`,...s.items.filter(t=>!/^(Ривер|RIVER):|^Остальные/.test(t))]}:s.id==='wifi'&&h?{...s,items:[`Логин / сеть: ${h.name}.`,`Пароль: ${D.stay.wifi_password}.`,'Если не получилось подключиться, свяжитесь с администратором базы.']}:s.id==='pets'&&h&&!h.pets?{...s,items:['В Шале проживание с питомцами не предусмотрено. Для согласования размещения свяжитесь с базой.']}:s)}

function renderGuide(query=''){
 const terms=queryWords(query),match=t=>terms.some(w=>normalize(t).includes(w)),highlight=t=>{let a=esc(t);for(const w of terms)a=a.replace(new RegExp('('+w+'[а-яёa-z0-9-]*)','gi'),'<mark>$1</mark>');return a};
 const visible=sections().filter(s=>terms.length?s.items.some(match)||match(s.title):s.tab===(tab==='pre'?'pre':'in')||s.id==='check'||s.id==='rules'||s.id==='pets');
 $('guide-sections').innerHTML=visible.map(s=>`<details ${terms.length?'open':''}><summary><span>${highlight(s.title)}${terms.length?`<span class="tag">${s.tab==='pre'?'Перед приездом':'В доме'}</span>`:''}</span></summary><ul>${s.items.map(t=>`<li>${highlight(t)}</li>`).join('')}</ul>${s.id==='area'?'<a class="text-button details-link" href="#map">Посмотреть карту территории →</a>':s.id==='food'?'<a class="text-button details-link" href="#food">Выбрать блюда →</a>':s.id==='wifi'?'<button class="text-button details-link" data-wifi>Подключиться к Wi-Fi →</button>':''}</details>`).join('')||'<p class="empty">Пока не нашли ответ. Нажмите «Спросить о доме» или свяжитесь с администратором.</p>';
 $('clear-search').hidden=!query;
}
function houseSelect(){return `<label for="order-house">Ваш дом</label><select id="order-house" name="house"><option value="">${tab==='pre'?'Дом пока не выбран':'Выберите дом'}</option>${D.houses.map(h=>`<option value="${h.id}" ${house===h.id?'selected':''}>${esc(h.name)}</option>`).join('')}</select>`}
function orderService(id){
 const s=D.services.find(x=>x.id===id);if(!s)return;
 if(s.kind==='goods')return orderSupplies(id);
 if(s.advance)return contact('booking');
 if(!availableForHouse(s,house)){toast('Эта баня доступна гостям соответствующего дома. Выберите свой дом.');return houses();}
 const filling=id==='tub',meal=id==='breakfast';
 show(s.title,`<p class="note">${esc(s.description)}</p><form id="order-form">${houseSelect()}${filling?`<label for="order-filling">Вариант чана</label><select id="order-filling">${D.tub_fillings.map(f=>`<option value="${f.id}">${esc(f.title)} — ${money(f.price)}</option>`).join('')}</select>`:''}${meal?`<label for="order-meal">Что доставить</label><select id="order-meal"><option value="Завтрак">Завтрак — ${money(D.food.breakfast_price)} / человек</option><option value="Обед">Обед — по меню</option><option value="Ужин">Ужин — по меню</option></select><label for="order-qty">Количество гостей</label><input id="order-qty" type="number" min="1" max="20" value="1" required><a class="text-button" href="#food">Выбрать блюда по меню →</a>`:''}<label for="order-time">Когда вам удобно</label><input id="order-time" maxlength="100" placeholder="Укажите желаемое время"><label for="order-comment">Пожелания — необязательно</label><textarea id="order-comment" maxlength="500" placeholder="Что важно учесть"></textarea><p id="order-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="primary-button" type="submit">Подготовить заявку →</button><p class="note">Получатель — отдел бронирования. Заявка не отправляется автоматически. Время и стоимость согласуем после вашего сообщения.</p></div></form>`,'Запрос в отдел бронирования');
 $('order-form').onsubmit=e=>{e.preventDefault();const hid=$('order-house').value;if(!hid)return orderError('Выберите дом, чтобы мы знали, где вы отдыхаете.');if(!availableForHouse(s,hid))return orderError('Эта услуга доступна гостям соответствующего дома.');const h=D.houses.find(x=>x.id===hid),fill=filling?D.tub_fillings.find(f=>f.id===$('order-filling').value):null,qty=Number($('order-qty')?.value||1),mealName=$('order-meal')?.value;prepare([`Здравствуйте! Хочу заказать ${s.title.toLowerCase()} в «Барских полях».`,`Дом: ${h.name}.`,fill?`Вариант: ${fill.title} (${money(fill.price)}).`:'',meal?`Питание: ${mealName}. Гостей: ${qty}.`:'',mealName==='Завтрак'?`По тарифу завтрака: ${money(D.food.breakfast_price*qty)}.`:'',$('order-time').value.trim()?`Желаемое время: ${$('order-time').value.trim()}.`:'',$('order-comment').value.trim()?`Пожелания: ${$('order-comment').value.trim()}`:'','Подтвердите, пожалуйста, наличие, время и итоговую стоимость.'].filter(Boolean).join('\n'),requestTarget([s]));};
}
let supplyQuantities={};
function orderSupplies(id){
 const goods=D.services.filter(s=>s.kind==='goods');if(id&&!supplyQuantities[id])supplyQuantities[id]=1;
 show('Принадлежности к отдыху',`<p class="note">Соберите один список. Администратор базы на связи ${esc(D.contacts.administrator.hours)}; наличие и выдачу нужно согласовать.</p><form id="supplies-form"><div class="supply-list">${goods.map(item=>`<label class="supply-row"><span><b>${esc(item.title)}</b><small>${money(item.price)}</small></span><input type="number" min="0" max="20" step="1" value="${supplyQuantities[item.id]||0}" data-supply-qty="${item.id}" aria-label="Количество: ${esc(item.title)}"></label>`).join('')}</div><p class="supply-total">По списку: <strong id="supply-total"></strong></p>${houseSelect()}<label for="order-comment">Когда нужны принадлежности</label><textarea id="order-comment" maxlength="500" placeholder="Укажите удобное время и пожелания"></textarea><p id="order-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="primary-button" type="submit">Подготовить заявку администратору →</button><p class="note">Это запрос на наличие и выдачу. Ничего не отправляется и не оплачивается автоматически.</p></div></form>`,'Администратор · 10:00–20:00');
 function readQuantities(){return Object.fromEntries([...document.querySelectorAll('[data-supply-qty]')].map(input=>[input.dataset.supplyQty,Number(input.value)]));}
 function update(){try{supplyQuantities=readQuantities();$('supply-total').textContent=money(supplySelection(goods,supplyQuantities).total);}catch{$('supply-total').textContent='Проверьте количество';}}
 $('supplies-form').addEventListener('input',update);update();
 $('supplies-form').onsubmit=e=>{e.preventDefault();const h=D.houses.find(item=>item.id===$('order-house').value);if(!h)return orderError('Выберите дом для выдачи принадлежностей.');let selection;try{selection=supplySelection(goods,readQuantities());}catch(error){return orderError(error.message);}if(!selection.items.length)return orderError('Выберите хотя бы одну принадлежность.');prepare([`Здравствуйте! Нужны принадлежности для дома «${h.name}» в «Барских полях»:`,...selection.items.map(item=>`• ${item.title} — ${item.quantity} шт. (${money(item.quantity*item.price)})`),`По списку: ${money(selection.total)}.`,$('order-comment').value.trim()?`Пожелания: ${$('order-comment').value.trim()}`:'','Подтвердите, пожалуйста, наличие и время выдачи.'].filter(Boolean).join('\n'),requestTarget(selection.items));};
}

function orderError(t){$('order-error').hidden=false;$('order-error').textContent=t;$('order-error').scrollIntoView({block:'nearest'})}
function orderCart(){
 const items=products().filter(p=>cart[p.id]),sum=items.reduce((a,p)=>a+cart[p.id]*(p.price||0),0);if(!items.length)return;
 show('Заказ к вашему столу',`<div class="order-summary">${items.map(p=>`<div><span>${esc(p.title)} <small>× ${cart[p.id]}</small></span><strong>${money((p.price||0)*cart[p.id])}</strong></div>`).join('')}<div><strong>По меню</strong><strong>${money(sum)}</strong></div></div><form id="order-form">${houseSelect()}<label for="order-time">Когда доставить</label><input id="order-time" placeholder="Укажите удобное время" maxlength="100"><label for="order-comment">Пожелания к заказу</label><textarea id="order-comment" maxlength="500" placeholder="Например, предпочтения по блюдам"></textarea><p id="order-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="primary-button" type="submit">Подготовить заказ →</button><button class="outline-button" type="button" id="clear-cart">Очистить список блюд</button><p class="note">Администратор уточнит наличие блюд, время доставки и итоговую сумму.</p></div></form>`,'Меню кухни');
 $('clear-cart').onclick=()=>{cart={};save('bp-guest-cart',cart);renderFood();close()};
 $('order-form').onsubmit=e=>{e.preventDefault();const h=D.houses.find(x=>x.id===$('order-house').value);if(!h)return orderError('Укажите дом для доставки.');prepare([`Здравствуйте! Заказ из кухни «Барских полей» в ${h.name}:`,...items.map(p=>`• ${p.title} — ${cart[p.id]} шт. (${money((p.price||0)*cart[p.id])})`),`По меню: ${money(sum)}.`,$('order-time').value.trim()?`Когда: ${$('order-time').value.trim()}.`:'',$('order-comment').value.trim()?`Пожелания: ${$('order-comment').value.trim()}`:'','Подтвердите, пожалуйста, наличие блюд, время доставки и итоговую сумму.'].filter(Boolean).join('\n'))};
}
function prepare(text,target='booking'){
 const a=D.contacts.administrator;
 show('Текст заявки готов',`<div class="request-recipient"><small>Кому передать заявку</small><div class="recipient-options" role="group" aria-label="Получатель заявки"><button type="button" data-request-target="booking" aria-pressed="false">Бронирование</button><button type="button" data-request-target="administrator" aria-pressed="false">Администратор</button></div><div id="request-recipient-info" aria-live="polite"></div></div><p id="request-contact-note" class="note"></p><label for="request-text">Текст можно дополнить</label><textarea id="request-text" class="request-text">${esc(text)}</textarea><div class="form-actions"><button class="primary-button" id="copy-request">Скопировать заявку</button></div><div id="request-contact-actions" class="request-contact-actions"></div><p id="request-channel-note" class="note" style="margin-top:14px"></p>`,'Связь с базой');
 function recipient(value){
  const admin=value==='administrator',label=admin?'Администратор базы':'Отдел бронирования';
  document.querySelectorAll('[data-request-target]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.requestTarget===value)));
  $('request-recipient-info').innerHTML=`<strong>${label}</strong><p>${admin?`${esc(a.names)} · ${esc(a.hours)}`:esc(D.contacts.phone_hours)}</p>`;
  $('request-contact-note').textContent=admin?`Позвоните администратору — он поможет с вопросами на территории и принадлежностями. На связи ${a.hours}.`:'Позвоните или скопируйте текст и отправьте его в мессенджер отдела бронирования. Заявка не отправляется автоматически.';
  $('request-contact-actions').innerHTML=`<a class="outline-button request-phone" href="${esc(admin?a.phone_url:D.contacts.phone_url)}">${icon('phone')}Позвонить ${esc(admin?a.phone:D.contacts.phone)}</a>${admin?'':`<div class="messenger-actions">${channelLinks('outline-button',true)}</div>`}`;
  $('request-channel-note').textContent=admin?'Готовый текст можно озвучить администратору. Он подтвердит наличие и время выдачи.':'После копирования откройте чат, вставьте сообщение и отправьте. Получатель подтвердит запрос.';
 }
 document.querySelectorAll('[data-request-target]').forEach(b=>b.onclick=()=>recipient(b.dataset.requestTarget));
 recipient(target==='administrator'?'administrator':'booking');
 $('copy-request').onclick=()=>copy($('request-text').value);
}
function wifi(){
 const h=H();if(!h)return houses('wifi');
 show('Wi-Fi в вашем доме',`<p class="note">Логин — название выбранного дома. Если подключение не получилось, поможет администратор базы.</p><div class="wifi-credentials"><div><small>Логин / название дома</small><strong>${esc(h.name)}</strong><button class="text-button" data-copy-wifi="login">Скопировать логин</button></div><div><small>Пароль</small><strong id="wifi-password" aria-live="polite">${'•'.repeat(D.stay.wifi_password.length)}</strong><button class="text-button" data-wifi-reveal>Показать пароль</button><button class="text-button" data-copy-wifi="password">Скопировать пароль</button></div></div><button class="outline-button" data-contact>Нужна помощь с подключением</button>`,'Интернет и Wi-Fi');
}

function localAnswer(text){
 const t=normalize(text),h=H();if(/wi.?fi|вай|парол|интернет/.test(t))return h?`Логин / сеть: ${h.name}. Пароль: ${D.stay.wifi_password}. Если подключиться не получилось, свяжитесь с администратором ${D.contacts.administrator.phone} (${D.contacts.administrator.hours}).`:'Выберите свой дом вверху страницы, затем нажмите «Логин и пароль».';
 if(/уголь|решетк|розжиг|веник|мангал/.test(t))return `Принадлежности можно заказать администратору базы: ${D.contacts.administrator.phone}, ${D.contacts.administrator.hours}. Откройте «Услуги» → «Принадлежности» и соберите список.`;
 if(/заезд|засел|выезд|выселен/.test(t))return h?`${h.name}: заезд после ${h.checkin}, выезд до ${h.checkout}. ${D.contacts.after_19}`:`Ривер: заезд с 15:00, выезд до 12:00. Остальные дома: 16:00 / 13:00. ${D.contacts.after_19}`;
 if(/кошк|собак|питом|животн/.test(t)&&h&&!h.pets)return 'В Шале проживание с питомцами не предусмотрено. Для согласования размещения свяжитесь с базой.';
 const terms=queryWords(t),rank=sections().map(s=>({s,score:terms.reduce((n,w)=>n+(normalize(s.title).includes(w)?3:0)+(s.items.some(i=>normalize(i).includes(w))?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 if(rank[0])return rank[0].s.items.slice(0,4).join('\n\n');return 'Этот вопрос лучше уточнить у администратора. Нажмите «Связь»: там Telegram, MAX, WhatsApp и телефон базы.';
}
function chat(){show('Спросите о вашем отдыхе',`<div class="chat-messages" id="chat-messages" role="log" aria-live="polite"></div><div class="chat-suggestions">${['Когда выезд?','Как заказать чан?','Какой пароль Wi-Fi?','Что есть на территории?'].map(q=>`<button data-question="${q}">${q}</button>`).join('')}</div><form class="chat-form" id="chat-form"><label class="sr-only" for="chat-input">Ваш вопрос</label><input id="chat-input" maxlength="300" placeholder="Напишите вопрос" autocomplete="off" required><button class="primary-button" aria-label="Задать вопрос">↑</button></form><p class="note" style="margin-top:14px">Ответы по путеводителю. Для заказа или уточнения услуги свяжитесь с администратором.</p>`,'Помощник гостя');if(!chatHistory.length)chatHistory.push({who:'assistant',text:'Я помогу найти информацию о доме, меню, бане и территории. Что хотите узнать?'});drawMessages();$('chat-form').onsubmit=e=>{e.preventDefault();ask($('chat-input').value.trim());$('chat-input').value=''}}
function drawMessages(){const box=$('chat-messages');if(!box)return;box.innerHTML='';for(const m of chatHistory){const e=document.createElement('p');e.className='chat-message '+m.who;e.textContent=m.text;box.append(e)}box.scrollTop=box.scrollHeight}
function ask(q){if(!q)return;chatHistory.push({who:'user',text:q},{who:'assistant',text:localAnswer(q)});drawMessages()}
function switchTab(value){tab=['pre','after'].includes(value)?value:'home';updateURL(true);renderContext();renderGuide($('guide-search').value);if(!phoneViewport.matches)$('quick').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'})}
document.addEventListener('click',e=>{
 const el=e.target.closest('button,a');if(!el)return;const d=el.dataset;
 if('bookingContact'in d)contact('booking');else if('copyCoupon'in d)copy(D.afterstay.code,'Код купона скопирован.');else if('copyWifi'in d)copy(d.copyWifi==='login'?H()?.name||'':D.stay.wifi_password,'Скопировано. Вставьте в настройках Wi-Fi.');else if('wifiReveal'in d){const open=el.getAttribute('aria-expanded')!=='true';el.setAttribute('aria-expanded',String(open));$('wifi-password').textContent=open?D.stay.wifi_password:'•'.repeat(D.stay.wifi_password.length);el.textContent=open?'Скрыть пароль':'Показать пароль';}else if('housePhoto'in d)showHousePhoto();else if('contact'in d)contact();else if('chat'in d)chat();else if('houses'in d)houses();else if('wifi'in d)wifi();else if('houseChoice'in d)selectHouse(d.houseChoice);else if('tab'in d)switchTab(d.tab);
 else if('serviceCategory'in d){serviceCategory=d.serviceCategory;serviceExpanded=false;renderServices()}else if('service'in d)orderService(d.service);
 else if('productInfo'in d)productInfo(d.productInfo);else if('productAdd'in d){foodQty(d.productAdd,1);close();toast('Блюдо добавлено в список заказа.')}else if('foodCategory'in d){foodCategory=d.foodCategory;renderFood()}else if('foodAdd'in d)foodQty(d.foodAdd,1);else if('foodRemove'in d)foodQty(d.foodRemove,-1);
 else if('question'in d)ask(d.question);
 else if('draftChannel'in d){navigator.clipboard.writeText($('request-text').value).catch(()=>{});}
});
$('more-services').onclick=()=>{serviceExpanded=true;renderServices()};$('open-cart').onclick=orderCart;
$('guide-search').oninput=e=>renderGuide(e.target.value);$('clear-search').onclick=()=>{$('guide-search').value='';renderGuide();$('guide-search').focus()};
$('food-search').oninput=e=>{foodSearch=e.target.value;renderFood()};
mapController=createInteractiveMap({host:$('territory-map'),data:territoryMap,houses:D.houses,selected:house,onSelect:selectHouse,onChooseHouse:houses,onPhoto:showHousePhoto,onAction:a=>{if(a.type==='contact')contact();else{if(a.category){serviceCategory=a.category;renderServices();}location.hash=a.href;}}});
$('open-map').onclick=()=>mapController.openFullscreen();
$('yandex-route').href=D.map.route_yandex;$('gis-route').href=D.map.route_2gis;$('address').textContent=D.address;$('footer-phone').textContent=D.contacts.phone;$('footer-phone').href=D.contacts.phone_url;$('footer-hours').textContent=D.contacts.phone_hours;
$('social-links').innerHTML=D.contacts.socials.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('');
$('review-links').innerHTML=D.reviews.map(r=>`<a class="outline-button" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)} ↗</a>`).join('');
$('food-note').textContent=D.food.delivery_note;
$('footer-administrator').innerHTML=`<strong>Администратор базы</strong><p>${esc(D.contacts.administrator.names)} · ${esc(D.contacts.administrator.hours)}</p><a href="${esc(D.contacts.administrator.phone_url)}">${esc(D.contacts.administrator.phone)}</a>`;
renderAfterStay();
window.addEventListener('hashchange',()=>{if(popup.open)close();if(['#home','#pre','#after','#reviews'].includes(location.hash)){tab=location.hash==='#pre'?'pre':location.hash==='#after'?'after':'home';renderContext();renderGuide($('guide-search').value);if(location.hash==='#home'&&!phoneViewport.matches)$('main').scrollIntoView({block:'start'})}else if(tab==='after'){tab='home';renderContext();renderGuide($('guide-search').value);}syncMobileScreen(true)});
updateURL();renderContext();renderServices();renderFood();renderGuide();
syncMobileScreen(true);
initExperience({data:D,sections,house:H,icon,close,wifi});
if(!phoneViewport.matches&&['#food','#services','#map','#guide','#reviews'].includes(location.hash))requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView({block:'start',behavior:'instant'}));
