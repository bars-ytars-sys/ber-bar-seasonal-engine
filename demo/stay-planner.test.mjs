import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
const context=vm.createContext({window:{},URL,Date});
for(const f of ['stay-core.js','stay-data.js'])vm.runInContext(fs.readFileSync(new URL('../prevyu/lid/'+f,import.meta.url),'utf8'),context);
const {BBStayCore:c,BBStayData:data}=context.window;
test('37 real houses have unique booking IDs and usable comparison fields',()=>{
 assert.equal(data.br.length,22);assert.equal(data.bp.length,15);
 for(const b of ['br','bp']){
  assert.equal(new Set(data[b].map(h=>h.roomId)).size,data[b].length);
  for(const h of data[b]){assert(h.capacity>=2);assert(h.price>0);assert(h.weekend>0);assert(h.rooms);assert(h.image.startsWith('https://'));assert(h.url.startsWith(b==='br'?'https://ecobr.ru/':'https://barskie-polya.ru/'));}
 }
});
test('combined filters respect occupancy, fencing, bath and pet restrictions',()=>{
 const bp=data.bp.filter(h=>c.matches(h,{guests:4,bath:true,fenced:true,pets:true}));
 assert.deepEqual(Array.from(bp,h=>h.id).sort(),['garden1','garden4']);
 assert(!c.matches(data.bp.find(h=>h.id==='chalet'),{guests:2,pets:true}));
 assert.equal(data.bp.filter(h=>c.matches(h,{guests:10})).length,0);
 assert.deepEqual(Array.from(data.br.filter(h=>c.matches(h,{guests:8,bath:true})),h=>h.id),['panorama']);
});
test('dates validate partial, impossible, past and reverse ranges',()=>{
 const today='2026-10-04';
 assert.equal(c.dateError({arrival:'',departure:''},today),'');
 for(const [arrival,departure]of [['2026-10-03','2026-10-05'],['2026-10-09',''],['2026-10-09','2026-10-09'],['2026-10-10','2026-10-09'],['2026-02-30','2026-03-02']])assert(c.dateError({arrival,departure},today));
 assert.equal(c.dateError({arrival:'2026-12-31',departure:'2027-01-03'},today),'');
 assert(c.validDate('2028-02-29'));assert(!c.validDate('2027-02-29'));
});
test('booking preserves house, exact adult count and future dates without contact data',()=>{
 const state={arrival:'2030-12-31',departure:'2031-01-03',adults:3,guests:4};
 for(const b of ['br','bp']){const h=data[b][0],u=new URL(c.bookingUrl(b,state,h));assert.equal(u.searchParams.get('onlyrooms'),String(h.roomId));assert.equal(u.searchParams.get('adults'),'3');assert.equal(u.searchParams.get('dfrom'),state.arrival);assert.equal(u.searchParams.get('dto'),state.departure);assert.equal([...u.searchParams].length,5);}
 const u=new URL(c.bookingUrl('br',{arrival:'',departure:''}));assert(!u.searchParams.has('onlyrooms'));assert(!u.searchParams.has('dfrom'));
});
