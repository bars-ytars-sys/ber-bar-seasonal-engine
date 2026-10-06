// Достройка демо-страницы БП: первый экран с панорамным видео дома и непрерывная полоска категорий.
// Все вставки локальны и ограничены изменяемыми местами: блок видео в rec1538220631,
// подпись кнопки первого экрана, стили+поведение видео и новая секция перед сезонными предложениями (rec3545323801).
// Запуск: node local-redesign/tools-video/sobrat-bp-stranicu.mjs [--video <путь к mp4>]
import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/ASON/Desktop/Ber&Bar';
const file = path.join(root, 'prevyu/lid/bp-glavnaya.html');
const PUBLIC = 'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine';
const PUBLIC_ASSETS = PUBLIC + '/demo/assets/';
// На GitHub Pages страница лежит в /ber-bar-seasonal-engine/prevyu/lid/, поэтому «../../demo/...»
// уводит на боевой barskie-polya.ru и блокируется. Основной путь — абсолютный адрес публикации,
// локальный относительный остаётся запасным (нужен при просмотре из папки проекта).
const LOCAL_ASSETS = '../../demo/assets/';

const argIndex = process.argv.indexOf('--video');
const videoArg = argIndex > -1 ? process.argv[argIndex + 1] : null;

let html = fs.readFileSync(file, 'utf8');

// Правки уже применены — сначала откатываем к копии, чтобы сборка была повторяемой
const backup = file.replace(/\.html$/, '.before-poloska.html');
if (fs.existsSync(backup)) {
  html = fs.readFileSync(backup, 'utf8');
} else {
  fs.copyFileSync(file, backup);
}
const done = [];

/* ---------- 1. Первый экран: видео дома ---------- */
const videoRx = /<video class="bp-hero-video"[\s\S]*?<\/video>/;
if (!videoRx.test(html)) throw new Error('не нашёл видео первого экрана — разметка изменилась');
const videoBlock = `<div class="bb-hero-media">`
  + `<video class="bp-hero-video" muted loop playsinline webkit-playsinline preload="none" `
  + `poster="${PUBLIC_ASSETS}bp-barski-poster.webp" `
  + `data-bb-video data-poster="${PUBLIC_ASSETS}bp-barski-poster.webp" `
  + `data-poster-local="${LOCAL_ASSETS}bp-barski-poster.webp" `
  + `data-src="${PUBLIC_ASSETS}bp-hero-barski.mp4" data-src-local="${LOCAL_ASSETS}bp-hero-barski.mp4" `
  + `data-webm="${PUBLIC_ASSETS}bp-hero-barski.webm" data-webm-local="${LOCAL_ASSETS}bp-hero-barski.webm" `
  + `data-mobile="${PUBLIC_ASSETS}bp-hero-barski-mobile.mp4" data-mobile-local="${LOCAL_ASSETS}bp-hero-barski-mobile.mp4" `
  + `aria-label="Барский дом — плавная панорама вдоль фасада"></video>`
  + `<span class="bb-hero-scrim" aria-hidden="true"></span>`
  + `</div>`;
html = html.replace(videoRx, videoBlock);
done.push('первый экран: видео собрано из одного источника с кадром-подложкой, затемнение и поведение — отдельным слоем');

/* ---------- 2. Заметная кнопка «Проверить даты» ---------- */
const oldButton = '<span class="tn-atom__button-text">Онлайн-подбор дома</span>';
if (!html.includes(oldButton)) throw new Error('не нашёл подпись первой кнопки');
html = html.replace(oldButton, '<span class="tn-atom__button-text">Проверить даты</span>');
done.push('кнопка первого экрана: «Онлайн-подбор дома» → «Проверить даты» (ссылка на /booking не менялась)');

