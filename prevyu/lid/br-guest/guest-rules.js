// Shared by service cards and request forms, so changing the house cannot
// expose or submit a bath belonging to a different house.
export function availableForHouse(service, houseId) {
  return !service.house_ids || (!!houseId && service.house_ids.includes(houseId));
}

export function requestTarget(items) {
  const targets = new Set(items.map(item => item.request_target || 'booking'));
  if (targets.size > 1) throw new Error('Услуги и принадлежности отправляются разным получателям.');
  return targets.values().next().value || 'booking';
}

export function supplySelection(goods, quantities) {
  const items = [];
  let total = 0;
  for (const product of goods) {
    const quantity = Number(quantities[product.id] ?? 0);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 20) {
      throw new Error('Укажите целое количество от 0 до 20.');
    }
    if (quantity) {
      items.push({...product, quantity});
      total += quantity * product.price;
    }
  }
  return {items, total};
}

export function eligibleSelection(ids,services,houseId) {
 return [...new Set(ids)].filter(id=>{const service=services.find(s=>s.id===id);return service&&!service.advance&&service.kind!=='goods'&&availableForHouse(service,houseId);}).slice(0,15);
}

export function assertRequestAllowed(items,houseId) {
 if(items.some(s=>!availableForHouse(s,houseId)||s.advance||s.kind==='goods'))throw new Error('В выбранном доме эта услуга недоступна.');
 return requestTarget(items);
}
