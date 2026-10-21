/* Swipe galleries; photos open without leaving the demo. No autoplay. */
(()=>{
 'use strict';
 function mount(){
  let dialog,image,caption,previous,next,source,index=0,opener;
  const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
  function show(at){const slides=[...source.querySelectorAll('.bp-media__slide img')];index=(at+slides.length)%slides.length;image.src=slides[index].currentSrc||slides[index].src;image.alt=slides[index].alt;caption.textContent=slides[index].alt+' · '+(index+1)+' / '+slides.length;previous.hidden=next.hidden=slides.length<2;}
  function open(gallery,at,button){
   if(!dialog){
    dialog=document.createElement('dialog');dialog.className='bp-lightbox';dialog.setAttribute('aria-label','Просмотр фотографий');
    dialog.innerHTML='<button class="bp-lightbox__close" type="button" aria-label="Закрыть фото">×</button><button type="button" data-previous aria-label="Предыдущее фото">‹</button><img alt=""><button type="button" data-next aria-label="Следующее фото">›</button><p class="bp-lightbox__caption" aria-live="polite"></p>';
    document.body.append(dialog);image=dialog.querySelector('img');caption=dialog.querySelector('p');previous=dialog.querySelector('[data-previous]');next=dialog.querySelector('[data-next]');
    dialog.querySelector('.bp-lightbox__close').addEventListener('click',()=>dialog.close());previous.addEventListener('click',()=>show(index-1));next.addEventListener('click',()=>show(index+1));
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}});
    dialog.addEventListener('close',()=>{document.documentElement.style.removeProperty('overflow');opener?.focus({preventScroll:true});});
   }
   source=gallery;opener=button;show(at);dialog.showModal();document.documentElement.style.overflow='hidden';
  }
  for(const gallery of document.querySelectorAll('[data-bp-media]')){
   if(gallery.dataset.ready)continue;gallery.dataset.ready='1';
   const track=gallery.querySelector('.bp-media__track'),slides=[...track.children],count=gallery.querySelector('.bp-media__counter');
   let current=0,frame;
   const update=()=>{current=Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));if(count)count.textContent=(current+1)+' / '+slides.length;};
   track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);},{passive:true});
   const move=step=>{const at=(current+step+slides.length)%slides.length;track.scrollTo({left:at*track.clientWidth,behavior:reduced()?'instant':'smooth'});};
   gallery.querySelector('[data-bp-prev]')?.addEventListener('click',()=>move(-1));gallery.querySelector('[data-bp-next]')?.addEventListener('click',()=>move(1));
   slides.forEach((button,i)=>button.addEventListener('click',()=>open(gallery,i,button)));update();
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