/* ---------- 3. Стили и поведение первого экрана ---------- */
// Внутрь Tilda-блока ничего не добавляем: посторонняя разметка рвёт его стили и инициализацию.
// Стили и скрипт идут отдельным блоком в конце страницы.
// Размер подписи подобран так, чтобы блок с кнопками и медалями оставался в высоте первого экрана:
// подпись 13 px даёт тот же габарит колонки, что и прежние 10 px у Tilda, но читается на видео.
const heroStyle = `<style id="bb-hero-style">
#rec1538220631 .bb-hero-media{position:absolute;inset:0;overflow:hidden;background-color:#314c44}
#rec1538220631 .bp-hero-video{width:100%;height:100%;object-fit:cover;object-position:50% 50%;display:block;background-color:#314c44}
#rec1538220631 .bb-hero-scrim{position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(20,34,29,.10) 0%,rgba(20,34,29,.24) 52%,rgba(20,34,29,.52) 100%)}
/* Читаемость текста поверх видео: было 10 px без тени */
#rec1538220631 .tn-elem[data-elem-id="1752661976580"] .tn-atom{font-size:13px!important;line-height:1.5!important;color:#f4eee0!important;text-shadow:0 1px 14px rgba(16,28,24,.65),0 1px 3px rgba(16,28,24,.5)}
@media screen and (max-width:1199px){#rec1538220631 .tn-elem[data-elem-id="1752661976580"] .tn-atom{font-size:13px!important}}
@media screen and (max-width:959px){#rec1538220631 .tn-elem[data-elem-id="1752661976580"] .tn-atom{font-size:13.5px!important}}
@media screen and (max-width:639px){#rec1538220631 .tn-elem[data-elem-id="1752661976580"] .tn-atom{font-size:13.5px!important}}
@media screen and (max-width:479px){#rec1538220631 .tn-elem[data-elem-id="1752661976580"] .tn-atom{font-size:13px!important;line-height:1.55!important}}
/* Заголовок и главная кнопка держат первый экран */
#rec1538220631 .tn-elem[data-elem-id="1752662111713"] .tn-atom{text-shadow:0 2px 18px rgba(16,28,24,.5)}
#rec1538220631 .tn-elem[data-elem-id="1752664467008"] .tn-atom{font-weight:600;letter-spacing:.01em}
#rec1538220631 .tn-elem[data-elem-id="1752664467008"] .tn-atom:hover{filter:brightness(1.06)}
/* Высота артборда: Tilda считает её сама и не оставляет места медалям — задаём явно */
@media screen and (min-width:960px){
#rec1538220631 .t396__artboard,#rec1538220631 .t396__filter{height:720px!important;min-height:720px!important}
}
</style>`;

/* Медали и кнопки первого экрана: Tilda ставит их по data-field-top-value и своей высоте артборда.
   Правим сами значения, иначе на узком экране медали налезают на кнопку опроса,
   а на широком уходят под полоску категорий. */
for (const field of ['1774600646727000001', '1786039775754000001', '1785334752681000001']) {
  const before = html;
  const pattern = "(data-elem-id='" + field + "'[\\s\\S]{0,400}?data-field-top-value=\")\\d+(\")";
  html = html.replace(new RegExp(pattern), '$1520$2');
  if (html === before) throw new Error('не нашёл положение медали ' + field + ' в разметке');
}
// На телефоне медали стояли вплотную к кнопке опроса — опускаем их на 36 px
const medalTop = (field, attr, value) => {
  const before = html;
  const pattern = "(data-elem-id='" + field + "'[\\s\\S]{0,1200}?data-field-top-" + attr + '-value=")\\d+(")';
  html = html.replace(new RegExp(pattern), '$1' + value + '$2');
  if (html === before) throw new Error('не нашёл положение медали ' + field + ' (' + attr + ')');
};
for (const field of ['1774600646727000001', '1786039775754000001', '1785334752681000001']) {
  medalTop(field, 'res-320', 442);
  medalTop(field, 'res-480', 401);
}
done.push('на телефоне медали опущены на 36 px — от кнопки опроса есть зазор');
const btn = (id, value) => {
  const before = html;
  const pattern = "(data-elem-id='" + id + "'[\\s\\S]{0,300}?data-field-top-value=\")\\d+(\")";
  html = html.replace(new RegExp(pattern), '$1' + value + '$2');
  if (html === before) throw new Error('не нашёл положение кнопки ' + id + ' в разметке');
};
btn('1752664467008', 362);
btn('1753688417167', 412);
// Правки внутри группы кнопок делаем по её собственному фрагменту: глобальный regex
// уходил за границы группы и портил высоту артборда.
const groupRe = /<div\s+class="t396__group[\s\S]*?data-group-id="175368842804016170"[\s\S]*?<div\s+class="tn-molecule"/;
const groupMatch = groupRe.exec(html);
if (!groupMatch) throw new Error('не нашёл группу кнопок первого экрана');
const groupFix = (attr, value) => {
  const fixed = groupMatch[0].replace(new RegExp('(data-group-' + attr + '=")\\d+(")'), '$1' + value + '$2');
  if (fixed === groupMatch[0]) throw new Error('не нашёл data-group-' + attr + ' в группе кнопок');
  html = html.replace(groupMatch[0], fixed);
  groupMatch[0] = fixed;
};
groupFix('top-value', 362);
groupFix('top-res-320-value', 297);
groupFix('top-res-480-value', 247);
groupFix('top-res-640-value', 423);
groupFix('top-res-960-value', 311);
const per = (id, attr, value) => {
  const pattern = "(data-elem-id='" + id + "'[\\s\\S]{0,300}?data-field-top-" + attr + '-value=")\\d+(")';
  html = html.replace(new RegExp(pattern), '$1' + value + '$2');
};
for (const id of ['1752664467008', '1753688417167']) {
  per(id, 'res-320', id === '1752664467008' ? 297 : 347);
  per(id, 'res-480', id === '1752664467008' ? 247 : 297);
  per(id, 'res-640', 423);
  per(id, 'res-960', id === '1752664467008' ? 311 : 359);
}
done.push('первый экран: кнопки выше на 20 px, медали опущены до 520 px — пересечений нет');

