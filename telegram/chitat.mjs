/**
 * Прочитать, что владелец написал боту в Телеграм.
 *
 *   node telegram/chitat.mjs          # новые сообщения (не помечая прочитанными)
 *   node telegram/chitat.mjs --vzyat  # то же + сдвинуть offset, чтобы не повторялись
 *
 * Нужно, пока бот не запущен: long polling никто не ведёт, сообщения лежат
 * на стороне Telegram до суток. Токен берётся из telegram/.env, в вывод не идёт.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ПАПКА = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(ПАПКА, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(с => с.trim() && !с.trim().startsWith('#'))
    .map(с => [с.slice(0, с.indexOf('=')).trim(), с.slice(с.indexOf('=') + 1).trim()])
);
const ТОКЕН = env.TG_BOT_TOKEN;
if (!ТОКЕН) { console.error('нет TG_BOT_TOKEN в telegram/.env'); process.exit(1); }

const ФАЙЛ = path.join(ПАПКА, 'state.json');
const состояние = JSON.parse(fs.readFileSync(ФАЙЛ, 'utf8'));
const взять = process.argv.includes('--vzyat');

const о = await fetch(`https://api.telegram.org/bot${ТОКЕН}/getUpdates`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ offset: состояние.offset || 0, timeout: 0, limit: 100 })
});
const д = await о.json();
if (!д.ok) { console.error('Телеграм отказал:', д.description); process.exit(1); }

const сообщения = д.result.filter(u => u.message);
if (!сообщения.length) { console.log('новых сообщений нет'); process.exit(0); }

for (const u of сообщения) {
  const м = u.message;
  const когда = new Date(м.date * 1000).toLocaleString('ru-RU');
  const кто = [м.from?.first_name, м.from?.last_name].filter(Boolean).join(' ');
  const что = м.text || м.caption || (м.photo ? '[фото]' : м.document ? `[файл ${м.document.file_name}]` : м.voice ? '[голосовое]' : '[без текста]');
  console.log(`${когда} · ${кто} (${м.chat.id}):\n${что}\n`);
}

if (взять) {
  состояние.offset = д.result[д.result.length - 1].update_id + 1;
  fs.writeFileSync(ФАЙЛ, JSON.stringify(состояние, null, 2), 'utf8');
  console.log('offset сдвинут:', состояние.offset);
}
