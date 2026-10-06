// Одна тестовая генерация панорамы Барского дома через Kie AI (Kling 3.0 image-to-video).
// Модель и цена выбраны заранее: kling-3.0/video, mode std, без звука — 14 кредитов/с, 5 с = 70 кредитов
// (тариф подтверждён по https://api.kie.ai/api/v1/models; та же модель, что в задаче c547f8a0...).
// Ключ читается из tools/.kie_key, в код и в отчёт не попадает.
// Запуск: node local-redesign/tools-video/gen-panorama.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/ASON/Desktop/Ber&Bar';
const KEY = fs.readFileSync(path.join(root, 'tools/.kie_key'), 'utf8').trim();
if (!KEY) throw new Error('нет ключа kie');
const auth = { Authorization: `Bearer ${KEY}` };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const source = path.join(root, 'local-redesign/proof/bp-hero-video/source-barski.jpg');
const outDir = path.join(root, 'local-redesign/proof/bp-hero-video/panorama-v2');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'panorama-barski.mp4');

const prompt = [
  'Smooth, slow, steady panoramic camera move along the facade of the existing country house in the source photo.',
  'Keep the house and its immediate surroundings clearly recognizable: same architecture, proportions, window and door count, roof shape, wall and roof materials, and the same positions of the deck, pergola with curtains, outdoor furniture, deer-shaped barbecue, gravel path, lawn, spruce tree and fence.',
  'Keep the original time of day, sunlight direction, exposure and colour grading: same colour temperature, saturation, contrast and tones as the source photo.',
  'Only a light natural breeze in the existing foliage is allowed.',
  'No quick camera moves, no zoom, no morphing, no warping of the building, no new objects, no people, no animals, no text or watermarks, no changed weather, no sunset or night.',
].join(' ');

async function retry(label, tries, fn) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try { return await fn(); } catch (e) {
      last = e;
      console.log(`  ${label}: попытка ${i}/${tries} — ${e.message}`);
      if (i < tries) await sleep(3000 * i);
    }
  }
  throw new Error(`${label}: ${last?.message}`);
}

const balance = async () => {
  const r = await fetch('https://api.kie.ai/api/v1/chat/credit', { headers: auth });
  const j = await r.json();
  return j?.data ?? null;
};
const before = await balance();
console.log('баланс до:', before);

const uploadUrl = await retry('загрузка фото', 5, async () => {
  const fd = new FormData();
  fd.append('file', new Blob([fs.readFileSync(source)]), path.basename(source));
  fd.append('uploadPath', 'bp-hero-panorama');
  fd.append('fileName', path.basename(source));
  const res = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', { method: 'POST', headers: auth, body: fd });
  const json = await res.json();
  const url = json?.data?.downloadUrl;
  if (!url) throw new Error(JSON.stringify(json).slice(0, 300));
  return url;
});
console.log('фото загружено:', uploadUrl);

const taskId = await retry('постановка задачи', 4, async () => {
  const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'kling-3.0/video',
      input: { prompt, image_urls: [uploadUrl], sound: false, duration: '5', aspect_ratio: '16:9', mode: 'std', multi_shots: false, multi_prompt: [], kling_elements: [] },
    }),
  });
  const json = await res.json();
  const id = json?.data?.taskId;
  if (!id) throw new Error(JSON.stringify(json).slice(0, 400));
  return id;
});
console.log('задача:', taskId);

let credits = null, resultUrl = null, state = null;
for (let i = 0; i < 150; i++) {
  await sleep(10000);
  const s = await retry('статус', 4, async () => {
    const res = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, { headers: auth });
    const json = await res.json();
    if (!json?.data?.state) throw new Error(JSON.stringify(json).slice(0, 200));
    return json.data;
  });
  state = s.state;
  if (s.state === 'success') { resultUrl = JSON.parse(s.resultJson).resultUrls[0]; credits = s.creditsConsumed; break; }
  if (s.state === 'fail') { console.log('провал:', s.failCode, s.failMsg); break; }
  if (i % 3 === 2) console.log(`  ждём… ${(i + 1) * 10} с (${s.state})`);
}

const after = await balance();
console.log('баланс после:', after, '| списано по API:', credits);

if (resultUrl) {
  await retry('скачивание', 5, async () => {
    const res = await fetch(resultUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 50000) throw new Error(`маленький файл ${buf.length}`);
    fs.writeFileSync(outFile, buf);
  });
}

fs.writeFileSync(path.join(outDir, 'generaciya.json'), JSON.stringify({
  date: new Date().toISOString(),
  model: 'kling-3.0/video', mode: 'std', sound: false, duration_s: 5, aspect_ratio: '16:9',
  price_note: '14 кредитов за секунду без звука по тарифу kie.ai; за 5 с списано creditsConsumed',
  taskId, state, creditsConsumed: credits, balanceBefore: before, balanceAfter: after,
  source, sourceUrl: uploadUrl, output: resultUrl, file: outFile, prompt,
}, null, 2));
console.log(resultUrl ? `готово: ${outFile} (${(fs.statSync(outFile).size / 1048576).toFixed(2)} МБ)` : 'результата нет');
