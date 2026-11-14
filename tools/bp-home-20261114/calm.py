"""Правки двух T123-блоков главной БП (14.11.2026), общие для демки и выкладки в Тильду.

hero(code, assets) — новый первый экран внутри блока с #bp-production-hero (rec5032272401).
promo(code) — карточка и окно «Чёрной пятницы» в блоке акций (rec4596018801).
Вход — код блока (из редактора Тильды или с живой страницы), выход — новый код.
"""
import re

H1 = 'База отдыха «Барские поля» в Подмосковье'


def element(text, start, tag='div'):
    """Границы элемента, начинающегося в start (учёт вложенных одноимённых тегов)."""
    depth = 0
    pat = re.compile(r'<(/?)%s\b[^>]*>' % tag)
    for m in pat.finditer(text, start):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return start, m.end()
    raise AssertionError('незакрытый ' + tag)


def one(text, old, new):
    assert text.count(old) == 1, (old[:60], text.count(old))
    return text.replace(old, new)


# Кадры первого экрана: (компьютер, телефон, alt, подпись, ссылка на дом)
def _slide(name, dw, dh, mw, mh, alt, caption=None, href=None):
    return (('bp-home-%s-20261114.webp' % name, dw, dh), ('bp-home-%s-mobile-20261114.webp' % name.replace('chalet-forest-light', 'chalet-light'), mw, mh), alt, caption, href)


PHOTOS = {
    'chalet': [(('bp-home-chalet-forest-light-20261114.webp', 1680, 1120), ('bp-home-chalet-light-mobile-20261114.webp', 1086, 1448),
                'Шале «Барских полей»: дом с террасой в лесу', None, None)],
    'slides': [
        _slide('top-chalet', 1920, 1072, 1080, 1446, 'Участок Шале сверху: дом, площадка с костровой чашей, баня с купелью, банный чан (визуализация)', 'Шале · вид сверху', '/chalet'),
        _slide('top-barski', 1920, 1072, 1080, 1446, 'Участок Барского дома сверху: дом, беседка, костровая зона, банный чан (визуализация)', 'Барский дом · вид сверху', '/barski'),
        _slide('top-barn', 1920, 1072, 1080, 1446, 'Участок Барнхауса сверху: дом, костровая зона, банный чан в лесу (визуализация)', 'Барнхаус · вид сверху', '/barnhauses'),
    ],
}


def pictures(slides, ASSETS):
    """Один кадр — прежняя разметка; несколько — слайдер (остальные кадры грузятся после загрузки страницы)."""
    if len(slides) == 1:
        (desk, dw, dh), (mob, mw, mh), alt, _, _ = slides[0]
        return ('<picture class="bp-calm__photo">'
                '<source media="(max-width:640px)" srcset="' + ASSETS + mob + '" width="%d" height="%d">' % (mw, mh) +
                '<img src="' + ASSETS + desk + '" width="%d" height="%d" alt="%s" fetchpriority="high" decoding="async">' % (dw, dh, alt) +
                '</picture>'), ''
    pics, caps, dots = '', '', ''
    for i, ((desk, dw, dh), (mob, mw, mh), alt, caption, href) in enumerate(slides):
        first = i == 0
        src = 'srcset' if first else 'data-srcset'
        img = ('src="%s" fetchpriority="high"' % (ASSETS + desk)) if first else ('data-src="%s"' % (ASSETS + desk))
        pics += ('<picture class="bp-calm__photo%s" data-calm-slide="%d"%s>' % (' is-active' if first else '', i, '' if first else ' aria-hidden="true"') +
                 '<source media="(max-width:640px)" %s="%s" width="%d" height="%d">' % (src, ASSETS + mob, mw, mh) +
                 '<img %s width="%d" height="%d" alt="%s" decoding="async"></picture>' % (img, dw, dh, alt))
        caps += '<a class="bp-calm__caption%s" data-calm-caption="%d" href="%s">%s →</a>' % (' is-active' if first else '', i, href, caption)
        dots += '<button type="button" class="bp-calm__dot%s" data-calm-dot="%d" aria-label="Кадр %d: %s"></button>' % (' is-active' if first else '', i, i + 1, caption)
    return pics, '<div class="bp-calm__nav">' + caps + '<div class="bp-calm__dots">' + dots + '</div></div>'


