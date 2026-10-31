import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({URL,URLSearchParams,Intl,AbortController,setTimeout,clearTimeout,fetch});
vm.runInContext(fs.readFileSync('prevyu/lid/br-stay-core.js','utf8'),context);
const C=context.BRStayCore;
const state={arrival:'2026-11-09',departure:'2026-11-11',adults:2,children:[],scenario:'all'};
const house={id:'baus-1',roomId:509613,capacity:2,bath:false,tub:true,pets:true};
const data={closed:{},prices:{'2026-11-09':{p:13200,g:2},'2026-11-10':{p:13200,g:2},'2026-11-11':{p:13200,g:2}}};

test('BR checkout preserves house, dates, adults and exact child ages',()=>{
  const u=new URL(C.bookingUrl({...state,adults:2,children:[0,7]},{...house,roomId:385875,capacity:4}));
  assert.equal(u.origin+u.pathname,'https://ecobr.ru/booking');
  assert.equal(u.searchParams.get('onlyrooms'),'385875');
  assert.equal(u.searchParams.get('dfrom'),'09-11-2026');
  assert.equal(u.searchParams.get('dto'),'11-11-2026');
  assert.equal(u.searchParams.get('adults'),'2');
  assert.equal(u.searchParams.get('children'),'[0,7]');
});
test('Reject impossible, reversed, past dates and missing child age',()=>{
  assert.ok(C.dateError({...state,arrival:'2026-02-30'},'2026-01-01'));
  assert.ok(C.dateError({...state,departure:state.arrival},'2026-10-30'));
  assert.ok(C.dateError(state,'2026-11-10'));
  assert.ok(C.partyError({...state,children:[null]}));
  assert.throws(()=>C.bookingUrl({...state,children:[9]},house));
});
test('Scenarios filter house capacity independently of private bath preferences',()=>{
  assert.equal(C.matches(house,{...state,scenario:'couple'}),true);
  assert.equal(C.matches({...house,capacity:7},{...state,scenario:'couple'}),false);
  assert.equal(C.matches(house,{...state,bath:true}),false);
  assert.equal(C.matches(house,{...state,children:[6]}),false);
  assert.equal(C.matches({...house,capacity:7},{...state,scenario:'friends'}),true);
  assert.equal(C.matches(house,{...state,scenario:'family'}),false);
});
test('One-night weekend gap remains bookable when Bnovo permits it',()=>{
  const s={...state,arrival:'2026-11-06',departure:'2026-11-07'};
  const d={closed:{},prices:{'2026-11-06':{p:15000,g:2},'2026-11-07':{p:15000,g:2}}};
  assert.equal(C.availability(d,s).status,'available');
  d.closed[s.arrival]={r:'minsa_2'};
  assert.equal(C.availability(d,s).status,'unavailable');
});
test('Arrival, departure, inner-night and minimum-stay restrictions are respected',()=>{
  for(const closed of [
    {[state.arrival]:{r:'ca'}},
    {[state.departure]:{cd:1}},
    {'2026-11-10':{r:'c'}},
    {[state.arrival]:{r:'minsa_3'}},
    {'2026-11-10':{r:'mins_3'}},
  ])assert.equal(C.availability({...data,closed},state).status,'unavailable');
  assert.equal(C.availability({...data,closed:{[state.departure]:{r:'c'}}},state).status,'available','closed arrival on checkout day does not itself forbid departure');
});
test('Unknown dates are never treated as free or sold out; closed arrivals inside a stay are allowed',()=>{
  assert.equal(C.availability({closed:{},prices:{}},state).status,'unknown');
  assert.equal(C.availability({...data,closed:{'2026-11-10':{r:'ca'}}},state).status,'available');
  assert.equal(C.availability(data,state).priceFrom,26400);
});
test('BR calendar is independent of the BP February cutoff',()=>{
  const s={...state,arrival:'2027-03-01',departure:'2027-03-02'};
  assert.equal(C.availability({closed:{},prices:{[s.arrival]:{p:10000,g:2},[s.departure]:{p:10000,g:2}}},s).status,'available');
});
test('Month grid contains real adjacent-month ISO dates and a valid cross-month stay',()=>{
  const days=C.monthDays('2026-10');assert.equal(days.length,42);assert.equal(days[0],'2026-09-28');assert.equal(days[41],'2026-11-08');
  const s={...state,arrival:'2026-10-31',departure:'2026-11-02'};
  assert.equal(C.availability({closed:{},prices:{'2026-10-31':{p:10000,g:2},'2026-11-01':{p:12000,g:2},'2026-11-02':{p:12000,g:2}}},s).status,'available');
});
test('On-demand house calendar fetches the entire 42-day grid using the same BR room',async()=>{
  const urls=[];const api=C.createApi(async url=>{urls.push(new URL(url));return {ok:true,json:async()=>url.includes('min_prices')?{min_prices:data.prices}:{closed_dates_with_reasons:{closed_dates:{}}}};});
  const r=await api.calendar(house,'2026-10');assert.equal(r.from,'2026-09-28');assert.equal(r.to,'2026-11-08');assert.equal(urls.length,2);
  for(const u of urls){assert.equal(u.searchParams.get('dfrom'),'28-09-2026');assert.equal(u.searchParams.get('dto'),'08-11-2026');assert.equal(u.searchParams.get('room_type_id')||u.searchParams.get('roomtype_id'),'509613');}
});
test('Public API cache reuses completed requests, retries failures and uses BR UID',async()=>{
  let calls=0,fail=true;
  const api=C.createApi(async url=>{
    calls++;assert.equal(new URL(url).searchParams.get('uid'),'9b88bc59-76a6-4230-8e86-85790f3854d4');
    if(fail)return{ok:false};
    return {ok:true,json:async()=>url.includes('min_prices')?{min_prices:data.prices}:{closed_dates_with_reasons:{closed_dates:{}}}};
  });
  await assert.rejects(api.load(house,state));fail=false;
  assert.equal((await api.load(house,state)).status,'available');
  await api.load(house,state);assert.equal(calls,4);
});
test('Twenty-two unique current BR houses retain exact category IDs and local photos',()=>{
  const d=vm.createContext({window:{}});vm.runInContext(fs.readFileSync('prevyu/lid/br-stay-data.js','utf8'),d);
  const rows=d.window.BRStayData.houses;assert.equal(rows.length,22);assert.equal(new Set(rows.map(h=>h.roomId)).size,22);
  assert.equal(rows.find(h=>h.id==='panorama').capacity,8);
  assert.equal(rows.find(h=>h.id==='baus-1').roomId,509613);
  for(const h of rows){assert.ok(fs.existsSync('prevyu/lid/'+h.image));assert.match(h.url,/^https:\/\/ecobr.ru\/doma\//);assert.ok(!('price' in h));}
});
