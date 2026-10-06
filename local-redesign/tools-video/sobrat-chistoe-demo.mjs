// Сборка чистого, логичного и красивого первого экрана «Барских полей»
// 1. Полноэкранное видео дома (H.264 mp4, webm, mobile mp4) с постером-подложкой.
// 2. Все элементы «Барских полей» строго по центру:
//    - иконка-елочка
//    - заголовок «УЮТНАЯ БАЗА ОТДЫХА В ПОДМОСКОВЬЕ» (фирменный стиль БП)
//    - тонкий разделитель
//    - описание «Дома с банным чаном у террасы, в часе от Москвы по Новой Риге»
//    - цена «Дом от 9 900 ₽ за ночь в будни» + правила
//    - кнопки «Проверить даты» (акцентная) и «Пройди опрос — получи сертификат»
//    - медали в ряд: ТОП-30 отелей, Хорошее место Яндекс 2026, Сплит оплата частями
// 3. Непрерывная плавная полоска категорий домов (Шале, Барский дом, Барнхаус, Гарден, Ривер).
// 4. Далее — исходные «Барские поля» без изменений.

import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/ASON/Desktop/Ber&Bar';
const file = path.join(root, 'prevyu/lid/bp-glavnaya.html');
const backup = file.replace(/\.html$/, '.before-poloska.html');

if (!fs.existsSync(backup)) {
  fs.copyFileSync(file, backup);
}
let html = fs.readFileSync(backup, 'utf8');

const PUBLIC = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine';
const PUBLIC_ASSETS = PUBLIC + '/demo/assets/';
const LOCAL_ASSETS = '../../demo/assets/';

