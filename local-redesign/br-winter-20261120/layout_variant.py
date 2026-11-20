"""The selected editorial layout for the two homepage sections."""
import re

REPOSITORY_ASSETS = "https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/"
SAMOVAR_PHOTO = REPOSITORY_ASSETS + "demo/assets/card-banya.webp"
LARGE_PHOTOS = {
    "program-romance-v9.webp": REPOSITORY_ASSETS + "demo/assets/storis/br-romantik.webp",
    "program-samovar-v9.webp": SAMOVAR_PHOTO,
}
EXTRA_EVENTS = (
    ("Романтик", "Украшение дома, воздушные шары и шампанское.", "romantic",
     "br-romantic-house.webp"),
    ("Девичник", "Праздник за городом в компании подруг.", "girlparty",
     "br-girlparty-chalet.webp"),
    ("Фотодень", "Индивидуальная фотосессия на территории базы.", "fotoden",
     "https://static.tildacdn.com/tild6330-3564-4464-b436-343134346661/7a72ad67-a4e9-41dc-9.webp"),
)

def photo_url(url):
    name = url.rsplit("/", 1)[-1]
    if name.startswith("event-"):
        return url.replace("-v9.webp", "-v10.webp")
    return LARGE_PHOTOS.get(name, url)

def photo(url):
    return f'<img src="{photo_url(url)}" alt="" loading="lazy" decoding="async">'

def cards(section):
    return re.findall(
        r'<img[^>]*src="([^"]+)"[^>]*>.*?class="br-nov-program-name">([^<]+)</span>'
        r'.*?<div class="br-nov-program-content">(.*?)</div>',
        section,
        re.S,
    )

def block(id, title, content):
    return (
        f'<section id="{id}" class="sample-section"><div class="sample-width">'
        f'<h2>{title}</h2>{content}</div></section>'
    )

def without_home_prices(home):
    pattern = r'<section\b[^>]*\bid="programmy-otdyha"[^>]*>.*?</section>'
    return re.sub(
        pattern, lambda section: re.sub(r'<strong>[^<]+</strong>', '', section[0]),
        home, count=1, flags=re.S,
    )

def update_home_programs_and_events(home, prefix):
    assets = {
        "program-romance-v9.webp": f"{prefix}/br-assets/br-date-evening.webp",
        "winter-activity-spa-hq.webp": f"{prefix}/br-assets/winter-selector-spa-pool.webp",
        "program-samovar-v9.webp": SAMOVAR_PHOTO,
        "event-birthday-v9.webp": f"{prefix}/br-assets/br-birthday-panoramic.webp",
        "event-family-v9.webp": f"{prefix}/br-assets/br-family-bariloche.webp",
    }
    for original, updated in assets.items():
        home = home.replace(f'src="{prefix}/br-assets/{original}"', f'src="{updated}"', 1)
    home = home.replace(
        'Соберите близких за городом. Для детей можно подобрать отдельную программу.</p>'
        '<a class="br-nov-button" '
        f'href="{prefix}/deti/#detskiy-prazdnik">Детский праздник</a>',
        'Соберите близких за городом.</p>'
        '<a class="br-nov-button" href="https://t.me/ecobazabr">Обсудить семейный праздник</a>',
        1,
    )
    extra_cards = "".join(
        f'<details class="br-nov-program" name="br-home-events"><summary>'
        f'<img class="br-nov-program-photo" src="{prefix + "/br-assets/" + photo if not photo.startswith("https://") else photo}" '
        f'width="88" height="52" alt="" loading="lazy" decoding="async">'
        f'<span class="br-nov-program-name">{title}</span><span class="br-nov-program-action">'
        f'<span class="br-nov-action-expand">Подробнее</span><span class="br-nov-action-collapse">Свернуть</span>'
        f'</span></summary><div class="br-nov-program-content"><p>{description}</p>'
        f'<a class="br-nov-button" href="#popup:{popup}">Подробнее</a></div></details>'
        for title, description, popup, photo in EXTRA_EVENTS
    )
    event_start = home.index('id="prazdniki"')
    last_event = home.index("</details>", home.index(">Корпоратив</span>", event_start)) + len("</details>")
    return home[:last_event] + extra_cards + home[last_event:]

def render(home, prefix):
    programs, celebrations = (
        re.search(rf'<section\b[^>]*\bid="{id}"[^>]*>.*?</section>', home, re.S)[0]
        for id in ("programmy-otdyha", "prazdniki")
    )
    program_cards, event_cards = cards(programs), cards(celebrations)
    assert len(program_cards) == 3 and len(event_cards) == 3 + len(EXTRA_EVENTS)
    rows = "".join(
        f'<article>{photo(url)}<div><h3>{title}</h3>{body}</div></article>'
        for url, title, body in program_cards
    )
    details = "".join(
        f'<details name="sample-event"><summary>{title}</summary><div>{body}</div></details>'
        for _, title, body in event_cards
    )
    family_photo = f"{prefix}/br-assets/br-family-bariloche.webp"
    strip = f'<div class="sample-strip">{photo(family_photo)}<div>{details}</div></div>'
    markup = '<div id="br-sample" class="sample-3">' + block(
        "programmy-otdyha", "Сценарии отдыха", f'<div class="sample-tiles">{rows}</div>'
    ) + block("prazdniki", "Праздники и мероприятия", strip) + "</div>"
    home = home.replace(programs, markup, 1).replace(celebrations, "", 1)
    return home.replace("</head>", f'<link rel="stylesheet" href="{prefix}/br-assets/variant-3.css"></head>', 1)

def render_tabs(home, prefix):
    section_ids = ("programmy-otdyha", "prazdniki")
    titles = ("Сценарии отдыха", "Праздники и мероприятия")
    for section_id, title in zip(section_ids, titles):
        section = re.search(rf'<section\b[^>]*\bid="{section_id}"[^>]*>.*?</section>', home, re.S)[0]
        items = cards(section)
        assert len(items) == (3 if section_id == "programmy-otdyha" else 3 + len(EXTRA_EVENTS))
        buttons, panels = [], []
        for index, (url, label, body) in enumerate(items):
            key = f"{section_id}-{index}"
            selected = str(index == 0).lower()
            buttons.append(
                f'<button id="tab-{key}" type="button" role="tab" aria-selected="{selected}" '
                f'aria-controls="panel-{key}" tabindex="{0 if index == 0 else -1}">{label}</button>'
            )
            image_url = photo_url(url)
            hidden = " hidden" if index else ""
            panels.append(
                f'<article id="panel-{key}" role="tabpanel" aria-labelledby="tab-{key}"{hidden}>'
                f'<div class="sample-frame"><img src="{image_url}" alt="" decoding="async"></div>'
                f'<div class="sample-copy"><h3>{label}</h3>{body}</div></article>'
            )
        controls = f'<div class="sample-controls" role="tablist" aria-label="{title}">' + "".join(buttons) + "</div>"
        markup = block(section_id, title, controls + "".join(panels))
        home = home.replace(section, f'<div class="sample-tabs">{markup}</div>', 1)
    head_assets = (
        f'<link rel="stylesheet" href="{prefix}/br-assets/variant-tabs.css">'
        f'<script src="{prefix}/br-assets/variant-tabs.js" defer></script>'
    )
    return home.replace("</head>", head_assets + "</head>", 1)
