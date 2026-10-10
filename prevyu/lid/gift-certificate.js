(function(){
 'use strict';
 const script=document.currentScript,root=new URL('.',script.src).href,assets=new URL('../../demo/assets/',root).href;
 const checkout='https://reservationsteps.ru/rooms/index/9b88bc59-76a6-4230-8e86-85790f3854d4?lang=ru&adults=1&onlyrooms=624219&scroll_to_rooms=1';
 const mount=document.querySelector('[data-gift-editor]');
 document.querySelectorAll('[data-gift-link]').forEach(a=>a.href=root+'br-gift.html'+a.hash);
 if(!mount)return;
 const themes=[{id:'birch',name:'Берёзовый свет',photo:'br-hero-4-v2.webp',line:'Подарите время для себя'},{id:'warm',name:'Тёплые выходные',photo:'berezovaya-roshcha-novyj-god-skandi.webp',line:'Пусть всё немного подождёт'},{id:'evening',name:'Вечер вдвоём',photo:'eco-ng-barn.webp',line:'Время быть рядом'},{id:'winter',name:'Зимний подарок',photo:'berezovaya-roshcha-novyj-god-shale.webp',line:'Тепло, которое хочется дарить'}];
 let theme=themes[0],amount=10000,custom=false;
 mount.innerHTML=`<div class="br-gift__editor"><div class="br-gift__fields"><section class="br-gift__group"><h3>1. Сумма подарка</h3><div class="br-gift__amounts"><button class="br-gift__pill" type="button" data-amount="fixed" aria-pressed="true">10 000 ₽</button><button class="br-gift__pill" type="button" data-amount="custom" aria-pressed="false">Другая сумма</button></div><label data-custom hidden><span class="br-gift__label">Номинал, ₽</span><input type="number" inputmode="numeric" min="1" step="1" value="10000" data-value></label><p class="br-gift__error" role="alert" data-amount-error hidden>Укажите сумму больше нуля, в целых рублях.</p><div class="br-gift__summary"><p class="br-gift__muted">Сертификат на проживание в «Берёзовой роще». Срок действия — 6 месяцев. Итоговая цена покупки и условия — в Bnovo.</p></div><div class="br-gift__links"><a class="br-gift__btn" data-buy href="${checkout}" target="_blank" rel="noopener">Купить через Bnovo ↗</a></div><p class="br-gift__fine" data-buy-note>Bnovo откроется в отдельной вкладке. После покупки вернитесь сюда и выберите оформление.</p><button class="br-gift__demo-link" type="button" data-open-design>Уже купили? Выбрать оформление</button><br><button class="br-gift__demo-link" type="button" data-preview-design>Посмотреть оформление в демо</button></section><div data-design hidden><section class="br-gift__group"><h3>2. Оформление</h3><p class="br-gift__muted">Выберите настроение подарка.</p><div class="br-gift__themes">${themes.map((t,i)=>`<button type="button" class="br-gift__theme" data-theme="${t.id}" aria-pressed="${i===0}"><img src="${assets+t.photo}" alt="" loading="lazy"><span>${t.name}</span></button>`).join('')}</div></section><section class="br-gift__group"><h3>3. Ваши слова</h3><div class="br-gift__form-grid"><label><span class="br-gift__label">Кому</span><input data-to maxlength="36" placeholder="Например, Анне"></label><label><span class="br-gift__label">От кого</span><input data-from maxlength="36" placeholder="Ваше имя"></label></div><label><span class="br-gift__label">Поздравление</span><textarea data-message maxlength="120" placeholder="Пусть этот отдых станет вашей маленькой счастливой историей."></textarea></label><div class="br-gift__links"><button class="br-gift__btn" type="button" data-download>Сохранить макет</button></div><p class="br-gift__fine">Скачивается макет оформления. Подтверждение покупки и номер действительного сертификата выдаёт Bnovo. Макет сам по себе не подтверждает оплату.</p><p class="br-gift__status" role="status" data-status></p></section></div></div><aside class="br-gift__preview"><p class="br-gift__preview-label">Ваш подарок</p><div class="br-gift__sheet" data-sheet data-theme="birch"><div class="br-gift__sheet-text"><div class="br-gift__brand">Берёзовая роща</div><div class="br-gift__occasion" data-line></div><div class="br-gift__sheet-title">Подарочный<br>сертификат</div><div class="br-gift__sheet-amount" data-total></div><div class="br-gift__recipient" data-recipient></div><div class="br-gift__message" data-greeting></div><div class="br-gift__sender" data-sender></div></div><img class="br-gift__sheet-image" data-photo alt="Дом в Берёзовой роще"><div class="br-gift__sheet-foot">На проживание · 6 месяцев<br>Макет оформления · действует вместе с сертификатом Bnovo</div></div><p class="br-gift__fine">Фотографии — дома и отдых в «Берёзовой роще».</p></aside></div>`;
 const $=s=>mount.querySelector(s),money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
 function valid(){return Number.isSafeInteger(amount)&&amount>0;}
 function update(){
  $('[data-sheet]').dataset.theme=theme.id;$('[data-line]').textContent=theme.line;$('[data-photo]').src=assets+theme.photo;
  $('[data-total]').textContent=valid()?money(amount):'Укажите номинал';
  $('[data-recipient]').textContent=$('[data-to]').value.trim();
  $('[data-greeting]').textContent=$('[data-message]').value.trim();$('[data-sender]').textContent=$('[data-from]').value.trim()?('От '+$('[data-from]').value.trim()):'';
  $('[data-amount-error]').hidden=valid();$('[data-download]').disabled=!valid();
  const buy=$('[data-buy]');buy.href=custom?'https://t.me/ecobazabr':checkout;buy.textContent=custom?'Заказать у менеджера ↗':'Купить через Bnovo ↗';
  $('[data-buy-note]').textContent=custom?'Индивидуальный номинал оформляет отдел продаж. Выбранная сумма пока показана только на макете.':'Bnovo откроется в отдельной вкладке. После покупки вернитесь сюда и выберите оформление.';
 }
 function design(){const block=$('[data-design]');block.hidden=false;block.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}
 mount.addEventListener('input',e=>{if(e.target.matches('[data-value]'))amount=Number(e.target.value);update();});
 mount.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.amount){custom=b.dataset.amount==='custom';$('[data-custom]').hidden=!custom;if(!custom)amount=10000;else amount=Number($('[data-value]').value);mount.querySelectorAll('[data-amount]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));update();}
  if(b.dataset.theme){theme=themes.find(t=>t.id===b.dataset.theme);mount.querySelectorAll('[data-theme].br-gift__theme').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));update();}
  if(b.hasAttribute('data-open-design')||b.hasAttribute('data-preview-design'))design();
  if(b.hasAttribute('data-download')&&valid()){
   b.disabled=true;$('[data-status]').textContent='Готовим макет…';
   try{
    const sheet=$('[data-sheet]').cloneNode(true),photo=sheet.querySelector('[data-photo]');
    const response=await fetch(photo.src);if(!response.ok)throw new Error('photo');const blob=await response.blob();photo.src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});
    const css=await(await fetch(root+'gift-certificate.css')).text();
    const html='<!doctype html><html lang="ru"><meta charset="utf-8"><title>Макет подарочного сертификата — Берёзовая роща</title><style>'+css+'body{margin:0;background:#ecefe6;padding:24px}.br-gift{max-width:480px;margin:auto}@media print{body{padding:0}.br-gift{max-width:148mm}}</style><main class="br-gift">'+sheet.outerHTML+'</main></html>';
    const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='Берёзовая-роща-макет-сертификата.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);$('[data-status]').textContent='Макет сохранён. Откройте файл в браузере; его можно распечатать или сохранить в PDF.';
   }catch(err){$('[data-status]').textContent='Не удалось скачать макет. Попробуйте ещё раз.';}finally{b.disabled=!valid();}
  }
 });update();if(location.hash==='#design')design();
})();