/* ---------- 1. Чистый блок первого экрана ---------- */
const heroHtml = `<!-- BP-HERO-FULLSCREEN:START -->
<div id="rec1538220631" class="r t-rec bp-hero-record" data-record-type="396">
  <div class="bp-hero">
    <!-- Фоновое панорамное видео дома -->
    <div class="bp-hero__bg">
      <video class="bp-hero__video" autoplay muted loop playsinline webkit-playsinline preload="auto"
        poster="${PUBLIC_ASSETS}bp-barski-poster.webp"
        data-desktop-mp4="${PUBLIC_ASSETS}bp-hero-barski.mp4"
        data-desktop-webm="${PUBLIC_ASSETS}bp-hero-barski.webm"
        data-mobile-mp4="${PUBLIC_ASSETS}bp-hero-barski-mobile.mp4"
        aria-label="Панорамное видео Барского дома">
        <source src="${PUBLIC_ASSETS}bp-hero-barski.webm" type="video/webm">
        <source src="${PUBLIC_ASSETS}bp-hero-barski.mp4" type="video/mp4">
      </video>
      <div class="bp-hero__scrim"></div>
    </div>

    <!-- Контент строго по центру -->
    <div class="bp-hero__content">
      <!-- Елочка БП -->
      <div class="bp-hero__logo-icon" aria-hidden="true">
        <svg width="44" height="42" viewBox="0 0 56 53" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M28 2L14 18H23L11 32H22L7 49H49L34 32H45L33 18H42L28 2Z" stroke="#eed5d5" stroke-width="2.2" stroke-linejoin="round"/>
        </svg>
      </div>

      <!-- Главный заголовок -->
      <h1 class="bp-hero__title">
        УЮТНАЯ БАЗА ОТДЫХА<br>В ПОДМОСКОВЬЕ
      </h1>

      <!-- Деликатный разделитель -->
      <div class="bp-hero__divider" aria-hidden="true"></div>

      <!-- Описание базы -->
      <p class="bp-hero__lead">
        Дома с банным чаном у террасы, в часе от Москвы по Новой Риге
      </p>

      <!-- Стоимость и условия -->
      <div class="bp-hero__price-box">
        <div class="bp-hero__price-val">Дом от 9 900 ₽ за ночь в будни</div>
        <div class="bp-hero__price-sub">Пт и сб от 2 ночей · предоплата 50% · Бесплатная отмена за 7 дней</div>
      </div>

      <!-- Кнопки действия -->
      <div class="bp-hero__actions">
        <a href="/booking" class="bp-hero__btn bp-hero__btn--primary" data-tilda-event-name="/tilda/click/rec1538220631/button1752664467008">
          <svg class="bp-hero__btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2L6 9h3.5L5 15h4L4 21h16l-5-6h4l-4.5-6H18L12 2z"/>
          </svg>
          <span>Проверить даты</span>
        </a>
        <a href="#popup:quiz" class="bp-hero__btn bp-hero__btn--quiz" data-tilda-event-name="/tilda/click/rec1538220631/button1753688417167">
          <span>Пройди опрос — получи сертификат</span>
        </a>
      </div>

      <!-- Медали доверия в ряд -->
      <div class="bp-hero__medals">
        <div class="bp-hero__medal" title="ТОП-30 отелей по версии Siva Travel">
          <img src="${PUBLIC_ASSETS}znachki/medali/top30.png" alt="ТОП-30 отелей">
        </div>
        <a href="https://yandex.ru/maps/1/moscow-and-moscow-oblast/?ll=36.479899%2C56.097167&mode=poi&poi%5Bpoint%5D=36.469182%2C56.095332&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D218830724182&source=serp_navig&tab=reviews&utm_source=share&z=15" target="_blank" rel="noopener" class="bp-hero__medal" title="Хорошее место 2026 Яндекса">
          <img src="${PUBLIC_ASSETS}znachki/medali/mesto.png" alt="Хорошее место Яндекс 2026">
        </a>
        <a href="/split" class="bp-hero__medal" title="Оплата частями через Яндекс Сплит">
          <img src="${PUBLIC_ASSETS}znachki/medali/split.png" alt="Яндекс Сплит">
        </a>
      </div>
    </div>
  </div>
</div>
<!-- BP-HERO-FULLSCREEN:END -->

<style id="bp-hero-custom-style">
.bp-hero-record {
  padding: 0 !important;
  background-color: #14221d !important;
  overflow: hidden !important;
}
.bp-hero {
  position: relative;
  min-height: 82svh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 100px 20px 60px;
  box-sizing: border-box;
  overflow: hidden;
}
@media (min-width: 960px) {
  .bp-hero {
    min-height: 740px;
    padding: 110px 32px 70px;
  }
}
.bp-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.bp-hero__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 48%;
  display: block;
}
.bp-hero__scrim {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(16, 28, 22, 0.70) 0%, rgba(16, 28, 22, 0.50) 50%, rgba(16, 28, 22, 0.28) 100%),
              linear-gradient(180deg, rgba(16, 28, 22, 0.45) 0%, rgba(16, 28, 22, 0.12) 30%, rgba(16, 28, 22, 0.70) 100%);
}
.bp-hero__content {
  position: relative;
  z-index: 2;
  max-width: 840px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.bp-hero__logo-icon {
  margin-bottom: 12px;
  opacity: 0.92;
}
.bp-hero__title {
  font-family: 'Forum', 'Playfair Display', 'Cormorant Garamond', 'Georgia', serif;
  font-size: 42px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #eed5d5;
  margin: 0 0 16px;
  text-shadow: 0 2px 22px rgba(0,0,0,0.7);
}
@media (max-width: 640px) {
  .bp-hero__title {
    font-size: 26px;
    line-height: 1.2;
    letter-spacing: 0.04em;
    margin-bottom: 12px;
  }
}
.bp-hero__divider {
  width: 220px;
  height: 1px;
  background: rgba(238, 213, 213, 0.38);
  margin: 0 auto 16px;
}
.bp-hero__lead {
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: #f4eee0;
  margin: 0 0 16px;
  max-width: 640px;
  text-shadow: 0 1px 12px rgba(0,0,0,0.7);
}
@media (max-width: 640px) {
  .bp-hero__lead {
    font-size: 14px;
    line-height: 1.45;
    margin-bottom: 14px;
  }
}
.bp-hero__price-box {
  margin-bottom: 22px;
  text-shadow: 0 1px 12px rgba(0,0,0,0.7);
}
.bp-hero__price-val {
  font-family: 'Montserrat', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #e58e58;
  margin-bottom: 4px;
}
@media (max-width: 640px) {
  .bp-hero__price-val {
    font-size: 17px;
  }
}
.bp-hero__price-sub {
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(244, 238, 224, 0.88);
}
@media (max-width: 640px) {
  .bp-hero__price-sub {
    font-size: 12px;
  }
}
.bp-hero__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 11px;
  width: 100%;
  max-width: 320px;
  margin-bottom: 28px;
}
.bp-hero__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 24px;
  border-radius: 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
  cursor: pointer;
}
.bp-hero__btn--primary {
  background: #a85c32;
  color: #fff !important;
  box-shadow: 0 4px 18px rgba(168, 92, 50, 0.35);
}
.bp-hero__btn--primary:hover {
  background: #bc6b3c;
  transform: translateY(-1px);
}
.bp-hero__btn--quiz {
  background: #f3ede2;
  color: #7b4a24 !important;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18);
}
.bp-hero__btn--quiz:hover {
  background: #fff8ee;
  transform: translateY(-1px);
}
.bp-hero__medals {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.bp-hero__medal {
  display: inline-block;
  width: 84px;
  height: 84px;
  transition: transform 0.2s ease;
}
.bp-hero__medal:hover {
  transform: scale(1.06);
}
.bp-hero__medal img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
@media (max-width: 640px) {
  .bp-hero__medal {
    width: 72px;
    height: 72px;
    gap: 10px;
  }
}
</style>

<script id="bp-hero-video-init">
(function() {
  var v = document.querySelector('.bp-hero__video');
  if (!v) return;

  var prefersReduced = false;
  try {
    prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches
      || !!navigator.connection?.saveData
      || /^(2g|slow-2g|3g)$/.test(navigator.connection?.effectiveType || '');
  } catch(e) {}

  if (prefersReduced) {
    v.setAttribute('preload', 'none');
    return;
  }

  var isMobile = matchMedia('(max-width: 640px)').matches;
  if (isMobile) {
    var mobSrc = v.getAttribute('data-mobile-mp4');
    if (mobSrc) {
      v.src = mobSrc;
    }
  }

  var playPromise = v.play();
  if (playPromise && playPromise.catch) {
    playPromise.catch(function() {});
  }
})();
</script>`;

