const reduced=matchMedia('(prefers-reduced-motion:reduce)'),phone=matchMedia('(max-width:640px)');
const SPRING='cubic-bezier(.34,1.45,.64,1)',EASE='cubic-bezier(.22,1,.36,1)',running=new WeakMap();
function stop(el){running.get(el)?.cancel();running.delete(el);el.style.transform=''}
function play(el,frames,duration=450,easing=EASE){
 if(!el||reduced.matches)return Promise.resolve();stop(el);
 const a=el.animate(frames,{duration,easing});running.set(el,a);
 return a.finished.catch(()=>{}).finally(()=>{if(running.get(el)===a)running.delete(el)});
}
let lastScreen=null;
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('fx-in');observer.unobserve(e.target)}},{threshold:.08,rootMargin:'0px 0px -6% 0px'});
export const motion={
 stop,
 screen(screen,mobile){const before=lastScreen;lastScreen=screen;if(!mobile||before===screen||before===null)return;const order=['home','food','services','guide','map','reviews'],dir=order.indexOf(screen)>=order.indexOf(before)?1:-1;play(document.querySelector('.page'),[{opacity:0,transform:`translateX(${36*dir}px)`},{opacity:1,transform:'translateX(0)'}],480)},
 context(){play(document.querySelector('#quick'),[{opacity:0,transform:'translateX(24px)'},{opacity:1,transform:'translateX(0)'}],480)},
 reveal(nodes){if(reduced.matches)return;[...nodes].forEach((el,i)=>{if(el.classList.contains('fx-reveal'))return;el.classList.add('fx-reveal');el.style.setProperty('--reveal-delay',Math.min(i,5)*65+'ms');observer.observe(el)})},
 sheetOpen(el,replaced){el.style.transform='';if(replaced){play(document.querySelector('#sheet-body'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],320);return}play(el,phone.matches?[{transform:'translateY(100%)',opacity:.5},{transform:'translateY(0)',opacity:1}]:[{transform:'translateY(24px) scale(.97)',opacity:0},{transform:'translateY(0) scale(1)',opacity:1}],550,SPRING)},
 sheetClose(el){const start=getComputedStyle(el).transform;el.style.transform='';return play(el,phone.matches?[{transform:start==='none'?'translateY(0)':start,opacity:1},{transform:'translateY(100%)',opacity:.2}]:[{transform:'translateY(0)',opacity:1},{transform:'translateY(20px)',opacity:0}],240,EASE)},
 cart(){const el=document.querySelector('#cart-panel');if(!el.hidden)play(el,[{transform:'translateY(12px) scale(.98)',opacity:.6},{transform:'translateY(0) scale(1)',opacity:1}],380,SPRING)}
};

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
export function initExperience(api){
 const page=document.querySelector('.page'),sheet=document.querySelector('#sheet'),cart=document.querySelector('#cart-panel'),food=document.querySelector('#food');
 const themeButton=document.querySelector('#theme-toggle'),head=document.querySelector('.masthead-right');head.insertBefore(themeButton,head.querySelector('[data-contact]'));
 function setTheme(value,animate=false){document.documentElement.dataset.theme=value;themeButton.setAttribute('aria-label',value==='dark'?'Включить светлую тему':'Включить тёмную тему');themeButton.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">${value==='dark'?'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>':'<path d="M20 14a8 8 0 0 1-10-10 8.5 8.5 0 1 0 10 10z"/>'}</svg>`;if(animate){document.documentElement.classList.add('theme-changing');setTimeout(()=>document.documentElement.classList.remove('theme-changing'),420)}}
 setTheme(read('bp-guest-theme','light')==='dark'?'dark':'light');themeButton.onclick=()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(next,true);save('bp-guest-theme',next)};
 function moveCart(){if(phone.matches){if(cart.parentElement!==document.body)document.body.insertBefore(cart,document.querySelector('.mobile-nav'))}else if(cart.parentElement!==food)food.append(cart)}
 moveCart();phone.addEventListener('change',moveCart);
 document.addEventListener('pointerdown',e=>{if(reduced.matches)return;const b=e.target.closest('.primary-button,.outline-button,.house-choice,.chips button,.shortcuts>*,.theme-toggle');if(!b||b.disabled)return;const r=b.getBoundingClientRect(),size=Math.max(r.width,r.height),s=document.createElement('span');s.className='fx-ripple';s.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-r.left-size/2}px;top:${e.clientY-r.top-size/2}px`;b.append(s);setTimeout(()=>s.remove(),650)});
 document.addEventListener('toggle',e=>{if(e.target.matches?.('#guide details')&&e.target.open)play(e.target.querySelector('ul'),[{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'translateY(0)'}],300)},true);
 let drag=null;sheet.addEventListener('pointerdown',e=>{if(!phone.matches||!e.target.closest('.sheet-grip'))return;motion.stop(sheet);drag={y:e.clientY,time:performance.now()};sheet.setPointerCapture(e.pointerId)});
 sheet.addEventListener('pointermove',e=>{if(drag)sheet.style.transform=`translateY(${Math.max(0,e.clientY-drag.y)}px)`});
 function endDrag(e){if(!drag)return;const dy=Math.max(0,e.clientY-drag.y),v=dy/Math.max(1,performance.now()-drag.time);drag=null;if(dy>110||dy>35&&v>.65)api.close();else{sheet.style.transform='';play(sheet,[{transform:`translateY(${dy}px)`},{transform:'translateY(0)'}],350,SPRING)}}
 sheet.addEventListener('pointerup',endDrag);sheet.addEventListener('pointercancel',()=>{drag=null;sheet.style.transform=''});
 let swipe=null;page.addEventListener('pointerdown',e=>{if(!phone.matches||e.clientX<24||document.querySelector('dialog[open]')||e.target.closest('input,textarea,select,button,a,.chips,.service-grid,.guest-stories,.map-card'))return;swipe={x:e.clientX,y:e.clientY}});
 page.addEventListener('pointerup',e=>{if(!swipe)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;swipe=null;if(Math.abs(dx)<70||Math.abs(dy)>45)return;const screens=['home','food','services','guide'],i=screens.indexOf(document.body.dataset.mobileScreen),next=Math.max(0,Math.min(3,i+(dx<0?1:-1)));if(i>=0&&next!==i)location.hash=screens[next]});page.addEventListener('pointercancel',()=>swipe=null);
 let phase=document.body.dataset.stayPhase;document.addEventListener('bp:context',()=>{if(phase!==document.body.dataset.stayPhase){motion.context();phase=document.body.dataset.stayPhase}renderStories();motion.reveal(document.querySelectorAll('#quick .quick-card'))});
 motion.reveal(document.querySelectorAll('#quick .quick-card,.shortcuts>*'));play(document.querySelector('.guest-hero'),[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],700);

 const strip=document.querySelector('#guest-stories'),story=document.querySelector('#story-view'),progress=document.querySelector('#story-progress'),body=document.querySelector('#story-body');
 const topics={wifi:['Wi-Fi','wifi','wifi'],house:['В доме','home','guide'],banya:['Баня','bath','services'],fire:['Мангал','leaf','guide'],area:['Карта','map','map'],food:['Еда','food','food'],road:['Дорога','map','guide'],check:['Заезд','clock','guide'],rules:['Правила','book','guide'],pets:['Питомцы','heart','guide'],around:['Рядом','leaf','guide'],reviews:['Отзыв','heart','reviews']};
 let seen=read('bp-guest-seen',[]);if(!Array.isArray(seen))seen=[];
 let current=null,slides=[],slide=0,timer=null,storyToken=0,storyReturn=null,holdTimer=null,press=null;
 function renderStories(){const ids=document.body.dataset.stayPhase==='pre'?['road','check','rules','pets','around','food']:['wifi','house','banya','fire','area','food','reviews'];strip.innerHTML=ids.map((id,i)=>`<button class="guest-story ${seen.includes(id)?'seen':''}" style="--story-index:${i}" data-story="${id}" aria-label="Памятка: ${topics[id][0]}"><span class="story-ring"><span>${api.icon(topics[id][1])}</span></span><span>${topics[id][0]}</span></button>`).join('')}
 renderStories();strip.onclick=e=>{const b=e.target.closest('[data-story]');if(b)openStory(b.dataset.story)};
 function openStory(id){current=id;storyReturn=document.activeElement;const section=id==='reviews'?{title:'После отдыха',items:['Поделитесь впечатлениями о «Барских полях». Ваш отзыв поможет другим гостям познакомиться с базой.']}:api.sections().find(s=>s.id===id);if(!section)return;slides=[];for(let i=0;i<section.items.length;i+=2)slides.push(section.items.slice(i,i+2));slide=0;if(!seen.includes(id)){seen.push(id);save('bp-guest-seen',seen)}if(!story.open)story.showModal();document.body.classList.add('modal-open');story.scrollTop=0;play(story,[{opacity:0,transform:'translateY(30px) scale(.96)',borderRadius:'30px'},{opacity:1,transform:'translateY(0) scale(1)',borderRadius:'0'}],500,EASE);drawStory(section.title);renderStories()}
 function drawStory(title){const token=++storyToken;timer?.cancel();const name=title||body.querySelector('h2')?.textContent||'';progress.innerHTML=slides.map((_,i)=>`<i><b style="width:${i<slide?100:0}%"></b></i>`).join('');body.innerHTML=`<div class="story-symbol">${api.icon(topics[current][1])}</div><small>${esc(api.house()?.name||'Барские поля')}</small><h2>${esc(name)}</h2>${slides[slide].map(t=>`<p>${esc(t)}</p>`).join('')}`;document.querySelector('#story-count').textContent=`${slide+1} / ${slides.length}`;document.querySelector('#previous-story').disabled=slide===0;document.querySelector('#next-story').disabled=slide===slides.length-1;
 const action=document.querySelector('#story-action');action.textContent=current==='wifi'?'Уточнить сеть и пароль':current==='banya'?'Выбрать баню или чан':current==='food'?'Открыть меню':current==='area'?'Рассмотреть карту':current==='reviews'?'Оставить отзыв':'Открыть памятку';play(body,[{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],500);
 if(!reduced.matches){const duration=Math.max(5000,Math.min(11000,3000+slides[slide].join('').length/22*1000));timer=progress.children[slide].firstElementChild.animate([{width:'0%'},{width:'100%'}],{duration,easing:'linear',fill:'forwards'});timer.finished.then(()=>{if(token===storyToken&&story.open&&slide<slides.length-1){slide++;drawStory()}}).catch(()=>{})}
 }
 async function closeStory(){if(!story.open)return;const token=++storyToken;timer?.cancel();clearTimeout(holdTimer);await play(story,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.96) translateY(20px)'}],240);if(token!==storyToken)return;story.close();if(!sheet.open)document.body.classList.remove('modal-open');const focus=strip.querySelector(`[data-story="${current}"]`)||storyReturn;if(focus?.isConnected)focus.focus()}
 document.querySelector('#close-story').onclick=closeStory;story.addEventListener('cancel',e=>{e.preventDefault();closeStory()});
 function step(delta){const next=Math.max(0,Math.min(slides.length-1,slide+delta));if(next!==slide){slide=next;drawStory()}}
 document.querySelector('#previous-story').onclick=()=>step(-1);document.querySelector('#next-story').onclick=()=>step(1);
 document.querySelector('#story-action').onclick=async()=>{const id=current;await closeStory();if(id==='wifi')api.wifi();else location.hash=topics[id][2]};
 story.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}});
 body.addEventListener('pointerdown',e=>{press={x:e.clientX,y:e.clientY,time:performance.now(),held:false};holdTimer=setTimeout(()=>{if(press){press.held=true;timer?.pause()}},220)});
 body.addEventListener('pointerup',e=>{if(!press)return;clearTimeout(holdTimer);const dx=e.clientX-press.x,dy=e.clientY-press.y,p=press;press=null;if(dy>110){closeStory();return}if(Math.abs(dx)>70&&Math.abs(dy)<45){step(dx<0?1:-1);return}if(p.held){timer?.play();return}step(e.clientX<innerWidth*.35?-1:1)});
 body.addEventListener('pointercancel',()=>{clearTimeout(holdTimer);press=null;timer?.play()});
 document.addEventListener('visibilitychange',()=>{if(story.open&&timer){if(document.hidden)timer.pause();else if(!press?.held)timer.play()}});
}
