"""Serve the November BR review over localhost using the verified BR snapshots."""
from argparse import ArgumentParser
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import re
from urllib.parse import urlsplit
from zipfile import ZipFile

HERE = Path(__file__).resolve().parent
SNAPSHOTS = HERE / "br-public-snapshots.zip"
with ZipFile(SNAPSHOTS) as archive:
    ROUTES = {
        page["path"]: page["file"]
        for page in json.loads(archive.read("published-manifest.json"))["pages"]
    }

def read_original(route):
    with ZipFile(SNAPSHOTS) as archive:
        return archive.read(ROUTES[route]).decode()

FRAGMENTS = dict(re.findall(
    r'<template id="([^"]+)">\s*(.*?)\s*</template>',
    (HERE / "sections.html").read_text(), flags=re.S,
))
GUARD = (HERE / "preview-guard.js").read_text().replace(
    "event.preventDefault();", "event.preventDefault(); event.stopImmediatePropagation();",
).replace("const nativeFetch", "navigator.sendBeacon = () => false; const nativeFetch")
ASSETS = {
    "/br-assets/" + file.name: file
    for file in (HERE / "assets").iterdir() if file.is_file()
}
ASSETS["/custom.css"] = HERE / "assets/site-custom.css"
ASSET_TYPES = {".css": "text/css; charset=utf-8", ".jpg": "image/jpeg", ".webp": "image/webp", ".js": "text/javascript; charset=utf-8"}
SPA = {"/spa": ("rec1910053581", "SPA"), "/banchan": ("rec1796236641", "Бани и банные чаны")}
ACTIVITIES = "/aktivnosti-v-beryozovoj-roshhe"
WOODS = "/br-assets/quad-woods.webp"

def before_record(body, record, markup):
    return re.sub(r'(?=<div id=["\']' + record + r'["\'])', lambda _: markup, body, count=1)

def before_footer(body, markup):
    for record in ("rec1745536501", "rec2056188821"):
        changed = before_record(body, record, markup)
        if changed != body:
            return changed
    raise ValueError("Missing BR footer")

def rename_quad(body):
    # The legacy popup hook also powers inbound links. Keep its technical name.
    # Structured FAQ data is kept byte-for-byte with the original SEO.
    parts = re.split(r'(<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>.*?</script>)', body, flags=re.S | re.I)
    for index in range(0, len(parts), 2):
        part = parts[index]
        part = re.sub(r"(?m)^ +\.replace\(/\(Багги\).*\n", "", part)
        part = re.sub(r"(?m)^ +\.replace\(/Конная.*'Конная прогулка по лесу'\)\s*\n", "", part)
        # The previous release had temporarily suppressed quad wording in program copy.
        part = re.sub(r"\.replace\(/\(Прогулка.*?, '\$1'\);", ";", part)
        part = re.sub(r"Багги(?:\s|&nbsp;)+и(?:\s|&nbsp;)+квадроциклы", "Квадроциклы", part, flags=re.I)
        part = part.replace("Багги&nbsp;— 4000 руб с&nbsp;водителем / 6000 руб без водителя", "Актуальную стоимость и условия прогулки уточняйте у менеджера")
        part = part.replace("Стоимость аренды:<br />Актуальную", "Актуальную")
        part = part.replace("багги с водителем", "Условия уточняйте у менеджера")
        part = part.replace("поездки на багги", "поездки на квадроциклах")
        part = part.replace("багги", "квадроциклы").replace("Багги", "Квадроциклы").replace("БАГГИ", "КВАДРОЦИКЛЫ")
        part = re.sub(
            r"(<a class=\"brh-activity\" href=\"[^\"]+#baggi\">\s*)<img[^>]*>",
            lambda m: m[1] + f'<img src="{WOODS}" alt="" loading="lazy">',
            part,
        )
        part = re.sub(
            r'(<button[^>]*data-s="baggi"[^>]*>)(<span class="st__f"[^>]*>)(.*?)(</button>)',
            lambda m: m[1] + '<span class="st__f br-nov-quad-cover">' + m[3].replace("от 4 000 ₽", "") + m[4],
            part, flags=re.S,
        )
        part = re.sub(
            r"(\{ к: 'baggi'[^\n]*?)цена: 'от 4 000 ₽'([^\n]*?ф: 'br-baggi')",
            r"\1цена: ''\2", part,
        )
        part = part.replace("Можно с водителем или за рулём самому.", "Условия прогулки уточняйте у менеджера.")
        part = re.sub(r"""https://static\.tildacdn\.com/tild6138-6132-4033-b136-623263323030/[^"'\s)]+""", WOODS, part)
        part = re.sub(r"""https://(?:static|thb)\.tildacdn\.com/tild3531-3236-4536-a136-373830363464/[^"'\s)]+""", WOODS, part)
        # Story dialog computes its own picture from the asset key.
        part = part.replace("return ФОТО + код", f"return код === 'br-baggi' ? '{WOODS}' : ФОТО + код")
        parts[index] = part
    return "".join(parts)

