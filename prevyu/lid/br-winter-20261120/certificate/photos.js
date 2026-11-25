export const photos = new Map([
  ['house-winter-holidayhouse', 'Холидей хаус · Новый год'],
  ['hero-panorama-garland', 'Панорама · Праздничный вечер'],
  ['house-winter-bariloche', 'Барилоче · Зимнее утро'],
  ['house-winter-aframe-luxe-white', 'А-фрейм · Зимний лес'],
  ['br-birthday-panoramic', 'Панорама · День рождения'],
  ['cert-photo-sfera-peonies', 'Сфера · Пионы'],
  ['house-winter-sfera', 'Сфера · Вечер для двоих'],
  ['cert-photo-black-aframe', 'А-фрейм · Уютный вечер'],
  ['cert-photo-baus-tub', 'Баус · Горячий чан'],
  ['winter-samovar-program', 'Баня · Чай с самоваром'],
  ['spa-open-pool-20261125', 'SPA · Тёплый бассейн'],
  ['cert-photo-baus-evening', 'Баус · Зимние сумерки'],
  ['cert-photo-aframe-bridge', 'А-фрейм · У воды'],
  ['cert-photo-barn-birches', 'Барнхаус · В берёзах'],
  ['cert-photo-panorama-summer', 'Панорама · Летний двор'],
  ['cert-photo-holiday-daylight', 'Холидей хаус · Летнее солнце'],
]);

export const photoUrl = (id) => new URL('../br-assets/' + id + '.webp', import.meta.url);
export const photoThumbnailUrl = (id) => new URL('./photos/' + id + '.webp', import.meta.url);
