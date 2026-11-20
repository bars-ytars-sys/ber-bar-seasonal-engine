/* BP PLANNER SCROLL 20261120: one cancellable, consistent scroll on Safari/Chrome. */
let cancelPlannerScroll=()=>{};
function scrollToPlanner(){
 cancelPlannerScroll();
 const from=window.scrollY,margin=parseFloat(getComputedStyle(section).scrollMarginTop)||0;
 const top=Math.max(0,Math.min(section.getBoundingClientRect().top+from-margin,document.documentElement.scrollHeight-innerHeight));
 const distance=top-from;
 if(matchMedia('(prefers-reduced-motion:reduce)').matches||Math.abs(distance)<2){window.scrollTo({top,behavior:'instant'});return;}
 const duration=Math.min(850,Math.max(600,Math.abs(distance)*.8)),started=performance.now();
 let frame=0,stopped=false;
 const events=['wheel','touchstart','pointerdown'];
 function stop(){
  if(stopped)return;stopped=true;cancelAnimationFrame(frame);
  for(const name of events)window.removeEventListener(name,stop,true);
  window.removeEventListener('keydown',key,true);cancelPlannerScroll=()=>{};
 }
 function key(e){if(['Escape','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))stop();}
 function tick(now){
  if(stopped)return;
  const t=Math.min(1,(now-started)/duration),eased=t*t*(3-2*t);
  window.scrollTo({top:from+distance*eased,behavior:'instant'});
  if(t<1)frame=requestAnimationFrame(tick);else stop();
 }
 for(const name of events)window.addEventListener(name,stop,{capture:true,passive:true});
 window.addEventListener('keydown',key,true);cancelPlannerScroll=stop;frame=requestAnimationFrame(tick);
}
