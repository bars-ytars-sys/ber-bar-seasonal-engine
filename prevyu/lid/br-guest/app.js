import D from './data.js?v=20261026-admin';
import {availableForHouse,supplySelection,eligibleSelection,assertRequestAllowed} from './guest-rules.js?v=20261026-admin';
import {createHousePhoto} from './house-photo.js';
import {createInteractiveMap} from './interactive-map.js?v=20261026-admin';
import territoryMap from './map-data.js?v=20261026-admin';
let mapController=null,pendingHouseAction='';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {
  home:'M3 10l9-7 9 7v10H3z M9 20v-7h6v7',
  chat:'M21 11a9 9 0 0 1-13 8l-5 2 2-5A9 9 0 1 1 21 11z M8 10h8m-8 4h5',
  spark:'m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3Z M20 2v4m-2-2h4',
  book:'M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H3V4Zm18 0h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h5V4Z',
  map:'m9 4-6-2v17l6 3 6-3 6 3V5l-6-3-6 2Zm0 0v18m6-20v17',
  wifi:'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20h.01',
  clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2',
  leaf:'M4 20C2 9 6 4 20 4c0 12-6 17-14 14M4 20 15 9',
  bath:'M3 11h18v4a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6ZM7 3c-2 3 2 3 0 6m5-6c-2 3 2 3 0 6m5-6c-2 3 2 3 0 6',
  food:'M5 3v7m-3-7v4a3 3 0 0 0 6 0V3M5 10v11M16 3v18m0-18c5 2 5 8 0 9',
  heart:'M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 1 8 8 14 7-6 12-10 8-14Z',
  phone:'M5 3h4l1 5-2 2c2 3 3 4 6 6l2-2 5 1v4c-1 4-6 2-11-3S1 4 5 3Z',
  search:'m20 20-5-5M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z',
  close:'m6 6 12 12M6 18 18 6',right:'m9 5 7 7-7 7',left:'m15 5-7 7 7 7',
  arrow:'M5 19 19 5M5 5h14v14',down:'m6 9 6 6 6-6',check:'m5 12 4 4L19 6'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name] || icons.leaf}"/></svg>`;
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
const read = (key, fallback) => {try {return JSON.parse(localStorage.getItem('br-guest-v1-'+key)) ?? fallback;} catch {return fallback;}};
const save = (key, value) => {try {localStorage.setItem('br-guest-v1-'+key, JSON.stringify(value));} catch {}};
const urlHouse = new URL(location.href).searchParams.get('house');
let house = urlHouse !== null ? urlHouse : read('house','');
if (!D.houses.some(h => h.id === house)) house = '';
let phase = ['pre','after'].includes(location.hash.slice(1)) ? location.hash.slice(1) : ['pre','after'].includes(read('phase','in')) ? read('phase','in') : 'in';
let selected = read('request',[]);
if (!Array.isArray(selected)) selected = [];
selected = validSelection(selected,house);
let pendingGuide = '';
let category = 'Все', screen = '', storyIndex = 0, focusReturn = null, closing = false, sheetEpoch = 0;
let seen = read('seen',[]); if (!Array.isArray(seen)) seen=[];
const H = () => D.houses.find(h => h.id === house);
const updateHousePhoto=createHousePhoto({selector:'.hero-photo:not(.house-photo-next)',fallbackSrc:'assets/cover.webp',fallbackAlt:'Дом на территории Берёзовой рощи'});
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const normalize = s => String(s).toLowerCase().replace(/ё/g,'е').replace(/wi[\s-]*fi|вай[\s-]*фай/g,'wifi');
const image = name => D.images[name] || 'assets/cover.webp';
const miniHouse = () => `<button class="mini-house" data-action="houses">${icon('home')}${H() ? esc(H().name) : 'Выберите свой дом'} ${icon('down')}</button>`;
const title = (heading, text) => `<div class="page-head">${miniHouse()}<h1>${heading}</h1><p>${text}</p></div>`;

