#!/usr/bin/env node
// Телеграм-бот Ber&Bar: принимает задачи из чата и отдаёт их Claude Code,
// запущенному в папке проекта. Контекст сессии сохраняется между сообщениями.
// Зависимостей нет: long polling через встроенный fetch.

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PAPKA_BOTA = path.dirname(fileURLToPath(import.meta.url));
const PAPKA_PROEKTA = path.resolve(PAPKA_BOTA, '..');
const FAJL_SOSTOYANIYA = path.join(PAPKA_BOTA, 'state.json');
const PAPKA_VHODA = path.join(PAPKA_BOTA, 'vhod');
const FAJL_LOGA = path.join(PAPKA_BOTA, 'log', 'bot.log');

const REZHIMY = ['default', 'acceptEdits', 'plan', 'bypassPermissions'];
const PREDEL_SOOBSHCHENIYA = 3800;

// Роли: команда -> файл промпта в корне проекта.
const ROLI = {
  '/razrab': { fajl: 'prompt-razrabotchik-sezonnost.md', imya: 'разработчик сезонности' },
  '/auditor': { fajl: 'prompt-audit-konkurentov.md', imya: 'аудитор' },
  '/tester': { fajl: 'prompt-testirovshchik.md', imya: 'тестировщик' },
};

// ── настройки ────────────────────────────────────────────────────────────────

async function prochitatEnv() {
  for (const imya of ['.env', '.env.local']) {
    let tekst;
    try {
      tekst = await fs.readFile(path.join(PAPKA_BOTA, imya), 'utf8');
    } catch {
      continue;
    }
    for (const stroka of tekst.split(/\r?\n/)) {
      const chistaya = stroka.trim();
      if (!chistaya || chistaya.startsWith('#')) continue;
      const razdel = chistaya.indexOf('=');
      if (razdel < 0) continue;
      const klyuch = chistaya.slice(0, razdel).trim();
      let znachenie = chistaya.slice(razdel + 1).trim();
      if (/^".*"$/.test(znachenie) || /^'.*'$/.test(znachenie)) znachenie = znachenie.slice(1, -1);
      if (!(klyuch in process.env)) process.env[klyuch] = znachenie;
    }
  }
}

await prochitatEnv();

const TOKEN = process.env.TG_BOT_TOKEN || '';
const RAZRESHENNYE = (process.env.TG_ALLOWED_IDS || '')
  .split(/[,\s]+/)
  .map((x) => x.trim())
  .filter(Boolean);
const MODEL = process.env.CLAUDE_MODEL || '';
const TAJMAUT = Number(process.env.CLAUDE_TIMEOUT_MS || 30 * 60 * 1000);
const PUT_CLAUDE = process.env.CLAUDE_BIN || 'claude';

if (!TOKEN) {
  console.error('Нет TG_BOT_TOKEN. Скопируйте telegram/.env.example в telegram/.env и вставьте токен от @BotFather.');
  process.exit(1);
}

// ── состояние ────────────────────────────────────────────────────────────────

const sostoyanie = {
  offset: 0,
  sessii: {}, // chatId -> session_id Claude Code
  papki: {}, // chatId -> рабочая папка
  rezhim: REZHIMY.includes(process.env.CLAUDE_PERMISSION_MODE) ? process.env.CLAUDE_PERMISSION_MODE : 'acceptEdits',
};

try {
  Object.assign(sostoyanie, JSON.parse(await fs.readFile(FAJL_SOSTOYANIYA, 'utf8')));
} catch {
  /* первый запуск */
}

let zapisPlaniruetsya = false;
async function sohranitSostoyanie() {
  if (zapisPlaniruetsya) return;
  zapisPlaniruetsya = true;
  setTimeout(async () => {
    zapisPlaniruetsya = false;
    try {
      await fs.writeFile(FAJL_SOSTOYANIYA, JSON.stringify(sostoyanie, null, 2), 'utf8');
    } catch (e) {
      await log('не сохранил состояние:', e.message);
    }
  }, 300);
}

async function log(...chasti) {
  const stroka = `${new Date().toISOString()} ${chasti.join(' ')}\n`;
  process.stdout.write(stroka);
  try {
    await fs.mkdir(path.dirname(FAJL_LOGA), { recursive: true });
    await fs.appendFile(FAJL_LOGA, stroka, 'utf8');
  } catch {
    /* лог не критичен */
  }
}

