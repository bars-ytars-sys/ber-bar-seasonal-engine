/* BR preview only: flowing menu, grouped list of all 22 houses. Native opener stays. */
(()=>{
 'use strict';
 const ids=['rec1728108931','rec1729227991'];
 const groups=[['Баусы',['baus-1','baus-2','baus-3']],['Хаусы',['house-1','house-2','house-3','house-4']],['А-фреймы',['aframe-luxe-white','aframe-luxe-black','aframe-white','aframe-black','aframe-neo']],['Барнхаусы',['barn-1','barn-2','barn-3','barn-4']],['Другие дома',['panorama','bariloche','chalet','scandi','holidayhouse','sfera']]];
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function mount(){
  const desktop=document.getElementById(ids[0]);if(!desktop)return;
  const houses=new Map();for(const a of desktop.querySelectorAll('a[href]')){const id=new URL(a.href).pathname.match(/\/doma\/([^/]+)\/?$/)?.[1];if(id)houses.set(id,{name:a.textContent.trim(),href:a.href});}
  if(houses.size!==22||groups.some(([,list])=>list.some(id=>!houses.has(id))))return;
  for(const id of ids){
   const rec=document.getElementById(id),art=rec?.querySelector('.t396__artboard'),nav=rec?.querySelector('.br-nov-menu');if(!art||!nav||rec.classList.contains('br-menu-ready'))continue;
   const close=rec.querySelector('a[href="#menuopen"]'),logo=rec.querySelector('[data-elem-id="1766501078669000001"] a'),callback=rec.querySelector('a[href="#zayavka"]');if(!close||!logo||!callback)continue;
   const originalCatalogue=nav.querySelector('a'),address=rec.querySelector('[data-elem-id="1718876193886"] .tn-atom')?.textContent.trim();
   const maps=[...rec.querySelectorAll('a[href]')].filter(a=>/go\.2gis\.com|yandex\.ru\/maps/.test(a.href));
   const socials=[...rec.querySelectorAll('a[href]')].filter(a=>/instagram\.com|t\.me\//.test(a.href));
   const shell=document.createElement('div');shell.className='br-menu-shell';shell.innerHTML=`<div class="br-menu-shell__header"><a class="br-menu-shell__logo" href="${esc(logo.href)}"><img src="${esc(logo.querySelector('img').getAttribute('src')||logo.querySelector('img').dataset.original)}" alt="Берёзовая роща" width="180"></a><button type="button" class="br-menu-shell__close" aria-label="Закрыть меню"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="br-menu-shell__body"><div class="br-menu-homes"><div class="br-menu-homes__entry"></div><details class="br-menu-houses" ${id===ids[0]?'open':''}><summary>Дома по категориям <span aria-hidden="true">⌄</span></summary><div class="br-menu-houses__groups">${groups.map(([title,list])=>`<section><p class="br-menu-houses__title">${title}</p><ul>${list.map(id=>{const h=houses.get(id);return `<li><a href="${esc(h.href)}" data-br-menu-house="${id}">${esc(h.name)}</a></li>`}).join('')}</ul></section>`).join('')}</div><div class="br-menu-houses__catalogue"></div></details></div><nav class="br-menu-sections" aria-label="Разделы сайта"></nav><div class="br-menu-contact"><p class="br-menu-contact__address">${esc(address||'')}</p><div class="br-menu-contact__maps">${maps.map(a=>`<a href="${esc(a.href)}">${esc(a.textContent)}</a>`).join('')}</div><p>Отдел бронирования<br>Ежедневно с 9:00 до 24:00</p><a class="br-menu-contact__phone" href="tel:+74951202008">+7 (495) 120-20-08</a><div class="br-menu-contact__callback"></div><div class="br-menu-contact__socials">${socials.map(a=>`<a href="${esc(a.href)}">${/t\.me/.test(a.href)?'Telegram':'Instagram'}</a>`).join('')}</div><a class="br-menu-contact__email" href="mailto:BR.BP.House@yandex.ru">Предложения о сотрудничестве</a></div></div>`;
   shell.querySelector('.br-menu-shell__close').addEventListener('click',()=>close.click());
   // Keep Zero's original button atoms in place for Tilda's delayed initialization.
   // Forward normal clicks to those atoms, preserving native popup/menu handlers.
   function copyLink(original){const copy=original.cloneNode(true);copy.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();original.click();});return copy;}
   const entry=copyLink(originalCatalogue);entry.classList.add('br-menu-catalog-link');entry.innerHTML='<span><strong>Каталог домов</strong><small>Фотографии и описание всех 22 домов</small></span><span class="br-menu-catalog-link__arrow" aria-hidden="true">→</span>';shell.querySelector('.br-menu-homes__entry').append(entry);
   const catalogue=copyLink(originalCatalogue);catalogue.textContent='Каталог с фотографиями →';shell.querySelector('.br-menu-houses__catalogue').append(catalogue);
   shell.querySelector('.br-menu-sections').append(...[...nav.querySelectorAll('a')].filter(a=>a!==originalCatalogue).map(copyLink));
   shell.querySelector('.br-menu-contact__callback').append(copyLink(callback));
   art.append(shell);rec.classList.add('br-menu-ready');
  }
  let resetFrame=0;
  document.addEventListener('click',e=>{
   if(!e.target.closest?.('a[href="#menu"],a[href="#menum"]'))return;
   cancelAnimationFrame(resetFrame);
   let attempts=0;
   function resetVisibleMenu(){
    for(const id of ids){
     const body=document.querySelector('#'+id+' .br-menu-shell__body');
     // A hidden native popup has no layout box: reset after it opens, once.
     if(body?.closest('.t-popup_show')&&body.getClientRects().length){body.scrollTop=0;resetFrame=0;return;}
    }
    if(++attempts<30)resetFrame=requestAnimationFrame(resetVisibleMenu);
   }
   resetFrame=requestAnimationFrame(resetVisibleMenu);
  },true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
