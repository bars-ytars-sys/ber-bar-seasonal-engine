"""Winter homepage review and its programs and events links."""
import re
from layout_variant import cards, photo


def section(html, identifier):
    pattern = rf'<section\b(?=[^>]*\bid="{identifier}")[^>]*>.*?</section>'
    matches = re.findall(pattern, html, re.S)
    assert len(matches) == 1, identifier
    return matches[0]


def offer_styles(html, prefix):
    return html.replace('</head>', f'<link rel="stylesheet" href="{prefix}/br-assets/offers.css"></head>', 1)


def tease_offers(html, prefix):
    programs = section(html, 'programmy-otdyha')
    events = section(html, 'prazdniki')
    teaser = (
        '<section class="br-offer-teaser" id="programmy-otdyha" aria-labelledby="br-offer-title">'
        '<span id="prazdniki" class="br-offer-anchor" aria-hidden="true"></span>'
        '<div class="br-offer-teaser__card"><div class="br-offer-teaser__photos">'
        f'<img src="{prefix}/br-assets/bath-guide.webp" alt="" loading="lazy" decoding="async">'
        f'<img src="{prefix}/br-assets/br-birthday-panoramic.webp" alt="" loading="lazy" decoding="async">'
        '</div><div class="br-offer-teaser__copy">'
        '<h2 id="br-offer-title">Свидание, баня или праздник</h2>'
        f'<a class="br-offer-teaser__link" href="{prefix}/vip-programmy/#br-nov-scenarios-title">'
        '<span>Смотреть программы</span><span aria-hidden="true">→</span></a>'
        '</div></div></section>'
    )
    original = re.escape(programs) + r'\s*' + re.escape(events)
    result, count = re.subn(original, lambda _: teaser, html, count=1)
    assert count == 1
    return offer_styles(result, prefix)


def add_events_to_programs(html, events, prefix):
    event_items = cards(events)
    assert len(event_items) == 6

    def row(item):
        url, title, body = item
        content = (
            photo(url) + f'<span class="br-review-offer-name">{title}</span>'
            '<span class="br-review-offer-arrow" aria-hidden="true">›</span>'
        )
        if '<details class="br-event-details">' in body:
            details = re.search(r'</summary>(.*?)</details>', body, re.S)[1]
            return (
                '<details class="br-review-offer-details"><summary class="br-review-offer-row">'
                + content + '</summary><div class="br-review-offer-info">' + details + '</div></details>'
            )
        href = re.search(r'\bhref="([^"]+)"', body)[1]
        return f'<a class="br-review-offer-row" href="{href}">{content}</a>'

    directory = (
        '<section id="prazdniki" class="br-nov br-program-events" aria-labelledby="br-program-events-title">'
        '<h2 id="br-program-events-title">Праздники и мероприятия</h2>'
        '<div class="br-review-offer-list">' + ''.join(row(item) for item in event_items) + '</div></section>'
    )
    scenarios = re.search(r'<section class="br-nov br-nov-scenarios"[^>]*>.*?</section>', html, re.S)[0]
    jump_link = '<a class="br-program-event-jump" href="#prazdniki">Праздники и мероприятия <span aria-hidden="true">↓</span></a>'
    updated = scenarios.replace('</h2>', '</h2>' + jump_link, 1)
    return offer_styles(html.replace(scenarios, updated + directory, 1), prefix)