def with_family_tab(body):
    tab = (
        '<li role="presentation" class="t1281__item t1281__tab t1281__tab-style2 t1281__width_25" '
        'data-tab-rec-ids="2863878101" data-tab-number="4">'
        '<button type="button" class="t1281__title t-name t-name_xs t1281__title-style2" '
        'id="tab4_2863877701" role="tab" aria-selected="false" aria-controls="rec2863878101" tabindex="-1">'
        '<div class="t1281__title-text">С детьми</div></button></li>'
    )
    start = body.index('id="carousel_2863877701"')
    end = body.index("</ul>", start)
    body = body[:start] + body[start:end].replace("t1281__width_33", "t1281__width_25") + tab + body[end:]
    body = body.replace(
        '<option value="2863878001">Мероприятия</option>',
        '<option value="2863878001">Мероприятия</option><option value="2863878101">С детьми</option>',
        1,
    )
    panel = '<div id="rec2863878101" class="r t-rec">' + FRAGMENTS["activities"] + '</div>'
    return before_record(body, "rec2863569901", panel)

@lru_cache(maxsize=len(ROUTES))
def render(route):
    original = read_original(route)
    head, body = re.split(r"(?=<body\b)", original, maxsplit=1, flags=re.I)
    head = head.replace('</head>', '<link rel="stylesheet" href="/br-assets/november.css"></head>', 1)
    # Install the local guard before site scripts. The original metadata stays intact.
    head = re.sub(r"(?<=<head>)", lambda _: "<script>window.__brDemoPaths="
                  + json.dumps(list(ROUTES)) + ";\n" + GUARD + "</script>", head, count=1, flags=re.I)
    body = rename_quad(body)
    body = re.sub(
        r'(<div\s+[^>]*data-group-id="1766499026279000004"[^>]*>)',
        lambda m: m[1] + FRAGMENTS["menu"],
        body,
    )
    booking = 'class="tn-atom__button-text">ПРОВЕРИТЬ ДАТЫ И ЗАБРОНИРОВАТЬ</span>'
    booking_copy = (
        'class="tn-atom__button-text br-native-booking-copy">'
        '<span>ПРОВЕРИТЬ ДАТЫ </span><span>И ЗАБРОНИРОВАТЬ</span></span>'
    )
    body = body.replace(booking, booking_copy, 1)
    if route in ("/", "/special"):
        body = re.sub(
            r'<article class="to-card">(?:(?!<article).)*?<h3 class="to-t">Банный отдых с самоваром</h3>.*?</article>',
            "", body, count=1, flags=re.S,
        )
    if route == "/":
        marker = '<section class="brh brh-section brh-section--offers"'
        assert body.count(marker) == 1
        body = body.replace(marker, FRAGMENTS["programs"] + FRAGMENTS["events"] + marker)
    if route == "/deti":
        body = before_footer(body, FRAGMENTS["kids"])
    if route == "/vip-programmy":
        body = before_footer(
            body, FRAGMENTS["scenario_filters"] + FRAGMENTS["bath"]
            + '<script src="/br-assets/scenario-filters.js" defer></script>',
        )
    if route == ACTIVITIES:
        body = with_family_tab(body)
    if route in SPA:
        links = "".join(f'<a href="{path}"{(" aria-current=page" if path == route else "")}>{name}</a>'
                        for path, (_, name) in SPA.items())
        body = before_record(body, SPA[route][0], f'<nav class="br-nov-tabs" aria-label="SPA, бани и банные чаны">{links}</nav>')
    return (head + body).encode()

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path.rstrip("/") or "/"
        if path in ROUTES:
            payload, mime = render(path), "text/html; charset=utf-8"
        elif path in ASSETS:
            file = ASSETS[path]
            payload, mime = file.read_bytes(), ASSET_TYPES[file.suffix]
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        self.end_headers()
        self.wfile.write(payload)

    def do_POST(self):
        self.send_error(405, "Local review: submissions are disabled")

if __name__ == "__main__":
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8154)
    args = parser.parse_args()
    ThreadingHTTPServer(("127.0.0.1", args.port), Handler).serve_forever()