/* Заменяем старый блок rec1538220631 на новый чистый блок */
const recStart = html.indexOf('<div id="rec1538220631"');
if (recStart < 0) throw new Error('Не найден блок rec1538220631 в шаблоне');

// Ищем конец записи rec1538220631: следующий t-rec или <!--/record-->
const recNext = html.indexOf('<div id="rec2806976901"', recStart);
if (recNext < 0) throw new Error('Не найден следующий блок rec2806976901');

html = html.slice(0, recStart) + heroHtml + '\n' + html.slice(recNext);
console.log(' + Первый экран полностью заменен на чистый полноэкранный hero с центрированием');

/* ---------- 2. Полоска категорий перед rec3545323801 ---------- */
const stripCards = [
  { name: 'Шале', guests: 5, href: 'https://barskie-polya.ru/chalet', photo: 'znachki/kategoriya-shale.webp' },
  { name: 'Барский дом', guests: 6, href: 'https://barskie-polya.ru/barski', photo: 'znachki/kategoriya-barskij-dom.webp' },
  { name: 'Барнхаус', guests: 6, href: 'https://barskie-polya.ru/barnhauses', photo: 'znachki/kategoriya-barnhaus.webp' },
  { name: 'Гарден', guests: 4, href: 'https://barskie-polya.ru/gardens', photo: 'znachki/kategoriya-garden.webp' },
  { name: 'Ривер', guests: 4, href: 'https://barskie-polya.ru/rivers', photo: 'znachki/kategoriya-river.webp' },
];
const card = (c, hidden) => `<li class="bb-poloska__punkt"${hidden ? ' aria-hidden="true"' : ''}>`
  + `<a class="bb-poloska__karta" href="${c.href}"${hidden ? ' tabindex="-1"' : ''}>`
  + `<img class="bb-poloska__foto" src="${PUBLIC_ASSETS}${c.photo}" `
  + `onerror="this.onerror=null;this.src='${LOCAL_ASSETS}${c.photo}'" `
  + `width="44" height="44" loading="lazy" decoding="async" alt="">`
  + `<b class="bb-poloska__nazvanie">${c.name}</b>`
  + `<span class="bb-poloska__gosti">до ${c.guests} гостей</span>`
  + `<span class="bb-poloska__strelka" aria-hidden="true">→</span></a></li>`;

