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
    section.innerHTML = `<div class="brd-winter__inner"><p class="brd-winter__eyebrow">Берёзовая роща · зима 2026 / 2027</p><h2 id="brd-winter-title">Зима в Берёзовой роще</h2><p class="brd-winter__intro">Встретьте Новый год за городом или приезжайте на январские каникулы.</p><div class="brd-winter__cards">${periods.map(p => `<article class="brd-winter__card" id="brd-${p.id}"><div class="brd-winter__photo"><img src="${escape(asset(p.photo))}" alt="${escape(p.alt)}" width="720" height="375" loading="lazy"><span class="brd-winter__tag">${p.tag}</span></div><div class="brd-winter__body"><h3>${p.name}</h3><p class="brd-winter__dates">${p.dates}</p><p class="brd-winter__text">${p.text}</p><div class="brd-winter__actions"><a class="brd-winter__button" href="${escape(booking(p.from,p.to))}">${p.button}<span aria-hidden="true">↗</span></a><a class="brd-winter__more" href="${escape(new URL('br-new-year.html',base).href+'#brd-'+p.id)}">Подробнее об отдыхе</a></div></div></article>`).join('')}</div><p class="brd-winter__note">Наличие домов и стоимость — в бронировании.</p></div>`;
    return section;
  }
  function swapStories() {
    const stories=document.getElementById('rec4153838101'),ribbon=document.getElementById('rec1910740261');
    if (!stories||!ribbon||stories.dataset.brdMoved) return;
    const marker=document.createComment('Original carousel position');ribbon.before(marker);stories.before(ribbon);marker.replaceWith(stories);stories.dataset.brdMoved='true';
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
    if(!document.getElementById('brd-winter')){document.body.classList.add('brd-demo-ready');hero.after(winter());swapStories();}
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
})();
