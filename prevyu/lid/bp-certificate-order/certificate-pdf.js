const rubles = new Intl.NumberFormat('ru-RU');
const serif = 'BPProductionSerif, Georgia, serif';
const sans = 'BPProductionRubik, Arial, sans-serif';

export async function loadImage(source) {
  const image = new Image();
  image.src = source;
  await image.decode();
  return image;
}

function cover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  context.drawImage(image, (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2,
    sourceWidth, sourceHeight, x, y, width, height);
}

function writeText(context, text, x, y, size, {family = sans, color = '#233b32', width = 520} = {}) {
  const weight = family === serif ? 300 : 400;
  context.font = weight + ' ' + size + 'px ' + family;
  const measured = context.measureText(text).width;
  if (measured > width) context.font = weight + ' ' + Math.floor(size * width / measured) + 'px ' + family;
  context.fillStyle = color;
  context.fillText(text, x, y);
}

export function drawCertificate(sheet, photo, logo, {name, nominal, number = '', requiresConfirmation = false}) {
  const context = sheet.getContext('2d', {alpha: false});
  const write = (...parts) => writeText(context, ...parts);
  context.setTransform(2, 0, 0, 2, 0, 0);
  context.fillStyle = '#fff9ee';
  context.fillRect(0, 0, 1200, 848);
  cover(context, photo, 24, 24, 510, 800);

  const left = 585;
  context.fillStyle = '#233b32';
  context.fillRect(left, 58, 232, 57);
  context.drawImage(logo, left + 18, 68, 196, 196 * logo.naturalHeight / logo.naturalWidth);
  write('Проживание и дополнительные услуги', left, 157, 20, {color: '#506256'});
  write('Подарочный', left, 242, 65, {family: serif});
  write('сертификат', left, 313, 65, {family: serif});

  write('Кому', left, 388, 19, {color: '#506256'});
  write(name || 'Имя получателя', left, 440, 40, {family: serif, width: 555});

  context.fillStyle = '#e0e7d4';
  context.fillRect(left, 481, 545, 122);
  write('Номинал', left + 24, 516, 19, {color: '#506256'});
  const amount = Number.isSafeInteger(nominal) ? rubles.format(nominal) + ' ₽' : '— ₽';
  write(amount, left + 24, 578, 48, {family: serif, width: 495});

  write('№ ' + (number || '—'), left, 663, 24, {width: 545});
  context.fillStyle = '#cec9b7';
  context.fillRect(left, 699, 545, 1);
  write(requiresConfirmation ? 'Действует на новое бронирование после подтверждения оплаты.' : 'Действует на новое бронирование.', left, 746, 19, {color: '#506256'});
  write('Можно использовать через пять дней после покупки.', left, 775, 19, {color: '#506256'});

  sheet.setAttribute('aria-label', 'Сертификат. Получатель: ' + (name || 'не указан') +
    '. Номинал: ' + amount + '. Номер: ' + (number || 'не указан') + '.');
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

export async function loadCertificateFonts() {
  await Promise.all([
    document.fonts.load(`300 65px ${serif}`, 'Подарочный сертификат').catch(() => []),
    document.fonts.load(`400 24px ${sans}`, 'Номинал, 10 000 ₽ № BC-01').catch(() => []),
  ]);
}

export async function downloadCertificate(sheet, filename) {
  const jpeg = await new Promise((resolve) => sheet.toBlob(resolve, 'image/jpeg', 0.95));
  if (!jpeg) throw new Error('Empty preview image');
  const pdf = jpegToPdf(new Uint8Array(await jpeg.arrayBuffer()), sheet.width, sheet.height);
  const url = URL.createObjectURL(pdf);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
