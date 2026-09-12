/**
 * MCP-сервер «Берёзовая роща / Барские поля».
 *
 * Зачем. До сих пор каждую проверку сайта приходилось писать заново
 * отдельным скриптом: открыть страницу, померить блок, посмотреть, что
 * его перекрывает. Здесь это собрано в постоянные инструменты, которыми
 * можно пользоваться из разговора.
 *
 * Инструменты:
 *   site_map      — карта страницы: блоки, их порядок, высоты, первые слова
 *   site_element  — что с элементом: размеры, стили и что лежит поверх него
 *   site_shot     — снимок страницы или одного блока в файл
 *   tilda_pages   — список страниц проекта (нужны ключи API)
 *   tilda_page    — блоки страницы: порядок, тип, скрыт ли (нужны ключи)
 *
 * Ключи Tilda. Кладутся в файл mcp/.tilda_keys (в репозиторий не попадает)
 * двумя строками:
 *     public=...
 *     secret=...
 * Берутся в Тильде: Настройки сайта → Экспорт и API → API-интеграция.
 * Без ключей работают первые три инструмента, Tilda-инструменты честно
 * сообщают, чего не хватает.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ЗДЕСЬ = path.dirname(fileURLToPath(import.meta.url));
const КОРЕНЬ = path.resolve(ЗДЕСЬ, '..');

/* ── Chrome через playwright-core. Подключаем лениво: без браузера
      сервер всё равно должен подниматься и отвечать. ── */
let chromium = null;
async function браузер() {
  if (!chromium) ({ chromium } = await import('playwright-core'));
  return chromium.launch({ channel: 'chrome' });
}

/* Открыть страницу и дать ей прогрузиться: тильдовские блоки встают
   по мере прокрутки, поэтому проходим страницу сверху донизу. */
async function открыть(бр, адрес, телефон) {
  const стр = await бр.newPage(телефон
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1600, height: 900 } });
  const ошибки = [];
  стр.on('pageerror', e => ошибки.push(String(e).split('\n')[0].slice(0, 90)));
  await стр.goto(адрес, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await стр.waitForTimeout(9000);
  await стр.evaluate(async () => {
    const шаг = innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += шаг) {
      scrollTo(0, y); await new Promise(r => setTimeout(r, 200));
    }
    scrollTo(0, 0);
  });
  await стр.waitForTimeout(4000);
  return { стр, ошибки };
}

/* ── ключи Tilda ── */
function ключи() {
  const файл = path.join(ЗДЕСЬ, '.tilda_keys');
  if (!fs.existsSync(файл)) return null;
  const о = {};
  fs.readFileSync(файл, 'utf8').split(/\r?\n/).forEach(с => {
    const м = с.match(/^\s*(public|secret)\s*=\s*(\S+)/i);
    if (м) о[м[1].toLowerCase()] = м[2];
  });
  return о.public && о.secret ? о : null;
}

async function тильда(метод, параметры) {
  const к = ключи();
  if (!к) {
    return { нужно: 'Нет ключей. Создайте mcp/.tilda_keys со строками ' +
      'public=... и secret=... — берутся в Тильде: Настройки сайта → ' +
      'Экспорт и API → API-интеграция.' };
  }
  const адрес = new URL('https://api.tildacdn.info/v1/' + метод + '/');
  адрес.searchParams.set('publickey', к.public);
  адрес.searchParams.set('secretkey', к.secret);
  Object.entries(параметры || {}).forEach(([и, з]) => адрес.searchParams.set(и, з));
  const о = await fetch(адрес).then(r => r.json());
  if (о.status !== 'FOUND') return { ошибка: о.message || JSON.stringify(о).slice(0, 300) };
  return о.result;
}

