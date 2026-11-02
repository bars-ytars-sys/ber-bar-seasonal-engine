import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const ctx=vm.createContext({window:{},URL,URLSearchParams,Date,Map,Promise,AbortController,setTimeout,clearTimeout,fetch});
vm.runInContext(fs.readFileSync('prevyu/lid/bp-calendar.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('prevyu/lid/bp-date-search-core.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('prevyu/lid/stay-data.js','utf8'),ctx);
const S=ctx.window.BPDateSearch,C=ctx.window.BPCalendar,houses=ctx.window.BBStayData.bp;
const state={adults:2,children:[],bath:false,tub:false,pets:false,fenced:false};
const holiday={closed:{'2026-12-31':{r:'minsa_3_0',cd:1},'2027-01-01':{r:'ca'},'2027-01-02':{r:'ca'},'2027-01-03':{r:'minsa_2_0'}},prices:Object.fromEntries(['2026-12-30','2026-12-31','2027-01-01','2027-01-02','2027-01-03'].map(d=>[d,null]))};

test('River 2 remains in all houses and is excluded only by an explicitly selected private-bath filter',()=>{
 assert.equal(houses.length,15);
 assert.equal(S.visible(houses,state,null).length,15);
 assert.equal(S.visible(houses,state,null).some(h=>h.id==='river2'),true);
 const filtered=S.visible(houses,{...state,bath:true},null);
 assert.equal(filtered.length,4);
 assert.equal(filtered.some(h=>h.id==='river2'),false);
 assert.equal(S.activeFilters({...state,bath:true})[0].label,'Своя баня');
 assert.equal(S.visible(houses,{...state,house:'river2'},null)[0].roomId,406980);
});
test('New Year package can span closed-arrival nights without being falsely marked occupied',()=>{
 assert.equal(S.inspect(C,holiday,'2026-12-31','2027-01-03').status,'available');
 assert.equal(S.inspect(C,holiday,'2026-12-31','2027-01-03').priceFrom,null);
 assert.equal(S.inspect(C,holiday,'2026-12-31','2027-01-02').status,'unavailable');
 assert.equal(S.inspect(C,holiday,'2027-01-01','2027-01-03').status,'unavailable');
});
test('Missing single-night price and failed/empty API responses remain unknown, never sold out or guaranteed free',()=>{
 assert.equal(S.inspect(C,holiday,'2026-12-30','2027-01-03').status,'unknown');
 assert.equal(S.inspect(C,null,'2026-12-31','2027-01-03').status,'unknown');
 assert.equal(S.inspect(C,{closed:{},prices:{}},'2026-12-31','2027-01-03').status,'unknown');
 const results=new Map(houses.map(h=>[h.id,{status:h.id==='river2'?'unknown':'unavailable'}]));
 assert.equal(S.visible(houses,state,results).some(h=>h.id==='river2'),true);
 assert.equal(S.visible(houses,state,results).length,1);
 assert.equal(S.visible(houses,state,results,true).length,15);
});
test('Minimum stays, occupied inner nights and checkout restrictions are retained',()=>{
 assert.equal(S.inspect(C,{...holiday,closed:{...holiday.closed,'2027-01-01':{r:'c'}}},'2026-12-31','2027-01-03').status,'unavailable');
 assert.equal(S.inspect(C,{...holiday,closed:{...holiday.closed,'2027-01-03':{cd:1}}},'2026-12-31','2027-01-03').status,'unavailable');
 const oneNight={closed:{'2026-11-06':{r:'c'}},prices:{'2026-11-05':{p:14300,g:2},'2026-11-06':null}};
 const r=S.inspect(C,oneNight,'2026-11-05','2026-11-06');
 assert.equal(r.status,'available');assert.equal(r.priceFrom,14300);
});
test('A real adjacent January day updates the displayed month immediately and still requires two nights',()=>{
 const data={closed:{'2027-01-03':{r:'minsa_2_0'},'2027-01-04':{r:'minsa_2_0'},'2027-01-05':{r:'minsa_2_0'}},prices:{'2027-01-03':null,'2027-01-04':null,'2027-01-05':null}};
 const start=S.nextSelection(C,{month:'2026-12',arrival:'',picking:'arrival'},'2027-01-03',data);
 assert.equal(start.month,'2027-01');assert.equal(start.arrival,'2027-01-03');
 assert.equal(S.nextSelection(C,start,'2027-01-04',data),null);
 assert.equal(S.nextSelection(C,start,'2027-01-05',data).departure,'2027-01-05');
});
test('Date-first selection accepts a year boundary, rejects impossible dates and keeps the BP inclusive cutoff',()=>{
 const error=(arrival,departure)=>S.dateError({arrival,departure},'2026-11-02','2027-02-01');
 assert.equal(error('2026-12-30','2027-01-03'),'');
 assert.equal(error('2027-01-31','2027-02-01'),'');
 assert.ok(error('2026-12-31','2026-12-30'));
 assert.ok(error('2027-02-01','2027-02-02'));
 assert.ok(error('2026-02-30','2026-12-30'));
 assert.ok(error('2026-99-99','2027-01-03'));
});
test('Party capacity and multiple amenities continue to filter all 15 records rather than API load progress',()=>{
 const party={...state,adults:2,children:[3,9]};
 const list=S.visible(houses,party,null);
 assert.ok(list.length>4);assert.ok(list.every(h=>h.capacity>=4));
 assert.ok(S.visible(houses,{...party,bath:true,fenced:true},null).every(h=>h.bath&&h.fenced));
});