const strip = `<!-- BB-POLOSKA:START — полоска категорий домов «Барских полей» -->
<section id="bb-poloska" class="bb-poloska" aria-labelledby="bb-poloska-titul">
<h2 id="bb-poloska-titul" class="bb-poloska__titul">Категории домов «Барских полей»</h2>
<div class="bb-poloska__okno">
<ul class="bb-poloska__lenta">
${stripCards.map((c) => card(c, false)).join('\n')}
${stripCards.map((c) => card(c, true)).join('\n')}
</ul>
</div>
<p class="bb-poloska__podskazka">Лента движется сама. Наведите курсор, чтобы остановить и выбрать дом.</p>
</section>
<style>
#bb-poloska{position:relative;overflow:hidden;background-color:#14221d;padding:22px 0 10px;font-family:'Rubik',Arial,sans-serif}
#bb-poloska .bb-poloska__titul{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
#bb-poloska .bb-poloska__okno{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 4%,#000 96%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 4%,#000 96%,transparent 100%)}
#bb-poloska .bb-poloska__lenta{display:flex;align-items:center;gap:12px;width:max-content;margin:0;padding:0 24px;list-style:none;animation:bb-poloska-hod 45s linear infinite;will-change:transform}
#bb-poloska .bb-poloska__punkt{flex:0 0 auto;margin:0;padding:0;list-style:none}
#bb-poloska .bb-poloska__karta{display:flex;align-items:center;gap:11px;padding:6px 16px 6px 7px;border-radius:999px;background-color:rgba(238,229,213,.07);border:1px solid rgba(238,229,213,.16);box-shadow:0 2px 10px rgba(12,22,18,.18);color:#eee5d5;text-decoration:none;white-space:nowrap;transition:background-color .25s ease,border-color .25s ease}
#bb-poloska .bb-poloska__karta:hover{background-color:rgba(238,229,213,.12);border-color:rgba(238,229,213,.28)}
#bb-poloska .bb-poloska__foto{width:44px;height:44px;border-radius:50%;object-fit:cover;flex:0 0 44px;display:block;background-color:#28413a}
#bb-poloska .bb-poloska__nazvanie{font-size:15px;font-weight:500;line-height:1.2;color:#eee5d5}
#bb-poloska .bb-poloska__gosti{font-size:12.5px;color:rgba(238,229,213,.72)}
#bb-poloska .bb-poloska__strelka{font-size:14px;color:rgba(238,229,213,.5)}
#bb-poloska .bb-poloska__podskazka{max-width:1200px;margin:10px auto 0;padding:0 24px;font-size:12px;line-height:1.5;color:rgba(238,229,213,.55)}
@keyframes bb-poloska-hod{from{transform:translate3d(0,0,0)}to{transform:translate3d(calc(-50% - 6px),0,0)}}
@media (hover:hover) and (pointer:fine){
 #bb-poloska .bb-poloska__okno:hover .bb-poloska__lenta,
 #bb-poloska .bb-poloska__okno:focus-within .bb-poloska__lenta{animation-play-state:paused}
}
@media (max-width:639px){
 #bb-poloska{padding-top:18px}
 #bb-poloska .bb-poloska__okno{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:none}
 #bb-poloska .bb-poloska__okno::-webkit-scrollbar{display:none}
 #bb-poloska .bb-poloska__lenta{padding:0 16px}
}
@media (prefers-reduced-motion:reduce){
 #bb-poloska .bb-poloska__lenta{animation:none;transform:none}
 #bb-poloska .bb-poloska__okno{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;mask-image:none;-webkit-mask-image:none;scrollbar-width:none}
 #bb-poloska .bb-poloska__karta{transition:none}
}
</style>
<script>
(function(){
 var sekciya=document.getElementById('bb-poloska'); if(!sekciya) return;
 var lenta=sekciya.querySelector('.bb-poloska__lenta'), okno=sekciya.querySelector('.bb-poloska__okno');
 if(!lenta||!okno) return;
 function nastroit(){ var n=lenta.scrollWidth/2; if(n>0) lenta.style.animationDuration=Math.max(20,Math.round(n*45/1200))+'s'; }
 nastroit(); addEventListener('resize',nastroit,{passive:true});
 var taymer=null;
 function priostanovit(){ lenta.style.animationPlayState='paused'; if(taymer) clearTimeout(taymer); }
 function prodolzhit(){ if(taymer) clearTimeout(taymer); taymer=setTimeout(function(){ lenta.style.animationPlayState=''; },2500); }
 ['touchstart','pointerdown','scroll','wheel'].forEach(function(e){ okno.addEventListener(e,priostanovit,{passive:true}); });
 ['touchend','pointerup','touchcancel','pointercancel','scrollend'].forEach(function(e){ okno.addEventListener(e,prodolzhit,{passive:true}); });
})();
</script>
<!-- BB-POLOSKA:END -->`;