function validSelection(ids,houseId) {return eligibleSelection(ids,D.services,houseId);}
function serviceForHouse(item,houseId=house) {
 if(item.id!=='bath')return item;
 const h=D.houses.find(h=>h.id===houseId);
 return {...item,title:h?.id==='holidayhouse'?'Сауна у вашего дома':'Баня у вашего дома',price_label:h?.id==='panorama'?'10 000 ₽ / 4 часа':item.price_label};
}
function administratorCard() {
 const a=D.contacts.administrator;
 return `<aside class="administrator-card"><div>${icon('phone')}<span><b>Администратор базы</b><small>${a.names?esc(a.names):'Вопросы по дому и принадлежностям'}${a.hours?' · '+esc(a.hours):''}</small></span></div>${a.phone?`<a href="${esc(a.phone_url)}">${esc(a.phone)}</a>`:`<button class="text-button" data-action="admin-contact">Уточнить контакт на ресепшене ↗</button>`}</aside>`;
}
function afterStay() {
 return `<section class="after-stay"><div class="after-intro"><p class="eyebrow">До новых встреч</p><h2>Спасибо, что выбрали нас</h2><p>Надеемся, вы увезли с собой тепло и хорошие воспоминания. Будем рады видеть вас снова в «Берёзовой роще».</p></div><article class="return-coupon"><img src="assets/guest-coupon.png" alt="Купон на 3 000 рублей на дополнительные услуги при следующем приезде" width="1080" height="1350"><div><h3>Для вашего следующего отдыха</h3><p>${esc(D.afterstay.scope)}. ${esc(D.afterstay.terms)}</p><div class="coupon-code"><small>Ваш купон</small><strong>${esc(D.afterstay.code)}</strong><button class="text-button" data-action="copy-coupon">Скопировать код</button></div><a class="primary full" href="assets/guest-coupon.png" download="Берёзовая-роща-купон-3000.png">Сохранить купон ↓</a><button class="secondary full" data-action="booking-contact">Обсудить следующий приезд ↗</button></div></article><article class="winter-card"><p class="eyebrow">Отдых зимой</p><h3>Новый год в роще</h3><p>Тёплый дом, банный чан и SPA-комплекс. Спланируйте следующую встречу с лесом.</p><a class="text-button" href="https://ecobr.ru/new-year" target="_blank" rel="noopener">Посмотреть Новый год ↗</a></article><div class="after-reviews"><h3>Как прошёл ваш отдых?</h3><p>Будем благодарны за несколько слов о вашем приезде.</p><a class="secondary full" href="${esc(D.map.reviews)}" target="_blank" rel="noopener">Оставить отзыв ↗</a></div></section>`;
}
function phaseTabs(){return `<div class="phase" role="tablist" aria-label="Этап отдыха" style="--phase:${['in','pre','after'].indexOf(phase)}"><i aria-hidden="true"></i>${[['in','В доме'],['pre','Перед приездом'],['after','После отъезда']].map(([id,name])=>`<button role="tab" data-phase="${id}" aria-selected="${phase===id}">${name}</button>`).join('')}</div>`;}

function home() {
  const quick=phase==='in'?[['wifi','Wi-Fi','Сеть и пароль','wifi'],['clock','Заезд','По вашей брони','arrival'],['home','Выезд','По вашей брони','departure']]:[['map','Дорога','Маршрут к базе','route'],['clock','Заезд','Как заселиться','arrival'],['chat','Связь','Мы рядом','contact']];
  return `<section class="hero hero-welcome"><img class="hero-photo" src="${esc(H()?.image||'assets/cover.webp')}" alt="${esc(H()?H().name+' — ваш дом в Берёзовой роще':'Дом на территории Берёзовой рощи')}" width="900" height="600" fetchpriority="high"><div class="hero-message"><p class="hero-eyebrow">Путеводитель гостя</p><h1>${phase==='after'?'До новых<br>встреч.':'Ваш отдых.<br>Без хлопот.'}</h1></div><button class="hero-photo-open" data-action="house-photo" aria-label="Посмотреть фото выбранного дома" ${H()?'':'hidden'}>Фото дома ↗</button><button class="house-picker" data-action="houses" aria-haspopup="dialog">${icon('home')}<span><small>${H() ? 'Ваш дом' : 'Начнём знакомство'}</small><b>${H() ? esc(H().name) : 'Выберите свой дом'}</b></span>${icon('down')}</button></section>
  ${phaseTabs()}${phase==='after'?afterStay():`
  <nav class="stay-quick" aria-label="Важное о вашем доме">${quick.map(([ic,name,sub,action])=>`<button data-action="${action}">${icon(ic)}<b>${name}</b><small>${sub}</small></button>`).join('')}</nav>
  ${administratorCard()}
  <nav class="home-actions" aria-label="Быстрые действия"><a href="#food">${icon('food')}<span><b>Ресторан</b><small>Завтраки и меню</small></span>${icon('right')}</a><a href="#services">${icon('bath')}<span><b>SPA и услуги</b><small>Время для себя</small></span>${icon('right')}</a><a href="#map">${icon('map')}<span><b>Карта</b><small>Ваш дом и места</small></span>${icon('right')}</a><button data-action="assistant">${icon('chat')}<span><b>Помощник</b><small>Ответы и связь</small></span>${icon('right')}</button></nav>
  <section class="home-stories"><div class="section-title"><h2>Коротко о важном</h2><a href="#guide">Вся памятка ↗</a></div><nav class="stories" aria-label="Коротко о важном">${D.stories.map((story,i)=>`<button class="story-button ${seen.includes(story.id)?'seen':''}" data-story="${i}"><span class="story-ring"><img src="${esc(image(story.image))}" alt="" width="52" height="52" loading="lazy"></span>${esc(story.short)}</button>`).join('')}</nav></section>
  <section class="section"><div class="section-title"><h2>Отдых в вашем ритме</h2><a href="#services">Все услуги ↗</a></div><div class="tile-grid">${[['SPA и релакс','spa','SPA и релакс'],['Баня и чан','tub','Баня и чан'],['Для двоих','couple','Особый повод'],['Ферма и прогулки','farm','Впечатления']].map(([name,img,cat])=>`<a class="tile tap" href="#services" data-route-category="${cat}"><img src="${esc(image(img))}" alt="${esc(name)} в Берёзовой роще" width="240" height="150" loading="lazy"><span>${name}${icon('arrow')}</span></a>`).join('')}</div></section>
  <section class="section"><button class="home-help full" data-action="contact">${icon('chat')}<span><h3>Нужна помощь?</h3><small>Все способы связаться с базой</small></span>${icon('right')}</button></section>
  <section class="section"><a class="home-help full tap" href="${esc(D.map.reviews)}" target="_blank" rel="noopener">${icon('heart')}<span><h3>Как вам у нас?</h3><small>Поделитесь впечатлениями об отдыхе</small></span>${icon('arrow')}</a></section>
  <p class="footnote">Лес, тишина и забота о вас.<br>Берёзовая роща by Reznichenko</p>`}`;
}


