"""Winter journeys between native BR pages and room-specific booking."""
from html import escape
import json
from pathlib import Path
import re

from winter_site import HOUSE_COVERS

HERE = Path(__file__).resolve().parent
STAY_DATA = HERE.parents[1] / "prevyu/lid/br-stay-data.js"
ROOM_IDS = {
    house["id"]: house["roomId"]
    for house in json.JSONDecoder().raw_decode(STAY_DATA.read_text().split("=", 1)[1].lstrip())[0]["houses"]
}
assert set(ROOM_IDS) == set(HOUSE_COVERS)

ACTIVITIES = "/aktivnosti-v-beryozovoj-roshhe/"
TOOLTIP = re.compile(
    r'(data-tipimg-original=")[^"]+(">\s*<div class=[\x27"]tn-atom__tip-text[\x27"]>)(.*?)</div>',
    re.S,
)
SOCIAL_ASSETS = {
    "/": "hero-panorama-garland.webp",
    "/doma": "hero-panorama-garland.webp",
    "/new-year": "hero-panorama-garland.webp",
    "/spa": "hero-winter-spa-hq.webp",
    "/deti": "winter-playground.webp",
    "/glamping": "winter-glamping.webp",
    "/banchan": "winter-panorama-tub.webp",
    "/kartabr": "territory-map.webp",
    "/aktivnosti-v-beryozovoj-roshhe": "winter-playground.webp",
    "/vip-programmy/svidanie": "winter-svidanie.webp",
    "/vip-programmy/perezagruzka": "hero-winter-spa-hq.webp",
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
        "SPA-комплекс": "hero-winter-spa-hq.webp",
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
        ("/spa/", "winter-open-pool.webp", "SPA и тёплый бассейн", "Открытый бассейн, сауны и хамам"),
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
        f'<img src="{prefix}/br-assets/holiday/br-skandi.webp" alt="Зимний двор дома Сканди с банным чаном" '
        'loading="lazy" decoding="async">'
        '<div><h2 id="br-winter-holiday-title">Новый год и каникулы</h2>'
        '<p>Новогодний заезд с 31 декабря по 3 января. Январские каникулы — с 3 января.</p>'
        f'<a href="{prefix}/new-year/">Посмотреть заезды <span aria-hidden="true">→</span></a></div></section>'
    )


def map_links(prefix):
    return (
        '<nav class="br-winter-map-links" aria-label="Отдых на территории">'
        f'<a href="{prefix}/doma/">Все 22 дома</a>'
        f'<a href="{prefix}/spa/">SPA и бассейн</a>'
        f'<a href="{prefix}{ACTIVITIES}">Ферма и прогулки</a>'
        '</nav>'
    )


def insert_before_record(html, record, markup):
    pattern = re.compile(r'<div id="' + re.escape(record) + r'"')
    updated, count = pattern.subn(lambda match: markup + match[0], html, count=1)
    assert count, record
    return updated


def apply(html, route, prefix, bath_programs=""):
    html = preview_social_image(html, route, prefix)
    catalogue = f'<a href="{prefix}/doma/">Каталог домов</a>'
    holiday_menu = f'<a href="{prefix}/new-year/" class="br-winter-menu-link">Новый год и каникулы</a>'
    html = html.replace('<nav class="br-nov-menu" aria-label="Разделы сайта">\n  ' + catalogue,
                        '<nav class="br-nov-menu" aria-label="Разделы сайта">\n  ' + catalogue + holiday_menu)
    if route.startswith("/doma/"):
        return rewrite_house_booking(html, route.rsplit("/", 1)[1], prefix)
    if route in ("/", "/kartabr"):
        html = winter_map(html, prefix)
        html = html.replace("</body>", f'<script src="{prefix}/br-assets/winter-map.js" defer></script></body>', 1)
        html = html.replace(
            'https://static.tildacdn.com/tild3439-6666-4264-a539-616130646439/Frame_2_1_1.webp',
            f"{prefix}/br-assets/territory-map.webp",
        )
    if route == "/":
        activity_section = '<section id="br-home-activities"'
        if activity_section in html:
            html = html.replace(activity_section, holiday_banner(prefix) + activity_section, 1)
        html = html.replace('>Отдых за пределами дома</h2>', '>Чем заняться зимой</h2>', 1)
        html = html.replace('>Сапборды<span aria-hidden=', '>Сапборды в тёплый сезон<span aria-hidden=', 1)
        map_heading = '<h2>Карта территории</h2>'
        html = html.replace(map_heading, map_heading + map_links(prefix), 1)
    if route == "/kartabr":
        html = insert_before_record(html, "rec2856176101", map_links(prefix))
    if route + "/" == ACTIVITIES:
        html = insert_before_record(html, "rec2863877701", winter_activities(prefix))
    if route == "/special":
        html = insert_before_record(html, "rec1758798101", holiday_banner(prefix))
    if route == "/banchan":
        html = insert_before_record(html, "rec2056178221", bath_programs)
    return html
