"""Winter journeys between native BR pages and room-specific booking."""
from html import escape
import json
from pathlib import Path
import re

from winter_site import HOUSE_COVERS, SPA_POOL_CARD, SPA_WINDOW_LOUNGE, WINTER_HORSE, within_record

HERE = Path(__file__).resolve().parent
CALLBACK_READY_SCRIPT = (HERE / "assets/callback-ready.js").read_text()
STAY_DATA = HERE.parents[1] / "prevyu/lid/br-stay-data.js"
STAY_HOUSES = json.JSONDecoder().raw_decode(STAY_DATA.read_text().split("=", 1)[1].lstrip())[0]["houses"]
ROOM_IDS = {house["id"]: house["roomId"] for house in STAY_HOUSES}
ROOM_NAMES = {house["id"]: house["name"] for house in STAY_HOUSES}
assert set(ROOM_IDS) == set(HOUSE_COVERS)

ACTIVITIES = "/aktivnosti-v-beryozovoj-roshhe/"
NEW_YEAR_COVER = "winter-new-year-dinner"
HOUSE_CATEGORY_ORDER = (
    "БАРИЛОЧЕ", "ПАНОРАМА", "СКАНДИ", "ШАЛЕ", "БАРНХАУС",
    "БАУС", "А-ФРЕЙМ", "СФЕРА", "ХАУС", "ХОЛИДЕЙ ХАУС",
)
# The two columns are stored one after the other in the Tilda record.
HOUSE_CATEGORY_SLOTS = (1, 6, 2, 7, 3, 8, 4, 9, 5, 10)
HOUSE_CATEGORY_PHOTOS = {
    "winter-aframe-luxe-white.webp": "aframe-luxe-white",
    "bariloche-warm.webp": "bariloche",
    "winter-scandi.webp": "scandi",
    "winter-house-panorama-2.webp": "panorama",
    "winter-selector-baus.webp": "baus-1",
    "winter-selector-chalet.webp": "chalet",
    "house-2-warm.webp": "house-2",
    "winter-selector-barn.webp": "barn-2",
    "winter-selector-sfera.webp": "sfera",
    "winter-selector-holiday.webp": "holidayhouse",
}
TOOLTIP = re.compile(
    r'(data-tipimg-original=")[^"]+(">\s*<div class=[\x27"]tn-atom__tip-text[\x27"]>)(.*?)</div>',
    re.S,
)
SOCIAL_ASSETS = {
    "/": "hero-panorama-garland.webp",
    "/doma": "hero-panorama-garland.webp",
    "/new-year": f"{NEW_YEAR_COVER}.webp",
    "/spa": SPA_POOL_CARD,
    "/deti": "winter-playground.webp",
    "/glamping": HOUSE_COVERS["bariloche"]["asset"],
    "/banchan": "winter-panorama-tub.webp",
    "/kartabr": "territory-map.webp",
    "/special": "winter-offers-window.webp",
    "/aktivnosti-v-beryozovoj-roshhe": "winter-playground.webp",
    "/vip-programmy/svidanie": "winter-svidanie.webp",
    "/vip-programmy/perezagruzka": SPA_WINDOW_LOUNGE,
}


def rewrite_house_booking(html, slug, prefix):
    start = html.index('<div id="' + HOUSE_COVERS[slug]["record"] + '"')
    end = html.index('<footer id="t-footer"', start)
    path = f"{prefix}/booking/"
    old = f'href="{path}"'
    updated = f'href="{path}?onlyrooms={ROOM_IDS[slug]}&amp;scroll_to_rooms=1"'
    content = html[start:end]
    assert content.count(old) == 2, slug
    return html[:start] + content.replace(old, updated) + html[end:]


def winter_map(html, prefix):
    labels = {
        "Ферма": "winter-activity-farm-hq.webp",
        "SPA-комплекс": SPA_WINDOW_LOUNGE,
    }
    houses = set()

    def thumbnail(match):
        room = re.search(r'\bhref="[^"]*/doma/([^/"]+)/?"', match[3])
        if room:
            slug = room[1]
            houses.add(slug)
            photo = HOUSE_COVERS[slug]["asset"]
        else:
            label = re.sub(r"<[^>]+>", "", match[3]).strip()
            photo = labels.get(label)
        if not photo:
            return match[0]
        return f'{match[1]}{prefix}/br-assets/{photo}{match[2]}{match[3]}</div>'

    html = TOOLTIP.sub(thumbnail, html)
    assert not houses or houses == set(HOUSE_COVERS), houses
    return html