function serviceCards() {
 const items=D.services.filter(s=>availableForHouse(s,house)&&(category==='Все'||s.category===category)).map(s=>serviceForHouse(s));
 return items.map(s=>{const action=s.advance?`<p class="advance-note">${esc(s.advance_note)}</p><button class="text-button" data-action="booking-contact">Согласовать заранее ↗</button>`:`<button class="primary" ${s.kind==='goods'?`data-supplies="${esc(s.id)}"`:`data-add-service="${esc(s.id)}" aria-pressed="${selected.includes(s.id)}"`}>${s.kind==='goods'?'Выбрать':selected.includes(s.id)?'В заявке '+icon('check'):'Добавить '+icon('right')}</button>`;return `<article class="service-card service-compact ${selected.includes(s.id)?'is-selected':''}" data-service-card="${esc(s.id)}"><div class="service-summary"><img src="${esc(s.image||image('cover'))}" alt="${esc(s.title)}" width="92" height="100" loading="lazy"><div><span class="service-category">${esc(s.category)}</span><h2>${esc(s.title)}</h2><p class="service-teaser">${esc(s.description)}</p></div></div><div class="service-bottom"><div class="price">${esc(s.price_label)}<small>${esc(s.unit||'Время согласуем с отделом бронирования')}</small></div>${s.advance?'':action}</div>${s.advance?`<div class="advance-actions">${action}</div>`:''}<details class="service-info"><summary>Описание и условия</summary><p>${esc(s.description)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener">Подробности на сайте ↗</a></details></article>`;}).join('') || `<div class="service-empty"><h2>${house?'В вашем доме нет отдельной бани':'Выберите свой дом'}</h2><p>${house?'Для отдыха отдельно доступен SPA-комплекс. Аренду свободной бани на территории можно обсудить с отделом бронирования.':'Покажем собственную баню именно для выбранного дома.'}</p><button class="secondary full" ${house?'data-category="SPA и релакс"':'data-action="houses"'}>${house?'Посмотреть SPA':'Выбрать дом'}</button></div>`;
}
function services() {
 const categories=['Все',...new Set(D.services.map(s=>s.category))];
 return title('Услуги и впечатления','SPA, чаны и программы — через отдел бронирования. Принадлежности — через администратора базы.')+`<div class="chips" aria-label="Категории услуг">${categories.map(c=>`<button data-category="${esc(c)}" aria-pressed="${c===category}">${esc(c)}</button>`).join('')}</div><div id="service-list" class="service-list">${serviceCards()}</div><a class="source-link" href="https://ecobr.ru/aktivnosti-v-beryozovoj-roshhe" target="_blank" rel="noopener">Все впечатления на сайте базы ↗</a>`;
}

function guideList(query='') {
  const q=normalize(query).trim(), matches=D.guides.filter(g=>!q||normalize(g.title+' '+g.body).includes(q));
  return matches.map(g=>`<details data-guide-id="${esc(g.id)}" ${q?'open':''}><summary>${icon(g.icon)}<span>${esc(g.title)}</span></summary><div class="guide-answer">${g.body.split('\n').filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('')}${g.action?`<button class="text-button" data-action="${esc(g.action)}">${esc(g.action_label)} ↗</button>`:''}${g.url?`<a class="text-button" href="${esc(g.url)}" target="_blank" rel="noopener">Подробнее на сайте ↗</a>`:''}</div></details>`).join('') || `<p class="empty">Пока не нашли ответ.<br><button class="text-button" data-action="contact">Спросить у администратора ↗</button></p>`;
}
function guide() { return title('Памятка гостя','Заезд, Wi-Fi и отдых на территории — ответы под рукой.')+`<label class="search">${icon('search')}<input id="guide-search" type="search" aria-label="Поиск по памятке" placeholder="Wi-Fi, выезд, SPA…" autocomplete="off"></label><div class="guide-list" id="guide-list">${guideList()}</div>`; }
function map() {return title('Карта территории','Ваш дом и любимые места. Нажмите на схему, чтобы узнать больше.')+`<div id="territory-map"></div><div class="route-card"><h3>Как добраться</h3><p>${esc(D.contacts.address)}</p><div class="route-links"><a class="primary" href="${esc(D.map.yandex_url)}" target="_blank" rel="noopener">Маршрут в Яндекс Картах ${icon('arrow')}</a><a class="secondary" href="${esc(D.map.two_gis_url)}" target="_blank" rel="noopener">Открыть 2ГИС ${icon('arrow')}</a></div></div><div class="map-shortcuts"><button data-action="houses">${icon('home')}Найти свой дом</button><button data-action="contact">${icon('chat')}Нужна помощь?</button></div>`;}
function mountMap(){mapController=createInteractiveMap({host:$('territory-map'),data:territoryMap,houses:D.houses,selected:house,onSelect:setHouse,onChooseHouse:houses,onPhoto:showHousePhoto,onAction:a=>{if(a.type==='contact')contact();else{if(a.category)category=a.category;location.hash=a.href;}}});}