// ── Telegram API ─────────────────────────────────────────────────────────────

// Сеть может мигнуть в любой момент, поэтому ни один сбой fetch не должен
// вылетать наружу: важные вызовы повторяем, в остальных случаях отдаём ok:false.
async function api(metod, telo, { tiho = false, popytki = tiho ? 1 : 4 } = {}) {
  let posledneeOpisanie = 'неизвестно';
  for (let popytka = 1; popytka <= popytki; popytka++) {
    try {
      const otvet = await fetch(`https://api.telegram.org/bot${TOKEN}/${metod}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(telo),
        signal: AbortSignal.timeout(metod === 'getUpdates' ? 45000 : 30000),
      });
      const dannye = await otvet.json().catch(() => ({ ok: false, description: 'ответ не разобран' }));
      if (dannye.ok) return dannye;
      posledneeOpisanie = dannye.description || `код ${otvet.status}`;
      // Ошибку от самого Telegram (плохой запрос) повторять бессмысленно.
      if (otvet.status >= 400 && otvet.status < 500 && otvet.status !== 429) {
        if (!tiho) await log('TG ошибка', metod, posledneeOpisanie);
        return dannye;
      }
    } catch (e) {
      posledneeOpisanie = e?.cause?.code || e?.name || e?.message || String(e);
    }
    if (popytka < popytki) await new Promise((r) => setTimeout(r, 2000 * popytka));
  }
  if (!tiho) await log('TG недоступен', metod, posledneeOpisanie);
  return { ok: false, description: posledneeOpisanie };
}

async function otpravit(chatId, tekst, dopolnenie = {}) {
  let poslednee = null;
  for (const chast of razrezat(tekst)) {
    const otvet = await api('sendMessage', {
      chat_id: chatId,
      text: chast,
      disable_web_page_preview: true,
      ...dopolnenie,
    });
    if (otvet.ok) poslednee = otvet.result.message_id;
  }
  return poslednee;
}

async function pravit(chatId, messageId, tekst) {
  if (!messageId) return;
  await api(
    'editMessageText',
    {
      chat_id: chatId,
      message_id: messageId,
      text: tekst.slice(0, PREDEL_SOOBSHCHENIYA),
      disable_web_page_preview: true,
    },
    { tiho: true },
  );
}

// Режет длинный текст по границам строк, чтобы влезть в лимит Telegram.
function razrezat(tekst) {
  const ischodnyj = (tekst || '').trim() || '(пусто)';
  if (ischodnyj.length <= PREDEL_SOOBSHCHENIYA) return [ischodnyj];
  const chasti = [];
  let tekushchaya = '';
  const otdat = () => {
    if (tekushchaya) chasti.push(tekushchaya);
    tekushchaya = '';
  };
  for (let stroka of ischodnyj.split('\n')) {
    while (stroka.length > PREDEL_SOOBSHCHENIYA) {
      otdat();
      chasti.push(stroka.slice(0, PREDEL_SOOBSHCHENIYA));
      stroka = stroka.slice(PREDEL_SOOBSHCHENIYA);
    }
    if (tekushchaya.length + stroka.length + 1 > PREDEL_SOOBSHCHENIYA) otdat();
    tekushchaya = tekushchaya ? `${tekushchaya}\n${stroka}` : stroka;
  }
  otdat();
  return chasti;
}

async function skachatFajl(fileId, imyaPodskazka) {
  const info = await api('getFile', { file_id: fileId });
  if (!info.ok) return null;
  const put = info.result.file_path;
  let soderzhimoe;
  try {
    const otvet = await fetch(`https://api.telegram.org/file/bot${TOKEN}/${put}`, {
      signal: AbortSignal.timeout(60000),
    });
    if (!otvet.ok) return null;
    soderzhimoe = Buffer.from(await otvet.arrayBuffer());
  } catch (e) {
    await log('файл не скачался', e?.cause?.code || e?.message || String(e));
    return null;
  }
  const rasshirenie = path.extname(imyaPodskazka || put) || '.bin';
  const osnova = (imyaPodskazka ? path.basename(imyaPodskazka, rasshirenie) : 'tg').replace(/[^\w.-]+/g, '_');
  const metka = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  await fs.mkdir(PAPKA_VHODA, { recursive: true });
  const kuda = path.join(PAPKA_VHODA, `${metka}_${osnova}${rasshirenie}`);
  await fs.writeFile(kuda, soderzhimoe);
  return kuda;
}

