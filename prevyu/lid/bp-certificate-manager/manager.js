import {photos, photoUrl} from '../bp-certificate-order/photos.js';
import {drawCertificate, downloadCertificate, loadCertificateFonts, loadImage} from '../bp-certificate-order/certificate-pdf.js';

const assetRoot = './assets/';
const form = document.getElementById('issue-certificate');
const recipient = document.getElementById('recipient');
const denomination = document.getElementById('denomination');
const certificateNumber = document.getElementById('certificate-number');
const download = document.getElementById('download-pdf');
const photoSelect = document.getElementById('certificate-photo');
const status = document.getElementById('pdf-status');
const sheet = document.getElementById('certificate-sheet');
function draw(photo, logo) {
  drawCertificate(sheet, photo, logo, {
    name: recipient.value.trim(),
    nominal: denomination.validity.valid ? denomination.valueAsNumber : NaN,
    number: certificateNumber.value.trim(),
  });
}

async function initialize() {
  for (const [id, title] of photos) photoSelect.add(new Option(title, id));
  const [initialPhoto, logo] = await Promise.all([
    loadImage(photoUrl(photoSelect.value)),
    loadImage(assetRoot + 'barskie-polya-logo.svg'),
    loadCertificateFonts(),
  ]);

  let photo = initialPhoto;
  let photoRequest = 0;
  draw(photo, logo);
  photoSelect.disabled = false;
  download.disabled = false;

  photoSelect.addEventListener('change', async () => {
    const request = ++photoRequest;
    download.disabled = true;
    status.textContent = 'Загружается фото…';
    try {
      const selected = await loadImage(photoUrl(photoSelect.value));
      if (request !== photoRequest) return;
      photo = selected;
      draw(photo, logo);
      download.disabled = false;
      status.textContent = '';
    } catch {
      if (request === photoRequest) status.textContent = 'Фото не загрузилось. Выберите его ещё раз.';
    }
  });

  form.addEventListener('input', (event) => {
    if (event.target === photoSelect) return;
    event.target.setCustomValidity('');
    if (!download.disabled) status.textContent = '';
    draw(photo, logo);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (download.disabled) return;
    recipient.setCustomValidity(recipient.value.trim() ? '' : 'Введите имя получателя.');
    certificateNumber.setCustomValidity(certificateNumber.value.trim() ? '' : 'Введите номер сертификата.');
    if (!form.reportValidity()) return;

    const safeNumber = certificateNumber.value.trim().replace(/[^\p{L}\p{N}._-]+/gu, '-');
    draw(photo, logo);
    download.disabled = true;
    photoSelect.disabled = true;
    try {
      await downloadCertificate(sheet, 'barskie-polya-' + safeNumber + '.pdf');
      status.textContent = 'PDF готов.';
    } catch {
      status.textContent = 'Не удалось скачать PDF. Повторите попытку.';
    } finally {
      photoSelect.disabled = false;
      download.disabled = false;
    }
  });
}

initialize().catch(() => {
  status.textContent = 'Не удалось загрузить макет. Обновите страницу.';
});
