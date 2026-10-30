/* BR selection and public Bnovo calendar only; never creates a reservation. */
(function (root) {
  'use strict';
  const uid = '9b88bc59-76a6-4230-8e86-85790f3854d4';
  const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const today = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const valid = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && iso(new Date(s+'T12:00:00')) === s;
  const add = (s,n) => { const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d); };
  const nights = (a,b) => Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
  function monthDays(month){
    const first=month+'-01',weekday=(new Date(first+'T12:00:00').getDay()+6)%7;
    return Array.from({length:42},(_,i)=>add(first,i-weekday));
  }
  function dateError(s, now=today()) {
    if (!valid(s.arrival)||!valid(s.departure)) return 'Выберите даты заезда и выезда.';
    if (s.arrival<now) return 'Дата заезда уже прошла. Выберите другую дату.';
    if (s.departure<=s.arrival) return 'Выезд должен быть позже заезда.';
    if (nights(s.arrival,s.departure)>60) return 'Для поездки дольше 60 ночей свяжитесь с отделом бронирования.';
    return '';
  }
  function partyError(s) {
    if (!Number.isInteger(s.adults)||s.adults<1||s.adults>10) return 'Укажите количество взрослых.';
    if (!Array.isArray(s.children)||s.children.length>5||s.children.some(a=>!Number.isInteger(a)||a<0||a>17)) return 'Укажите возраст каждого ребёнка.';
    return '';
  }
  const guests = s => Number(s.adults)+(s.children?.length||0);
  function matches(h,s) {
    if (h.capacity<guests(s)||s.bath&&!h.bath||s.tub&&!h.tub||s.pets&&!h.pets) return false;
    if (s.scenario==='couple' && h.capacity>4) return false;
    if (s.scenario==='family' && h.capacity<3) return false;
    if (s.scenario==='friends' && h.capacity<5) return false;
    return true;
  }
  function bookingUrl(s,house) {
    const error=dateError(s)||partyError(s);
    if (error) throw Error(error);
    if (house && (!Number.isSafeInteger(house.roomId)||house.roomId<=0||guests(s)>house.capacity)) throw Error('Дом не подходит для выбранного числа гостей.');
    const u=new URL('https://ecobr.ru/booking');
    u.searchParams.set('dfrom',s.arrival.split('-').reverse().join('-'));
    u.searchParams.set('dto',s.departure.split('-').reverse().join('-'));
    u.searchParams.set('adults',String(s.adults));u.searchParams.set('children',JSON.stringify(s.children));
    if (house) u.searchParams.set('onlyrooms',String(house.roomId));
    u.searchParams.set('scroll_to_rooms','1');
    return u.href;
  }
  function rule(data,day) {
    const entry=data.closed[day]||{},parts=String(entry.r||'').split('_'),code=parts[0],price=data.prices[day];
    const number=k=>{const i=parts.indexOf(k);return i<0?0:Number(parts[i+1])||0;};
    const known=Object.hasOwn(data.prices,day)||Object.hasOwn(data.closed,day);
    const stop=code==='c',noArrival=stop||['ca','rpa','rpb'].includes(code);
    const available=known&&!noArrival&&(Number(price?.p)>0||parts.some(p=>['mins','minsa','maxs'].includes(p)));
    return {known,code,stop,noArrival,available,noDeparture:Number(entry.cd)===1,minimum:number('minsa')||number('mins')||1,maximum:number('maxs'),price:Number(price?.p)||0,baseGuests:Number(price?.g)||null};
  }
  function availability(data,s) {
    // Unknown data must never become either a free house or a sold-out house.
    const start=rule(data,s.arrival),end=rule(data,s.departure),count=nights(s.arrival,s.departure);
    if (!start.known||!end.known) return {status:'unknown',reason:'Не удалось подтвердить весь период.'};
    if (!start.available) return {status:'unavailable',reason:'На эту дату нет заезда.'};
    if (end.noDeparture) return {status:'unavailable',reason:'На эту дату нет выезда.'};
    if (count<start.minimum||start.maximum&&count>start.maximum) return {status:'unavailable',reason:`Условия заезда: от ${start.minimum} ночей.`};
    let total=0,baseGuests=null,hasPrice=true;
    for (let d=s.arrival;d<s.departure;d=add(d,1)) {
      const r=rule(data,d);
      if (!r.known) return {status:'unknown',reason:'Не удалось подтвердить весь период.'};
      if (r.stop||r.code==='mins'&&count<r.minimum) return {status:'unavailable',reason:'Внутри периода есть ограничение.'};
      if (!r.available&&!r.noArrival&&!r.noDeparture) return {status:'unknown',reason:'Нужна дополнительная проверка.'};
      if (!r.price || !r.baseGuests || baseGuests && baseGuests!==r.baseGuests) hasPrice=false;
      total+=r.price;baseGuests=baseGuests||r.baseGuests;
    }
    return {status:'available',priceFrom:hasPrice?total:null,baseGuests,nights:count};
  }
  function createApi(fetcher=root.fetch.bind(root)) {
    const cache=new Map(),queue=[];let running=0;
    function drain(){while(running<4&&queue.length){const t=queue.shift();running++;Promise.resolve().then(t.job).then(t.resolve,t.reject).finally(()=>{running--;drain();});}}
    function queued(job){return new Promise((resolve,reject)=>{queue.push({job,resolve,reject});drain();});}
    async function request(endpoint,house,s) {
      const q=new URLSearchParams({uid,dfrom:s.arrival.split('-').reverse().join('-'),dto:s.departure.split('-').reverse().join('-')});
      if(endpoint==='min_prices'){q.set('room_type_id',String(house.roomId));q.set('currency','RUB');}
      else{q.set('roomtype_id',String(house.roomId));q.set('onlyrooms',String(house.roomId));}
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
      try {
        const r=await fetcher('https://public-api.reservationsteps.ru/v1/api/'+endpoint+'?'+q,{credentials:'omit',signal:controller.signal});
        if(!r.ok)throw Error('Bnovo временно не ответил.');return await r.json();
      } finally {clearTimeout(timer);}
    }
    async function load(house,s,fresh=false) {
      const key=[house.roomId,s.arrival,s.departure].join(':'),old=cache.get(key);
      if(!fresh&&old&&Date.now()-old.at<120000)return old.promise;
      const promise=Promise.all(['closed_dates_with_reasons','min_prices'].map(e=>queued(()=>request(e,house,s)))).then(([c,p])=>{
        const closed=c.closed_dates_with_reasons?.closed_dates,prices=p.min_prices;
        if(!closed||typeof closed!=='object'||!prices||typeof prices!=='object')throw Error('Bnovo вернул неполные данные.');
        return availability({closed,prices},s);
      }).catch(e=>{cache.delete(key);throw e;});
      cache.set(key,{at:Date.now(),promise});return promise;
    }
    async function calendar(house,month,fresh=false){
      if(!/^\d{4}-\d{2}$/.test(month)||!valid(month+'-01'))throw Error('Некорректный месяц.');
      const days=monthDays(month),s={arrival:days[0],departure:days[41]},key='calendar:'+house.roomId+':'+month,old=cache.get(key);
      if(!fresh&&old&&Date.now()-old.at<120000)return old.promise;
      const promise=Promise.all(['closed_dates_with_reasons','min_prices'].map(e=>queued(()=>request(e,house,s)))).then(([c,p])=>{
        const closed=c.closed_dates_with_reasons?.closed_dates,prices=p.min_prices;
        if(!closed||typeof closed!=='object'||!prices||typeof prices!=='object')throw Error('Календарь временно недоступен.');
        return {closed,prices,from:s.arrival,to:s.departure};
      }).catch(e=>{cache.delete(key);throw e;});
      cache.set(key,{at:Date.now(),promise});return promise;
    }
    return {load,calendar};
  }
  root.BRStayCore={uid,iso,today,valid,add,nights,monthDays,dateError,partyError,guests,matches,bookingUrl,rule,availability,createApi};
})(typeof window==='undefined'?globalThis:window);
