import {photos, photoUrl, photoThumbnailUrl} from './photos.js?v=4';

const get = (id) => document.getElementById(id);
const order = get('order');
const recipient = get('recipient');
const phone = get('phone');
const certificateNumbers = new Map();
const customAmount = get('custom-amount');
const gallery = get('photos');
const back = get('photo-back');
const next = get('photo-next');
const currency = new Intl.NumberFormat('ru-RU');
const telegram = 'https://t.me/ecobazabr';
const movement = matchMedia('(prefers-reduced-motion: reduce)');
const photoInputs = new Map();

for (const [id, title] of photos) {
  const label = document.createElement('label');
  label.className = 'photo-option';
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'photo';
  radio.value = id;
  radio.checked = gallery.childElementCount === 0;
  const tile = document.createElement('span');
  const image = new Image(400, 300);
  image.src = photoThumbnailUrl(id);
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  tile.append(image, title);
  label.append(radio, tile);
  gallery.append(label);
  photoInputs.set(id, radio);
}

function updateGalleryArrows() {
  back.disabled = gallery.scrollLeft < 4;
  next.disabled = gallery.scrollWidth - gallery.clientWidth - gallery.scrollLeft < 4;
}
function browsePhotos(direction) {
  gallery.scrollBy({left: gallery.clientWidth * .8 * direction, behavior: movement.matches ? 'instant' : 'smooth'});
}
back.addEventListener('click', () => browsePhotos(-1));
next.addEventListener('click', () => browsePhotos(1));
gallery.addEventListener('scroll', updateGalleryArrows, {passive: true});
new ResizeObserver(updateGalleryArrows).observe(gallery);
updateGalleryArrows();

function chooseOccasion(input) {
  const photo = photoInputs.get(input.dataset.photo);
  if (!photo) return;
  photo.checked = true;
  const left = gallery.scrollLeft + photo.closest('label').getBoundingClientRect().left - gallery.getBoundingClientRect().left;
  gallery.scrollTo({left: left - 4, behavior: movement.matches ? 'instant' : 'smooth'});
}

function updateText(inputId, outputId, containerId = outputId) {
  const value = get(inputId).value.trim();
  get(outputId).textContent = value;
  get(containerId).hidden = !value;
  return value;
}

function refreshOrder() {
  const custom = order.elements.amount.value === 'custom';
  customAmount.disabled = !custom;
  get('custom-field').hidden = !custom;
  const amount = custom ? customAmount.valueAsNumber : Number(order.elements.amount.value);
  const selectedPhoto = order.elements.photo.value;
  const image = get('preview-photo');
  const source = photoUrl(selectedPhoto).href;
  const title = photos.get(selectedPhoto);
  if (image.src !== source) image.src = source;
  image.alt = title;
  if (get('art-current').textContent !== title) get('art-current').textContent = title;

  const name = updateText('recipient', 'preview-recipient', 'preview-recipient-group');
  const sender = updateText('sender', 'preview-sender', 'preview-sender-group');
  const overline = updateText('overline', 'preview-overline');
  const greeting = updateText('greeting', 'preview-greeting');
  get('preview-names').hidden = !name && !sender;
  get('character-count').textContent = get('greeting').value.length + ' / 300';
  get('preview-amount').textContent = Number.isSafeInteger(amount) && amount > 0
    ? currency.format(amount) + ' ₽' : '—';
  get('request-fallback').hidden = true;
  return {custom, amount, selectedPhoto, name, sender, overline, greeting, occasion: order.elements.occasion.value};
}

order.addEventListener('input', (event) => {
  if (event.target.name === 'occasion') chooseOccasion(event.target);
  recipient.setCustomValidity('');
  refreshOrder();
});
order.addEventListener('change', (event) => {
  if (event.target.name === 'amount' && event.target.value === 'custom') customAmount.focus();
});
function certificateNumber(orderDetails, callback) {
  const key = JSON.stringify([orderDetails, callback]);
  if (!certificateNumbers.has(key)) {
    const id = crypto.randomUUID().replaceAll('-', '').slice(0, 20).toUpperCase();
    certificateNumbers.set(key, 'BR-' + id);
  }
  return certificateNumbers.get(key);
}

order.addEventListener('submit', (event) => {
  event.preventDefault();
  const orderDetails = refreshOrder();
  const {custom, amount, selectedPhoto, name, sender, overline, greeting, occasion} = orderDetails;
  recipient.setCustomValidity(name ? '' : 'Укажите имя получателя.');
  if (!order.reportValidity()) return;

  const callback = phone.value.trim();
  const number = certificateNumber(orderDetails, callback);
  const details = [
    'Заявка на подарочный сертификат «Берёзовая роща»',
    'Номер заявки: ' + number,
    'Номинал: ' + currency.format(amount) + ' ₽' + (custom ? ' (свой номинал)' : ''),
    'Сумма к оплате: уточнить у менеджера.',
    'Получатель: ' + name,
    'Фото: ' + photos.get(selectedPhoto),
    photoUrl(selectedPhoto).href,
  ];
  if (occasion !== 'Без повода') details.push('Повод: ' + occasion);
  if (sender) details.push('От кого: ' + sender);
  if (overline) details.push('Строка над заголовком: ' + overline);
  if (greeting) details.push('Поздравление: ' + greeting);
  if (callback) details.push('Телефон для связи: ' + callback);
  details.push('Подскажите, пожалуйста, как оформить и оплатить сертификат.');

  const draft = details.join('\n');
  get('order-reference').textContent = number;
  get('draft').value = draft;
  get('copy-status').textContent = '';
  get('request-fallback').hidden = false;
  const link = new URL(telegram);
  link.searchParams.set('text', draft);
  const chat = get('open-chat');
  chat.href = link.href;
  chat.click();
});

get('copy').addEventListener('click', async () => {
  const draft = get('draft');
  try {
    await navigator.clipboard.writeText(draft.value);
    get('copy-status').textContent = 'Заявка скопирована.';
  } catch {
    draft.select();
    get('copy-status').textContent = 'Скопируйте выделенный текст.';
  }
});

refreshOrder();
get('send-request').disabled = false;