/* ── описания инструментов ── */
const ИНСТРУМЕНТЫ = [
  {
    name: 'site_map',
    description: 'Карта страницы: блоки Тильды по порядку — номер записи, положение, ' +
      'высота и первые слова. Плюс ошибки консоли. Так видно, что за чем идёт, ' +
      'какие блоки пустые и что сломалось.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Адрес страницы' },
        mobile: { type: 'boolean', description: 'Смотреть как с телефона' }
      },
      required: ['url']
    }
  },
  {
    name: 'site_element',
    description: 'Что происходит с элементом: размеры, положение на странице, ключевые ' +
      'стили и — главное — какой элемент лежит поверх его середины. Этим ловятся ' +
      'перекрытия вроде «меню закрывает кнопку».',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        selector: { type: 'string', description: 'CSS-селектор' },
        mobile: { type: 'boolean' },
        scroll_to: { type: 'boolean', description: 'Подвести элемент к центру экрана' }
      },
      required: ['url', 'selector']
    }
  },
  {
    name: 'site_shot',
    description: 'Снимок страницы или отдельного блока в файл PNG. Возвращает путь.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        selector: { type: 'string', description: 'Если задан — снимок только этого элемента' },
        scroll: { type: 'number', description: 'Прокрутить на столько пикселей' },
        mobile: { type: 'boolean' },
        out: { type: 'string', description: 'Куда положить файл' }
      },
      required: ['url']
    }
  },
  {
    name: 'tilda_pages',
    description: 'Список страниц проекта Тильды: номер, заголовок, адрес, когда опубликована.',
    inputSchema: {
      type: 'object',
      properties: { projectid: { type: 'string' } },
      required: ['projectid']
    }
  },
  {
    name: 'tilda_page',
    description: 'Страница Тильды изнутри: блоки по порядку с номерами записей — ' +
      'то, что видно в редакторе, включая скрытые блоки.',
    inputSchema: {
      type: 'object',
      properties: {
        pageid: { type: 'string' },
        full: { type: 'boolean', description: 'Вернуть и разметку страницы' }
      },
      required: ['pageid']
    }
  }
];