def preview_social_image(html, route, prefix):
    cover = HOUSE_COVERS.get(route.rsplit("/", 1)[-1]) if route.startswith("/doma/") else None
    asset = cover["asset"] if cover else SOCIAL_ASSETS.get(route)
    if not asset:
        return html
    url = f"https://bars-ytars-sys.github.io{prefix}/br-assets/{asset}"
    pattern = re.compile(r'(<meta\b[^>]*\b(?:name|property)="(?:og|twitter):image"[^>]*\bcontent=")[^"]+"', re.I)
    updated, count = pattern.subn(lambda match: f'{match[1]}{url}"', html)
    if count:
        return updated
    return html.replace("</head>", f'<meta property="og:image" content="{url}"></head>', 1)


def winter_activities(prefix):
    cards = (
        ("/spa/", SPA_POOL_CARD, "SPA и тёплый бассейн", "Открытый бассейн, сауны и хамам"),
        ("/banchan/#samovar", "winter-panorama-tub.webp", "Баня и чан", "Парение и травяной чай из самовара"),
        ("/deti/", "winter-activity-farm-hq.webp", "Зимой с детьми", "Контактная ферма, площадка и семейное кино"),
        ("/new-year/", "hero-panorama-garland.webp", "Новый год и каникулы", "Новогодний заезд и даты в январе"),
    )
    items = "".join(
        f'<a class="br-winter-route-card" href="{prefix}{path}">'
        f'<img src="{prefix}/br-assets/{photo}" alt="" loading="lazy" decoding="async">'
        f'<span><strong>{title}</strong><small>{description}</small></span></a>'
        for path, photo, title, description in cards
    )
    return (
        '<section class="br-winter-route" aria-labelledby="br-winter-activities-title">'
        '<h2 id="br-winter-activities-title">Чем заняться зимой</h2>'
        f'<div class="br-winter-route__grid">{items}</div></section>'
    )


def holiday_banner(prefix):
    return (
        '<section class="br-winter-route br-winter-holiday" aria-labelledby="br-winter-holiday-title">'
        f'<img src="{prefix}/br-assets/{HOUSE_COVERS["barn-4"]["asset"]}" alt="Зимний «Барнхаус-4» с гирляндой и тёплым светом в окнах" '
        'loading="lazy" decoding="async">'
        '<div><h2 id="br-winter-holiday-title">Новый год и каникулы</h2>'
        '<p>Новогодний заезд с 31 декабря по 3 января. Январские каникулы — с 3 января.</p>'
        '<p class="br-winter-holiday__perk">В новогодний заезд — лотерея и подарки в каждом доме.</p>'
        f'<a class="br-winter-primary" href="{prefix}/new-year/">Посмотреть заезды <span aria-hidden="true">→</span></a></div></section>'
    )


