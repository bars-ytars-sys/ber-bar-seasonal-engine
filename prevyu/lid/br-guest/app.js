import D from './data.js?v=20261023-house-photo';
import {createHousePhoto} from './house-photo.js';

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
let phase = read('phase','in') === 'pre' ? 'pre' : 'in';
let selected = read('request',[]);
if (!Array.isArray(selected)) selected = [];
selected = [...new Set(selected)].filter(id => D.services.some(s => s.id === id)).slice(0,15);
let category = 'Все', screen = '', storyIndex = 0, focusReturn = null, closing = false, sheetEpoch = 0;
let seen = read('seen',[]); if (!Array.isArray(seen)) seen=[];
const H = () => D.houses.find(h => h.id === house);
const updateHousePhoto=createHousePhoto({selector:'.hero-photo:not(.house-photo-next)',fallbackSrc:'assets/cover.webp',fallbackAlt:'Дом на территории Берёзовой рощи'});
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const normalize = s => String(s).toLowerCase().replace(/ё/g,'е').replace(/wi[\s-]*fi|вай[\s-]*фай/g,'wifi');
const image = name => D.images[name] || 'assets/cover.webp';
const miniHouse = () => `<button class="mini-house" data-action="houses">${icon('home')}${H() ? esc(H().name) : 'Выберите свой дом'} ${icon('down')}</button>`;
const title = (heading, text) => `<div class="page-head">${miniHouse()}<h1>${heading}</h1><p>${text}</p></div>`;

function home() {
  return `<section class="intro"><p class="eyebrow">Ваш личный путеводитель</p><h1>Всё для вашего<br>отдыха.</h1><p>Хорошо, когда нужное — под рукой.</p></section>
  <section class="hero"><img class="hero-photo" src="${esc(H()?.image||'assets/cover.webp')}" alt="${esc(H()?H().name+' — ваш дом в Берёзовой роще':'Дом на территории Берёзовой рощи')}" width="900" height="600" fetchpriority="high"><p class="hero-caption"><i></i> Берёзовая роща · в гостях у природы</p><button class="house-picker" data-action="houses" aria-haspopup="dialog">${icon('home')}<span><small>${H() ? 'Ваш дом' : 'Начнём знакомство'}</small><b>${H() ? esc(H().name) : 'Выберите свой дом'}</b></span>${icon('down')}</button></section>
  <div class="phase" role="tablist" aria-label="Этап отдыха" style="--phase:${phase==='pre'?1:0}"><i aria-hidden="true"></i><button role="tab" data-phase="in" aria-selected="${phase==='in'}">Я уже в гостях</button><button role="tab" data-phase="pre" aria-selected="${phase==='pre'}">Собираюсь к вам</button></div>
  <div class="home-info">${icon(phase==='in'?'wifi':'map')}<div><h3>${phase==='in'?'Подключимся к отдыху?':'Дорога без лишних забот'}</h3><p>${phase==='in'?'Нужны сеть и пароль Wi-Fi? Подскажем именно для вашего дома.':'Адрес, маршрут и связь с базой — всё в одном месте.'}</p><button class="text-button" data-action="${phase==='in'?'wifi':'route'}">${phase==='in'?'Узнать Wi-Fi':'Как добраться'} ${icon('arrow')}</button></div></div>
  <nav class="stories" aria-label="Коротко о важном">${D.stories.map((s,i)=>`<button class="story-button ${seen.includes(s.id)?'seen':''}" data-story="${i}"><span class="story-ring"><img src="${esc(image(s.image))}" alt="" width="52" height="52" loading="lazy"></span>${esc(s.short)}</button>`).join('')}</nav>
  <section class="section"><div class="section-title"><h2>${phase==='pre'?'Отдых начинается<br>с предвкушения':'Как провести день'}</h2><a href="#services">Все услуги ↗</a></div><div class="tile-grid">
  ${[
    ['SPA и релакс','spa','#services','SPA и релакс'],['Вкусный отдых','restaurant','#food',''],
    ['Баня и чан','tub','#services','SPA и релакс'],['Впечатления','farm','#services','Впечатления']
  ].map(([name,img,href,cat])=>`<a class="tile tap" href="${href}" ${cat?`data-route-category="${cat}"`:''}><img src="${esc(image(img))}" alt="${esc(name)} в Берёзовой роще" width="240" height="150" loading="lazy"><span>${name}${icon('arrow')}</span></a>`).join('')}
  <a class="tile tile-wide tap" href="#map"><div><h3>Ваша маленькая<br>карта большого отдыха</h3><p>Найдите свой дом, ресторан<br>и любимое место на территории.</p></div>${icon('map')}</a></div></section>
  <section class="section"><button class="home-help full" data-action="assistant">${icon('chat')}<span><h3>Есть вопрос?</h3><small>Найдём ответ или свяжем с базой</small></span>${icon('right')}</button></section>
  <section class="section"><a class="home-help full tap" href="${esc(D.map.reviews)}" target="_blank" rel="noopener">${icon('heart')}<span><h3>Как вам у нас?</h3><small>Поделитесь впечатлениями об отдыхе</small></span>${icon('arrow')}</a></section>
  <p class="footnote">Лес, тишина и забота о вас.<br>Берёзовая роща by Reznichenko</p>`;
}

