import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import D from '../prevyu/lid/bp-guest/data.js';
import M from '../prevyu/lid/bp-guest/map-data.js';
import {availableForHouse, requestTarget, supplySelection} from '../prevyu/lid/bp-guest/guest-rules.js';

const service = id => D.services.find(item => item.id === id);

test('RIVER and other houses retain their distinct arrival/departure times', () => {
  for (const house of D.houses) {
    assert.deepEqual([house.checkin, house.checkout], house.id.startsWith('river') ? ['15:00', '12:00'] : ['16:00', '13:00']);
  }
});

test('private baths are offered only for the matching selected house', () => {
  assert.equal(availableForHouse(service('sauna'), 'garden1'), true);
  assert.equal(availableForHouse(service('sauna'), 'garden4'), true);
  assert.equal(availableForHouse(service('sauna'), 'barski'), true);
  for (const id of ['', 'garden2', 'river1', 'chalet']) assert.equal(availableForHouse(service('sauna'), id), false);
  assert.equal(availableForHouse(service('chalet-sauna'), 'chalet'), true);
  for (const id of ['', 'garden1', 'garden4', 'river1']) assert.equal(availableForHouse(service('chalet-sauna'), id), false);
});

test('one tub service uses the classic name, and advanced services are marked', () => {
  assert.equal(D.services.filter(item => ['tub', 'tub-filling'].includes(item.id)).length, 1);
  assert.equal(D.tub_fillings.find(item => item.id === 'plain').title, 'Классический чан');
  assert.equal(service('tub').price, 5500);
  for (const id of ['massage', 'steam-master', 'romantic', 'birthday', 'svidanie', 'perezagruzka']) assert.equal(service(id).advance, true);
  assert.equal(service('veranda'), undefined);
});

test('the booking department and administrator receive different request types', () => {
  assert.equal(requestTarget([service('tub')]), 'booking');
  assert.equal(requestTarget([service('coal-3'), service('grill')]), 'administrator');
  assert.throws(() => requestTarget([service('tub'), service('coal-3')]));
});

test('one supply request totals multiple products and rejects invalid quantities', () => {
  const goods = D.services.filter(item => item.kind === 'goods');
  const selection = supplySelection(goods, {'coal-3': 2, grill: 1});
  assert.equal(selection.total, 1800);
  assert.equal(selection.items.length, 2);
  assert.equal(requestTarget(selection.items), 'administrator');
  for (const quantity of [-1, 1.5, 21, NaN]) assert.throws(() => supplySelection(goods, {grill: quantity}));
  assert.equal(supplySelection(goods, {}).total, 0);
});

test('all QR house IDs still have matching map points and local photos', () => {
  assert.equal(D.houses.length, 15);
  assert.deepEqual(new Set(D.houses.map(item => item.id)), new Set(M.houses.map(item => item.id)));
  for (const house of D.houses) assert.equal(existsSync(new URL('../prevyu/lid/bp-guest/' + house.image, import.meta.url)), true);
});
