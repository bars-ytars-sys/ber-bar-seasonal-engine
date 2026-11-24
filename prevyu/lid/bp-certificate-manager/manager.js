const assetRoot = './assets/';
const form = document.getElementById('issue-certificate');
const recipient = document.getElementById('recipient');
const denomination = document.getElementById('denomination');
const certificateNumber = document.getElementById('certificate-number');
const download = document.getElementById('download-pdf');
const status = document.getElementById('pdf-status');
const sheet = document.getElementById('certificate-sheet');
const context = sheet.getContext('2d', {alpha: false});
const rubles = new Intl.NumberFormat('ru-RU');
const serif = 'BPProductionSerif, Georgia, serif';
const sans = 'BPProductionRubik, Arial, sans-serif';

async function loadImage(filename) {
  const image = new Image();
  image.src = assetRoot + filename;
  await image.decode();
  return image;
}

function cover(image, x, y, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  context.drawImage(image, (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2,
    sourceWidth, sourceHeight, x, y, width, height);
}

function write(text, x, y, size, {family = sans, color = '#233b32', width = 520} = {}) {
  const weight = family === serif ? 300 : 400;
  context.font = weight + ' ' + size + 'px ' + family;
  const measured = context.measureText(text).width;
  if (measured > width) context.font = weight + ' ' + Math.floor(size * width / measured) + 'px ' + family;
  context.fillStyle = color;
  context.fillText(text, x, y);
}

function draw(photo, logo) {
  context.setTransform(2, 0, 0, 2, 0, 0);
  context.fillStyle = '#fff9ee';
  context.fillRect(0, 0, 1200, 848);
  cover(photo, 24, 24, 510, 800);

  const left = 585;
  context.fillStyle = '#233b32';
  context.fillRect(left, 58, 232, 57);
  context.drawImage(logo, left + 18, 68, 196, 196 * logo.naturalHeight / logo.naturalWidth);
  write('Проживание и дополнительные услуги', left, 157, 20, {color: '#506256'});
  write('Подарочный', left, 242, 65, {family: serif});
  write('сертификат', left, 313, 65, {family: serif});

  write('Кому', left, 388, 19, {color: '#506256'});
  write(recipient.value.trim() || 'Имя получателя', left, 440, 40, {family: serif, width: 555});

  context.fillStyle = '#e0e7d4';
  context.fillRect(left, 481, 545, 122);
  write('Номинал', left + 24, 516, 19, {color: '#506256'});
  const amount = denomination.validity.valid ? rubles.format(denomination.valueAsNumber) + ' ₽' : '— ₽';
  write(amount, left + 24, 578, 48, {family: serif, width: 495});

  write('№ ' + (certificateNumber.value.trim() || '—'), left, 663, 24, {width: 545});
  context.fillStyle = '#cec9b7';
  context.fillRect(left, 699, 545, 1);
  write('Действует на новое бронирование.', left, 746, 19, {color: '#506256'});
  write('Можно использовать через пять дней после покупки.', left, 775, 19, {color: '#506256'});

  sheet.setAttribute('aria-label', 'Сертификат. Получатель: ' + (recipient.value.trim() || 'не указан') +
    '. Номинал: ' + amount + '. Номер: ' + (certificateNumber.value.trim() || 'не указан') + '.');
}

function jpegToPdf(jpeg, width, height) {
  // A one-page A4 PDF embedding the JPEG preview at full resolution.
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let length = 0;

  function append(...parts) {
    for (const part of parts) {
      const bytes = typeof part === 'string' ? encoder.encode(part) : part;
      chunks.push(bytes);
      length += bytes.byteLength;
    }
  }

  function addObject(...parts) {
    offsets.push(length);
    append(offsets.length - 1 + ' 0 obj\n', ...parts, '\nendobj\n');
  }

  append('%PDF-1.4\n', new Uint8Array([37, 226, 227, 207, 211, 10]));
  addObject('<< /Type /Catalog /Pages 2 0 R >>');
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Certificate 4 0 R >> >> /Contents 5 0 R >>`);
  addObject(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.byteLength} >>\nstream\n`, jpeg, '\nendstream');
  const contents = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Certificate Do\nQ\n`;
  addObject(`<< /Length ${contents.length} >>\nstream\n${contents}endstream`);
  const xref = length;
  append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for (const offset of offsets.slice(1)) append(String(offset).padStart(10, '0') + ' 00000 n \n');
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks, {type: 'application/pdf'});
}

async function initialize() {
  const [photo, logo] = await Promise.all([
    loadImage('barskie-polya-winter.webp'),
    loadImage('barskie-polya-logo.svg'),
    ...[
      [`300 65px ${serif}`, 'Подарочный сертификат'],
      [`400 24px ${sans}`, 'Номинал, 10 000 ₽ № BC-01'],
    ].map(([font, sample]) => document.fonts.load(font, sample).catch(() => [])),
  ]);

  draw(photo, logo);
  download.disabled = false;

  form.addEventListener('input', (event) => {
    event.target.setCustomValidity('');
    status.textContent = '';
    draw(photo, logo);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    recipient.setCustomValidity(recipient.value.trim() ? '' : 'Введите имя получателя.');
    certificateNumber.setCustomValidity(certificateNumber.value.trim() ? '' : 'Введите номер сертификата.');
    if (!form.reportValidity()) return;

    const safeNumber = certificateNumber.value.trim().replace(/[^\p{L}\p{N}._-]+/gu, '-');
    draw(photo, logo);
    download.disabled = true;
    try {
      const jpeg = await new Promise((resolve) => sheet.toBlob(resolve, 'image/jpeg', 0.95));
      if (!jpeg) throw new Error('Empty preview image');
      const pdf = jpegToPdf(new Uint8Array(await jpeg.arrayBuffer()), sheet.width, sheet.height);
      const url = URL.createObjectURL(pdf);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'barskie-polya-' + safeNumber + '.pdf';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
      status.textContent = 'PDF готов.';
    } catch {
      status.textContent = 'Не удалось скачать PDF. Повторите попытку.';
    } finally {
      download.disabled = false;
    }
  });
}

initialize().catch(() => {
  status.textContent = 'Не удалось загрузить макет. Обновите страницу.';
});
