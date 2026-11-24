import {photos, photoUrl} from './photos.js';
import {drawCertificate, downloadCertificate, loadCertificateFonts, loadImage} from './certificate-pdf.js';

const get = (id) => document.getElementById(id);
const order = get('order');
const recipient = get('recipient');
const phone = get('phone');
const draftButton = get('download-draft');
const draftStatus = get('draft-status');
const customAmount = get('custom-amount');
const gallery = get('photos');
const back = get('photo-back');
const next = get('photo-next');
const currency = new Intl.NumberFormat('ru-RU');
const telegram = 'https://t.me/bazabarskie_polya';

for (const [id, title] of photos) {
  const label = document.createElement('label');
  label.className = 'photo-option';
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'photo';
  radio.value = id;
  radio.checked = gallery.childElementCount === 0;
  const tile = document.createElement('span');
  const image = new Image(108, 72);
  image.src = photoUrl(id);
  image.alt = '';
  image.loading = 'lazy';
  tile.append(image, title);
  label.append(radio, tile);
  gallery.append(label);
}

function updateGalleryArrows() {
  back.disabled = gallery.scrollLeft < 4;
  next.disabled = gallery.scrollWidth - gallery.clientWidth - gallery.scrollLeft < 4;
}
function browsePhotos(direction) {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  gallery.scrollBy({left: gallery.clientWidth * .8 * direction, behavior: reducedMotion ? 'instant' : 'smooth'});
}
back.addEventListener('click', () => browsePhotos(-1));
next.addEventListener('click', () => browsePhotos(1));
gallery.addEventListener('scroll', updateGalleryArrows, {passive: true});
new ResizeObserver(updateGalleryArrows).observe(gallery);
updateGalleryArrows();

function refreshOrder() {
  const custom = order.elements.amount.value === 'custom';
  customAmount.disabled = !custom;
  get('custom-field').hidden = !custom;
  const amount = custom ? customAmount.valueAsNumber : Number(order.elements.amount.value);
  const selectedPhoto = order.elements.photo.value;
  const image = get('preview-photo');
  const source = photoUrl(selectedPhoto).href;
  if (image.src !== source) image.src = source;
  image.alt = photos.get(selectedPhoto);
  const name = recipient.value.trim();
  get('preview-recipient').textContent = name;
  get('preview-recipient').hidden = !name;
  get('preview-amount').textContent = Number.isSafeInteger(amount) && amount > 0
    ? currency.format(amount) + ' ₽' : '—';
  get('request-fallback').hidden = true;
  return {custom, amount, selectedPhoto, name};
}

order.addEventListener('input', () => {
  recipient.setCustomValidity('');
  refreshOrder();
});
order.addEventListener('change', (event) => {
  if (event.target.name === 'amount' && event.target.value === 'custom') customAmount.focus();
});
order.addEventListener('submit', (event) => {
  event.preventDefault();
  const {custom, amount, selectedPhoto, name} = refreshOrder();
  recipient.setCustomValidity(name ? '' : 'Укажите имя получателя.');
  if (!order.reportValidity()) return;

  const details = [
    'Заявка на подарочный сертификат «Барские поля»',
    'Номинал: ' + currency.format(amount) + ' ₽' + (custom ? ' (свой номинал)' : ''),
    'Сумма к оплате: уточнить у менеджера.',
    'Получатель: ' + name,
    'Фото: ' + photos.get(selectedPhoto),
    photoUrl(selectedPhoto).href,
  ];
  const callback = phone.value.trim();
  if (callback) details.push('Телефон для связи: ' + callback);
  details.push('Пришлите, пожалуйста, ссылку на оплату.');

  const draft = details.join('\n');
  get('draft').value = draft;
  get('copy-status').textContent = '';
  get('request-fallback').hidden = false;
  const link = new URL(telegram);
  link.searchParams.set('text', draft);
  const chat = get('open-chat');
  chat.href = link.href;
  chat.click();
  void saveDraft({amount, selectedPhoto, name});
});

async function saveDraft({amount, selectedPhoto, name}) {
  if (draftButton.disabled) return;
  draftButton.disabled = true;
  draftStatus.textContent = 'Готовим макет PDF…';
  try {
    const [photo, logo] = await Promise.all([
      loadImage(photoUrl(selectedPhoto)),
      loadImage(document.querySelector('.brand img').src),
      loadCertificateFonts(),
    ]);
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1696;
    drawCertificate(canvas, photo, logo, {name, nominal: amount, draft: true});
    await downloadCertificate(canvas, 'barskie-polya-maket.pdf');
    draftStatus.textContent = 'Макет скачан. Его можно приложить к заявке в Telegram.';
  } catch {
    draftStatus.textContent = 'Не удалось скачать макет. Повторите попытку.';
  } finally {
    draftButton.disabled = false;
  }
}

draftButton.addEventListener('click', () => {
  const details = refreshOrder();
  recipient.setCustomValidity(details.name ? '' : 'Укажите имя получателя.');
  if (order.reportValidity()) void saveDraft(details);
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
draftButton.disabled = false;
