/**
 * Страница «Спецпредложения» Барских полей с новой карточкой
 * «Подарки именинникам» на вкладке «Программы лояльности».
 *
 * Карточка не рисуется заново, а копируется с соседней — так оформление
 * совпадает точь-в-точь, а в Тильде это делается кнопкой «дублировать».
 *
 * Запуск: node demo/build-preview-bp-special.mjs  →  barskie-special.html
 * Смотреть: http://localhost:8749/barskie-special.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

const ФОТО = 'data:image/webp;base64,' +
  fs.readFileSync(path.join(ROOT, 'demo', 'assets', 'bp-birthday.webp')).toString('base64');

const js = `
(function () {
  var ФОТО = ${JSON.stringify(ФОТО)};

  var ТЕКСТЫ = {
    '1764771644231000019': 'Подарки именинникам в Барских полях',
    '1764771644274000020': 'Отметьте день рождения на базе — скидка 10% на проживание.',
    '1764939169833000011':
      'Скидка на основные и дополнительные места при проживании от 1 суток. ' +
      'Дом бронируется на ФИО именинника, скидка действует только на его дом. ' +
      'Срок — 7 суток до и после дня рождения, включая сам день. ' +
      'Предварительное бронирование обязательно. ' +
      'Скидка предоставляется при предъявлении копии паспорта или свидетельства о рождении. ' +
      'Не суммируется с другими акциями и не действует для агентств.'
  };

  function поставить() {
    var rec = document.getElementById('rec1753397921');
    if (!rec || rec.dataset.boBirthday) return false;

    var ряд = rec.querySelector('[data-group-id="1775289397266000011"]');
    var образец = rec.querySelector('[data-group-id="1764771644162000014"]');
    if (!ряд || !образец) return false;

    /* Копия соседней карточки: всё оформление достаётся даром. */
    var новая = образец.cloneNode(true);
    новая.setAttribute('data-group-id', 'bo-birthday');

    /* Тексты. Ищем по номерам элементов внутри самой копии. */
    Object.keys(ТЕКСТЫ).forEach(function (id) {
      var el = новая.querySelector('[data-elem-id="' + id + '"] .tn-atom');
      if (el) el.textContent = ТЕКСТЫ[id];
    });

    /* Фотография акции вместо снимка соседней. */
    новая.querySelectorAll('.tn-atom').forEach(function (el) {
      var b = getComputedStyle(el).backgroundImage;
      if (b && b !== 'none' && /url\\(/.test(b) && el.offsetWidth > 120) {
        el.style.backgroundImage = "url('" + ФОТО + "')";
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
      if (el.tagName === 'IMG' && el.offsetWidth > 120) {
        el.src = ФОТО;
        el.removeAttribute('srcset');
      }
    });

    /* Кнопка ведёт туда же, куда и у соседней карточки. */
    var кнопка = новая.querySelector('[data-elem-id="1764937914017000007"] .tn-atom');
    if (кнопка) кнопка.textContent = 'Связаться с менеджером';

    var обёртка = document.createElement('div');
    обёртка.className = 'tn-molecule';
    обёртка.appendChild(новая);
    ряд.appendChild(обёртка);

    rec.dataset.boBirthday = '1';
    return true;
  }

  if (!поставить()) {
    var t = setInterval(function () { if (поставить()) clearInterval(t); }, 400);
    setTimeout(function () { clearInterval(t); }, 30000);
  }
})();`;

let page = read('demo', 'sites', 'bp-special.html');
page = page.replace(/<\/body>/i, `<script>\n${js}\n</script>\n</body>`);
fs.writeFileSync(path.join(ROOT, 'barskie-special.html'), page, 'utf8');
console.log(`  barskie-special.html  ${(page.length / 1048576).toFixed(1)} МБ`);
console.log('  карточка «Подарки именинникам» — вкладка «Программы лояльности»');
console.log('  смотреть: http://localhost:8749/barskie-special.html');