/* Колонка текста выше артборда: поднимаем высоту всех брейкпоинтов, иначе медали уходят под полоску */
const artSel = /<div class="t396__artboard"[^>]*data-artboard-recid="1538220631"[^>]*>/;
const artTag = artSel.exec(html);
if (!artTag) throw new Error('не нашёл артборд первого экрана');
const heightFrom = /data-artboard-height="(\d+)"/.exec(artTag[0])?.[1];
const heightTo = String(Number(heightFrom ?? 580) + 120);
const artFixed = artTag[0]
  .replace('data-artboard-height="' + heightFrom + '"', 'data-artboard-height="' + heightTo + '"')
  .replace('data-artboard-height-res-320="1012"', 'data-artboard-height-res-320="1132"')
  .replace('data-artboard-height-res-480="924"', 'data-artboard-height-res-480="1044"')
  .replace('data-artboard-height-res-640="1320"', 'data-artboard-height-res-640="1440"')
  .replace('data-artboard-height-res-960="540"', 'data-artboard-height-res-960="660"');
html = html.replace(artTag[0], artFixed);
done.push('высота первого экрана увеличена: ' + heightFrom + ' -> ' + heightTo + ' px (и по всем брейкпоинтам)');
const heroScript = `<script id="bb-hero-script">(function(){
 var root=document.getElementById('rec1538220631'); if(!root) return;
 var v=root.querySelector('[data-bb-video]'); if(!v) return;
 var media=v.closest('.bb-hero-media');
 function toLocal(){ // опубликованный адрес не отдался — берём файл рядом со страницей
  if(v.dataset['bbLocal']) return;
  v.dataset['bbLocal']='1';
  [['data-poster-local','poster'],['data-src-local','src'],['data-mobile-local','data-mobile'],['data-webm-local','data-webm']].forEach(function(pair){
   var val=v.getAttribute(pair[0]); if(!val) return;
   if(pair[1]==='src'){ if(v.getAttribute('src')) v.setAttribute('src',val); }
   else v.setAttribute(pair[1],val);
  });
 }
 // Запасной кадр: если основной адрес постера не отдался, ставим локальный файл
 var poster=v.getAttribute('poster');
 if(poster){
  var probe=new Image();
  probe.onerror=toLocal;
  probe.src=poster;
 }
 var less=false;
 try{
  less=matchMedia('(prefers-reduced-motion: reduce)').matches
    || !!navigator.connection?.saveData
    || /^(2g|slow-2g|3g)$/.test(navigator.connection?.effectiveType||'');
 }catch(e){}
 if(less){ // экономия трафика или уменьшение анимации — остаётся фотография дома
  v.setAttribute('preload','none');
  if(media) media.setAttribute('data-bb-static','1');
  return;
 }
 function start(){
  var mobile=matchMedia('(max-width:640px)').matches;
  var mp4=mobile?(v.getAttribute('data-mobile')||v.getAttribute('data-src')):v.getAttribute('data-src');
  var webm=mobile?null:v.getAttribute('data-webm');
  // Список источников: сначала webm (легче), затем mp4; на телефоне — облегчённый файл
  if(webm){ var s1=document.createElement('source'); s1.src=webm; s1.type='video/webm'; v.appendChild(s1); }
  if(mp4){ var s2=document.createElement('source'); s2.src=mp4; s2.type='video/mp4'; v.appendChild(s2); }
  v.preload='auto';
  var p=v.play();
  if(p&&p.catch) p.catch(function(){});
  v.addEventListener('playing',function(){ v.setAttribute('data-bb-playing','1'); },{once:true});
  v.addEventListener('error',function(){ // видео не отдалось — показываем кадр
   v.removeAttribute('src'); v.load();
   if(media) media.setAttribute('data-bb-static','1');
  });
 } if(document.readyState==='complete') setTimeout(start,400); else addEventListener('load',function(){ setTimeout(start,400); },{once:true});
})();</script>`;
if (!html.includes('id="bb-hero-style"')) {
  // Стили и скрипт — в самый конец страницы, чтобы не трогать разметку Tilda
  const anchors = ['</body>', '</html>', '</BODY>'];
  const at = anchors.map((a) => html.lastIndexOf(a)).filter((i) => i > 0).sort((a, b) => b - a)[0];
  if (!at) throw new Error('не нашёл конец страницы');
  html = html.slice(0, at) + heroStyle + '\n' + heroScript + '\n' + html.slice(at);
  done.push('первый экран: стили и скрипт поведения в конце страницы (разметка Tilda не тронута)');
}