def apply(html, prefix):
    hero = section(html, 'br-home-start')
    opening = hero[:hero.index('>') + 1].replace('brx--s1', 'brx--s1 br-review-hero')
    slides = re.search(r'<div class="brx__slides">.*?</picture></div>', hero, re.S)[0]
    # A separate, shallow mobile photo needs the full-width frame, not the old
    # portrait crop that was made for a photograph behind the entire hero.
    slides = slides.replace('winter-br-hero-pano-20261116-mobile.webp',
                            'winter-br-hero-pano-20261116.webp')
    heading = re.search(r'<h1\b[^>]*>.*?</h1>', hero, re.S)[0]
    actions = re.search(r'<div class="brx__row">.*?</div>', hero, re.S)[0]
    benefits = re.search(r'<aside\b.*?</aside>', hero, re.S)[0]
    benefits = benefits.replace('>5 лет</span>', '>Хорошее место</span>')
    benefits = benefits.replace(
        '<span class="br-winter-benefits__full">Оплата частями</span>',
        '<span class="br-winter-benefits__full">Оплата частями</span>'
        '<span class="br-winter-benefits__short">Сплит</span>',
    )
    new_hero = (
        opening + '<div class="brx__copy">' + heading
        + '<h2 class="brx__sub">22 дома. В 40 минутах от Москвы.</h2></div>'
        + slides + '<div class="br-review-hero__actions">' + actions + '</div>'
        + benefits + '</section>'
    )
    html = html.replace(hero, new_hero, 1)

    # Existing gallery retained: srcset used to keep displaying the first photo
    # even after its native dot handler had assigned a different src.
    old = 'photo.src = next.src;\n        photo.alt = button.dataset.alt;'
    new = "photo.removeAttribute('srcset');\n        photo.removeAttribute('sizes');\n        " + old
    assert html.count(old) == 1
    html = html.replace(old, new, 1)

    houses = section(html, 'br-home-houses')
    panorama_photo = prefix + '/br-assets/winter-house-panorama-2.webp'
    first_image = re.search(r'<img\b[^>]*>', houses)[0]
    new_image = re.sub(r'\s+(?:srcset|sizes)="[^"]*"', '', first_image)
    new_image = re.sub(r'\bsrc="[^"]*"', f'src="{panorama_photo}"', new_image)
    new_image = re.sub(r'\balt="[^"]*"', 'alt="Панорама — зимний внешний вид"', new_image)
    new_houses = houses.replace(first_image, new_image, 1)
    # The selected thumbnail must describe the actual initial photograph.
    panorama_end = new_houses.index('</article>')
    first = new_houses[:panorama_end].replace('aria-pressed="true"', 'aria-pressed="false"')
    first = first.replace('aria-label="Внешний вид" aria-pressed="false"',
                          'aria-label="Внешний вид" aria-pressed="true"')
    new_houses = first + new_houses[panorama_end:]
    new_houses = new_houses.replace(
        '22 дома на базе — выберите свой. Наличие и стоимость покажет бронирование.',
        'Все 22 дома — с фотографиями и выбором дат.', 1,
    )
    html = html.replace(houses, new_houses, 1)

    # Show the core SPA / restaurant / farm offer before additional programmes.
    activities = section(html, 'br-home-activities')
    activity_cards = re.findall(r'<a class="brh-activity".*?</a>', activities, re.S)
    assert len(activity_cards) == 9
    rest = ''.join(activity_cards[3:]).replace('<span aria-hidden="true">↗</span>',
                                             '<span aria-hidden="true">↗︎</span>')
    featured = ''.join(activity_cards[:3]).replace('href="#br-home-spa"',
                                                  f'href="{prefix}/spa/"', 1)
    compact_activities = (
        '<section id="br-home-activities" class="brh brh-section br-review-activities" '
        'aria-labelledby="br-home-activities-title"><div class="brh-section__heading">'
        '<h2 id="br-home-activities-title">Отдых за пределами дома</h2>'
        f'<a class="brh-link" href="{prefix}/aktivnosti-v-beryozovoj-roshhe/">Все занятия →</a></div>'
        '<div class="brh-activities__track br-review-featured">' + featured + '</div>'
        '<details class="br-review-more-activities"><summary>Бани, прогулки и другие занятия'
        '<span aria-hidden="true">+</span></summary><div class="brh-activities__track">'
        + rest + '</div></details></section>'
    )
    wrapped = r'<div class="brh-wide-bg">\s*' + re.escape(activities) + r'\s*</div>'
    html, count = re.subn(wrapped, '', html, count=1)
    assert count == 1
    html = html.replace(new_houses, new_houses + compact_activities, 1)

    # At 2:39 in the review the owner explicitly points to this native category
    # selector. Keep the entire block, moving it ahead of optional programmes.
    house_options = section(html, 'br-home-house-options')
    html = html.replace(house_options, '', 1)
    html = html.replace(compact_activities, compact_activities + house_options, 1)

    html = tease_offers(html, prefix)

    # Compact map preview, with the original interactive map retained on demand.
    map_match = re.search(
        r'<div id="br-home-map">.*?<span\b(?=[^>]*data-br-slot="rec2856176101")'
        r'[^>]*></span>\s*</div>', html, re.S,
    )
    assert map_match
    start, end = map_match.span()
    old_map = map_match[0]
    assert old_map.count('rec2856176101') == 1
    map_image = 'https://static.tildacdn.com/tild3439-6666-4264-a539-616130646439/Frame_2_1_1.webp'
    new_map = (
        '<div id="br-home-map" class="brh brh-section br-review-map"><h2>Карта территории</h2>'
        '<details id="br-review-map-details"><summary><img src="' + map_image + '" '
        'alt="Схема всей территории Берёзовой рощи" loading="lazy" decoding="async">'
        '<span>Развернуть карту <span aria-hidden="true">↗︎</span></span></summary>'
        '<div class="br-review-map-expanded"><span data-br-slot="rec1841838861" hidden></span>'
        '<span data-br-slot="rec2856176101" hidden></span></div></details></div>'
    )
    html = html[:start] + new_map + html[end:]
    # The native photo setter runs after mount, so update its source, too.
    html = html.replace(
        'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-home-preview/home-assets/barn-2-november.webp',
        prefix + '/br-assets/winter-barn-2.webp',
    )
    return html.replace('</head>', f'<link rel="stylesheet" href="{prefix}/br-assets/home-review.css"></head>', 1).replace(
        '</body>', f'<script src="{prefix}/br-assets/home-review.js" defer></script></body>', 1,
    )
