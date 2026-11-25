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
 }
 const map=document.getElementById('br-review-map-details');
 if(map)map.addEventListener('toggle',()=>{
  map.querySelector('summary>span').innerHTML=(map.open?'Свернуть карту':'Развернуть карту')+' <span aria-hidden="true">↗︎</span>';
  if(map.open&&typeof window.t396_doResize==='function')requestAnimationFrame(()=>window.t396_doResize('2856176101'));
 });
 const activities = document.getElementById('br-other-activities');
 const activitiesToggle = document.querySelector('[aria-controls="br-other-activities"]');
 if (activities && activitiesToggle) {
  activitiesToggle.addEventListener('click', () => {
   const opening = activities.hidden;
   activities.hidden = !opening;
   activitiesToggle.setAttribute('aria-expanded', String(opening));
   if (opening && activities.getBoundingClientRect().top > window.innerHeight * .8) {
    activities.scrollIntoView({ block: 'start' });
   }
  });
 }
})();