/* ---------- 4. Полоска категорий ---------- */
const stripCards = [
  { name: 'Шале', guests: 5, href: 'https://barskie-polya.ru/chalet', photo: 'znachki/kategoriya-shale.webp' },
  { name: 'Барский дом', guests: 6, href: 'https://barskie-polya.ru/barski', photo: 'znachki/kategoriya-barskij-dom.webp' },
  { name: 'Барнхаус', guests: 6, href: 'https://barskie-polya.ru/barnhauses', photo: 'znachki/kategoriya-barnhaus.webp' },
  { name: 'Гарден', guests: 4, href: 'https://barskie-polya.ru/gardens', photo: 'znachki/kategoriya-garden.webp' },
  { name: 'Ривер', guests: 4, href: 'https://barskie-polya.ru/rivers', photo: 'znachki/kategoriya-river.webp' },
];
const card = (c, hidden) => `<li class="bb-poloska__punkt"${hidden ? ' aria-hidden="true"' : ''}>`
  + `<a class="bb-poloska__karta" href="${c.href}"${hidden ? ' tabindex="-1"' : ''}>`
  + `<img class="bb-poloska__foto" src="${PUBLIC_ASSETS}${c.photo}" data-src-local="${LOCAL_ASSETS}${c.photo}" `
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
#bb-poloska{position:relative;overflow:hidden;background-color:#314c44;padding:22px 0 6px;font-family:'Rubik',Arial,sans-serif}
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
 // Локальный файл рядом со страницей — запасной, если опубликованный адрес не отдался
 [].forEach.call(sekciya.querySelectorAll('img[data-src-local]'),function(img){
  img.addEventListener('error',function(){ var p=img.getAttribute('data-src-local'); if(p&&img.getAttribute('src')!==p) img.setAttribute('src',p); },{once:true});
 });
 // Скорость: 45 с на полный проход ленты
 function nastroit(){ var n=lenta.scrollWidth/2; if(n>0) lenta.style.animationDuration=Math.max(20,Math.round(n*45/1200))+'s'; }
 nastroit(); addEventListener('resize',nastroit,{passive:true});
 // Палец на телефоне: пока листают и ещё пару секунд после — движение стоит
 var taymer=null;
 function priostanovit(){ lenta.style.animationPlayState='paused'; if(taymer) clearTimeout(taymer); }
 function prodolzhit(){ if(taymer) clearTimeout(taymer); taymer=setTimeout(function(){ lenta.style.animationPlayState=''; },2500); }
 ['touchstart','pointerdown','scroll','wheel'].forEach(function(e){ okno.addEventListener(e,priostanovit,{passive:true}); });
 ['touchend','pointerup','touchcancel','pointercancel','scrollend'].forEach(function(e){ okno.addEventListener(e,prodolzhit,{passive:true}); });
})();
</script>
<!-- BB-POLOSKA:END -->`;

if (!html.includes('BB-POLOSKA:START')) {
  const marker = '<div id="rec3545323801"';
  const at = html.indexOf(marker);
  if (at < 0) throw new Error('не нашёл блок сезонных предложений rec3545323801');
  html = html.slice(0, at) + strip + '\n' + html.slice(at);
  done.push('полоска категорий вставлена перед сезонными предложениями (rec3545323801)');
}

/* ---------- 5. Видео из новой генерации ---------- */
if (videoArg) {
  const target = path.join(root, 'demo/assets/bp-hero-barski.mp4');
  fs.copyFileSync(videoArg, target);
  done.push('видео заменено файлом ' + videoArg + ' -> demo/assets/bp-hero-barski.mp4');
}
fs.writeFileSync(file, html, 'utf8');
console.log(done.map((d) => ' + ' + d).join('\n'));
console.log(`файл: ${file} (${html.length} байт), копия до правки: ${path.basename(backup)}`);
