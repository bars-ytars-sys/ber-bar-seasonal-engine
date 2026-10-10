/* Pure selection and booking helpers, shared by the demo and its checks. */
(function (root) {
  'use strict';
  const iso = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
    const date = new Date(value + 'T12:00:00');
    return !isNaN(date) && iso(date) === value;
  }
  function dateError(state, today=iso(new Date())) {
    if (!state.arrival && !state.departure) return '';
    if (!validDate(state.arrival) || !validDate(state.departure)) return 'Укажите даты заезда и выезда.';
    if (state.arrival < today) return 'Выберите дату заезда не раньше сегодняшнего дня.';
    if (state.departure <= state.arrival) return 'Выезд должен быть позже заезда.';
    return '';
  }
  function matches(house, state) {
    return house.capacity >= Number(state.guests || 2)
      && (!state.bath || house.bath) && (!state.pets || house.pets)
      && (!state.fenced || house.fenced);
  }
  function bookingUrl(brand, state, house) {
    const u = new URL(brand==='br'?'https://ecobr.ru/booking':'https://barskie-polya.ru/booking');
    if (house) u.searchParams.set('onlyrooms',String(house.roomId));
    // Guest filter includes children; the module asks for exact ages and party.
    // Only adults are transferred when the guest explicitly supplies their count.
    u.searchParams.set('adults', String(state.adults || 2));
    if (state.arrival && state.departure && !dateError(state)) {
      u.searchParams.set('dfrom',state.arrival); u.searchParams.set('dto',state.departure);
    }
    u.searchParams.set('scroll_to_rooms','1');
    return u.href;
  }
  function availabilityUrl(brand, state, houses) {
    if (dateError(state) || !state.arrival || !state.departure) throw new Error('Сначала выберите корректные даты.');
    const ids=[...new Set(houses.map(h=>Number(h.roomId)))];
    if (!ids.length || ids.some(id=>!Number.isSafeInteger(id)||id<=0)) throw new Error('Нет подходящих домов для проверки.');
    const uid=brand==='br'?'9b88bc59-76a6-4230-8e86-85790f3854d4':brand==='bp'?'17f7bf8e-d176-4c55-83a8-a1c0cd6187ae':null;
    if(!uid)throw new Error('Неизвестная база.');
    const u=new URL('https://reservationsteps.ru/rooms/index/'+uid);
    const date=v=>v.split('-').reverse().join('-');
    u.searchParams.set('lang','ru');u.searchParams.set('adults',String(Math.min(10,Math.max(1,Number(state.guests)||2))));
    u.searchParams.set('dfrom',date(state.arrival));u.searchParams.set('dto',date(state.departure));
    u.searchParams.set('onlyrooms',ids.join(','));u.searchParams.set('scroll_to_rooms','1');
    return u.href;
  }
  root.BBStayCore = {iso,validDate,dateError,matches,bookingUrl,availabilityUrl};
})(typeof window==='undefined'?globalThis:window);
