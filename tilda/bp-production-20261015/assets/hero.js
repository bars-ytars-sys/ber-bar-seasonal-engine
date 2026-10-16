(()=>{const v=document.querySelector('.bp-hero__video'),hero=document.querySelector('.bp-hero-record');if(!v||!hero)return;
const mobile=matchMedia('(max-width:640px)').matches,assets='https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/';
v.poster=assets+'bp-hero-new-houses-20261010'+(mobile?'-mobile':'')+'-poster.webp';hero.querySelector('.bp-hero__bg').style.backgroundImage='url("'+v.poster+'")';
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches,save=navigator.connection?.saveData;
if(!reduced&&!save){v.src=assets+'bp-hero-new-houses-20261010'+(mobile?'-mobile':'')+'.mp4';v.play().catch(()=>{});}
let inView=true;function playback(){if(!v.src)return;if(document.hidden||!inView)v.pause();else v.play().catch(()=>{});}
if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;document.body.classList.toggle('bp-hero-in-view',inView);playback();}).observe(hero);
document.addEventListener('visibilitychange',playback);
function sync(){const header=document.querySelector('#rec1185050691 .t396__artboard'),nav=document.querySelector('.t975');const h=header?.getBoundingClientRect().height||76,b=nav&&getComputedStyle(nav).display!=='none'?nav.getBoundingClientRect().height:0;document.documentElement.style.setProperty('--bp-screen',innerHeight+'px');document.documentElement.style.setProperty('--bp-header-height',h+'px');document.documentElement.style.setProperty('--bp-bottom-height',b+'px');}
window.addEventListener('resize',sync);window.addEventListener('load',sync);sync();})();