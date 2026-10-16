/* Preserve Tilda's original menu, with a stable panel height and local anchors. */
(()=>{
 'use strict';
 const config=window.BPPreviewRoutes||{home:'/',catalog:'/houses',winter:'/new-year'};
 const home=new URL(config.home,location.href),catalog=new URL(config.catalog,location.href),winter=new URL(config.winter,location.href);
 const menuId='rec1185050696',shown='nolimShow1185050696';
 let record,panel,opener,close,wasOpen=false,pending=false,waitingOpener=false;
 const homeAnchor=hash=>location.pathname===home.pathname?hash:home.href+hash;
 function route(raw){
  if(!raw||/^(?:tel:|mailto:|javascript:|#popup:)/i.test(raw)||raw==='#openmenu')return raw;
  const anchor={'#houses':catalog.href,'#uslugi':homeAnchor('#bp-programs'),'#bp-programs':homeAnchor('#bp-programs'),'#faq':homeAnchor('#faq'),'#bb-stay':homeAnchor('#bb-stay')};
  if(anchor[raw])return anchor[raw];
  if(raw[0]==='#')return raw;
  let u;try{u=new URL(raw,location.href);}catch{return raw;}
  const production=u.hostname==='barskie-polya.ru',sameOrigin=u.origin===location.origin;
  if(!production&&!sameOrigin)return raw;
  const root=u.pathname==='/',currentHome=u.pathname===home.pathname;
  if(root||currentHome||u.pathname.endsWith('/bp-glavnaya.html')){
   if(u.hash==='#openmenu')return '#openmenu';
   if(u.hash==='#zayavka')return '#zayavka';
   if(anchor[u.hash])return anchor[u.hash];
   return home.href+u.search+u.hash;
  }
  if(u.pathname==='/houses'||/\/(?:bp-houses|houses)\.html$/.test(u.pathname))return catalog.href;
  if(u.pathname==='/new-year')return winter.href;
  if(u.pathname==='/booking'&&!u.search)return homeAnchor('#bb-stay');
  // Tilda also creates relative links later, e.g. privacy and seasonal offers.
  const base=new URL('./',home).pathname;
  if(sameOrigin&&window.BPPreviewRoutes&&!u.pathname.startsWith(base))return 'https://barskie-polya.ru'+u.pathname+u.search+u.hash;
  if(sameOrigin&&window.BPPreviewRoutes&&base==='/'&&!u.pathname.endsWith('.html'))return 'https://barskie-polya.ru'+u.pathname+u.search+u.hash;
  return raw;
 }
 function routes(){
  for(const a of document.querySelectorAll('a[href]')){
   const raw=a.getAttribute('href'),next=route(raw);
   if(next!==raw)a.setAttribute('href',next);
  }
 }
 function open(){return !!panel&&(panel.classList.contains(shown)||(record.style.display==='block'&&panel.style.pointerEvents==='auto'));}
 function sync(){
  if(!panel)return;
  const first=record.querySelector('.tn-elem'),scale=parseFloat(first?.style.zoom)||1;
  const height=Math.round(Math.min(document.documentElement.clientHeight||innerHeight,600*scale));
  const value=Math.max(1,height)+'px';
  if(record.style.getPropertyValue('--bp-native-menu-height')!==value)record.style.setProperty('--bp-native-menu-height',value);
  const opened=open();opener?.setAttribute('aria-expanded',String(opened));
  if(wasOpen&&!opened)opener?.focus({preventScroll:true});wasOpen=opened;
 }
 function closeMenu(){if(open())close?.click();}
 function mount(){
  record=document.getElementById(menuId);panel=record?.querySelector('.t396');if(!panel)return;
  opener=document.querySelector('#rec1185050691 a[href="#openmenu"]');close=record.querySelector('[data-elem-id="1752787864116"]');
  const style=document.createElement('style');style.id='bp-native-navigation-style';
  style.textContent='#'+menuId+' .t396{height:var(--bp-native-menu-height,600px)!important;max-height:100dvh;max-width:100vw}#bp-programs,[name="faq"]{scroll-margin-top:100px}';
  document.head.append(style);
  opener?.setAttribute('aria-controls',menuId);opener?.setAttribute('aria-expanded','false');
  if(close){close.setAttribute('role','button');close.setAttribute('tabindex','0');close.setAttribute('aria-label','Закрыть меню');}
  function nativeAnchorOffset(){
   const original=window.t270_scroll;if(typeof original!=='function'||original.bpNativeOffset)return;
   const scroll=function(hash,offset){
    if(['#bb-stay','#bp-programs','#faq'].includes(hash))offset=(document.querySelector('#rec1185050691 .t396__artboard')?.getBoundingClientRect().height||76)+20;
    return original.call(this,hash,offset);
   };
   scroll.bpNativeOffset=true;window.t270_scroll=scroll;
  }
  nativeAnchorOffset();if(window.t_onFuncLoad)window.t_onFuncLoad('t270_scroll',nativeAnchorOffset);
  routes();sync();
  new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;routes();sync();});}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});
  new MutationObserver(sync).observe(record,{attributes:true,subtree:true,attributeFilter:['class','style']});
  window.addEventListener('resize',sync);
  document.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&open()){e.preventDefault();closeMenu();}
   if(close?.contains(e.target)&&['Enter',' '].includes(e.key)){e.preventDefault();close.click();}
  });
  document.addEventListener('click',e=>{
   const a=e.target.closest?.('a[href]');if(!a)return;
   const raw=a.getAttribute('href'),next=route(raw);if(next!==raw)a.setAttribute('href',next);
   if(raw==='#openmenu'&&!a.hasAttribute('nlm082')){
    e.preventDefault();e.stopImmediatePropagation();if(waitingOpener)return;
    waitingOpener=true;
    const ready=new MutationObserver(()=>{if(!a.hasAttribute('nlm082'))return;ready.disconnect();waitingOpener=false;requestAnimationFrame(()=>a.click());});
    ready.observe(a,{attributes:true,attributeFilter:['nlm082']});
    setTimeout(()=>{ready.disconnect();waitingOpener=false;},4000);return;
   }
   if(a.closest('#'+menuId)&&next==='#zayavka'){closeMenu();return;}
   if(!a.closest('#'+menuId)||!/^#(?:faq|bp-programs)$/.test(next))return;
   const id=next.slice(1),target=document.getElementById(id)||document.querySelector('[name="'+id+'"]');
   if(!target)return;e.preventDefault();e.stopImmediatePropagation();closeMenu();
   setTimeout(()=>{
    history.replaceState(null,'',next);
    const header=document.querySelector('#rec1185050691 .t396__artboard'),offset=(header?.getBoundingClientRect().height||76)+20;
    window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top-offset,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
   },450);
  },true);
 }
 if(typeof module!=='undefined'&&module.exports){module.exports={route};return;}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
