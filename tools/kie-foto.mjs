/**
 * Достраиваем фотографию через kie.ai: берём снимок заказчика и просим
 * дорисовать к нему банный чан. Готовый кадр кладём в demo/assets.
 *
 * Запуск:  node tools/kie-foto.mjs <путь-к-фото> [имя-результата]
 * Пример:  node tools/kie-foto.mjs "C:/Users/ASON/Desktop/spas.jpg" bp-yablochny-spas
 *
 * Ключ лежит в tools/.kie_key и в репозиторий не попадает.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const КОРЕНЬ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const КЛЮЧ = fs.readFileSync(path.join(КОРЕНЬ, 'tools/.kie_key'), 'utf8').trim();

const исходник = process.argv[2];
const имяРезультата = process.argv[3] || 'bp-yablochny-spas';
if (!исходник) { console.error('нужен путь к фотографии'); process.exit(1); }
if (!fs.existsSync(исходник)) { console.error('файл не найден: ' + исходник); process.exit(1); }

/* Просьба к модели. Держим по-английски: так модели понимают точнее.
   Правим здесь, если кадр выйдет не тот. */
const ЗАДАНИЕ = [
  'Add a large round wooden Russian hot tub (banny chan) with steaming hot water',
  'as the main subject of the scene, standing outdoors on the wooden deck.',
  'Arrange fresh red and yellow apples beautifully around the rim of the tub and',
  'floating on the water, with cinnamon sticks and a few autumn oak leaves.',
  'Keep the existing autumn decoration of the original photo: sunflowers, hay bale,',
  'orange autumn leaves, warm wooden tones.',
  'Photorealistic, warm golden evening light, cosy countryside resort atmosphere,',
  'shallow depth of field. No text, no watermarks, no people.'
].join(' ');

const пауза = мс => new Promise(r => setTimeout(r, мс));

async function запрос(адрес, настройки) {
  const о = await fetch(адрес, настройки);
  const текст = await о.text();
  let тело;
  try { тело = JSON.parse(текст); } catch { тело = текст; }
  if (!о.ok) throw new Error(адрес + ' → ' + о.status + ' ' + текст.slice(0, 200));
  return тело;
}

/* ── 1. Загружаем исходник: модели нужен адрес, а не файл ── */
async function загрузить(файл) {
  const данные = fs.readFileSync(файл);
  const расш = path.extname(файл).slice(1).toLowerCase() || 'jpg';
  const mime = расш === 'png' ? 'image/png' : расш === 'webp' ? 'image/webp' : 'image/jpeg';
  console.log('загружаем исходник, ' + (данные.length / 1024).toFixed(0) + ' КБ…');
  const о = await запрос('https://kieai.redpandaai.co/api/file-base64-upload', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + КЛЮЧ, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base64Data: 'data:' + mime + ';base64,' + данные.toString('base64'),
      uploadPath: 'images/ber-bar',
      fileName: 'ishodnik-' + Date.now() + '.' + расш
    })
  });
  const адрес = о?.data?.downloadUrl || о?.data?.url || о?.data?.fileUrl;
  if (!адрес) throw new Error('загрузка не вернула адрес: ' + JSON.stringify(о).slice(0, 300));
  console.log('исходник доступен по адресу');
  return адрес;
}

/* ── 2. Ставим задачу на правку ── */
async function поставитьЗадачу(адресИсходника) {
  console.log('ставим задачу на дорисовку чана…');
  const о = await запрос('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + КЛЮЧ, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/nano-banana-edit',
      input: { prompt: ЗАДАНИЕ, image_urls: [адресИсходника], output_format: 'png' }
    })
  });
  const id = о?.data?.taskId || о?.data?.task_id || о?.taskId;
  if (!id) throw new Error('задача не создана: ' + JSON.stringify(о).slice(0, 300));
  console.log('задача ' + id);
  return id;
}

/* ── 3. Ждём результат ── */
async function дождаться(id) {
  for (let n = 1; n <= 60; n++) {
    await пауза(5000);
    const о = await запрос('https://api.kie.ai/api/v1/jobs/recordInfo?taskId=' + encodeURIComponent(id), {
      headers: { Authorization: 'Bearer ' + КЛЮЧ }
    });
    const д = о?.data || {};
    const состояние = д.state || д.status || '';
    if (n % 3 === 0 || состояние) console.log('  ' + (n * 5) + ' с: ' + (состояние || 'ждём'));
    if (/success|completed?/i.test(состояние)) {
      let итог = д.resultJson || д.result || д.output;
      if (typeof итог === 'string') { try { итог = JSON.parse(итог); } catch {} }
      const ссылки = итог?.resultUrls || итог?.result_urls || итог?.urls || итог?.images || [];
      const адрес = Array.isArray(ссылки) ? ссылки[0] : ссылки;
      if (!адрес) throw new Error('готово, но адреса нет: ' + JSON.stringify(д).slice(0, 400));
      return typeof адрес === 'string' ? адрес : адрес.url;
    }
    if (/fail|error/i.test(состояние)) throw new Error('задача не выполнена: ' + JSON.stringify(д).slice(0, 300));
  }
  throw new Error('за пять минут результата не дождались');
}

/* ── 4. Забираем и кладём в demo/assets ── */
async function забрать(адрес, имя) {
  const о = await fetch(адрес);
  const байты = Buffer.from(await о.arrayBuffer());
  const куда = path.join(КОРЕНЬ, 'demo/assets', имя + '.png');
  fs.writeFileSync(куда, байты);
  console.log('сохранено: ' + куда + ', ' + (байты.length / 1024).toFixed(0) + ' КБ');
  return куда;
}

const адресИсходника = await загрузить(исходник);
const id = await поставитьЗадачу(адресИсходника);
const адресИтога = await дождаться(id);
console.log('готовый кадр: ' + адресИтога);
await забрать(адресИтога, имяРезультата);
console.log('\nдальше: пережать в webp под карточку и подставить в data-bo-img');
