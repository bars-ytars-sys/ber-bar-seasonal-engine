/* Visible previews complement the existing swipe/lightbox gallery. */
(()=>{
 'use strict';
 function mount(){
  for(const gallery of document.querySelectorAll('.bp-bath-gallery [data-bp-media]')){
   const track=gallery.querySelector('.bp-media__track'),buttons=[...gallery.querySelectorAll('[data-bp-thumb]')],caption=gallery.querySelector('[data-bp-caption]');
   const section=gallery.closest('.bp-bath-gallery'),inner=section.querySelector('.bp-bath-gallery__inner'),native=document.querySelector('#'+section.dataset.houseRecord+' [data-elem-type="gallery"]');
   if(native){
    let layoutFrame;
    const align=()=>{cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(()=>{
     const rect=native.getBoundingClientRect(),client=document.documentElement.clientWidth,desktop=matchMedia('(min-width:960px)').matches;
     const width=desktop?client-2*rect.left:rect.width;if(width<200||width>client||rect.width<=0)return;
     inner.style.width=width+'px';inner.style.maxWidth='none';
     const gap=width-2*rect.width;inner.style.columnGap=desktop?Math.max(0,Math.min(40,gap))+'px':'0px';
    });};
    if('ResizeObserver'in window){const observer=new ResizeObserver(align);observer.observe(native);observer.observe(native.closest('.t396__artboard'));}
    window.addEventListener('resize',align);window.addEventListener('load',align);document.fonts?.ready.then(align);align();
   }
   let frame;
   const update=()=>{const current=Math.max(0,Math.min(buttons.length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===current)));if(caption)caption.textContent=buttons[current]?.dataset.caption||'';};
   buttons.forEach((button,i)=>button.addEventListener('click',()=>track.scrollTo({left:i*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})));
   track.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);},{passive:true});update();
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