function serviceCards() {
  const items=D.services.filter(s => category==='Все'||s.category===category);
  return items.map(s=>`<article class="service-card"><div class="service-photo"><img src="${esc(s.image||image('cover'))}" alt="${esc(s.title)}" width="600" height="380" loading="lazy"><span class="category-tag">${esc(s.category)}</span></div><div class="service-copy"><h2>${esc(s.title)}</h2><p>${esc(s.description)}</p><div class="service-bottom"><div class="price">${esc(s.price_label)}<small>${esc(s.unit||'Время согласуем с базой')}</small></div><button class="primary" data-add-service="${esc(s.id)}" aria-pressed="${selected.includes(s.id)}">${selected.includes(s.id)?'Добавлено '+icon('check'):'Выбрать '+icon('arrow')}</button></div><div class="service-footer"><a href="${esc(s.url)}" target="_blank" rel="noopener">Подробнее на сайте ↗</a></div></div></article>`).join('') || '<p class="empty">Уточните доступные услуги у администратора.</p>';
}

function services() {
  const categories=['Все',...new Set(D.services.map(s=>s.category))];
  return title('Отдых<br>с удовольствием.','Выберите то, чего хочется именно сейчас. Время, наличие и итоговую стоимость подтвердит администратор.')+`<div class="chips" aria-label="Категории услуг">${categories.map(c=>`<button data-category="${esc(c)}" aria-pressed="${c===category}">${esc(c)}</button>`).join('')}</div><div id="service-list" class="service-list">${serviceCards()}</div><a class="source-link" href="https://ecobr.ru/aktivnosti-v-beryozovoj-roshhe" target="_blank" rel="noopener">Все впечатления на сайте базы ↗</a>`;
}

function guideList(query='') {
  const q=normalize(query).trim(), matches=D.guides.filter(g=>!q||normalize(g.title+' '+g.body).includes(q));
  return matches.map(g=>`<details ${q?'open':''}><summary>${icon(g.icon)}<span>${esc(g.title)}</span></summary><div class="guide-answer">${g.body.split('\n').filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('')}${g.action?`<button class="text-button" data-action="${esc(g.action)}">${esc(g.action_label)} ↗</button>`:''}${g.url?`<a class="text-button" href="${esc(g.url)}" target="_blank" rel="noopener">Подробнее на сайте ↗</a>`:''}</div></details>`).join('') || `<p class="empty">Пока не нашли ответ.<br><button class="text-button" data-action="contact">Спросить у администратора ↗</button></p>`;
}
function guide() { return title('Маленькие ответы.<br>Спокойный отдых.','Всё важное о доме и территории. Если понадобится помощь — мы рядом.')+`<label class="search">${icon('search')}<input id="guide-search" type="search" aria-label="Поиск по памятке" placeholder="Wi-Fi, выезд, SPA…" autocomplete="off"></label><div class="guide-list" id="guide-list">${guideList()}</div>`; }
function map() {return title('Здесь начинается<br>ваша прогулка.','Официальная карта территории. Откройте её крупнее, чтобы рассмотреть дорожки и дома.')+`<div class="map-box"><button class="full" data-action="map-large" aria-label="Увеличить карту территории"><img src="assets/map.webp" alt="Официальная карта Берёзовой рощи: дома, ресепшн, ресторан и территория" width="1000" height="800"></button><div class="map-caption"><span>Территория Берёзовой рощи</span><button data-action="map-large">Увеличить ↗</button></div></div><div class="route-card"><h3>Как добраться</h3><p>${esc(D.contacts.address)}</p><div class="route-links"><a class="primary" href="${esc(D.map.yandex_url)}" target="_blank" rel="noopener">Маршрут в Яндекс Картах ${icon('arrow')}</a><a class="secondary" href="${esc(D.map.two_gis_url)}" target="_blank" rel="noopener">Открыть 2ГИС ${icon('arrow')}</a></div></div><div class="map-shortcuts"><button data-action="houses">${icon('home')}Найти свой дом</button><button data-action="contact">${icon('chat')}Нужна помощь?</button></div>`;}
function food() {return `<div class="page-head"><a class="screen-back" href="#home">${icon('left')}На главную</a>${miniHouse()}<h1>Вкусный отдых.<br>Без хлопот.</h1><p>Завтрак не спеша, обед после прогулки и тёплый вечер в ресторане.</p></div><div class="section"><article class="service-card"><div class="service-photo"><img src="${esc(image('restaurant'))}" width="600" height="380" alt="Ресторан Берёзовой рощи"><span class="category-tag">Ресторан на территории</span></div><div class="service-copy"><h2>К столу!</h2><p>Завтраки «шведский стол», комплексные обеды и ужины. Актуальное меню, часы работы и наличие мест подскажет администратор.</p><button class="primary full" data-action="restaurant">Уточнить меню и заказать ${icon('arrow')}</button></div></article></div><div class="section"><div class="about-card"><h3>Начните утро вкусно</h3><p>Завтрак — с 10:00, стоимость 1 500 ₽ на человека. Перед посещением уточните время и условия для вашей брони.</p><button class="primary full" data-action="breakfast">Хочу на завтрак ${icon('arrow')}</button></div></div><p class="footnote">Меню и обслуживание согласуются с базой.<br>Мы подготовим запрос, а вы выберете удобный способ связи.</p>`;}

