/* BP date-first search: public calendar evidence, no reservations or writes. */
(function(root){
 'use strict';
 const valid=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const d=new Date(s+'T12:00:00');return !isNaN(d)&&[String(d.getFullYear()),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')===s;};
 function dateError(s,today,end){
  if(!s.arrival&&!s.departure)return '';
  if(!valid(s.arrival)||!valid(s.departure))return 'Выберите заезд и выезд.';
  if(s.arrival<today)return 'Дата заезда уже прошла.';
  if(s.departure<=s.arrival)return 'Выезд должен быть позже заезда.';
  if(s.departure>end||s.arrival>=end)return 'Отдых можно выбрать до 1 февраля 2027 включительно.';
  return '';
 }
 function inspect(cal,data,arrival,departure){
  const unknown=reason=>({status:'unknown',reason:reason||'Наличие и тариф на этот период подтвердит модуль бронирования.'});
  const unavailable=reason=>({status:'unavailable',reason});
  if(!data||!arrival||!departure||departure<=arrival)return unknown();
  const start=cal.rule(data,arrival),end=cal.rule(data,departure),n=cal.nights(arrival,departure);
  if(start.noArrival)return unavailable('На эту дату нет заезда.');
  if(end.noDeparture)return unavailable('На эту дату нет выезда.');
  if(n<start.minimum)return unavailable('Для этого заезда — от '+start.minimum+' ночей.');
  if(start.maximum&&n>start.maximum)return unavailable('Для этого заезда — до '+start.maximum+' ночей.');
  let uncertain=!start.available||!end.known,total=0,baseGuests=null,hasPrice=true;
  for(let d=arrival;d<departure;d=cal.add(d,1)){
   const r=cal.rule(data,d);
   if(r.stop)return unavailable('В выбранном периоде есть недоступная ночь.');
   if(r.code==='mins'&&n<r.minimum)return unavailable('В этом периоде — от '+r.minimum+' ночей.');
   if(!r.known||!r.available&&!r.noArrival&&!r.noDeparture)uncertain=true;
   if(!r.price||baseGuests!==null&&baseGuests!==r.guests)hasPrice=false;
   total+=r.price||0;baseGuests=baseGuests??r.guests;
  }
  if(uncertain)return unknown();
  return {status:'available',nights:n,priceFrom:hasPrice?total:null,baseGuests};
 }
 const filterLabels={bath:'Своя баня',tub:'Банный чан',pets:'С питомцем',fenced:'Огороженная территория'};
 const activeFilters=s=>Object.entries(filterLabels).filter(([key])=>s[key]).map(([key,label])=>({key,label}));
 function visible(houses,state,results,showUnavailable=false){
  const party=Number(state.adults)+(state.children?.length||0);
  const list=houses.filter(h=>(!state.house||h.id===state.house)&&h.capacity>=party&&Object.keys(filterLabels).every(k=>!state[k]||h[k]));
  if(!results)return list;
  const rank={available:0,unknown:1,unavailable:2};
  return list.filter(h=>showUnavailable||results.get(h.id)?.status!=='unavailable').sort((a,b)=>(rank[results.get(a.id)?.status]??1)-(rank[results.get(b.id)?.status]??1));
 }
 function nextSelection(cal,s,day,data){
  const rule=cal.rule(data,day);
  if(!s.arrival||s.picking!=='departure'||day===s.arrival){
   if(rule.noArrival||!rule.known)return null;
   return {arrival:day,departure:'',picking:'departure',month:day.slice(0,7)};
  }
  if(day<=s.arrival||inspect(cal,data,s.arrival,day).status==='unavailable')return null;
  return {arrival:s.arrival,departure:day,picking:'complete',month:day.slice(0,7)};
 }
 root.BPDateSearch={dateError,inspect,activeFilters,visible,nextSelection,filterLabels};
})(typeof window==='undefined'?globalThis:window);

/* Keep Bnovo in the site's existing booking page and preserve the return selection. */
(function(root){
 'use strict';
 function date(value){
  if(/^\d{2}-\d{2}-\d{4}$/.test(value||''))value=value.split('-').reverse().join('-');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return '';
  const d=new Date(value+'T12:00:00');
  return !isNaN(d)&&`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`===value?value:'';
 }
 function selection(search,houses,today,end){
  try{
   const q=new URLSearchParams(search),house=houses.find(h=>h.id===q.get('house'))||houses.find(h=>String(h.roomId)===q.get('onlyrooms'));
   if((q.has('house')||q.has('onlyrooms'))&&!house)return null;
   const arrival=date(q.get('arrival')||q.get('dfrom')),departure=date(q.get('departure')||q.get('dto'));
   const adults=Number(q.get('adults')||2),children=JSON.parse(q.get('children')||'[]');
   if(!arrival||!departure||arrival<today||departure<=arrival||departure>end||!Number.isInteger(adults)||adults<1||!Array.isArray(children)||children.length>4||children.some(a=>!Number.isInteger(a)||a<0||a>17)||adults+children.length>(house?.capacity||6))return null;
   return {house,arrival,departure,adults,children,guests:adults+children.length,month:arrival.slice(0,7)};
  }catch{return null;}
 }
 function checkoutUrl(state,house){
  const u=new URL('https://barskie-polya.ru/booking');
  u.searchParams.set('house',house.id);u.searchParams.set('onlyrooms',String(house.roomId));
  u.searchParams.set('dfrom',state.arrival);u.searchParams.set('dto',state.departure);
  u.searchParams.set('adults',String(state.adults));u.searchParams.set('children',JSON.stringify(state.children));
  u.searchParams.set('scroll_to_rooms','1');return u.href;
 }
 function returnUrl(state,base='https://barskie-polya.ru/'){
  const u=new URL('/',base);
  if(state){for(const [k,v]of Object.entries({...(state.house?{house:state.house.id}:{}),arrival:state.arrival,departure:state.departure,adults:state.adults,children:JSON.stringify(state.children)}))u.searchParams.set(k,String(v));}
  u.hash='bb-stay';return u.href;
 }
 const api={selection,checkoutUrl,returnUrl};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BPBookingReturn=api;
})(typeof window==='undefined'?globalThis:window);