def revise_offers(html, prefix):
    certificate = '<article class="to-card" id="podarochnyy-sertifikat">'
    assert html.count(certificate) == 1
    html = html.replace(f'<a class="to-btn" href="{prefix}/certificate/">',
                        f'<a class="to-btn br-winter-primary" href="{prefix}/certificate/">', 1)
    html = html.replace(
        'https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/certificates/br-baus-hot-tub-snow.webp',
        f'{prefix}/br-assets/house-winter-sfera.webp',
    )
    photo = re.compile(r'(' + re.escape(certificate) + r'\s*<div class="to-pic">\s*<img\b[^>]+>)')
    html, count = photo.subn(r'\1<span class="br-gift-cover-caption" aria-hidden="true">Сертификат на отдых</span>', html)
    assert count == 1
    html = html.replace(
        'Выберите номинал, оформление и добавьте своё поздравление.',
        'Выберите номинал, оформление под повод и укажите имя получателя.',
    )
    weekdays = f'''<article class="to-card br-weekday-offer" id="uyutnye-budni">
      <div class="to-pic"><img src="{prefix}/br-assets/winter-weekday-chan.webp"
        alt="Банный чан «Берёзовой рощи» в зимний день" width="1024" height="1024" loading="lazy" decoding="async"></div>
      <div class="to-body">
        <h3 class="to-t">Уютные будни</h3>
        <p class="to-d">Встречаем зиму в тепле. Днём — прогулки среди заснеженных берёз, вечером — горячий чан под открытым небом и уют вашего дома. Приезжайте отдыхать — мы обо всём позаботимся.</p>
        <p class="to-hl">При бронировании <strong>от 2 суток в будни классический чан включён в стоимость проживания.</strong></p>
        <p class="to-terms">Предложение доступно для отдельных категорий домов. Подробности уточняйте у менеджера. Акции не суммируются.</p>
        <a class="to-btn br-winter-primary" href="{prefix}/booking/">Выбрать даты</a>
      </div>
    </article>'''
    html = re.sub(r'<article class="to-card" id="br-black-friday"[^>]*>.*?</article>', '', html, flags=re.S)
    html = re.sub(r'<(?:style|script) id="brbf-[^"]+"[^>]*>.*?</(?:style|script)>', '', html, flags=re.S)
    html = re.sub(r'<button id="brbf-launcher"[^>]*>.*?</button>\s*<dialog id="brbf-dialog"[^>]*>.*?</dialog>', '', html, flags=re.S)
    return html.replace(certificate, weekdays + certificate, 1)


def map_links(prefix):
    return (
        '<nav class="br-winter-map-links" aria-label="Отдых на территории">'
        f'<a href="{prefix}/doma/">Все 22 дома</a>'
        f'<a href="{prefix}/spa/">SPA и бассейн</a>'
        f'<a href="{prefix}{ACTIVITIES}">Ферма и прогулки</a>'
        '</nav>'
    )


def house_categories(record, prefix):
    def name(label):
        return label.strip().upper().replace("A", "А")

    label = re.compile(r'(<span class="tn-atom__button-text">)([^<]+)(</span>)')
    tabs = [match for match in label.finditer(record) if name(match[2]) in HOUSE_CATEGORY_ORDER]
    assert len(tabs) == len(HOUSE_CATEGORY_ORDER)
    original = {name(tab[2]): (index, tab[2]) for index, tab in enumerate(tabs, 1)}
    order = dict(zip(HOUSE_CATEGORY_ORDER, HOUSE_CATEGORY_SLOTS))
    groups = {old: order[title] for title, (old, _) in original.items()}
    labels = {slot: original[title][1] for title, slot in order.items()}

    def rename_label(match):
        previous = original.get(name(match[2]))
        return f"{match[1]}{labels[previous[0]]}{match[3]}" if previous else match[0]

    record = label.sub(rename_label, record)
    pattern = re.compile(r'(class="t396__group tn-group house-)(\d+)\b')
    record, count = pattern.subn(lambda match: f"{match[1]}{groups[int(match[2])]}", record)
    assert count == len(tabs)
    for old, slug in HOUSE_CATEGORY_PHOTOS.items():
        new = HOUSE_COVERS[slug]["asset"]
        record = record.replace(f"{prefix}/br-assets/{old}", f"{prefix}/br-assets/{new}")
    # Mark the static order so the original delayed rearrangement skips it.
    return record.replace('id="rec2851363001"', 'id="rec2851363001" data-bb-poryadok="1"', 1)


def insert_before_record(html, record, markup):
    pattern = re.compile(r'<div id="' + re.escape(record) + r'"')
    updated, count = pattern.subn(lambda match: markup + match[0], html, count=1)
    assert count, record
    return updated


