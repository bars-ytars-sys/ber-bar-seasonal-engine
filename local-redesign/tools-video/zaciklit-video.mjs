// Собирает бесшовную петлю из короткого клипа Kling и раскладывает её в три файла первого экрана.
// Схема: клип проигрывается вперёд, затем назад (ping-pong) — стык середины и стык конца с началом
// совпадают кадр в кадр, поэтому петля без рывка и без «призраков» кроссфейда.
//
// Запуск: node zaciklit-video.mjs <kv> <vhod.mp4> <papka-vyhodа> [imya]
//   kv        — путь к ffmpeg (ffmpeg-static)
//   vhod.mp4  — сырой клип Kling (5 с)
//   imya      — базовое имя файлов, по умолчанию hero (hero.webm, hero.mp4, hero-mobile.mp4)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [ffmpeg, input, outDir, name = 'hero'] = process.argv.slice(2);
if (!ffmpeg || !input || !outDir) throw new Error('usage: <ffmpeg> <vhod.mp4> <papka> [imya]');
if (!fs.existsSync(ffmpeg)) throw new Error(`нет ffmpeg: ${ffmpeg}`);
if (!fs.existsSync(input)) throw new Error(`нет входного видео: ${input}`);
fs.mkdirSync(outDir, { recursive: true });

const run = (args) => {
  process.stdout.write(`\n▶ ffmpeg ${args.slice(0, 6).join(' ')} …\n`);
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
};

// Петля: вперёд + назад. reverse держит весь клип в памяти — 5 с это нормально.
const LOOP = '[0:v]split=2[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[loop]';

const outputs = [
  // desktop webm — основной источник (VP9, без звука)
  { file: `${name}.webm`, filter: `${LOOP};[loop]scale='min(1920,iw)':-2[out]`, codec: ['-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2'] },
  // desktop mp4 — запасной для Safari/старых браузеров (H.264)
  { file: `${name}.mp4`, filter: `${LOOP};[loop]scale='min(1920,iw)':-2[out]`, codec: ['-c:v', 'libx264', '-crf', '23', '-preset', 'slow', '-profile:v', 'high', '-movflags', '+faststart'] },
  // мобильный — меньше и легче
  { file: `${name}-mobile.mp4`, filter: `${LOOP};[loop]scale=-2:'min(540,ih)'[out]`, codec: ['-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-profile:v', 'main', '-movflags', '+faststart'] },
];

for (const o of outputs) {
  run(['-i', input, '-filter_complex', o.filter, '-map', '[out]', '-an', ...o.codec, '-pix_fmt', 'yuv420p', path.join(outDir, o.file)]);
}

for (const o of outputs) {
  const p = path.join(outDir, o.file);
  const s = fs.statSync(p);
  console.log(`${o.file.padEnd(20)} ${(s.size / 1024 / 1024).toFixed(2)} МБ`);
}
console.log('\nГотово:', outDir);
