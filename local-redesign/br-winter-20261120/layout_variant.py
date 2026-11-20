"""The selected editorial layout for the two homepage sections."""
import re

REPOSITORY_ASSETS = "https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/"
LARGE_PHOTOS = {
    "program-romance-v9.webp": REPOSITORY_ASSETS + "demo/assets/storis/br-romantik.webp",
    "program-samovar-v9.webp": REPOSITORY_ASSETS + "demo/assets/card-banya.webp",
}

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

def render(home, prefix):
    programs, celebrations = (
        re.search(rf'<section\b[^>]*\bid="{id}"[^>]*>.*?</section>', home, re.S)[0]
        for id in ("programmy-otdyha", "prazdniki")
    )
    program_cards, event_cards = cards(programs), cards(celebrations)
    assert len(program_cards) == len(event_cards) == 3
    rows = "".join(
        f'<article>{photo(url)}<div><h3>{title}</h3>{body}</div></article>'
        for url, title, body in program_cards
    )
    details = "".join(
        f'<details name="sample-event"><summary>{title}</summary><div>{body}</div></details>'
        for _, title, body in event_cards
    )
    family_photo = f"{prefix}/br-assets/kids-party.jpg"
    strip = f'<div class="sample-strip">{photo(family_photo)}<div>{details}</div></div>'
    markup = '<div id="br-sample" class="sample-3">' + block(
        "programmy-otdyha", "Сценарии отдыха", f'<div class="sample-tiles">{rows}</div>'
    ) + block("prazdniki", "Праздники и мероприятия", strip) + "</div>"
    home = home.replace(programs, markup, 1).replace(celebrations, "", 1)
    return home.replace("</head>", f'<link rel="stylesheet" href="{prefix}/br-assets/variant-3.css"></head>', 1)

def render_tabs(home, prefix):
    section_ids = ("programmy-otdyha", "prazdniki")
    titles = ("Сценарии отдыха", "Праздники и мероприятия")
    replacements = {
        "Свидание года": "drive-romance.webp",
        "Банный отдых с самоваром": "drive-samovar.webp",
        "День рождения": "kids-entertainers.jpg",
        "Семейный праздник": "kids-party.jpg",
    }
    for section_id, title in zip(section_ids, titles):
        section = re.search(rf'<section\b[^>]*\bid="{section_id}"[^>]*>.*?</section>', home, re.S)[0]
        items = cards(section)
        assert len(items) == 3
        buttons, panels = [], []
        for index, (url, label, body) in enumerate(items):
            key = f"{section_id}-{index}"
            selected = str(index == 0).lower()
            buttons.append(
                f'<button id="tab-{key}" type="button" role="tab" aria-selected="{selected}" '
                f'aria-controls="panel-{key}" tabindex="{0 if index == 0 else -1}">{label}</button>'
            )
            asset = replacements.get(label)
            image_url = f"{prefix}/br-assets/{asset}" if asset else photo_url(url)
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
