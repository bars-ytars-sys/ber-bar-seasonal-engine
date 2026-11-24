const illustrations = [
  ['barskie-polya-winter', 'Шале · Новый год'],
  ['barski-tulips', 'Барский дом · Тюльпаны'],
  ['barn1-birthday', 'Барнхаус 1 · День рождения'],
  ['barn2-amber', 'Барнхаус 2 · Золотая осень'],
  ['winter-tree', 'Ёлка у Шале'],
  ['garden-lilac', 'Гарден 3 · Сирень'],
  ['river2-evening', 'Ривер 2 · Вечер для двоих'],
];

const assets = '../../../../demo/assets/bp-winter-20261124/certificates/';
const get = (id) => document.getElementById(id);
const artwork = get('sheet-art');
const strip = get('art-strip');
const previous = get('art-previous');
const next = get('art-next');
const amountButtons = get('amounts');
const customAmount = get('own-amount');
const request = get('request-link');
const currency = new Intl.NumberFormat('ru-RU');
const movement = matchMedia('(prefers-reduced-motion: reduce)');
let activeArt;
let preset = amountButtons.querySelector('input:checked');

function updateArrows() {
  previous.disabled = strip.scrollLeft < 2;
  next.disabled = strip.scrollWidth - strip.clientWidth - strip.scrollLeft < 2;
}

function selectArt(button, move) {
  activeArt?.setAttribute('aria-pressed', 'false');
  activeArt = button;
  button.setAttribute('aria-pressed', 'true');
  const image = button.querySelector('img');
  const label = button.textContent;
  artwork.src = image.src;
  artwork.alt = label;
  get('art-current').textContent = label;
  if (move) {
    const left = strip.scrollLeft + button.getBoundingClientRect().left - strip.getBoundingClientRect().left;
    strip.scrollTo({left: left - 4, behavior: movement.matches ? 'instant' : 'smooth'});
  }
}

const artButtons = new Map();
for (const [key, label] of illustrations) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'art-option';
  button.setAttribute('aria-pressed', 'false');

  const img = document.createElement('img');
  img.src = assets + key + '.webp';
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';

  const caption = document.createElement('span');
  caption.textContent = label;
  button.append(img, caption);
  button.addEventListener('click', () => selectArt(button, false));
  strip.append(button);
  artButtons.set(key, button);
}
selectArt(artButtons.get(illustrations[0][0]), false);

get('occasions').addEventListener('change', (event) => {
  const button = artButtons.get(event.target.value);
  if (button) selectArt(button, true);
});
strip.addEventListener('scroll', updateArrows, {passive: true});
window.addEventListener('resize', updateArrows);
previous.addEventListener('click', () => strip.scrollBy({left: -strip.clientWidth * .85, behavior: movement.matches ? 'instant' : 'smooth'}));
next.addEventListener('click', () => strip.scrollBy({left: strip.clientWidth * .85, behavior: movement.matches ? 'instant' : 'smooth'}));
updateArrows();

function updateAmount() {
  const custom = customAmount.value && customAmount.validity.valid;
  const amount = custom ? customAmount.valueAsNumber : Number(preset.value);
  preset.checked = !custom;
  get('sheet-amount').textContent = currency.format(amount) + ' ₽';
  const target = new URL('../', location.href);
  target.searchParams.set('certificate', '1');
  target.searchParams.set('nominal', String(amount));
  target.hash = 'gift-card';
  request.href = target.href;
}

customAmount.addEventListener('input', updateAmount);
amountButtons.addEventListener('change', (event) => {
  preset = event.target;
  customAmount.value = '';
  updateAmount();
});
request.addEventListener('click', (event) => {
  if (!customAmount.reportValidity()) event.preventDefault();
});
updateAmount();

function bindText(inputId, outputId) {
  const input = get(inputId);
  const output = get(outputId);
  input.addEventListener('input', () => {
    output.textContent = input.value.trim();
    output.hidden = !output.textContent;
  });
}
bindText('overline', 'sheet-overline');
bindText('greeting', 'sheet-greeting');
get('greeting').addEventListener('input', (event) => {
  get('character-count').textContent = event.target.value.length + ' / 300';
});

function bindName(inputId, outputId) {
  const input = get(inputId);
  const group = get(outputId);
  const name = group.querySelector('dd');
  input.addEventListener('input', () => {
    name.textContent = input.value.trim();
    group.hidden = !name.textContent;
    get('sheet-names').hidden = get('sheet-to').hidden && get('sheet-from').hidden;
  });
}
bindName('recipient', 'sheet-to');
bindName('sender', 'sheet-from');
