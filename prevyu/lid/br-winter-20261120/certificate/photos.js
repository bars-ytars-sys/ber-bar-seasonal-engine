export const photos = new Map([
  ['cert-art-bariloche-morning', 'Барилоче · Зимнее утро'],
  ['cert-art-holidayhouse-spring', 'Холидей хаус · Весенние тюльпаны'],
  ['cert-art-panorama-summer-evening', 'Панорама · Летний вечер'],
  ['cert-art-panorama-holiday', 'Панорама · Новогодние огни'],
  ['cert-art-barnhouse-summer-birthday', 'Барнхаус · Летний день рождения'],
  ['cert-art-bariloche-gold', 'Барилоче · Золотая осень'],
  ['cert-art-aframe-lilac-spring', 'А-фрейм · Майская сирень'],
  ['cert-art-sfera-frost', 'Сфера · Мороз и солнце'],
  ['cert-art-aframe-twilight', 'А-фрейм · Зимний вечер вдвоём'],
  ['cert-art-chalet-night', 'Шале · Тёплый зимний вечер'],
]);

export const photoUrl = (id) => new URL('../br-assets/' + id + '.webp', import.meta.url);
export const photoThumbnailUrl = (id) => new URL('./photos/' + id + '.webp', import.meta.url);
