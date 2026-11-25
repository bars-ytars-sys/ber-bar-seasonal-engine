export const photos = new Map([
  ['cert-art-bariloche-morning', 'Барилоче · Зимнее утро'],
  ['cert-art-panorama-holiday', 'Панорама · Новогодние огни'],
  ['cert-art-barnhouse-birthday', 'Барнхаус · День рождения'],
  ['cert-art-holidayhouse-tulips', 'Холидей хаус · Тюльпаны'],
  ['cert-art-aframe-twilight', 'А-фрейм · Вечер для двоих'],
  ['cert-art-sfera-frost', 'Сфера · Мороз и солнце'],
  ['cert-art-chalet-night', 'Шале · Тёплый вечер'],
]);

export const photoUrl = (id) => new URL('../br-assets/' + id + '.webp', import.meta.url);
export const photoThumbnailUrl = (id) => new URL('./photos/' + id + '.webp', import.meta.url);
