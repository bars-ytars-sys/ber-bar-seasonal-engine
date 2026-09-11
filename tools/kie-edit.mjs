/**
 * Правка фотографии через kie.ai (google/nano-banana-edit) с произвольным заданием.
 *
 *   node tools/kie-edit.mjs <фото> <имя-результата> <файл-с-заданием.txt>
 *
 * Результат — demo/assets/<имя>.png. Ключ — tools/.kie_key (в git не идёт).
 * Та же схема, что tools/kie-foto.mjs, только задание берётся из файла.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const КОРЕНЬ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const КЛЮЧ = fs.readFileSync(path.join(КОРЕНЬ, 'tools/.kie_key'), 'utf8').trim();
const [исходник, имя, файлЗадания] = process.argv.slice(2);
if (!исходник || !имя || !файлЗадания) { console.error('нужно: <фото> <имя> <задание.txt>'); process.exit(1); }
const ЗАДАНИЕ = fs.readFileSync(файлЗадания, 'utf8').replace(/\s+/g, ' ').trim();
const пауза = мс => new Promise(r => setTimeout(r, мс));
const метка = '[' + имя + '] ';

async function запрос(адрес, настройки) {
  const о = await fetch(адрес, настройки);
  const текст = await о.text();
  let тело; try { тело = JSON.parse(текст); } catch { тело = текст; }
  if (!о.ok) throw new Error(адрес + ' → ' + о.status + ' ' + текст.slice(0, 200));
  return тело;
}

const данные = fs.readFileSync(исходник);
const расш = path.extname(исходник).slice(1).toLowerCase() || 'jpg';
const mime = расш === 'png' ? 'image/png' : расш === 'webp' ? 'image/webp' : 'image/jpeg';
const з = await запрос('https://kieai.redpandaai.co/api/file-base64-upload', {
  method: 'POST', headers: { Authorization: 'Bearer ' + КЛЮЧ, 'Content-Type': 'application/json' },
  body: JSON.stringify({ base64Data: 'data:' + mime + ';base64,' + данные.toString('base64'), uploadPath: 'images/ber-bar', fileName: 'ishodnik-' + Date.now() + '.' + расш })
});
const адресИсходника = з?.data?.downloadUrl || з?.data?.url || з?.data?.fileUrl;
if (!адресИсходника) throw new Error('загрузка не вернула адрес');
const т = await запрос('https://api.kie.ai/api/v1/jobs/createTask', {
  method: 'POST', headers: { Authorization: 'Bearer ' + КЛЮЧ, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'google/nano-banana-edit', input: { prompt: ЗАДАНИЕ, image_urls: [адресИсходника], output_format: 'png' } })
});
const id = т?.data?.taskId || т?.data?.task_id || т?.taskId;
if (!id) throw new Error('задача не создана: ' + JSON.stringify(т).slice(0, 200));
console.log(метка + 'задача поставлена');
for (let n = 1; n <= 72; n++) {
  await пауза(5000);
  const о = await запрос('https://api.kie.ai/api/v1/jobs/recordInfo?taskId=' + encodeURIComponent(id), { headers: { Authorization: 'Bearer ' + КЛЮЧ } });
  const д = о?.data || {}; const с = д.state || д.status || '';
  if (/success|completed?/i.test(с)) {
    let итог = д.resultJson || д.result || д.output; if (typeof итог === 'string') { try { итог = JSON.parse(итог); } catch {} }
    const сс = итог?.resultUrls || итог?.result_urls || итог?.urls || итог?.images || [];
    const адрес = Array.isArray(сс) ? сс[0] : сс;
    const байты = Buffer.from(await (await fetch(typeof адрес === 'string' ? адрес : адрес.url)).arrayBuffer());
    const куда = path.join(КОРЕНЬ, 'demo/assets', имя + '.png');
    fs.writeFileSync(куда, байты);
    console.log(метка + 'готово за ' + n * 5 + ' с: ' + куда + ', ' + (байты.length / 1024).toFixed(0) + ' КБ');
    process.exit(0);
  }
  if (/fail|error/i.test(с)) throw new Error(метка + 'не выполнено: ' + JSON.stringify(д).slice(0, 300));
}
throw new Error(метка + 'за 6 минут результата нет');