function food() {return `<div class="page-head"><a class="screen-back" href="#home">${icon('left')}На главную</a>${miniHouse()}<h1>Ресторан и завтраки</h1><p>Меню, завтрак и тёплый вечер — согласуем с базой.</p></div><div class="section"><article class="service-card"><div class="service-photo"><img src="${esc(image('restaurant'))}" width="600" height="380" alt="Ресторан Берёзовой рощи"><span class="category-tag">Ресторан на территории</span></div><div class="service-copy"><h2>К столу!</h2><p>Завтраки «шведский стол», комплексные обеды и ужины. Актуальное меню, часы работы и наличие мест подскажет администратор.</p><button class="primary full" data-action="restaurant">Уточнить меню и заказать ${icon('arrow')}</button></div></article></div><div class="section"><div class="about-card"><h3>Начните утро вкусно</h3><p>Завтрак — с 10:00, стоимость 1 500 ₽ на человека. Перед посещением уточните время и условия для вашей брони.</p><button class="primary full" data-action="breakfast">Хочу на завтрак ${icon('arrow')}</button></div></div><p class="footnote">Меню и обслуживание согласуются с базой.<br>Мы подготовим запрос, а вы выберете удобный способ связи.</p>`;}

function render() {
  mapController?.destroy();mapController=null;
  const route=location.hash.slice(1);screen=['services','guide','map','food'].includes(route)?route:'home';
  $('main').innerHTML=`<div class="screen ${selected.length?'has-bar':''}">${({home,services,guide,map,food}[screen])()}</div>`;
  const active=screen;
  document.querySelectorAll('[data-screen]').forEach(a=>a.toggleAttribute('aria-current',false));
  document.querySelector(`[data-screen="${active}"]`).setAttribute('aria-current','page');
  document.querySelector('.bottom-nav').style.setProperty('--nav',['home','food','services','guide','map'].indexOf(active));
  updateRequestBar();
  updateHousePhoto(H());
  if(screen==='map')mountMap();
  if(screen==='guide'&&pendingGuide){const id=pendingGuide;pendingGuide='';requestAnimationFrame(()=>{const el=document.querySelector(`[data-guide-id="${id}"]`);if(el){el.open=true;el.scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'});}});}
}
function openGuide(id){pendingGuide=id;if(location.hash==='#guide')render();else location.hash='#guide';}
function updateRequestBar() {
  const visible=!!selected.length&&!(screen==='home'&&phase==='after');$('request-bar').hidden=!visible;
  $('request-count').textContent=`Ваши пожелания · ${selected.length}`;
  document.querySelector('.screen')?.classList.toggle('has-bar',visible);
}
function setHouse(id) {
  house=D.houses.some(h=>h.id===id)?id:'';save('house',house);const before=selected.length;selected=validSelection(selected,house);save('request',selected);
  const u=new URL(location.href);if(house)u.searchParams.set('house',house);else u.searchParams.delete('house');history.replaceState(null,'',u.pathname+u.search+u.hash);
  if(screen==='home'){
    document.querySelector('.house-picker small').textContent=H()?'Ваш дом':'Начнём знакомство';
    document.querySelector('.house-picker b').textContent=H()?H().name:'Выберите свой дом';
    updateHousePhoto(H());document.querySelector('.hero-photo-open').hidden=!H();
  }else if(screen==='map'&&mapController){
    document.querySelector('.mini-house').innerHTML=icon('home')+(H()?esc(H().name):'Выберите свой дом')+icon('down');
    mapController.setSelected(house);
  }else render();
  updateRequestBar();const next=pendingHouseAction;pendingHouseAction='';closeSheet().then(()=>{if(next==='wifi')actions.wifi();});toast(before>selected.length?'Убрали услуги, недоступные для выбранного дома':H()?`Ваш дом — ${H().name}`:'Выбрана общая информация');
}
const sheet=$('sheet');
function showSheet(title,html,label='С заботой о вашем отдыхе') {
  if(!sheet.open) focusReturn=document.activeElement;
  ++sheetEpoch;closing=false;sheet.getAnimations().forEach(a=>a.cancel());
  $('sheet-title').textContent=title;$('sheet-label').textContent=label;$('sheet-body').innerHTML=html;
  if(!sheet.open)sheet.showModal();sheet.scrollTop=0;
  requestAnimationFrame(()=>$('sheet-close').focus({preventScroll:true}));
}
async function closeSheet() {
  if(!sheet.open||closing)return;closing=true;const epoch=sheetEpoch;
  if(!reduced())await sheet.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(40px)',opacity:0}],{duration:180,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{});
  if(epoch!==sheetEpoch)return;sheet.close();sheet.getAnimations().forEach(a=>a.cancel());closing=false;if(focusReturn?.isConnected)focusReturn.focus({preventScroll:true});
}
$('sheet-close').addEventListener('click',closeSheet);sheet.addEventListener('cancel',e=>{e.preventDefault();closeSheet();});
sheet.addEventListener('click',e=>{if(e.target===sheet){const r=sheet.getBoundingClientRect();if(e.clientY<r.top||e.clientX<r.left||e.clientX>r.right)closeSheet();}});
let swipeY=null;sheet.querySelector('.sheet-grip').addEventListener('pointerdown',e=>{swipeY=e.clientY;e.target.setPointerCapture(e.pointerId);});
sheet.querySelector('.sheet-grip').addEventListener('pointerup',e=>{if(swipeY!==null&&e.clientY-swipeY>55)closeSheet();swipeY=null;});
document.addEventListener('guest:photo-error',()=>toast('Фото дома не загрузилось. Попробуйте выбрать дом ещё раз.'));
let toastTimer;function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3400);}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('Текст скопирован. Вставьте его в сообщение базе.');}catch{toast('Выделите текст запроса ниже и скопируйте его.');}}
function houseChoices(query='') {return D.houses.filter(h=>normalize(h.name).includes(normalize(query))).map(h=>`<button class="house-choice" data-house="${esc(h.id)}" aria-pressed="${h.id===house}"><img src="${esc(h.image)}" width="64" height="54" loading="lazy" alt=""><span><b>${esc(h.name)}</b><small>${h.capacity?'До '+esc(h.capacity)+' гостей':'Ваш дом в лесу'}</small></span>${icon(h.id===house?'check':'right')}</button>`).join('')||'<p class="empty">Не нашли дом. Попробуйте другое название.</p>';}
function houses(next='') {pendingHouseAction=next;showSheet('Какой у вас дом?',`<p class="sheet-body-copy">Выберите дом — сохраним его для ваших вопросов и пожеланий. Его можно поменять в любой момент.</p><label class="search">${icon('search')}<input id="house-search" type="search" placeholder="Название дома" aria-label="Поиск дома" autocomplete="off"></label><div class="house-list" id="house-list">${houseChoices()}</div>`,'Ваш уголок в лесу');}
const channels = () => D.contacts.socials.filter(s=>['telegram','max','whatsapp'].includes(s.id));