def new_year_page(html, prefix):
    assets = f"{prefix}/br-assets"
    cards = (
        ("hero-panorama-garland", NEW_YEAR_COVER,
         "Наряженная ёлка и праздничный стол в доме «А-фрейм люкс чёрный»", ' fetchpriority="high"'),
        ("winter-new-year-scandi", "winter-january-house-4-evening",
         "Заснеженный «Хаус-4» с новогодними огнями вечером", ' loading="lazy"'),
    )
    for previous, photo, alt, loading in cards:
        old = re.compile(rf'<img class="holiday-card__photo" src="{re.escape(assets)}/{previous}\.webp"[^>]*>')
        markup = (
            f'<img class="holiday-card__photo" src="{assets}/{photo}.webp" '
            f'srcset="{assets}/{photo}-mobile.webp 640w, {assets}/{photo}.webp 1280w" '
            'sizes="(max-width: 700px) 92vw, (max-width: 1240px) 45vw, 570px" '
            f'alt="{alt}" width="1280" height="853" decoding="async"{loading}>'
        )
        html, count = old.subn(markup, html)
        assert count == 1, previous

    # Bnovo's booking entry accepts DD-MM-YYYY for date parameters.
    html = re.sub(r"((?:dfrom|dto)=)(\d{4})-(\d{2})-(\d{2})", r"\g<1>\4-\3-\2", html)

    intro = "Новогодний заезд в загородный дом. Праздничный ужин можно заказать в ресторане.</p>"
    assert html.count(intro) == 1
    html = html.replace(
        intro,
        'Встретьте Новый год в своём доме. Праздничный ужин можно заказать в ресторане.</p>'
        '<p class="br-new-year-perk">Новогодняя лотерея и подарки в каждом доме</p>',
    )
    title = re.compile(r'(<h1 id="holiday-title">.*?)\s*(<p class="holiday-periods__location">.*?</p>)', re.S)
    countdown = re.compile(r'<div class="мини-отсчёт" id="отсчёт"[^>]*>.*?<div><b data-ч="с">—</b><span>с</span></div>\s*</div>', re.S)
    assert len(countdown.findall(html)) == 1
    html = countdown.sub("", html)
    units = ''.join(
        f'<div><b data-ч="{key}">—</b><span>{unit}</span></div>'
        for key, unit in (("д", "дни"), ("ч", "часы"), ("м", "минуты"), ("с", "секунды"))
    )
    timer = (
        '<div class="br-new-year-clock" role="timer" id="отсчёт" aria-labelledby="br-new-year-clock-title">'
        '<p id="br-new-year-clock-title">До Нового года</p>'
        f'<div class="br-new-year-clock__units">{units}</div></div>'
    )
    html, count = title.subn(lambda match: f'<div class="br-new-year-heading"><div>{match[1]}{match[2]}</div>{timer}</div>', html, count=1)
    assert count == 1

    links = (
        '<nav class="навигация br-new-year-links" aria-label="Разделы новогодней страницы">'
        '<div class="навигация__полоса"><a href="#holiday-periods">Даты заездов</a>'
        '<a href="#коротко">Что ждёт гостей</a><a href="#дома">Дома</a>'
        '<a href="#условия">Что входит</a><a href="#спа">SPA</a>'
        '<a href="#зимой">Зимой</a><a href="#вопросы">Вопросы</a></div></nav>'
    )
    html, count = re.subn(r'<nav class="навигация"[^>]*>.*?</nav>', links, html, count=1, flags=re.S)
    assert count == 1

    # Match the winter facade already used on each house's main page.
    categories = ("bariloche", "scandi", "panorama", "baus-1", "chalet", "house-2", "barn-2", "sfera", "holidayhouse")
    house_photos = re.compile(r'(<div class="выбор__фото">)(.*?)(</div>)', re.S)

    def update_category_photos(block):
        def replace_image(match):
            slug = categories[int(match[1])]
            cover = HOUSE_COVERS[slug]["asset"]
            alt = escape(f"{ROOM_NAMES[slug]} — зимний фасад", quote=True)
            photo = re.sub(r'\bsrc="[^"]*"', f'src="{assets}/{cover}"', match[0], count=1)
            return re.sub(r'\balt="[^"]*"', f'alt="{alt}"', photo, count=1)

        photos, count = re.subn(r'<img[^>]*\bdata-i="(\d+)"[^>]*>', replace_image, block[2])
        assert count == len(categories)
        return f"{block[1]}{photos}{block[3]}"

    html, count = house_photos.subn(update_category_photos, html, count=1)
    assert count == 1
    return html.replace("</head>", f'<link rel="stylesheet" href="{assets}/new-year.css"></head>', 1)