def hero(hero, ASSETS, variant='chalet'):
    pics, nav = pictures(PHOTOS[variant], ASSETS)
    h1 = re.search(r'<h1 class="bp-hero__eyebrow">(.*?)</h1>', hero).group(1)
    assert h1 == 'База отдыха «Барские поля» в Подмосковье', h1
    assert 'Дом от 9 900 ₽ за ночь в будни' in hero and 'href="#popup:quiz"' in hero
    m_start = hero.index('<div class="bp-hero__medals"')
    medals = hero[slice(*element(hero, m_start))]
    medals = medals.replace('class="bp-hero__medals"', 'class="bp-calm__awards"', 1)
    medals = re.sub(r'<br\s*/?>', ' ', medals)
    medals = one(medals, '<strong class="bp-hero__top30">ТОП-30</strong><small>отелей по версии Siva Travel</small>',
                 '<strong class="bp-hero__top30">ТОП-30 отелей</strong><small>по версии Siva Travel</small>')
    catalogue = re.search(r'<a class="bp-hero__catalogue" href="([^"]+)"', hero).group(1)
    # Три факта с сайта (каталог 15 домов; блок «О домах»), иконки — тонкая линия в цвете БП.
    ICON = '<svg viewBox="0 0 40 40" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{}</svg>'
    FACTS = (
        '<ul class="bp-calm__facts">'
        '<li>' + ICON.format('<path d="M4 34h32"/><path d="M8 34V20l9-7 9 7v14"/><path d="M14 34v-7h6v7"/><path d="M32 34v-5"/><path d="M32 9l-4.5 9h9z"/><path d="M32 14l-5.5 11h11z"/>') + '<span>15 домов в лесу</span></li>'
        '<li>' + ICON.format('<path d="M7 22h26"/><path d="M9 22l1.6 12h18.8L31 22"/><path d="M10 28h20"/><path d="M15 18c-2-3 2-5 0-8"/><path d="M20 18c-2-3 2-5 0-8"/><path d="M25 18c-2-3 2-5 0-8"/>') + '<span>Терраса и банный чан у каждого дома</span></li>'
        '<li>' + ICON.format('<path d="M7 34V21l13-9 13 9v13z"/><path d="M7 25.5h26"/><path d="M7 29.8h26"/><path d="M17 34v-6h6v6"/><path d="M27 17.5V11h3v8.6"/><path d="M28.5 8c-1.5-2 1.5-3 0-5"/>') + '<span>Дома с собственной баней</span></li>'
        '</ul>')
    new_hero = (
        '<div id="bp-production-hero" class="r t-rec bp-hero-record bp-calm-record">'
        '<div class="bp-calm">'
        + pics + '<div class="bp-calm__shade" aria-hidden="true"></div>'
        '<div class="bp-calm__content">'
        '<h1 class="bp-calm__eyebrow">' + h1 + '</h1>'
        '<p class="bp-calm__title">Уединённый отдых в лесу</p>'
        '<p class="bp-calm__lead">Дома с полностью или частично огороженной территорией. Час от Москвы по Новорижскому шоссе.</p>'
        '<div class="bp-calm__cta"><a class="bp-calm__btn" href="#bb-stay" data-bb-planner>Выбрать дом</a>'
        '<span class="bp-calm__price"><b>от 9 900 ₽</b>за ночь в будни</span></div>'
        '<p class="bp-calm__links"><a href="' + catalogue + '">Каталог всех домов</a><a href="#popup:quiz">Сертификат за опрос</a></p>'
        '</div>' + nav + '</div>' + FACTS + medals + '</div>')
    inner_s = hero.index('<div id="bp-production-hero"')
    inner = hero[slice(*element(hero, inner_s))]
    return hero.replace(inner, new_hero)


