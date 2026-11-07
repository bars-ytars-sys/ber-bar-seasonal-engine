/* Demo presentation changes only. All booking/calendar behavior remains in BRStay. */
(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const asset = path => new URL(path, base).href;
  const escape = text => String(text).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const here = id => {const url=new URL(location.href);url.hash=id;return url.href;};
  const winterPage = location.pathname.endsWith('/br-new-year.html');
  const booking = (arrival, departure) => {
    const url = new URL('https://ecobr.ru/booking');
    url.search = new URLSearchParams({dfrom:arrival,dto:departure,adults:'2',scroll_to_rooms:'1'});
    return url.href;
  };
  const periods = [
    {id:'newyear',name:'Новый год',dates:'31 декабря — 3 января',from:'2026-12-31',to:'2027-01-03',tag:'Встречаем 2027',photo:'../../demo/assets/br-ng-kartochka-720.webp',alt:'Зимний дом в Берёзовой роще',text:'Встретить Новый год в своём доме: близкие рядом, зимний лес за окном и праздничное настроение.',button:'Выбрать дом на Новый год'},
    {id:'holidays',name:'Зимние каникулы',dates:'3 — 11 января',from:'2027-01-03',to:'2027-01-11',tag:'Отдыхаем без спешки',photo:'br-guest/assets/houses/chalet.webp',alt:'Дом Шале на базе отдыха Берёзовая роща',text:'Приехать после новогодней ночи. Гулять, отдыхать в доме и выбрать удобные дни январских каникул.',button:'Выбрать даты каникул'}
  ];
  function winter() {
    const section = document.createElement('section');
    section.id = 'brd-winter'; section.className = 'brd-winter';
    section.setAttribute('aria-labelledby','brd-winter-title');
    section.innerHTML = `<div class="brd-winter__inner"><p class="brd-winter__eyebrow">Берёзовая роща · зима 2026 / 2027</p><h2 id="brd-winter-title">Новый год или каникулы?<br>Выбирайте свой отдых</h2><p class="brd-winter__intro">Два повода приехать в лес. Встреча Нового года и январские каникулы — отдельно, с понятными датами.</p><div class="brd-winter__cards">${periods.map(p => `<article class="brd-winter__card" id="brd-${p.id}"><div class="brd-winter__photo"><img src="${escape(asset(p.photo))}" alt="${escape(p.alt)}" width="720" height="375" loading="lazy"><span class="brd-winter__tag">${p.tag}</span></div><div class="brd-winter__body"><h3>${p.name}</h3><p class="brd-winter__dates">${p.dates}</p><p class="brd-winter__text">${p.text}</p><div class="brd-winter__actions"><a class="brd-winter__button" href="${escape(booking(p.from,p.to))}">${p.button}<span aria-hidden="true">↗</span></a><a class="brd-winter__more" href="${escape(new URL('br-new-year.html',base).href+'#brd-'+p.id)}">Подробнее об отдыхе</a></div></div></article>`).join('')}</div><p class="brd-winter__note">Выбирайте доступный дом и удобные даты в бронировании. Стоимость проживания и дополнительных услуг зависит от выбранного тарифа.</p></div>`;
    return section;
  }
  function nav(hero) {
    if (document.getElementById('brd-nav')) return;
    const node = document.createElement('nav'); node.id='brd-nav';node.className='brd-nav';
    node.setAttribute('aria-label','Быстрый переход по демке');
    node.innerHTML=`<div class="brd-nav__inner"><a href="${escape(asset('br-doma.html')+'#bb-stay')}">Дома и даты</a><a class="brd-nav__winter" href="${escape(here('brd-newyear'))}"><span aria-hidden="true">✧</span>Новый год</a><a href="${escape(here('brd-holidays'))}">Каникулы</a><a href="${escape(here('rec4153838101'))}">Впечатления</a><a href="${escape(here('rec1841838861'))}">Карта базы</a></div>`;
    hero.before(node);
    const header = document.getElementById('t-header');
    const elements=[...(header?.querySelectorAll('#rec1729326481 .tn-elem,#rec1730117851 .tn-elem')||[])];
    const height = () => {
      // Tilda keeps its fixed header artboard at 1px; measure its visible elements.
      const boxes=elements.map(el=>el.getBoundingClientRect()).filter(r=>r.width>20&&r.height>10&&r.height<150&&r.top>=0&&r.top<60&&r.bottom<150);
      const size=boxes.length?Math.ceil(Math.max(...boxes.map(r=>r.bottom))):0;
      node.style.marginTop=size+'px';
      // The original hero already reserves this space for its fixed header.
      hero.style.marginTop=-size+'px';
    };
    height();window.addEventListener('resize',height,{passive:true});window.addEventListener('load',height,{once:true});
    const headerSize=new ResizeObserver(height);elements.forEach(el=>headerSize.observe(el));
  }
  function swapStories() {
    const stories=document.getElementById('rec4153838101'),ribbon=document.getElementById('rec1910740261');
    if (!stories||!ribbon||stories.dataset.brdMoved) return;
    const marker=document.createComment('Original carousel position');ribbon.before(marker);stories.before(ribbon);marker.replaceWith(stories);stories.dataset.brdMoved='true';
  }
  function gallery() {
    const target=document.getElementById('rec2851363001');
    const houses=window.BRStayData?.houses;
    if (!target||!houses?.length||document.getElementById('brd-gallery')) return false;
    const node=document.createElement('section');node.id='brd-gallery';node.className='brd-gallery';node.setAttribute('aria-label','Фотографии всех 22 домов');
    node.innerHTML=`<div class="brd-gallery__head"><div><h2>Посмотрите все ${houses.length} дома</h2><p>Фотографии, удобства и выбор дат — в каталоге</p></div><div class="brd-gallery__controls"><button type="button" data-brd-scroll="-1" aria-label="Предыдущие фотографии">‹</button><button type="button" data-brd-scroll="1" aria-label="Следующие фотографии">›</button></div></div><div class="brd-gallery__track">${houses.map(h=>`<a class="brd-gallery__house" href="${escape(asset('br-doma.html')+'?house='+encodeURIComponent(h.id)+'#bb-stay')}" aria-label="${escape(h.name)} — посмотреть в каталоге"><img src="${escape(asset(h.image))}" alt="${escape(h.name)}" width="300" height="200" loading="lazy" decoding="async"><b>${escape(h.name)}</b><small>До ${h.capacity} гостей</small></a>`).join('')}</div><a class="brd-winter__button brd-gallery__catalog" href="${escape(asset('br-doma.html')+'#bb-stay')}">Открыть каталог домов →</a>`;
    target.after(node);
    node.addEventListener('click',event=>{const button=event.target.closest('[data-brd-scroll]');if(!button)return;const row=node.querySelector('.brd-gallery__track');row.scrollBy({left:Number(button.dataset.brdScroll)*row.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});});
    return true;
  }
  function holidayPage() {
    const hero=document.querySelector('.нг-бр .герой');
    if(!hero||document.getElementById('brd-winter'))return;
    const section=winter();hero.after(section);document.body.classList.add('brd-winter-ready');
    const back=document.createElement('a');back.className='brd-winter__back';back.href=asset('br-doma.html')+'#bb-stay';back.textContent='← Вернуться к домам';section.querySelector('.brd-winter__inner').prepend(back);
    const dates=hero.querySelector('.даты');
    if(dates)dates.innerHTML='Новый год: 31 декабря — 3 января<br>Каникулы: 3 — 11 января<br><small>40 минут от Москвы</small>';
    for(const a of hero.querySelectorAll('a'))if(a.href.includes('/booking')){a.href=booking(periods[0].from,periods[0].to);a.textContent='Выбрать новогодний заезд';}
    const firstFact=document.querySelector('#коротко .факт');
    if(firstFact){const label=firstFact.querySelector('b'),text=firstFact.querySelector('span');if(label)label.textContent='Два зимних заезда';if(text)text.textContent='Новый год: 31 декабря — 3 января. Каникулы: 3 — 11 января.';}
    for(const a of document.querySelectorAll('.нг-бр a[href]')){
      const url=new URL(a.href);
      if(url.origin==='https://ecobr.ru'&&url.pathname==='/booking'&&url.searchParams.get('dfrom')==='2026-12-31'&&url.searchParams.get('dto')==='2027-01-11'){
        url.searchParams.set('dto','2027-01-03');a.href=url.href;
      }
    }
    for(const a of document.querySelectorAll('.brd-winter__more')){a.href=here(a.closest('article').id==='brd-newyear'?'условия':'зимой');a.textContent='Что вас ждёт';}
  }
  function mount() {
    if(winterPage){holidayPage();return;}
    const hero=document.getElementById('rec2411016811');if(!hero)return;
    if(!document.getElementById('brd-winter')){document.body.classList.add('brd-demo-ready');nav(hero);hero.after(winter());swapStories();}
    gallery();
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');
    if(link&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){
      const destination=new URL(link.href),pages={'/':'br-glavnaya.html','/doma':'br-doma.html','/new-year':'br-new-year.html'};
      if(['ecobr.ru','www.ecobr.ru'].includes(destination.hostname)&&pages[destination.pathname]&&!destination.hash){
        event.preventDefault();event.stopImmediatePropagation();location.assign(asset(pages[destination.pathname])+destination.search);return;
      }
    }
    const a=event.target.closest?.('.brd-nav a,.brd-winter__more');if(!a)return;
    const url=new URL(a.href);if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
    const target=document.getElementById(decodeURIComponent(url.hash.slice(1)));if(!target)return;
    event.preventDefault();event.stopImmediatePropagation();
    history.replaceState(history.state,'',url.href);target.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  if(!winterPage&&!window.BRStayData){const data=document.createElement('script');data.src=asset('br-stay-data.js?v=20261107');data.onload=gallery;document.head.append(data);}
})();
