(() => {
  const popupPrograms = {
    '#popup:dr': 'День рождения',
    '#popup:romantic': 'Романтик',
    '#popup:girlparty': 'Девичник',
    '#popup:fotoden': 'Фотодень',
  };
  const telegramLink = 'a[href="https://t.me/ecobazabr"]';

  function contactOptions(program) {
    const message = `Здравствуйте! Меня заинтересовала программа «${program}» в «Берёзовой роще». Подскажите, пожалуйста, условия и доступные даты.`;
    const options = document.createElement('div');
    options.className = 'br-program-contact';

    const telegram = document.createElement('a');
    telegram.href = 'https://t.me/ecobazabr?text=' + encodeURIComponent(message);
    telegram.textContent = 'Telegram';
    telegram.target = '_blank';
    telegram.rel = 'noopener';

    const max = document.createElement('a');
    max.href = 'https://max.ru/:share?text=' + encodeURIComponent(message);
    max.textContent = 'MAX · выбрать чат';
    max.target = '_blank';
    max.rel = 'noopener';

    options.append(telegram, max);
    return options;
  }

  for (const [hook, program] of Object.entries(popupPrograms)) {
    const popup = document.querySelector(`[data-tooltip-hook="${hook}"]`);
    if (!popup) continue;
    for (const link of popup.querySelectorAll(telegramLink)) {
      link.replaceWith(contactOptions(program));
    }
  }

  for (const card of document.querySelectorAll('.br-nov-scenarios article, #samovar article, .sample-3 article, .sample-tabs article')) {
    const title = card.querySelector('h3')?.textContent.trim();
    if (!title || title === 'Банный отдых с самоваром') continue;
    const link = card.querySelector(telegramLink);
    if (link) {
      link.replaceWith(contactOptions(title));
    } else if (['Свидание года', 'Полная перезагрузка'].includes(title)) {
      card.append(contactOptions(title));
    }
  }

  for (const card of document.querySelectorAll('#prazdniki details')) {
    const contact = card.querySelector(telegramLink);
    if (contact) contact.replaceWith(contactOptions('Корпоратив'));
  }

  const path = location.pathname.replace(/\/$/, '');
  const detail = path.endsWith('/vip-programmy/svidanie') ? 'Свидание года'
    : path.endsWith('/vip-programmy/perezagruzka') ? 'Полная перезагрузка' : '';
  if (detail) {
    const record = document.querySelector('#allrecords h1')?.closest('.t-rec');
    record?.after(contactOptions(detail));
  }

  for (const contact of document.querySelectorAll('.br-family-contact')) {
    contact.replaceWith(contactOptions('Семейный праздник'));
  }
})();
