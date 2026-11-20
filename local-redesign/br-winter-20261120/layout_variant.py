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
    strip = f'<div class="sample-strip">{photo(event_cards[1][0])}<div>{details}</div></div>'
    markup = '<div id="br-sample" class="sample-3">' + block(
        "programmy-otdyha", "Сценарии отдыха", f'<div class="sample-tiles">{rows}</div>'
    ) + block("prazdniki", "Праздники и мероприятия", strip) + "</div>"
    home = home.replace(programs, markup, 1).replace(celebrations, "", 1)
    return home.replace("</head>", f'<link rel="stylesheet" href="{prefix}/br-assets/variant-3.css"></head>', 1)