if (!html.includes('BB-POLOSKA:START')) {
  // Вставляем полоску категорий СРАЗУ ПОСЛЕ блока первого экрана
  const marker = '<!-- BP-HERO-FULLSCREEN:END -->';
  const at = html.indexOf(marker);
  if (at < 0) throw new Error('не нашёл маркер конца первого экрана BP-HERO-FULLSCREEN:END');
  const insertPos = at + marker.length;
  html = html.slice(0, insertPos) + '\n' + strip + '\n' + html.slice(insertPos);
  console.log(' + Полоска категорий вставлена сразу после первого экрана');
}

/* ---------- 3. Порядок блоков на телефоне (скрипт Tilda) ---------- */
const oldPoryadok = `  function порядок() {
    if (!тел()) return;
    var герой = $('rec1538220631'), нов = $('bp-doma'), дома = (нов && нов.closest('.r')) || $('rec2241691831'), р = document.querySelector('.рейтинг-моб');
    if (герой && !р) {
      р = document.createElement('a');
      р.className = 'рейтинг-моб';
      р.href = 'https://yandex.ru/maps/org/barskiye_polya/218830724182/reviews/';
      р.target = '_blank'; р.rel = 'noopener';
      р.innerHTML = '<b>5,0 ★</b><span>636 оценок · Хорошее место 2026 на Яндекс Картах</span>';
      герой.parentNode.insertBefore(р, герой.nextSibling);
    }
    // акции (3 карточки) лентой сразу под рейтингом, дома за ними (владелец 25.09: «акции верни»)
    var ак = $('rec3545323801'), после = р;
    if (ак && после && после.nextElementSibling !== ак) после.parentNode.insertBefore(ак, после.nextSibling);
    if (ак) после = ак;
    if (после && дома && после.nextElementSibling !== дома) после.parentNode.insertBefore(дома, после.nextSibling);
  }`;

const newPoryadok = `  function порядок() {
    if (!тел()) return;
    var герой = $('rec1538220631'), полоска = $('bb-poloska'), нов = $('bp-doma'), дома = (нов && нов.closest('.r')) || $('rec2241691831'), р = document.querySelector('.рейтинг-моб');
    if (герой && полоска && герой.nextElementSibling !== полоска) {
      герой.parentNode.insertBefore(полоска, герой.nextSibling);
    }
    var после = полоска || герой;
    if (после && !р) {
      р = document.createElement('a');
      р.className = 'рейтинг-моб';
      р.href = 'https://yandex.ru/maps/org/barskiye_polya/218830724182/reviews/';
      р.target = '_blank'; р.rel = 'noopener';
      р.innerHTML = '<b>5,0 ★</b><span>636 оценок · Хорошее место 2026 на Яндекс Картах</span>';
      после.parentNode.insertBefore(р, после.nextSibling);
    }
    if (р) после = р;
    var ак = $('rec3545323801');
    if (ак && после && после.nextElementSibling !== ак) после.parentNode.insertBefore(ак, после.nextSibling);
    if (ак) после = ак;
    if (после && дома && после.nextElementSibling !== дома) после.parentNode.insertBefore(дома, после.nextSibling);
  }`;

if (html.includes(oldPoryadok)) {
  html = html.replace(oldPoryadok, newPoryadok);
  console.log(' + Мобильный порядок блоков обновлен');
}

fs.writeFileSync(file, html, 'utf8');
console.log(`Успешно собрано в ${file} (${html.length} байт)`);
