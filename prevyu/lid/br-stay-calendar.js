/* House calendar, opened on demand. Bnovo restrictions remain the only availability source. */
(() => {
  'use strict';
  const C=window.BRStayCore;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=d=>new Date(d+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
  const short=d=>d?new Date(d+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'}):'Выбрать';
  const monthName=m=>new Date(m+'-01T12:00:00').toLocaleDateString('ru-RU',{month:'long',year:'numeric'});
  const shift=(m,n)=>{const d=new Date(m+'-01T12:00:00');d.setMonth(d.getMonth()+n);return C.iso(d).slice(0,7);};
  function mount(host,{house,api,value,onChange,onApply}){
    let arrival=value.arrival||'',departure=value.departure||'',month=(arrival||C.today()).slice(0,7),picking='arrival',data={closed:{},prices:{}},loading=true,error='',version=0,destroyed=false;
    const firstMonth=C.today().slice(0,7),lastMonth=shift(firstMonth,12);
    if(month<firstMonth||month>lastMonth)month=firstMonth;
    function allowed(day){
      if(loading||error||day<C.today())return false;
      if(picking==='arrival'||!arrival)return C.rule(data,day).available;
      return day>arrival&&!C.dateError({arrival,departure:day})&&C.availability(data,{arrival,departure:day}).status==='available';
    }
    function render(){
      if(destroyed)return;
      const ready=arrival&&departure&&!C.dateError({arrival,departure})&&C.availability(data,{arrival,departure}).status==='available';
      const start=arrival&&C.rule(data,arrival),n=arrival&&departure?C.nights(arrival,departure):0;
      let hint=loading?'Загружаем календарь дома…':error?'Не удалось загрузить календарь. Повторите проверку.':picking==='departure'&&arrival?`Выберите выезд.${start.minimum>1?' От '+start.minimum+' ночей для этого заезда.':''}`:'Выберите заезд, затем выезд.';
      if(ready)hint=`${short(arrival)} — ${short(departure)} · ${n} ${n===1?'ночь':n<5?'ночи':'ночей'}`;
      host.innerHTML=`<div class="brp-calendar"><div class="brp-month-head"><button type="button" data-month-step="-1" aria-label="Предыдущий месяц" ${month<=firstMonth||loading?'disabled':''}>‹</button><select data-month aria-label="Месяц календаря">${Array.from({length:13},(_,i)=>shift(firstMonth,i)).map(m=>`<option value="${m}" ${m===month?'selected':''}>${monthName(m)}</option>`).join('')}</select><button type="button" data-month-step="1" aria-label="Следующий месяц" ${month>=lastMonth||loading?'disabled':''}>›</button></div><div class="brp-date-picks"><button type="button" data-pick="arrival" aria-pressed="${picking==='arrival'}"><small>Заезд</small><strong>${short(arrival)}</strong></button><span aria-hidden="true">→</span><button type="button" data-pick="departure" aria-pressed="${picking==='departure'}" ${arrival?'':'disabled'}><small>Выезд</small><strong>${short(departure)}</strong></button></div><p class="brp-calendar-hint" role="status" aria-live="polite">${hint}</p>${error?'<button type="button" class="brp-link" data-calendar-retry>Повторить загрузку</button>':''}<div class="brp-weekdays" aria-hidden="true">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d=>`<span>${d}</span>`).join('')}</div><div class="brp-days" aria-label="Даты отдыха" aria-busy="${loading}">${C.monthDays(month).map(d=>{
        const r=C.rule(data,d),enabled=allowed(d),selected=d===arrival||d===departure,inside=arrival&&departure&&d>arrival&&d<departure;
        return `<button type="button" data-day="${d}" class="brp-day${d.slice(0,7)!==month?' brp-adjacent':''}${selected?' brp-selected':''}${inside?' brp-in-range':''}${!enabled&&d>=C.today()&&r.known&&!loading?' brp-unavailable':''}" aria-label="${esc(label(d))}${enabled?'':', недоступно'}" aria-pressed="${selected}" ${enabled?'':'disabled'}>${Number(d.slice(-2))}${d.slice(0,7)!==month?'<small>'+new Date(d+'T12:00:00').toLocaleDateString('ru-RU',{month:'short'})+'</small>':''}</button>`;
      }).join('')}</div><div class="brp-calendar-legend"><span><i></i>${picking==='departure'?'Доступен выезд':'Доступен заезд'}</span><span>／ Недоступно</span></div><p class="brp-calendar-note">Минимальный срок зависит от даты заезда. Условия бани и чана указаны в выбранном тарифе.</p><button class="brp-btn" type="button" data-calendar-apply ${ready&&!loading?'':'disabled'}>Показать дома на эти даты</button>${arrival?'<button class="brp-link" type="button" data-calendar-clear>Сбросить даты</button>':''}</div>`;
    }
    async function load(fresh=false){
      const v=++version;loading=true;error='';render();
      try{
        const next=await api.calendar(house,month,fresh);
        if(v!==version||destroyed)return;
        // Replace the fetched window, preserving adjacent windows for cross-month ranges.
        for(const part of ['closed','prices']){
          for(const d of Object.keys(data[part]))if(d>=next.from&&d<=next.to)delete data[part][d];
          Object.assign(data[part],next[part]);
        }
      }catch{if(v!==version||destroyed)return;error='Календарь временно недоступен.';}
      loading=false;render();
    }
    function change(){onChange({arrival,departure});}
    host.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b||b.disabled||destroyed)return;
      if(b.dataset.day){
        const d=b.dataset.day;if(!allowed(d))return;
        if(picking==='arrival'||!arrival){arrival=d;departure='';picking='departure';}else{departure=d;picking='arrival';}
        change();
        if(d.slice(0,7)!==month){month=d.slice(0,7);load();}else render();
      }
      if(b.dataset.pick){picking=b.dataset.pick;render();}
      if(b.dataset.monthStep){month=shift(month,Number(b.dataset.monthStep));load();}
      if(b.hasAttribute('data-calendar-retry'))load(true);
      if(b.hasAttribute('data-calendar-clear')){arrival='';departure='';picking='arrival';change();render();}
      if(b.hasAttribute('data-calendar-apply'))onApply();
    });
    host.addEventListener('change',e=>{if(e.target.matches('[data-month]')){month=e.target.value;load();}});
    load();return{destroy(){destroyed=true;version++;}};
  }
  window.BRStayCalendar={mount};
})();