def promo(promo):
    card_s = promo.index('<!-- BP-BLACK-FRIDAY-CARD:START -->')
    card_e = promo.index('<!-- BP-BLACK-FRIDAY-CARD:END -->')
    card = promo[card_s:card_e]
    photo = re.search(r'<div class="bo-pic bo-bf__photo">.*?</div>', card, re.S).group(0)
    timer = card[slice(*element(card, card.index('<div class="bo-bf__countdown"')))]
    assert 'data-start="2026-11-10T00:00:00+03:00" data-end="2026-11-17T00:00:00+03:00"' in timer
    for label, short in [('дней', 'д'), ('часов', 'ч'), ('минут', 'м'), ('секунд', 'с')]:
        timer = one(timer, '<small>' + label + '</small>', '<small>' + short + '</small>')
    assert 'с 10 по 16 ноября включительно' in card and 'до 30 ноября включительно' in card
    new_card = (
        '<!-- BP-BLACK-FRIDAY-CARD:START -->'
        '<article class="bo-card bo-bf" id="bo-black-friday" aria-labelledby="bo-bf-title">' + photo +
        '<div class="bo-body">'
        '<h3 class="bo-t" id="bo-bf-title">Чёрная пятница</h3>'
        '<p class="bp-calm-bf__gift">Чан в подарок</p>'
        '<p class="bp-calm-bf__lead">Для новых броней с 10 по 16 ноября на 2 ночи в будни. Проживание — до 30 ноября включительно.</p>'
        + timer +
        '<a class="bo-btn" href="#zayavka" data-bp-black-friday aria-label="Подобрать дом по акции «Чёрная пятница»">Подобрать дом по акции</a>'
        '<p class="bo-terms">Бронь нужно оформить с 10 по 16 ноября включительно. В подарок — классический чан без наполнения. '
        'На ранее оформленные брони акция не распространяется. Акции не суммируются.</p>'
        '</div></article>')
    promo = promo[:card_s] + new_card + promo[card_e:]

    # Окно: те же факты, без повторов и лишних уровней текста.
    body_s = promo.index('<div class="bp-bf-popup__body">')
    body = promo[slice(*element(promo, body_s))]
    new_body = (
        '<div class="bp-bf-popup__body">'
        '<h2 id="bp-bf-popup-title">Чёрная пятница</h2>'
        '<p class="bp-calm-bf__gift">Чан в подарок</p>'
        '<p class="bp-calm-bf__lead" id="bp-bf-popup-conditions">Для новых броней с 10 по 16 ноября на 2 ночи в будни. Проживание — до 30 ноября включительно.</p>'
        '<div data-bf-popup-timer-slot></div>'
        '<a class="bo-btn bp-bf-popup__cta" href="#zayavka" data-bp-black-friday>Подобрать дом по акции</a>'
        '<p class="bp-bf-popup__fine">В подарок — классический чан без наполнения. На ранее оформленные брони акция не распространяется. Акции не суммируются.</p>'
        '</div>')
    promo = promo.replace(body, new_body)
    promo = one(promo, 'setTimeout(autoShow, 4500);', '(window.bpCalmAutoShow || (run => setTimeout(run, 4500)))(autoShow);')
    promo = one(promo, "description.textContent = 'Чёрная пятница в «Барских полях»: 10–16 ноября. Классический чан без наполнения в подарок только при оформлении новой брони с 10 по 16 ноября включительно на 2 ночи в будни с проживанием до 30 ноября включительно. На ранее оформленные брони акция не распространяется. Акции не суммируются. Оставьте контакты — поможем выбрать дом и даты.';",
                "description.textContent = 'Для новых броней с 10 по 16 ноября на 2 ночи в будни, проживание до 30 ноября. Оставьте контакты — подберём дом и даты.';")
    promo = one(promo, "'До конца Чёрной пятницы'", "'До конца акции'")
    promo = one(promo, "'До начала Чёрной пятницы'", "'До начала акции'")
    promo = one(promo, '<p class="bo-bf__countdown-label" data-bf-countdown-label>До начала Чёрной пятницы</p>',
                '<p class="bo-bf__countdown-label" data-bf-countdown-label>До конца акции</p>')
    return promo
