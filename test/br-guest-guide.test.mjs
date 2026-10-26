import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import D from '../prevyu/lid/br-guest/data.js';
import M from '../prevyu/lid/br-guest/map-data.js';
import {availableForHouse,eligibleSelection,assertRequestAllowed,requestTarget,supplySelection} from '../prevyu/lid/br-guest/guest-rules.js';
const service=id=>D.services.find(s=>s.id===id);

test('a private bath is unavailable to Baus and other houses without one',()=>{
 const baths=new Set(['sfera','aframe-black','barn-4','panorama','holidayhouse']);
 for(const h of D.houses)assert.equal(availableForHouse(service('bath'),h.id),baths.has(h.id));
 assert.equal(availableForHouse(service('bath'),''),false);
 for(const h of D.houses)assert.equal(availableForHouse(service('spa'),h.id),true);
});
test('changing the house or restoring an old basket removes incompatible bath requests',()=>{
 assert.deepEqual(eligibleSelection(['bath','spa','bath','romantic','coal-3','unknown'],D.services,'baus-2'),['spa']);
 assert.deepEqual(eligibleSelection(['bath','spa'],D.services,'sfera'),['bath','spa']);
});
test('a house change inside the request form cannot submit the previous bath',()=>{
 assert.throws(()=>assertRequestAllowed([service('bath')],'baus-2'));
 assert.throws(()=>assertRequestAllowed([service('bath')],''));
 assert.equal(assertRequestAllowed([service('bath'),service('spa')],'sfera'),'booking');
 assert.throws(()=>assertRequestAllowed([service('romantic')],'sfera'));
});
test('supplies are collected in a separate administrator request',()=>{
 const goods=D.services.filter(s=>s.kind==='goods');
 const selected=supplySelection(goods,{'coal-3':2,grill:1});
 assert.equal(selected.total,1800);assert.equal(requestTarget(selected.items),'administrator');
 assert.equal(requestTarget([service('tub'),service('spa')]),'booking');
 assert.throws(()=>requestTarget([service('tub'),service('grill')]));
 for(const quantity of [-1,NaN,0.5,21])assert.throws(()=>supplySelection(goods,{grill:quantity}));
});
test('BR keeps all 22 QR house IDs and photos and never uses BP contacts',()=>{
 assert.equal(D.houses.length,22);assert.deepEqual(new Set(D.houses.map(h=>h.id)),new Set(M.houses.map(h=>h.id)));
 for(const h of D.houses)assert.equal(existsSync(new URL('../prevyu/lid/br-guest/'+h.image,import.meta.url)),true);
 assert.equal(JSON.stringify(D).includes('+79010510220'),false);
 assert.equal(D.contacts.phone_url,'tel:+74951202008');
 assert.equal(D.afterstay.code,'BR-3000');assert.match(D.afterstay.terms,/в течение месяца после получения/);assert.match(D.afterstay.terms,/отделом бронирования/);
});
