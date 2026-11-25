export const photos = new Map([
  ['house-winter-holidayhouse', 'Холидей хаус'],
  ['house-winter-bariloche', 'Барилоче'],
  ['hero-panorama-garland', 'Панорама'],
  ['spa-open-pool-20261125', 'Зимний SPA'],
]);
export const photoUrl = (id) => new URL('../br-assets/' + id + '.webp', import.meta.url);