function contact(kind='all') {
 const a=D.contacts.administrator;
 const admin=`<section class="contact-group"><p class="eyebrow">Администратор базы</p><h3>${a.names?esc(a.names):'Помощь на территории'}</h3><p class="sheet-body-copy">Уголь, решётки, розжиг и другие принадлежности.${a.hours?' На связи '+esc(a.hours)+'.':''}</p>${a.phone?`<a class="primary full" href="${esc(a.phone_url)}">${esc(a.phone)}</a>`:`<p class="form-note">Прямой контакт подскажут на ресепшене или в отделе бронирования.</p><button class="secondary full" data-action="booking-contact">Уточнить контакт администратора ↗</button>`}</section>`;
 const booking=`<section class="contact-group"><p class="eyebrow">Отдел бронирования</p><h3>SPA, чаны и программы</h3><p class="sheet-body-copy">${esc(D.contacts.phone_hours)}</p><div class="contact-list"><a class="primary" href="${esc(D.contacts.phone_url)}">${esc(D.contacts.phone)}</a>${channels().map(s=>`<a class="secondary" href="${esc(s.url)}" target="_blank" rel="noopener">Написать в ${esc(s.title)}</a>`).join('')}</div></section>`;
 showSheet(kind==='booking'?'Отдел бронирования':'Мы рядом.',(kind==='booking'?booking:kind==='administrator'?admin:admin+booking)+`<div class="social-list">${D.contacts.socials.filter(s=>!channels().includes(s)).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`).join('')}<a href="https://ecobr.ru/" target="_blank" rel="noopener">Сайт базы ↗</a></div>`,'Берёзовая роща');
}
function showHousePhoto(id=house) {
 const h=D.houses.find(h=>h.id===id);if(!h)return houses();
 showSheet(h.name,`<img class="house-full-photo" src="${esc(h.image)}" alt="${esc(h.name)} — фото дома"><p class="sheet-body-copy">${h.has_private_bath?'На территории дома есть своя баня или сауна.':'Дом на территории Берёзовой рощи.'}</p><a class="secondary full" href="${esc(h.url)}" target="_blank" rel="noopener">Страница дома ↗</a>`,'Ваш дом');
}
let supplyQuantities={};
function orderSupplies(id='') {
 const goods=D.services.filter(s=>s.kind==='goods');if(id&&!Object.values(supplyQuantities).some(Boolean))supplyQuantities[id]=1;
 showSheet('Для мангала и бани',`<p class="sheet-body-copy">Соберите один список принадлежностей для администратора базы.</p><form id="supply-form">${houseSelect()}<div class="supply-list">${goods.map(s=>`<label class="supply-row"><span><b>${esc(s.title)}</b><small>${esc(s.price_label)}</small></span><input type="number" min="0" max="20" step="1" inputmode="numeric" value="${supplyQuantities[s.id]||0}" data-supply-quantity="${esc(s.id)}" aria-label="Количество: ${esc(s.title)}"></label>`).join('')}</div><div class="supply-total"><span>Итого</span><strong id="supply-total"></strong></div><label for="supply-note">Пожелания — необязательно</label><textarea id="supply-note" maxlength="700"></textarea><p class="form-error" id="supply-error" hidden></p><div class="form-actions"><button class="primary full" type="submit">Подготовить список →</button><p class="form-note">Получатель — администратор базы. Ничего не отправляется автоматически.</p></div></form>`,'Принадлежности');
 function update(){document.querySelectorAll('[data-supply-quantity]').forEach(i=>supplyQuantities[i.dataset.supplyQuantity]=Number(i.value));try{$('supply-total').textContent=supplySelection(goods,supplyQuantities).total.toLocaleString('ru-RU')+' ₽';}catch{$('supply-total').textContent='Проверьте количество';}}
 document.querySelectorAll('[data-supply-quantity]').forEach(i=>i.oninput=update);update();
 $('supply-form').onsubmit=e=>{e.preventDefault();const fail=t=>{$('supply-error').hidden=false;$('supply-error').textContent=t;};const h=D.houses.find(h=>h.id===$('request-house').value);if(!h)return fail('Выберите свой дом.');let chosen;try{chosen=supplySelection(goods,supplyQuantities);}catch{return fail('Укажите целое количество от 0 до 20.');}if(!chosen.items.length)return fail('Выберите хотя бы одну позицию.');const note=$('supply-note').value.trim();showDraft([`Здравствуйте! Мы гости «Берёзовой рощи».`,`Наш дом: ${h.name}.`,'Хотели бы заказать принадлежности:',...chosen.items.map(s=>`• ${s.title} × ${s.quantity} — ${(s.price*s.quantity).toLocaleString('ru-RU')} ₽.`),`Итого: ${chosen.total.toLocaleString('ru-RU')} ₽.`,note?'Пожелания: '+note:'','Подтвердите, пожалуйста, наличие и время.'].filter(Boolean).join('\n'),'administrator');};
}

function houseSelect() {return `<label for="request-house">Ваш дом</label><select id="request-house" required><option value="">Выберите свой дом</option>${D.houses.map(h=>`<option value="${esc(h.id)}" ${h.id===house?'selected':''}>${esc(h.name)}</option>`).join('')}</select>`;}
function requestForm(preset='') {
  if(!selected.length&&!preset){toast('Сначала выберите услугу');return;}
  selected=validSelection(selected,house);save('request',selected);const items=preset?[]:selected.map(id=>serviceForHouse(D.services.find(s=>s.id===id)));if(!items.length&&!preset){render();toast('Для выбранного дома эти услуги недоступны.');return;}
  showSheet(preset?'Давайте позаботимся.':'Ваши пожелания.',`<p class="sheet-body-copy">${preset?esc(preset):'Собрали всё в одном запросе. Укажите удобное время — отдел бронирования подтвердит возможность и стоимость.'}</p>${items.map(s=>`<div class="selected-service"><div><b>${esc(s.title)}</b><small>${esc(s.price_label)}</small></div><button data-remove-service="${esc(s.id)}" aria-label="Убрать ${esc(s.title)}">×</button></div>`).join('')}<form id="request-form">${houseSelect()}${items.some(s=>s.id==='tub')?`<label for="request-filling">Какой чан вам хочется?</label><select id="request-filling">${D.services.find(s=>s.id==='tub').prices.map(p=>`<option value="${esc(p.title)} — ${p.amount.toLocaleString('ru-RU')} ₽">${esc(p.title)} — ${p.amount.toLocaleString('ru-RU')} ₽</option>`).join('')}</select><p class="form-note" style="margin-top:8px">Вариант «Любви» согласуется за 2 дня до заезда. Для отдельных домов цена может отличаться.</p>`:''}${items.some(s=>s.id==='spa')?`<label for="request-spa">Сколько времени в SPA?</label><select id="request-spa">${D.services.find(s=>s.id==='spa').prices.map(p=>`<option value="${esc(p.title)} — ${p.amount.toLocaleString('ru-RU')} ₽">${esc(p.title)} — ${p.amount.toLocaleString('ru-RU')} ₽</option>`).join('')}</select>`:''}<label for="request-time">Когда вам удобно?</label><input id="request-time" maxlength="120" placeholder="Например, сегодня в 18:00" autocomplete="off"><label for="request-note">Ваши пожелания</label><textarea id="request-note" maxlength="700" placeholder="Количество гостей и что важно учесть"></textarea><p id="request-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="primary full" type="submit">Подготовить запрос ${icon('arrow')}</button><p class="form-note">Получатель — отдел бронирования. Подготовим текст, который вы сами отправите. Время и стоимость нужно согласовать; запрос не означает подтверждение услуги.</p></div></form>`,'Отдых без лишних забот');
  $('request-form').addEventListener('submit',e=>{e.preventDefault();const h=D.houses.find(x=>x.id===$('request-house').value);if(!h){$('request-error').hidden=false;$('request-error').textContent='Выберите дом, чтобы мы знали, где вы отдыхаете.';return;}
    try{assertRequestAllowed(items,h.id);}catch{$('request-error').hidden=false;$('request-error').textContent='У выбранного дома нет этой бани. Смените дом в путеводителе и выберите доступную услугу.';return;}
    house=h.id;selected=validSelection(selected,house);save('request',selected);save('house',house);const u=new URL(location.href);u.searchParams.set('house',house);history.replaceState(null,'',u.pathname+u.search+u.hash);
    const text=[`Здравствуйте! Мы гости «Берёзовой рощи».`,`Наш дом: ${h.name}.`,'',preset||'Хотели бы заказать:',...items.map(s=>{const item=serviceForHouse(s,h.id);return '• '+item.title+(['spa','tub'].includes(item.id)?'.':' ('+item.price_label+').');}),$('request-filling')?'Вариант чана: '+$('request-filling').value:null,$('request-spa')?'Посещение SPA: '+$('request-spa').value:null,$('request-time').value.trim()?'Когда: '+$('request-time').value.trim():'',$('request-note').value.trim()?'Пожелания: '+$('request-note').value.trim():'','',preset?'Спасибо!':'Подскажите, пожалуйста, возможность, время и итоговую стоимость.'].filter(x=>x!==null).join('\n').replace(/\n{3,}/g,'\n\n');
    render();showDraft(text);
  });
}