def apply(html, route, prefix, bath_programs=""):
    html = preview_social_image(html, route, prefix)
    if route == "/contacts":
        # The exported Contacts popup has no runnable Tilda handler. Reuse the
        # main page form while keeping the callback links in the native menu.
        bridge = html.index("window.brContactsCallbackBridge")
        start = html.rindex("<script", 0, bridge)
        end = html.index("</script>", bridge) + len("</script>")
        callback = f'''<script>(() => {{
  const openCallback = () => {{
    if (location.hash === '#zayavka') location.replace('{prefix}/#zayavka');
  }};
  addEventListener('hashchange', openCallback);
  openCallback();
}})();</script>'''
        html = html[:start] + callback + html[end:]
    if route in ("/", "/split", "/new-year") and 'data-tooltip-hook="#zayavka"' in html:
        html = html.replace("</head>", f"<script>{CALLBACK_READY_SCRIPT}</script></head>", 1)
    html = html.replace(
        "https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/prevyu/lid/br-gift.html",
        prefix + "/certificate/",
    )
    # The previous shared script also set certificate links at runtime.
    html = html.replace('data-gift-link', 'data-br-winter-certificate-link')
    catalogue = f'<a href="{prefix}/doma/">Каталог домов</a>'
    holiday_menu = f'<a href="{prefix}/new-year/" class="br-winter-menu-link">Новый год и каникулы</a>'
    html = html.replace('<nav class="br-nov-menu" aria-label="Разделы сайта">\n  ' + catalogue,
                        '<nav class="br-nov-menu" aria-label="Разделы сайта">\n  ' + catalogue + holiday_menu)
    if route.startswith("/doma/"):
        return rewrite_house_booking(html, route.rsplit("/", 1)[1], prefix)
    if route in ("/", "/special"):
        html = revise_offers(html, prefix)
    if route in ("/", "/kartabr"):
        html = winter_map(html, prefix)
        html = html.replace("</head>", f'<link rel="stylesheet" href="{prefix}/br-assets/territory-winter.css"></head>', 1)
        html = html.replace("</body>", f'<script src="{prefix}/br-assets/winter-map.js" defer></script></body>', 1)
        html = html.replace(
            'https://static.tildacdn.com/tild3439-6666-4264-a539-616130646439/Frame_2_1_1.webp',
            f"{prefix}/br-assets/territory-map.webp",
        )
    if route == "/":
        html = within_record(html, "rec2851363001", lambda record: house_categories(record, prefix))
        activity_section = '<section id="br-home-activities"'
        if activity_section in html:
            html = html.replace(activity_section, holiday_banner(prefix) + activity_section, 1)
        html = html.replace('>Отдых за пределами дома</h2>', '>Чем заняться зимой</h2>', 1)
        html = html.replace('>Сапборды<span aria-hidden=', '>Сапборды в тёплый сезон<span aria-hidden=', 1)
        map_heading = '<h2>Карта территории</h2>'
        html = html.replace(map_heading, map_heading + map_links(prefix), 1)
    if route == "/kartabr":
        html = insert_before_record(html, "rec2856176101", map_links(prefix))
    if route == "/deti":
        summer_horse = "https://static.tildacdn.com/tild6538-6533-4165-a561-313935353936/image-2.png"
        winter_horse = f"{prefix}/br-assets/{WINTER_HORSE}"
        html = within_record(html, "rec1750149901", lambda record: record.replace(summer_horse, winter_horse))
    if route + "/" == ACTIVITIES:
        html = insert_before_record(html, "rec2863877701", winter_activities(prefix))
    if route == "/new-year":
        return new_year_page(html, prefix)
    if route == "/special":
        old_cover = "https://static.tildacdn.com/tild3637-6635-4039-b237-636162656332/6_2.webp"
        winter_cover = f"{prefix}/br-assets/{SOCIAL_ASSETS[route]}"
        html = within_record(html, "rec1751257721", lambda record: record.replace(old_cover, winter_cover))
        html = insert_before_record(html, "rec1758798101", holiday_banner(prefix))
    if route == "/banchan":
        html = insert_before_record(html, "rec2056178221", bath_programs)
    return html