/* ── выполнение ── */
async function выполнить(имя, арг) {
  if (имя === 'site_map') {
    const бр = await браузер();
    try {
      const { стр, ошибки } = await открыть(бр, арг.url, арг.mobile);
      const блоки = await стр.evaluate(() =>
        [...document.querySelectorAll('[id^="rec"]')].map(б => {
          const r = б.getBoundingClientRect();
          const т = (б.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 52);
          return { id: б.id, верх: Math.round(r.top + scrollY),
                   высота: Math.round(r.height), текст: т };
        }));
      const строки = блоки.map(б =>
        б.id.padEnd(16) + String(б.верх).padStart(7) + 'px  высота ' +
        String(б.высота).padStart(5) + '  ' + б.текст);
      return 'Блоков: ' + блоки.length + '\n' + строки.join('\n') +
        '\n\nОшибки консоли: ' + ([...new Set(ошибки)].join(' | ') || 'нет');
    } finally { await бр.close(); }
  }

  if (имя === 'site_element') {
    const бр = await браузер();
    try {
      const { стр } = await открыть(бр, арг.url, арг.mobile);
      if (арг.scroll_to) {
        await стр.evaluate(с => {
          const у = document.querySelector(с);
          if (у) у.scrollIntoView({ block: 'center' });
        }, арг.selector);
        await стр.waitForTimeout(1200);
      }
      const о = await стр.evaluate(с => {
        const у = document.querySelector(с);
        if (!у) return null;
        const r = у.getBoundingClientRect();
        const ст = getComputedStyle(у);
        const сверху = document.elementFromPoint(
          Math.min(innerWidth - 2, Math.max(2, r.left + r.width / 2)),
          Math.min(innerHeight - 2, Math.max(2, r.top + r.height / 2)));
        const рек = у.closest('[id^="rec"]');
        const рекСверху = сверху ? сверху.closest('[id^="rec"]') : null;
        return {
          блок: рек ? рек.id : '—',
          размер: Math.round(r.width) + 'x' + Math.round(r.height),
          наСтранице: Math.round(r.top + scrollY),
          наЭкране: Math.round(r.top) + '…' + Math.round(r.bottom),
          стили: ['position:' + ст.position, 'z-index:' + ст.zIndex,
                  'display:' + ст.display, 'overflow:' + ст.overflow,
                  'opacity:' + ст.opacity, 'transform:' + ст.transform].join('  '),
          поверх: сверху ? ((сверху.className || сверху.tagName).toString().slice(0, 46) +
                   ' из ' + (рекСверху ? рекСверху.id : '—')) : '—',
          свой: сверху === у || (сверху && у.contains(сверху))
        };
      }, арг.selector);
      if (!о) return 'Элемент «' + арг.selector + '» на странице не найден.';
      return 'блок: ' + о.блок + '\nразмер: ' + о.размер +
        '\nна странице: ' + о.наСтранице + 'px, на экране ' + о.наЭкране +
        '\n' + о.стили +
        '\nв середине элемента лежит: ' + о.поверх +
        (о.свой ? '  (это он сам — ничего не перекрывает)' : '  ← ПЕРЕКРЫТ');
    } finally { await бр.close(); }
  }

  if (имя === 'site_shot') {
    const бр = await браузер();
    try {
      const { стр } = await открыть(бр, арг.url, арг.mobile);
      if (арг.scroll != null) {
        await стр.evaluate(y => scrollTo(0, y), арг.scroll);
        await стр.waitForTimeout(1400);
      }
      const куда = арг.out || path.join(КОРЕНЬ, 'снимок.png');
      if (арг.selector) {
        const у = стр.locator(арг.selector).first();
        if (!арг.scroll) { await у.scrollIntoViewIfNeeded(); await стр.waitForTimeout(1200); }
        await у.screenshot({ path: куда });
      } else {
        await стр.screenshot({ path: куда });
      }
      return 'снимок: ' + куда;
    } finally { await бр.close(); }
  }

  if (имя === 'tilda_pages') {
    const о = await тильда('getpageslist', { projectid: арг.projectid });
    if (!Array.isArray(о)) return JSON.stringify(о, null, 1);
    return о.map(с => String(с.id).padEnd(12) + (с.alias || '/').padEnd(24) +
      (с.title || '').slice(0, 46) + '   опубликована ' + (с.published || '—')).join('\n');
  }

  if (имя === 'tilda_page') {
    const о = await тильда(арг.full ? 'getpagefull' : 'getpage', { pageid: арг.pageid });
    if (о && о.нужно || о && о.ошибка) return JSON.stringify(о, null, 1);
    const шапка = 'страница: ' + (о.title || '') + '  (' + (о.alias || '/') + ')';
    const блоки = (о.bodyparts || о.blocks || []);
    if (!блоки.length && о.html) return шапка + '\nразметка получена, длина ' + о.html.length;
    return шапка + '\n' + JSON.stringify(о, null, 1).slice(0, 6000);
  }

  return 'Неизвестный инструмент: ' + имя;
}

/* ── протокол MCP поверх stdin/stdout ── */
function ответ(id, результат) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result: результат }) + '\n');
}
function ошибка(id, текст) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32000, message: текст } }) + '\n');
}

let буфер = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', async кусок => {
  буфер += кусок;
  let п;
  while ((п = буфер.indexOf('\n')) >= 0) {
    const строка = буфер.slice(0, п).trim();
    буфер = буфер.slice(п + 1);
    if (!строка) continue;
    let з;
    try { з = JSON.parse(строка); } catch (e) { continue; }

    if (з.method === 'initialize') {
      ответ(з.id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'ber-bar', version: '1.0.0' }
      });
    } else if (з.method === 'tools/list') {
      ответ(з.id, { tools: ИНСТРУМЕНТЫ });
    } else if (з.method === 'tools/call') {
      try {
        const т = await выполнить(з.params.name, з.params.arguments || {});
        ответ(з.id, { content: [{ type: 'text', text: String(т) }] });
      } catch (e) {
        ответ(з.id, { content: [{ type: 'text', text: 'Не получилось: ' + (e && e.message) }], isError: true });
      }
    } else if (з.id !== undefined) {
      ошибка(з.id, 'метод не поддерживается: ' + з.method);
    }
  }
});