function showDraft(text,target='booking') {
 const a=D.contacts.administrator,admin=target==='administrator';
 const links=admin?(a.phone?`<a class="secondary full" href="${esc(a.phone_url)}">Позвонить администратору: ${esc(a.phone)}</a>`:`<p class="form-note">Передайте список администратору на ресепшене. Его прямой контакт также можно уточнить в отделе бронирования.</p><button class="secondary full" data-action="booking-contact">Уточнить контакт администратора ↗</button>`):`<div class="contact-list">${channels().map(s=>`<a class="secondary" href="${esc(s.id==='whatsapp'?s.url+'?text='+encodeURIComponent(text):s.url)}" target="_blank" rel="noopener">Открыть ${esc(s.title)}</a>`).join('')}</div>`;
 showSheet('Осталось отправить.',`<div class="request-recipient"><small>Получатель</small><strong>${admin?'Администратор базы':'Отдел бронирования'}</strong><p>${admin?((a.names?esc(a.names)+' · ':'')+(a.hours?esc(a.hours):'На территории базы')):esc(D.contacts.phone_hours)}</p></div><p class="sheet-body-copy">Текст готов. Скопируйте его и передайте получателю.</p><button id="copy-draft" class="primary full">Скопировать текст ${icon('book')}</button><div class="draft" id="draft-text">${esc(text)}</div>${links}<p class="form-note" style="margin-top:17px">Пока ничего не отправлено. Получатель подтвердит возможность, время и итоговую стоимость.</p>`,'С заботой о деталях');$('copy-draft').addEventListener('click',()=>copyText(text));
}

