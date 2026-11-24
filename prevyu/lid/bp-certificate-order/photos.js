export const photos = new Map([
  ['barskie-polya-winter', 'Шале · Новый год'],
  ['winter-tree-daylight', 'Ёлка у Шале'],
  ['barn1-winter-morning', 'Барнхаус 1 · Зимнее утро'],
  ['barski-tulips', 'Барский дом · Тюльпаны'],
  ['barn1-birthday', 'Барнхаус 1 · День рождения'],
  ['barn2-amber', 'Барнхаус 2 · Золотая осень'],
  ['garden-lilac', 'Гарден 3 · Сирень'],
  ['chalet-first-snow', 'Шале · Первый снег'],
  ['barn2-pink-evening', 'Барнхаус 2 · Розовый вечер'],
  ['barski-golden-day', 'Барский дом · Золотой день'],
  ['barn1-spring-birches', 'Барнхаус 1 · Весенние берёзы'],
  ['chalet-white-night', 'Шале · Белая ночь'],
  ['barski-birthday-lights', 'Барский дом · Праздничные фонарики'],
  ['river2-evening', 'Ривер 2 · Вечер для двоих'],
  ['barn2-meadow', 'Барнхаус 2 · Летний луг'],
  ['garden2-spring-rain', 'Гарден 2 · После дождя'],
]);

export function photoUrl(id) {
  return new URL('../../../demo/assets/bp-winter-20261124/certificates/' + id + '.webp', import.meta.url);
}
