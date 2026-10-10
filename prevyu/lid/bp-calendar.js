/* Public Bnovo calendar data. No credentials, bookings or guest information. */
(function(root){
 'use strict';
 const api='https://public-api.reservationsteps.ru/v1/api/',uid='17f7bf8e-d176-4c55-83a8-a1c0cd6187ae',cache=new Map();
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const date=s=>new Date(s+'T12:00:00');
 const add=(s,n)=>{const d=date(s);d.setDate(d.getDate()+n);return iso(d);};
 const nights=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
 function rule(data,day){
  const entry=data.closed[day]||{},parts=(entry.r||'').split('_'),code=parts[0],price=data.prices[day];
  const number=k=>{const i=parts.indexOf(k);return i<0?0:Number(parts[i+1])||0;};
  const minimum=number('minsa')||number('mins')||1,maximum=number('maxs');
  const known=Object.prototype.hasOwnProperty.call(data.prices,day)||Object.prototype.hasOwnProperty.call(data.closed,day);
  const stop=code==='c',noArrival=stop||['ca','rpa','rpb'].includes(code),noDeparture=entry.cd===1;
  const available=known&&!noArrival&&(Number(price?.p)>0||parts.includes('mins')||parts.includes('minsa')||parts.includes('maxs'));
  return{known,available,noArrival,noDeparture,stop,minimum,maximum,price:Number(price?.p)||null,guests:Number(price?.g)||2,code};
 }
 async function load(roomId,month,fresh=false){
  if(!Number.isSafeInteger(Number(roomId))||Number(roomId)<=0||!/^\d{4}-\d{2}$/.test(month))throw Error('Некорректный календарь.');
  const key=roomId+':'+month,old=cache.get(key);if(!fresh&&old&&Date.now()-old.at<300000)return old.promise;
  const [y,m]=month.split('-').map(Number),from=new Date(y,m-1,1,12),to=new Date(y,m+1,1,12),format=d=>iso(d).split('-').reverse().join('-');
  const promise=Promise.all(['closed_dates_with_reasons','min_prices'].map(async endpoint=>{
   const params=new URLSearchParams({uid,dfrom:format(from),dto:format(to)});
   if(endpoint==='min_prices'){params.set('room_type_id',String(roomId));params.set('currency','RUB');}
   else{params.set('roomtype_id',String(roomId));params.set('onlyrooms',String(roomId));}
   const r=await fetch(api+endpoint+'?'+params,{credentials:'omit',signal:AbortSignal.timeout(15000)});
   if(!r.ok)throw Error('Не удалось загрузить календарь.');return r.json();
  })).then(([closed,prices])=>{
   if(!closed.closed_dates_with_reasons||!prices.min_prices||typeof prices.min_prices!=='object')throw Error('Календарь временно недоступен.');
   return{closed:closed.closed_dates_with_reasons.closed_dates||{},prices:prices.min_prices,from:iso(from),to:iso(to),loaded:Date.now()};
  }).catch(e=>{cache.delete(key);throw e;});cache.set(key,{at:Date.now(),promise});return promise;
 }
 async function loadStay(roomId,arrival,departure){
  const periods=[];let cursor=date(arrival.slice(0,7)+'-01');
  while(iso(cursor).slice(0,7)<=departure.slice(0,7)){periods.push(iso(cursor).slice(0,7));cursor.setMonth(cursor.getMonth()+2);}
  const chunks=await Promise.all(periods.map(month=>load(roomId,month,true))),data={closed:{},prices:{}};
  for(const chunk of chunks){Object.assign(data.closed,chunk.closed);Object.assign(data.prices,chunk.prices);}return data;
 }
 function validate(data,arrival,departure,today=iso(new Date())){
  if(!arrival||!departure||departure<=arrival)return 'Выберите дату заезда, затем дату выезда.';
  if(arrival<today)return 'Эта дата уже прошла.';
  const start=rule(data,arrival),end=rule(data,departure),count=nights(arrival,departure);
  if(!start.available)return 'В этот день заезд недоступен. Выберите другую дату.';
  if(!end.known||end.noDeparture)return 'В этот день выезд недоступен. Выберите другую дату.';
  if(count<start.minimum)return `Для этого заезда нужно не менее ${start.minimum} ночей. Выберите более поздний выезд.`;
  if(start.maximum&&count>start.maximum)return `Для этого заезда доступно не больше ${start.maximum} ночей.`;
  for(let d=arrival;d<departure;d=add(d,1)){
   const r=rule(data,d);if(!r.known)return 'Нужно обновить календарь на выбранный период.';
   if(r.stop)return 'Внутри выбранного периода есть недоступная ночь. Выберите другие даты.';
   if(r.code==='mins'&&count<r.minimum)return `В этом периоде нужно не менее ${r.minimum} ночей.`;
   if(!r.available&&!r.noArrival&&!r.noDeparture)return 'Доступность одной из ночей требует проверки. Выберите другой период.';
  }
  return '';
 }
 root.BPCalendar={iso,add,nights,rule,load,loadStay,validate};
})(typeof window==='undefined'?globalThis:window);