function simpleRequest(text){requestForm(text);}
function assistant(query='') {showSheet('Чем вам помочь?',`<p class="sheet-body-copy">Найдём ответ в памятке. По вопросам вашего дома всегда можно связаться с базой.</p><label class="search">${icon('search')}<input id="assistant-search" type="search" placeholder="Например, как подключить Wi-Fi" aria-label="Ваш вопрос" value="${esc(query)}" autocomplete="off"></label><div id="assistant-results" class="assistant-results"></div><button class="secondary full" data-action="contact">Спросить у администратора ${icon('chat')}</button>`,'Быстрые ответы');assistantResults(query);}
function assistantResults(query) {const words=normalize(query).split(/[^а-яa-z0-9-]+/).filter(w=>w.length>2&&!['как','где','что','мне','для','нас','наш'].includes(w)).map(w=>w.slice(0,5));const list=words.length?D.guides.map(g=>({g,n:words.reduce((n,w)=>n+Number(normalize(g.title+' '+g.body).includes(w)),0)})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,3).map(x=>x.g):D.guides.slice(0,3);$('assistant-results').innerHTML=list.map(g=>`<div class="assistant-result"><h3>${esc(g.title)}</h3><p>${esc(g.body).replace(/\n/g,'<br>')}</p>${g.action?`<button class="text-button" data-action="${esc(g.action)}">${esc(g.action_label)} ↗</button>`:''}</div>`).join('')||'<p class="empty">В памятке пока нет точного ответа. Администратор поможет.</p>';}
function mapLarge(){mapController?.openFullscreen();}
const story=$('story');
function showStory(index) {storyIndex=Math.max(0,Math.min(D.stories.length-1,index));const s=D.stories[storyIndex];if(!seen.includes(s.id)){seen.push(s.id);save('seen',seen);}
  $('story-progress').innerHTML=D.stories.map((_,i)=>`<span class="${i<storyIndex?'done':i===storyIndex?'current':''}"><i></i></span>`).join('');
  $('story-content').innerHTML=`<img class="story-picture" src="${esc(image(s.image))}" width="600" height="450" alt="${esc(s.short)}"><p class="eyebrow">Коротко о важном</p><h2 id="story-title">${esc(s.title)}</h2><div class="story-copy">${s.body.split('\n').map(p=>`<p>${esc(p)}</p>`).join('')}</div><button class="primary" data-story-action="${esc(s.action)}">${esc(s.action_label)} ${icon('arrow')}</button>`;
  $('story-counter').textContent=`${storyIndex+1} / ${D.stories.length}`;story.querySelector('[data-action="story-prev"]').disabled=storyIndex===0;story.querySelector('[data-action="story-next"]').disabled=storyIndex===D.stories.length-1;
  if(!story.open){focusReturn=document.activeElement;story.showModal();}story.scrollTop=0;
}
function closeStory(){story.close();render();if(focusReturn?.isConnected)focusReturn.focus();}
story.addEventListener('cancel',e=>{e.preventDefault();closeStory();});
let storyTouchX=null;story.addEventListener('touchstart',e=>{storyTouchX=e.changedTouches[0].clientX;},{passive:true});story.addEventListener('touchend',e=>{if(storyTouchX!==null){const dx=e.changedTouches[0].clientX-storyTouchX;if(Math.abs(dx)>70)showStory(storyIndex+(dx<0?1:-1));}storyTouchX=null;},{passive:true});

