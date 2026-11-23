/* Scoped homepage interactions; no form, payment or booking interception. */
(()=>{
 'use strict';
 for(const visual of document.querySelectorAll('#br-house-cards .brh-house__visual')){
  const choices=[...visual.querySelectorAll('.brh-house__photos button')];if(choices.length<2)continue;
  const step=direction=>{const current=Math.max(0,choices.findIndex(b=>b.getAttribute('aria-pressed')==='true'));choices[(current+direction+choices.length)%choices.length].click();};
  for(const direction of [-1,1]){
   const button=document.createElement('button');button.type='button';button.className='br-review-photo-step';button.dataset.direction=direction;
   button.setAttribute('aria-label',direction<0?'Предыдущее фото дома':'Следующее фото дома');button.textContent=direction<0?'‹':'›';button.addEventListener('click',()=>step(direction));visual.append(button);
  }
  let start=null,ignoreClick=false;
  visual.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.target.closest('button'))return;start={x:e.clientX,y:e.clientY};ignoreClick=false;});
  visual.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4){ignoreClick=true;step(dx<0?1:-1);}});
  visual.addEventListener('pointercancel',()=>{start=null;});
  visual.addEventListener('click',e=>{if(ignoreClick){e.preventDefault();e.stopPropagation();ignoreClick=false;}},true);
 }
 const map=document.getElementById('br-review-map-details');
 if(map)map.addEventListener('toggle',()=>{
  map.querySelector('summary>span').innerHTML=(map.open?'Свернуть карту':'Развернуть карту')+' <span aria-hidden="true">↗︎</span>';
  if(map.open&&typeof window.t396_doResize==='function')requestAnimationFrame(()=>window.t396_doResize('2856176101'));
 });
})();
