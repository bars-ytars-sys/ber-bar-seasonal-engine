// The previous picture remains visible until the new house photo has decoded.
export function createHousePhoto({selector, fallbackSrc, fallbackAlt, duration=600}) {
  let generation=0, animation=null;
  return async function updateHousePhoto(house) {
    const token=++generation;
    animation?.cancel(); animation=null;
    const current=document.querySelector(selector);
    if(!current)return;
    const container=current.parentElement;
    container.querySelectorAll('.house-photo-next').forEach(img=>img.remove());
    const src=house?.image||fallbackSrc;
    const alt=house?`${house.name} — ваш дом на территории базы отдыха`:fallbackAlt;
    container.dataset.photoFor=house?.id||'';
    if(current.getAttribute('src')===src){
      current.alt=alt;container.dataset.photoState='ready';return;
    }
    container.dataset.photoState='loading';
    const next=current.cloneNode(false);
    next.removeAttribute('id');next.classList.add('house-photo-next');
    next.setAttribute('aria-hidden','true');next.loading='eager';next.fetchPriority='auto';
    next.style.opacity='0';next.style.animation='none';next.style.transition='none';
    next.alt=alt;next.src=src;
    try{await next.decode();}catch{
      if(token===generation&&current.isConnected){
        container.dataset.photoState='error';
        container.dispatchEvent(new CustomEvent('guest:photo-error',{bubbles:true}));
      }
      return;
    }
    if(token!==generation||!current.isConnected)return;
    // Overlay also on desktop, where the original photo occupies a grid cell.
    Object.assign(next.style,{position:'absolute',inset:'auto',left:current.offsetLeft+'px',
      top:current.offsetTop+'px',width:current.offsetWidth+'px',height:current.offsetHeight+'px'});
    container.insertBefore(next,current.nextSibling);
    container.dataset.photoState='transition';
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      animation=next.animate([{opacity:0},{opacity:1}],{
        duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'
      });
      await animation.finished.catch(()=>{});
    }
    if(token!==generation||!current.isConnected){next.remove();return;}
    next.style.opacity='1';next.classList.remove('house-photo-next');next.removeAttribute('aria-hidden');
    current.remove();
    for(const property of ['position','inset','left','top','width','height'])next.style.removeProperty(property);
    animation?.cancel();animation=null;
    container.dataset.photoState='ready';
  };
}