document.addEventListener('input',e=>{if(e.target.id==='house-search')$('house-list').innerHTML=houseChoices(e.target.value);if(e.target.id==='guide-search')$('guide-list').innerHTML=guideList(e.target.value);if(e.target.id==='assistant-search')assistantResults(e.target.value);});
document.addEventListener('click',e=>{
  const target=e.target.closest('button,a');if(!target)return;
  if(target.dataset.routeCategory)category=target.dataset.routeCategory;
  if(target.dataset.phase){phase=target.dataset.phase;save('phase',phase);history.replaceState(null,'',location.pathname+location.search+(phase==='in'?'#home':'#'+phase));render();return;}
  if(target.hasAttribute('data-house')){setHouse(target.dataset.house);return;}
  if(target.dataset.category){category=target.dataset.category;render();return;}
  if(target.hasAttribute('data-story')){showStory(Number(target.dataset.story));return;}
  if(target.dataset.supplies){orderSupplies(target.dataset.supplies);return;}
  if(target.dataset.addService){const id=target.dataset.addService,item=D.services.find(s=>s.id===id);if(!item||item.advance||item.kind==='goods'||!availableForHouse(item,house)){toast('Выберите дом, для которого доступна эта услуга.');return;}selected=selected.includes(id)?selected.filter(x=>x!==id):[...selected,id];save('request',selected);if(screen==='services'){target.setAttribute('aria-pressed',String(selected.includes(id)));target.innerHTML=selected.includes(id)?'В заявке '+icon('check'):'Добавить '+icon('right');target.closest('.service-card')?.classList.toggle('is-selected',selected.includes(id));}updateRequestBar();toast(selected.includes(id)?'Добавили в ваши пожелания':'Убрали из пожеланий');return;}
  if(target.dataset.removeService){selected=selected.filter(id=>id!==target.dataset.removeService);save('request',selected);render();if(selected.length)requestForm();else closeSheet();return;}
  if(target.dataset.storyAction){const action=target.dataset.storyAction;closeStory();if(action.startsWith('#'))location.hash=action;else actions[action]?.();return;}
  if(target.dataset.action)actions[target.dataset.action]?.();
});
const actions={
  contact,houses,assistant,'map-large':mapLarge,request:()=>requestForm(),'booking-contact':()=>contact('booking'),'admin-contact':()=>contact('administrator'),'house-photo':()=>showHousePhoto(),supplies:()=>orderSupplies(),'copy-coupon':()=>copyText(D.afterstay.code),
  arrival:()=>openGuide('arrival'),departure:()=>openGuide('departure'),
  route:()=>{if(sheet.open)closeSheet();location.hash='map';},
  wifi:()=>{if(!H())return houses('wifi');simpleRequest('Подскажите, пожалуйста, название сети и пароль Wi-Fi для нашего дома.');},
  restaurant:()=>simpleRequest('Хотели бы посмотреть актуальное меню ресторана. Подскажите часы работы, варианты обеда и ужина.'),
  breakfast:()=>simpleRequest('Хотели бы записаться на завтрак. Подскажите время, наличие мест и стоимость для нашей брони.'),
  'close-story':closeStory,'story-prev':()=>showStory(storyIndex-1),'story-next':()=>showStory(storyIndex+1)
};
window.addEventListener('hashchange',()=>{if(sheet.open)closeSheet();if(['#home','#pre','#after'].includes(location.hash)){phase=location.hash==='#home'?'in':location.hash.slice(1);save('phase',phase);}else if(phase==='after'){phase='in';save('phase',phase);}render();window.scrollTo({top:0,behavior:'instant'});});
render();
