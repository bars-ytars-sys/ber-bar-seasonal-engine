/**
 * Та же картинка в высоком разрешении через kie.ai.
 *   node tools/kie-hires.mjs pro   <фото> <имя>   — nano-banana-pro, 4K, «один в один»
 *   node tools/kie-hires.mjs topaz <фото> <имя>   — topaz/image-upscale ×4
 * Результат — demo/assets/<имя>.png. Ключ — tools/.kie_key.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const КОРЕНЬ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const КЛЮЧ = fs.readFileSync(path.join(КОРЕНЬ, 'tools/.kie_key'), 'utf8').trim();
const [режим, исходник, имя] = process.argv.slice(2);
const м = '[' + режим + '] ';
const пауза = мс => new Promise(r => setTimeout(r, мс));
async function запрос(u, н) { const о = await fetch(u, н); const т = await о.text(); let j; try { j = JSON.parse(т); } catch { j = т; } if (!о.ok) throw new Error(u + ' → ' + о.status + ' ' + т.slice(0, 300)); return j; }
const д = fs.readFileSync(исходник);
const з = await запрос('https://kieai.redpandaai.co/api/file-base64-upload', { method: 'POST', headers: { Authorization: 'Bearer ' + КЛЮЧ, 'Content-Type': 'application/json' },
  body: JSON.stringify({ base64Data: 'data:image/png;base64,' + д.toString('base64'), uploadPath: 'images/ber-bar', fileName: 'hires-' + Date.now() + '.png' }) });
const адрес = з?.data?.downloadUrl || з?.data?.url || з?.data?.fileUrl;
const ЗАДАНИЕ = 'Recreate this exact image one-to-one in high resolution: identical composition, camera angle, framing, house, lights, Christmas tree, snowman, trees, snow and colors. Do not add, remove or move anything. Only increase resolution and make every detail crisp and sharp, photorealistic, no noise, no text.';
const тело = режим === 'pro'
  ? { model: 'nano-banana-pro', input: { prompt: ЗАДАНИЕ, image_input: [адрес], aspect_ratio: '1:1', resolution: '4K', output_format: 'png' } }
  : { model: 'topaz/image-upscale', input: { image_url: адрес, upscale_factor: '4' } };
const т = await запрос('https://api.kie.ai/api/v1/jobs/createTask', { method: 'POST', headers: { Authorization: 'Bearer ' + КЛЮЧ, 'Content-Type': 'application/json' }, body: JSON.stringify(тело) });
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
    const куда = path.join(КОРЕНЬ, 'demo/assets', имя + '.png'); fs.writeFileSync(куда, б);
    const w = б.readUInt32BE(16), h = б.readUInt32BE(20);
    console.log(м + 'готово за ' + n * 5 + ' с: ' + имя + '.png ' + w + 'x' + h + ', ' + (б.length / 1048576).toFixed(1) + ' МБ');
    process.exit(0);
  }
  if (/fail|error/i.test(с)) { console.log(м + 'не выполнено: ' + JSON.stringify(d).slice(0, 400)); process.exit(1); }
}
console.log(м + 'за 8 минут результата нет'); process.exit(1);
