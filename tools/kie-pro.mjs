/**
 * Генерация через kie.ai nano-banana-pro по фото и заданию.
 *   node tools/kie-pro.mjs <фото> <имя> <задание.txt> [соотношение=16:9] [разрешение=4K]
 * Результат — demo/assets/<имя>.jpg (сервис отдаёт JPEG). Ключ — tools/.kie_key.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const КОРЕНЬ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const КЛЮЧ = fs.readFileSync(path.join(КОРЕНЬ, 'tools/.kie_key'), 'utf8').trim();
const [исходник, имя, файлЗадания, соотношение = '16:9', разрешение = '4K'] = process.argv.slice(2);
const м = '[' + имя + '] ';
const пауза = мс => new Promise(r => setTimeout(r, мс));
async function запрос(u, н) { const о = await fetch(u, н); const т = await о.text(); let j; try { j = JSON.parse(т); } catch { j = т; } if (!о.ok) throw new Error(u + ' → ' + о.status + ' ' + т.slice(0, 300)); return j; }
const д = fs.readFileSync(исходник);
const mime = д[0] === 0xFF ? 'image/jpeg' : 'image/png';
const з = await запрос('https://kieai.redpandaai.co/api/file-base64-upload', { method: 'POST', headers: { Authorization: 'Bearer ' + КЛЮЧ, 'Content-Type': 'application/json' },
  body: JSON.stringify({ base64Data: 'data:' + mime + ';base64,' + д.toString('base64'), uploadPath: 'images/ber-bar', fileName: 'pro-' + Date.now() + (mime === 'image/jpeg' ? '.jpg' : '.png') }) });
const адрес = з?.data?.downloadUrl || з?.data?.url || з?.data?.fileUrl;
const т = await запрос('https://api.kie.ai/api/v1/jobs/createTask', { method: 'POST', headers: { Authorization: 'Bearer ' + КЛЮЧ, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'nano-banana-pro', input: { prompt: fs.readFileSync(файлЗадания, 'utf8').replace(/\s+/g, ' ').trim(), image_input: [адрес], aspect_ratio: соотношение, resolution: разрешение, output_format: 'jpg' } }) });
const id = т?.data?.taskId || т?.data?.task_id;
if (!id) { console.log(м + 'задача не создана: ' + JSON.stringify(т).slice(0, 300)); process.exit(1); }
console.log(м + 'задача поставлена');
for (let n = 1; n <= 96; n++) {
  await пауза(5000);
  const о = await запрос('https://api.kie.ai/api/v1/jobs/recordInfo?taskId=' + encodeURIComponent(id), { headers: { Authorization: 'Bearer ' + КЛЮЧ } });
  const d = о?.data || {}; const с = d.state || d.status || '';
  if (/success|completed?/i.test(с)) {
    let и = d.resultJson || d.result; if (typeof и === 'string') { try { и = JSON.parse(и); } catch {} }
    const сс = и?.resultUrls || и?.result_urls || и?.urls || [];
    const u = Array.isArray(сс) ? сс[0] : сс;
    const б = Buffer.from(await (await fetch(typeof u === 'string' ? u : u.url)).arrayBuffer());
    const куда = path.join(КОРЕНЬ, 'demo/assets', имя + '.jpg'); fs.writeFileSync(куда, б);
    console.log(м + 'готово за ' + n * 5 + ' с: ' + имя + '.jpg, ' + (б.length / 1048576).toFixed(1) + ' МБ');
    process.exit(0);
  }
  if (/fail|error/i.test(с)) { console.log(м + 'не выполнено: ' + JSON.stringify(d).slice(0, 400)); process.exit(1); }
}
console.log(м + 'за 8 минут результата нет'); process.exit(1);
