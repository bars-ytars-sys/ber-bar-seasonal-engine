import assert from 'node:assert/strict';
import '../prevyu/lid/bp-calendar.js';
const c=globalThis.BPCalendar;
const data={closed:{'2026-12-04':{r:'mins_2_0'},'2026-12-05':{r:'mins_2_0'},'2026-12-15':{r:'c'},'2027-01-01':{r:'ca',cd:1}},prices:{}};
for(let d='2026-12-01';d<'2027-01-10';d=c.add(d,1))data.prices[d]={p:16000,g:2};
data.prices['2026-12-04']=null;data.prices['2026-12-05']=null;data.prices['2026-12-15']=null;data.prices['2027-01-01']=null;
assert.equal(c.nights('2026-12-31','2027-01-02'),2);
assert.equal(c.nights('2026-10-24','2026-10-26'),2); // DST must not change nights.
assert.equal(c.rule(data,'2026-12-04').available,true); // A 2-night restriction is not an occupied day.
assert.equal(c.rule(data,'2026-12-15').available,false);
assert.equal(c.rule(data,'2026-11-30').available,false); // No data must never become a free date.
assert.match(c.validate(data,'2026-12-04','2026-12-05','2026-10-10'),/2 ночей/);
assert.equal(c.validate(data,'2026-12-04','2026-12-06','2026-10-10'),'');
assert.match(c.validate(data,'2026-12-14','2026-12-16','2026-10-10'),/недоступная ночь/);
assert.equal(c.validate(data,'2026-12-14','2026-12-15','2026-10-10'),''); // Checkout is not an occupied night.
assert.match(c.validate(data,'2026-12-31','2027-01-01','2026-10-10'),/выезд недоступен/);
assert.equal(c.validate(data,'2026-12-31','2027-01-03','2026-10-10'),''); // Arrival-only closure allows staying through.
const missing={closed:{},prices:{'2026-12-01':{p:16000},'2026-12-03':{p:16000}}};
assert.match(c.validate(missing,'2026-12-01','2026-12-03','2026-10-10'),/обновить календарь/);
console.log('Calendar restrictions, unknown dates, checkout and DST: passed');