// ── запуск Claude Code ───────────────────────────────────────────────────────

let zanyat = false;
const ochered = [];
let tekushchij = null; // { child, chatId, messageId }

function podpisRezhima(rezhim) {
  if (rezhim === 'bypassPermissions') return 'делает всё без вопросов';
  if (rezhim === 'acceptEdits') return 'правит файлы сам, команды в терминале — нет';
  if (rezhim === 'plan') return 'только планирует, ничего не меняет';
  return 'обычный: всё, что требует спроса, отклоняется';
}

function papkaChata(chatId) {
  return sostoyanie.papki[chatId] || PAPKA_PROEKTA;
}

function opisatVvod(blok) {
  const vvod = blok.input || {};
  const znachenie =
    vvod.file_path || vvod.path || vvod.pattern || vvod.command || vvod.url || vvod.description || vvod.prompt || '';
  if (!znachenie) return '';
  return ` · ${String(znachenie).replace(/\s+/g, ' ').slice(0, 90)}`;
}

function ubit(child) {
  if (!child || child.killed) return;
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
  } else {
    child.kill('SIGTERM');
  }
}

async function vypolnit(zadacha) {
  const { chatId, tekst } = zadacha;
  const papka = papkaChata(chatId);
  const sessiya = sostoyanie.sessii[chatId];

  const argumenty = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', sostoyanie.rezhim];
  if (sessiya) argumenty.push('--resume', sessiya);
  if (MODEL) argumenty.push('--model', MODEL);

  const statusId = await otpravit(chatId, sessiya ? '⏳ Работаю…' : '⏳ Новая сессия, работаю…');

  const child = spawn(PUT_CLAUDE, argumenty, {
    cwd: papka,
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  tekushchij = { child, chatId, messageId: statusId };

  child.stdin.on('error', () => {
    /* процесс мог умереть до записи */
  });
  child.stdin.write(tekst);
  child.stdin.end();

  let hvost = '';
  let otvetnyjTekst = '';
  const instrumenty = [];
  let poslednijShag = '';
  let zamechanie = '';
  let stderrTekst = '';
  const nachalo = Date.now();
  let poslednyayaPravka = 0;

  const obnovitStatus = async (silno = false) => {
    const teper = Date.now();
    if (!silno && teper - poslednyayaPravka < 3500) return;
    poslednyayaPravka = teper;
    const sekundy = Math.round((teper - nachalo) / 1000);
    const shagi = instrumenty.length ? `\nшагов: ${instrumenty.length}` : '';
    await pravit(chatId, statusId, `⏳ Работаю… ${sekundy} с${shagi}${poslednijShag ? `\n${poslednijShag}` : ''}`);
  };

  const razobratSobytie = async (sobytie) => {
    if (sobytie.type === 'system' && sobytie.subtype === 'init' && sobytie.session_id) {
      sostoyanie.sessii[chatId] = sobytie.session_id;
      await sohranitSostoyanie();
      return;
    }
    if (sobytie.type === 'assistant' && sobytie.message?.content) {
      for (const blok of sobytie.message.content) {
        if (blok.type === 'text' && blok.text?.trim()) {
          otvetnyjTekst = blok.text;
          poslednijShag = `💬 ${blok.text.trim().split('\n')[0].slice(0, 120)}`;
        } else if (blok.type === 'tool_use') {
          instrumenty.push(blok.name);
          poslednijShag = `🔧 ${blok.name}${opisatVvod(blok)}`;
        }
      }
      await obnovitStatus();
      return;
    }
    if (sobytie.type === 'result') {
      if (typeof sobytie.result === 'string' && sobytie.result.trim()) otvetnyjTekst = sobytie.result;
      if (sobytie.subtype && sobytie.subtype !== 'success') {
        zamechanie = sobytie.subtype === 'error_max_turns' ? 'упёрся в предел шагов' : String(sobytie.subtype);
      }
      if (sobytie.session_id) {
        sostoyanie.sessii[chatId] = sobytie.session_id;
        await sohranitSostoyanie();
      }
    }
  };

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (kusok) => {
    hvost += kusok;
    const stroki = hvost.split('\n');
    hvost = stroki.pop() || '';
    for (const stroka of stroki) {
      const chistaya = stroka.trim();
      if (!chistaya) continue;
      try {
        // Обработчик асинхронный: без catch сетевой сбой внутри него уронит процесс.
        razobratSobytie(JSON.parse(chistaya)).catch((e) => log('сбой разбора события', e?.message || String(e)));
      } catch {
        /* не JSON — пропускаем */
      }
    }
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (kusok) => {
    stderrTekst += kusok;
  });

  let prervanPoVremeni = false;
  const tajmer = setTimeout(() => {
    prervanPoVremeni = true;
    ubit(child);
  }, TAJMAUT);

  const kod = await new Promise((gotovo) => {
    child.on('error', (e) => {
      zamechanie = `не удалось запустить claude: ${e.message}`;
      gotovo(-1);
    });
    child.on('close', (c) => gotovo(c));
  });
  clearTimeout(tajmer);
  const prervanPolzovatelem = tekushchij?.prervana === true;
  tekushchij = null;
  if (prervanPoVremeni) zamechanie = `оборвал по лимиту времени (${Math.round(TAJMAUT / 60000)} мин)`;

  const sekundy = Math.round((Date.now() - nachalo) / 1000);
  const svodka = `— ${sekundy} с, шагов: ${instrumenty.length}`;

  if (otvetnyjTekst.trim()) {
    await pravit(chatId, statusId, `✅ Готово ${svodka}`);
    await otpravit(chatId, otvetnyjTekst);
    if (zamechanie) await otpravit(chatId, `⚠️ ${zamechanie}`);
  } else if (prervanPolzovatelem || (!zamechanie && (kod === 143 || kod === null))) {
    await pravit(chatId, statusId, `⛔️ Прервано ${svodka}`);
  } else {
    const prichina = zamechanie || stderrTekst.trim().split('\n').slice(-3).join('\n') || `код выхода ${kod}`;
    await pravit(chatId, statusId, `❌ Не получилось ${svodka}`);
    await otpravit(chatId, prichina.slice(0, PREDEL_SOOBSHCHENIYA));
  }
  await log('задача', chatId, `${sekundy}с`, `шагов ${instrumenty.length}`, `код ${kod}`);
}

async function vzyatIzOcheredi() {
  if (zanyat) return;
  const zadacha = ochered.shift();
  if (!zadacha) return;
  zanyat = true;
  try {
    await vypolnit(zadacha);
  } catch (e) {
    await log('сбой задачи', e?.stack || String(e));
    await otpravit(zadacha.chatId, `❌ Внутренний сбой: ${e?.message || e}`);
  } finally {
    zanyat = false;
    vzyatIzOcheredi();
  }
}

// ── команды ──────────────────────────────────────────────────────────────────

const SPRAVKA = [
  'Пишите задачу обычным сообщением — передам её Claude Code в папке проекта и пришлю результат.',
  'Контекст держится: следующее сообщение продолжает тот же разговор.',
  '',
  'Роли (начинают новый разговор с готовым промптом из проекта):',
  '/razrab — разработчик сезонности',
  '/auditor — аудитор',
  '/tester — тестировщик',
  '',
  'Команды:',
  '/novaya — начать с чистого листа',
  '/stop — прервать то, что идёт сейчас',
  '/status — папка, сессия, режим прав, очередь',
  '/papka <путь> — сменить рабочую папку',
  '/rezhim <default|acceptEdits|plan|bypassPermissions> — права на действия',
  '/id — мой chat id',
  '',
  'Фото и файлы можно присылать: падают в telegram/vhod/, путь уходит в задачу вместе с подписью.',
].join('\n');

async function nachatRol(chatId, imyaKomandy, dopolnenie) {
  const rol = ROLI[imyaKomandy];
  let promptRoli;
  try {
    promptRoli = await fs.readFile(path.join(PAPKA_PROEKTA, rol.fajl), 'utf8');
  } catch {
    await otpravit(chatId, `Не нашёл файл промпта ${rol.fajl} в корне проекта.`);
    return;
  }
  delete sostoyanie.sessii[chatId];
  await sohranitSostoyanie();
  const zadanie = dopolnenie
    ? `${promptRoli}\n\n---\n\nПервая задача:\n${dopolnenie}`
    : `${promptRoli}\n\n---\n\nПрими эту роль. Коротко скажи, что понял, и ждать задачу.`;
  await otpravit(chatId, `🎭 Роль: ${rol.imya}. Новый разговор.`);
  ochered.push({ chatId, tekst: zadanie });
  vzyatIzOcheredi();
}

async function obrabotatKomandu(chatId, tekst) {
  const [komanda, ...ostatok] = tekst.trim().split(/\s+/);
  const argument = ostatok.join(' ').trim();
  const imya = komanda.toLowerCase().replace(/@.*$/, '');

  if (imya === '/start' || imya === '/help' || imya === '/spravka') {
    await otpravit(chatId, `Бот Ber&Bar на связи.\n\n${SPRAVKA}`);
    return true;
  }
  if (imya === '/id') {
    await otpravit(chatId, `Ваш chat id: ${chatId}`);
    return true;
  }
  if (ROLI[imya]) {
    await nachatRol(chatId, imya, argument);
    return true;
  }
  if (imya === '/novaya' || imya === '/new') {
    delete sostoyanie.sessii[chatId];
    await sohranitSostoyanie();
    await otpravit(chatId, '🧹 Начал с чистого листа — прошлый разговор забыт.');
    return true;
  }
  if (imya === '/stop') {
    const bylo = ochered.length;
    ochered.length = 0;
    if (tekushchij) {
      tekushchij.prervana = true;
      ubit(tekushchij.child);
      await otpravit(chatId, `⛔️ Прерываю${bylo ? `, из очереди убрал ${bylo}` : ''}.`);
    } else {
      await otpravit(chatId, bylo ? `Очередь очищена (${bylo}).` : 'Сейчас ничего не выполняется.');
    }
    return true;
  }
  if (imya === '/status') {
    const stroki = [
      `папка: ${papkaChata(chatId)}`,
      `сессия: ${sostoyanie.sessii[chatId] ? `${sostoyanie.sessii[chatId].slice(0, 8)}…` : 'новая'}`,
      `режим прав: ${sostoyanie.rezhim} — ${podpisRezhima(sostoyanie.rezhim)}`,
      `сейчас: ${zanyat ? 'работаю' : 'свободен'}${ochered.length ? `, в очереди ${ochered.length}` : ''}`,
      MODEL ? `модель: ${MODEL}` : 'модель: по умолчанию',
    ];
    await otpravit(chatId, stroki.join('\n'));
    return true;
  }
  if (imya === '/papka' || imya === '/cd') {
    if (!argument) {
      await otpravit(chatId, `Сейчас: ${papkaChata(chatId)}\nСменить: /papka C:\\путь\\к\\папке`);
      return true;
    }
    const put = path.resolve(argument);
    try {
      const stat = await fs.stat(put);
      if (!stat.isDirectory()) throw new Error('это не папка');
      sostoyanie.papki[chatId] = put;
      delete sostoyanie.sessii[chatId];
      await sohranitSostoyanie();
      await otpravit(chatId, `📁 Рабочая папка: ${put}\nРазговор начат заново.`);
    } catch (e) {
      await otpravit(chatId, `Не вижу такой папки: ${e.message}`);
    }
    return true;
  }
  if (imya === '/rezhim' || imya === '/mode') {
    if (!REZHIMY.includes(argument)) {
      await otpravit(
        chatId,
        [`Сейчас: ${sostoyanie.rezhim} — ${podpisRezhima(sostoyanie.rezhim)}`, '', ...REZHIMY.map((r) => `${r} — ${podpisRezhima(r)}`)].join('\n'),
      );
      return true;
    }
    sostoyanie.rezhim = argument;
    await sohranitSostoyanie();
    await otpravit(chatId, `Режим прав: ${argument} — ${podpisRezhima(argument)}`);
    return true;
  }
  // Прочие слэш-команды (например /code-review) уходят в Claude Code как есть.
  return false;
}

// ── приём сообщений ──────────────────────────────────────────────────────────

async function obrabotatSoobshchenie(soobshchenie) {
  const chatId = soobshchenie.chat?.id;
  if (!chatId) return;
  const chatIdStroka = String(chatId);

  if (!RAZRESHENNYE.length) {
    await otpravit(
      chatId,
      `Доступ ещё не настроен. Ваш chat id: ${chatIdStroka}\nВпишите его в telegram/.env в TG_ALLOWED_IDS и перезапустите бота.`,
    );
    await log('доступ не настроен, обращался', chatIdStroka);
    return;
  }
  if (!RAZRESHENNYE.includes(chatIdStroka)) {
    await log('чужой чат', chatIdStroka);
    await otpravit(chatId, 'Этот бот приватный.');
    return;
  }

  const tekst = (soobshchenie.text || soobshchenie.caption || '').trim();
  if (tekst.startsWith('/') && (await obrabotatKomandu(chatId, tekst))) return;

  // Фото и файлы складываем на диск и подсовываем путь в задачу.
  const vlozheniya = [];
  if (soobshchenie.photo?.length) {
    vlozheniya.push({ file_id: soobshchenie.photo[soobshchenie.photo.length - 1].file_id, imya: 'foto.jpg' });
  }
  if (soobshchenie.document) {
    vlozheniya.push({ file_id: soobshchenie.document.file_id, imya: soobshchenie.document.file_name || 'fajl.bin' });
  }
  if (soobshchenie.voice || soobshchenie.audio || soobshchenie.video || soobshchenie.video_note) {
    await otpravit(chatId, 'Голосовые и видео пока не разбираю — напишите текстом.');
    if (!tekst) return;
  }

  const chasti = [];
  for (const vlozhenie of vlozheniya) {
    const put = await skachatFajl(vlozhenie.file_id, vlozhenie.imya);
    if (put) chasti.push(`Присланный файл: ${put}`);
    else await otpravit(chatId, 'Файл скачать не удалось.');
  }
  if (tekst) chasti.push(tekst);
  if (!chasti.length) return;

  ochered.push({ chatId, tekst: chasti.join('\n\n') });
  if (zanyat) await otpravit(chatId, `📥 Принял, в очереди ${ochered.length}.`);
  vzyatIzOcheredi();
}

// ── цикл опроса ──────────────────────────────────────────────────────────────

async function ustanovitKomandy() {
  await api('setMyCommands', {
    commands: [
      { command: 'razrab', description: 'роль: разработчик сезонности' },
      { command: 'auditor', description: 'роль: аудитор' },
      { command: 'tester', description: 'роль: тестировщик' },
      { command: 'novaya', description: 'начать разговор заново' },
      { command: 'stop', description: 'прервать выполнение' },
      { command: 'status', description: 'папка, сессия, режим' },
      { command: 'papka', description: 'сменить рабочую папку' },
      { command: 'rezhim', description: 'права на действия' },
      { command: 'id', description: 'мой chat id' },
    ],
  });
}

async function cikl() {
  const ya = await api('getMe');
  if (!ya.ok) {
    console.error('Токен не принят Telegram:', ya.description);
    process.exit(1);
  }
  await log('бот запущен:', `@${ya.result.username}`, '| папка:', PAPKA_PROEKTA, '| режим:', sostoyanie.rezhim);
  if (!RAZRESHENNYE.length) await log('ВНИМАНИЕ: TG_ALLOWED_IDS пуст — бот скажет вам ваш chat id и ничего больше.');
  await ustanovitKomandy();

  for (;;) {
    try {
      const otvet = await api(
        'getUpdates',
        { offset: sostoyanie.offset, timeout: 30, allowed_updates: ['message'] },
        { tiho: true },
      );
      if (!otvet.ok) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      for (const obnovlenie of otvet.result) {
        sostoyanie.offset = obnovlenie.update_id + 1;
        await sohranitSostoyanie();
        if (obnovlenie.message) {
          obrabotatSoobshchenie(obnovlenie.message).catch((e) => log('сбой обработки', e?.stack || String(e)));
        }
      }
    } catch (e) {
      await log('сбой опроса', e?.message || String(e));
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

process.on('SIGINT', () => {
  if (tekushchij) ubit(tekushchij.child);
  process.exit(0);
});

// Последняя страховка: одиночный сбой (обрыв сети, битый ответ) не должен
// гасить бота — пишем в лог и продолжаем опрос.
process.on('unhandledRejection', (prichina) => {
  log('необработанный сбой', prichina?.stack || prichina?.message || String(prichina));
});
process.on('uncaughtException', (e) => {
  log('исключение', e?.stack || String(e));
});

await cikl();