function render() {
  const route=location.hash.slice(1);screen=['services','guide','map','food'].includes(route)?route:'home';
  $('main').innerHTML=`<div class="screen ${selected.length?'has-bar':''}">${({home,services,guide,map,food}[screen])()}</div>`;
  const active=screen==='food'?'home':screen;
  document.querySelectorAll('[data-screen]').forEach(a=>a.toggleAttribute('aria-current',false));
  document.querySelector(`[data-screen="${active}"]`).setAttribute('aria-current','page');
  document.querySelector('.bottom-nav').style.setProperty('--nav',['home','services','guide','map'].indexOf(active));
  updateRequestBar();
  updateHousePhoto(H());
}
function updateRequestBar() {
  $('request-bar').hidden=!selected.length;
  $('request-count').textContent=`Ваши пожелания · ${selected.length}`;
  document.querySelector('.screen')?.classList.toggle('has-bar',!!selected.length);
}
function setHouse(id) {
  house=D.houses.some(h=>h.id===id)?id:'';save('house',house);
  const u=new URL(location.href);if(house)u.searchParams.set('house',house);else u.searchParams.delete('house');history.replaceState(null,'',u.pathname+u.search+u.hash);
  if(screen==='home'){
    document.querySelector('.house-picker small').textContent=H()?'Ваш дом':'Начнём знакомство';
    document.querySelector('.house-picker b').textContent=H()?H().name:'Выберите свой дом';
    updateHousePhoto(H());
  }else render();
  closeSheet();toast(H()?`Ваш дом — ${H().name}`:'Выбрана общая информация');
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
function houses() {showSheet('Какой у вас дом?',`<p class="sheet-body-copy">Выберите дом — сохраним его для ваших вопросов и пожеланий. Его можно поменять в любой момент.</p><label class="search">${icon('search')}<input id="house-search" type="search" placeholder="Название дома" aria-label="Поиск дома" autocomplete="off"></label><div class="house-list" id="house-list">${houseChoices()}</div>`,'Ваш уголок в лесу');}
const channels = () => D.contacts.socials.filter(s=>['telegram','max','whatsapp'].includes(s.id));
function contact() {showSheet('Мы рядом.',`<div class="contact-info">${esc(D.contacts.phone_role)}<br>${esc(D.contacts.phone_hours)}</div><div class="contact-list"><a class="primary" href="${esc(D.contacts.phone_url)}">${esc(D.contacts.phone)}</a>${channels().map(s=>`<a class="secondary" href="${esc(s.url)}" target="_blank" rel="noopener">Написать в ${esc(s.title)}</a>`).join('')}</div><div class="social-list">${D.contacts.socials.filter(s=>!channels().includes(s)).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`).join('')}<a href="https://ecobr.ru/" target="_blank" rel="noopener">Сайт базы ↗</a></div>`,'Берёзовая роща');}
function houseSelect() {return `<label for="request-house">Ваш дом</label><select id="request-house" required><option value="">Выберите свой дом</option>${D.houses.map(h=>`<option value="${esc(h.id)}" ${h.id===house?'selected':''}>${esc(h.name)}</option>`).join('')}</select>`;}
function requestForm(preset='') {
  if(!selected.length&&!preset){toast('Сначала выберите услугу');return;}
  const items=preset?[]:selected.map(id=>D.services.find(s=>s.id===id)).filter(Boolean);
  showSheet(preset?'Давайте позаботимся.':'Ваши пожелания.',`<p class="sheet-body-copy">${preset?esc(preset):'Собрали всё в одном запросе. Укажите удобное время — администратор подтвердит возможность и стоимость.'}</p>${items.map(s=>`<div class="selected-service"><div><b>${esc(s.title)}</b><small>${esc(s.price_label)}</small></div><button data-remove-service="${esc(s.id)}" aria-label="Убрать ${esc(s.title)}">×</button></div>`).join('')}<form id="request-form">${houseSelect()}${items.some(s=>s.id==='tub')?`<label for="request-filling">Какой чан вам хочется?</label><select id="request-filling">${D.services.find(s=>s.id==='tub').prices.map(p=>`<option value="${esc(p.title)} — ${p.amount.toLocaleString('ru-RU')} ₽">${esc(p.title)} — ${p.amount.toLocaleString('ru-RU')} ₽</option>`).join('')}</select><p class="form-note" style="margin-top:8px">Вариант «Любви» согласуется за 2 дня до заезда. Для отдельных домов цена может отличаться.</p>`:''}${items.some(s=>s.id==='spa')?`<label for="request-spa">Сколько времени в SPA?</label><select id="request-spa">${D.services.find(s=>s.id==='spa').prices.map(p=>`<option value="${esc(p.title)} — ${p.amount.toLocaleString('ru-RU')} ₽">${esc(p.title)} — ${p.amount.toLocaleString('ru-RU')} ₽</option>`).join('')}</select>`:''}<label for="request-time">Когда вам удобно?</label><input id="request-time" maxlength="120" placeholder="Например, сегодня в 18:00" autocomplete="off"><label for="request-note">Ваши пожелания</label><textarea id="request-note" maxlength="700" placeholder="Количество гостей и что важно учесть"></textarea><p id="request-error" class="form-error" role="alert" hidden></p><div class="form-actions"><button class="primary full" type="submit">Подготовить запрос ${icon('arrow')}</button><p class="form-note">Сначала подготовим текст. Вы сами отправите его базе. Время и стоимость нужно согласовать; запрос не означает подтверждение услуги.</p></div></form>`,'Отдых без лишних забот');
  $('request-form').addEventListener('submit',e=>{e.preventDefault();const h=D.houses.find(x=>x.id===$('request-house').value);if(!h){$('request-error').hidden=false;$('request-error').textContent='Выберите дом, чтобы мы знали, где вы отдыхаете.';return;}
    house=h.id;save('house',house);const u=new URL(location.href);u.searchParams.set('house',house);history.replaceState(null,'',u.pathname+u.search+u.hash);
    const text=[`Здравствуйте! Мы гости «Берёзовой рощи».`,`Наш дом: ${h.name}.`,'',preset||'Хотели бы заказать:',...items.map(s=>'• '+s.title+' ('+s.price_label+').'),$('request-filling')?'Вариант чана: '+$('request-filling').value:null,$('request-spa')?'Посещение SPA: '+$('request-spa').value:null,$('request-time').value.trim()?'Когда: '+$('request-time').value.trim():'',$('request-note').value.trim()?'Пожелания: '+$('request-note').value.trim():'','',preset?'Спасибо!':'Подскажите, пожалуйста, возможность, время и итоговую стоимость.'].filter(x=>x!==null).join('\n').replace(/\n{3,}/g,'\n\n');
    render();showDraft(text);
  });
}
function showDraft(text) {showSheet('Осталось отправить.',`<div class="success-icon">${icon('check')}</div><p class="sheet-body-copy">Запрос готов. Скопируйте его и отправьте базе в удобном мессенджере.</p><button id="copy-draft" class="primary full">Скопировать текст ${icon('book')}</button><div class="draft" id="draft-text">${esc(text)}</div><div class="contact-list">${channels().map(s=>`<a class="secondary" href="${esc(s.id==='whatsapp'?s.url+'?text='+encodeURIComponent(text):s.url)}" target="_blank" rel="noopener">Открыть ${esc(s.title)}</a>`).join('')}</div><p class="form-note" style="margin-top:17px">Пока ничего не отправлено. После отправки дождитесь ответа администратора.</p>`,'С заботой о деталях');$('copy-draft').addEventListener('click',()=>copyText(text));}
function simpleRequest(text){requestForm(text);}
function assistant(query='') {showSheet('Чем вам помочь?',`<p class="sheet-body-copy">Найдём ответ в памятке. По вопросам вашего дома всегда можно связаться с базой.</p><label class="search">${icon('search')}<input id="assistant-search" type="search" placeholder="Например, как подключить Wi-Fi" aria-label="Ваш вопрос" value="${esc(query)}" autocomplete="off"></label><div id="assistant-results" class="assistant-results"></div><button class="secondary full" data-action="contact">Спросить у администратора ${icon('chat')}</button>`,'Быстрые ответы');assistantResults(query);}
function assistantResults(query) {const words=normalize(query).split(/[^а-яa-z0-9-]+/).filter(w=>w.length>2&&!['как','где','что','мне','для','нас','наш'].includes(w)).map(w=>w.slice(0,5));const list=words.length?D.guides.map(g=>({g,n:words.reduce((n,w)=>n+Number(normalize(g.title+' '+g.body).includes(w)),0)})).filter(x=>x.n).sort((a,b)=>b.n-a.n).slice(0,3).map(x=>x.g):D.guides.slice(0,3);$('assistant-results').innerHTML=list.map(g=>`<div class="assistant-result"><h3>${esc(g.title)}</h3><p>${esc(g.body).replace(/\n/g,'<br>')}</p>${g.action?`<button class="text-button" data-action="${esc(g.action)}">${esc(g.action_label)} ↗</button>`:''}</div>`).join('')||'<p class="empty">В памятке пока нет точного ответа. Администратор поможет.</p>';}
function mapLarge(){showSheet('Территория крупнее.',`<p class="sheet-body-copy">Увеличьте карту кнопкой «+» и перемещайтесь по ней пальцем.</p><div class="map-view" id="map-view"><img id="zoom-map" src="assets/map.webp" alt="Увеличенная официальная карта Берёзовой рощи"></div><div class="zoom-controls"><button data-zoom="-1" aria-label="Уменьшить карту">−</button><span id="zoom-value">100%</span><button data-zoom="1" aria-label="Увеличить карту">+</button></div><a class="secondary full" href="${esc(D.map.url)}" target="_blank" rel="noopener">Официальная карта на сайте ↗</a>`,'Найдите своё место');let zoom=1;$('sheet-body').querySelectorAll('[data-zoom]').forEach(b=>b.addEventListener('click',()=>{zoom=Math.max(1,Math.min(4,zoom+Number(b.dataset.zoom)*.5));$('zoom-map').style.width=(zoom*100)+'%';$('zoom-value').textContent=Math.round(zoom*100)+'%';}));}
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
  if(target.dataset.phase){phase=target.dataset.phase;save('phase',phase);render();return;}
  if(target.hasAttribute('data-house')){setHouse(target.dataset.house);return;}
  if(target.dataset.category){category=target.dataset.category;render();return;}
  if(target.hasAttribute('data-story')){showStory(Number(target.dataset.story));return;}
  if(target.dataset.addService){const id=target.dataset.addService;selected=selected.includes(id)?selected.filter(x=>x!==id):[...selected,id];save('request',selected);if(screen==='services')$('service-list').innerHTML=serviceCards();updateRequestBar();toast(selected.includes(id)?'Добавили в ваши пожелания':'Убрали из пожеланий');return;}
  if(target.dataset.removeService){selected=selected.filter(id=>id!==target.dataset.removeService);save('request',selected);render();if(selected.length)requestForm();else closeSheet();return;}
  if(target.dataset.storyAction){const action=target.dataset.storyAction;closeStory();if(action.startsWith('#'))location.hash=action;else actions[action]?.();return;}
  if(target.dataset.action)actions[target.dataset.action]?.();
});
const actions={
  contact,houses,assistant,'map-large':mapLarge,request:()=>requestForm(),
  route:()=>{if(sheet.open)closeSheet();location.hash='map';},
  wifi:()=>simpleRequest('Подскажите, пожалуйста, название сети и пароль Wi-Fi для нашего дома.'),
  restaurant:()=>simpleRequest('Хотели бы посмотреть актуальное меню ресторана. Подскажите часы работы, варианты обеда и ужина.'),
  breakfast:()=>simpleRequest('Хотели бы записаться на завтрак. Подскажите время, наличие мест и стоимость для нашей брони.'),
  'close-story':closeStory,'story-prev':()=>showStory(storyIndex-1),'story-next':()=>showStory(storyIndex+1)
};
window.addEventListener('hashchange',()=>{if(sheet.open)closeSheet();render();window.scrollTo({top:0,behavior:'instant'});});
render();
