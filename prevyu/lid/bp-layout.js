/* Keep decorative artwork in its own row, including after img -> SVG conversion. */
(()=>{
 'use strict';
 const garland='https://static.tildacdn.com/tild3638-6438-4366-b766-613130643330/_.svg';
 const forest='https://static.tildacdn.com/tild3533-3034-4864-a235-613732613230/___.svg';
 const artwork=()=>`<div class="bp-heading-art" aria-hidden="true"><span class="bp-heading-garland"><img src="${garland}" alt="" width="383" height="163" loading="lazy"></span><span class="bp-heading-forest"><img src="${forest}" alt="" width="417" height="129" loading="lazy"></span><span class="bp-heading-garland bp-heading-garland--right"><img src="${garland}" alt="" width="383" height="163" loading="lazy"></span></div>`;
 function mount(){
  for(const [id,title] of [
   ['rec1534422731','Здесь отдых становится особенным'],
   ['rec1185039526','Карта территории'],
   ['rec1216602591','Категория эмоций'],
   ['rec1185039396','О базе отдыха'],
   ['rec1185039536','Отзывы гостей'],
   ['rec2238137661','Наши новости'],
   ['rec1187742556','Контакты'],
   ['rec2709575101','FAQ']
  ]){
   const record=document.getElementById(id);if(!record||record.querySelector('.bp-section-heading'))continue;
   record.classList.add('bp-section-heading-record');
   record.insertAdjacentHTML('beforeend',`<div class="bp-section-heading">${artwork()}<h2>${title}</h2><span class="bp-heading-rule" aria-hidden="true"></span></div>`);
  }
  const picker=document.querySelector('.bpc-section');
  if(picker&&!picker.querySelector('.bp-heading-art')){
   picker.querySelector('.bp-sheet-decor')?.remove();
   const inner=picker.querySelector('.bst-inner'),top=document.createElement('div');
   top.className='bpc-section-top';
   while(inner.firstElementChild&&!inner.firstElementChild.classList.contains('bpc-count'))top.append(inner.firstElementChild);
   inner.prepend(top);top.insertAdjacentHTML('afterbegin',artwork());
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
