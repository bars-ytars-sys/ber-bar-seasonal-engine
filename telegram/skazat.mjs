/**
 * Написать владельцу в Телеграм от имени бота-координатора.
 *
 *   node telegram/skazat.mjs "текст сообщения"
 *   node telegram/skazat.mjs --fajl demo/zima-br.html "подпись"
 *   echo "текст" | node telegram/skazat.mjs -
 *
 * Токен и chat id берутся из telegram/.env — в вывод не попадают.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ПАПКА = path.dirname(fileURLToPath(import.meta.url));
const ПРОЕКТ = path.resolve(ПАПКА, '..');

const env = Object.fromEntries(
  fs.readFileSync(path.join(ПАПКА, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(с => с.trim() && !с.trim().startsWith('#'))
    .map(с => [с.slice(0, с.indexOf('=')).trim(), с.slice(с.indexOf('=') + 1).trim()])
);
const ТОКЕН = env.TG_BOT_TOKEN;
const ЧАТ = process.env.TG_CHAT || (env.TG_ALLOWED_IDS || '').split(/[,\s]+/).filter(Boolean)[0];
if (!ТОКЕН || !ЧАТ) { console.error('нет TG_BOT_TOKEN или TG_ALLOWED_IDS в telegram/.env'); process.exit(1); }

const КАРТИНКИ = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function api(метод, тело, файл) {
  let опции;
  if (файл) {
    const форма = new FormData();
    for (const [к, з] of Object.entries(тело)) форма.append(к, String(з));
    форма.append(файл.поле, new Blob([fs.readFileSync(файл.путь)]), path.basename(файл.путь));
    опции = { method: 'POST', body: форма };
  } else {
    опции = { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(тело) };
  }
  const о = await fetch(`https://api.telegram.org/bot${ТОКЕН}/${метод}`, опции);
  const д = await о.json();
  if (!д.ok) { console.error('Телеграм отказал:', д.description); process.exit(1); }
  return д.result;
}

const арг = process.argv.slice(2);
if (арг[0] === '--fajl' || арг[0] === '--файл') {
  const путь = path.resolve(ПРОЕКТ, арг[1]);
  if (!fs.existsSync(путь)) { console.error('нет файла:', путь); process.exit(1); }
  const подпись = арг.slice(2).join(' ');
  const картинка = КАРТИНКИ.has(path.extname(путь).toLowerCase()) && fs.statSync(путь).size < 9e6;
  const р = await api(
    картинка ? 'sendPhoto' : 'sendDocument',
    { chat_id: ЧАТ, ...(подпись ? { caption: подпись.slice(0, 1000) } : {}) },
    { поле: картинка ? 'photo' : 'document', путь }
  );
  console.log('отправлено, message_id', р.message_id, '—', path.basename(путь));
} else {
  let текст = арг.join(' ');
  if (!текст || текст === '-') текст = fs.readFileSync(0, 'utf8');
  текст = текст.trim();
  if (!текст) { console.error('пустое сообщение'); process.exit(1); }
  for (let i = 0; i < текст.length; i += 3900) {
    const р = await api('sendMessage', { chat_id: ЧАТ, text: текст.slice(i, i + 3900), disable_web_page_preview: true });
    console.log('отправлено, message_id', р.message_id);
  }
}
