"""Build an independent, read-only winter preview from the current BR demo."""
import argparse
import importlib
import json
from pathlib import Path
import re
import shutil
import sys

import layout_variant
import family_component
import review_changes
import hashlib

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "br-tasks-20261119"))
pages = importlib.import_module("build_pages")
original_pages = importlib.import_module("serve")

PREFIX = "/ber-bar-seasonal-engine/prevyu/lid/br-winter-20261120"
STORIES = {
    "br-rybalka": "activity-fish-hq",
    "br-sup": "activity-sup-hq",
    "br-ferma-v": "br-ferma-v",
    "br-koni-v": "br-koni-v",
}
ALIASES = {
    "house-bariloche-2": "bariloche",
    "house-chalet-2": "chalet",
    **STORIES,
    **{name + "-m": asset for name, asset in STORIES.items()},
}
IMAGE = re.compile(r"<(?:img|source)\b[^>]*>", re.I)
SRCSET = re.compile(r"""\s+srcset=(["'])[^"']*\1""", re.I)
URL = re.compile(
    r"""(?:https://[^\s'"<>(),]+/)?(?:br-guest/assets/houses/|br-guest/assets/|home-assets/|demo/assets/storis/|demo/assets/)"""
    r"""([a-zA-Z\d-]+)\.(?:webp|jpg)"""
)
SPA_HERO = re.compile(
    r"""https://[^/]+/tild3031-6666-4338-b861-666432343536/[^"'<>\s(),]*ChatGPT_Image_9__202\.webp"""
)
NATIVE_PHOTOS = {
    "tild6332-6365-4533-b938-383537656539": "selector-aframe",
    "tild3863-6162-4634-b361-326630343263": "bariloche",
    "tild6466-3735-4037-a631-616463343866": "scandi",
    "tild6536-6562-4363-b666-366437663763": "house-panorama-2",
    "tild3034-3630-4035-b662-373935306330": "selector-baus",
    "tild3064-3136-4166-b562-333239343964": "selector-chalet",
    "tild3936-3531-4839-b862-303765353032": "house-house-2-2",
    "tild3962-3764-4635-b038-366332343264": "selector-barn",
    "tild3238-3034-4562-b735-646535623737": "selector-sfera",
    "tild3061-6364-4266-b765-303136303965": "selector-holiday",
    "tild3031-3065-4461-b065-323461373666": "selector-spa-pool",
    "tild3161-6566-4534-a165-346361656362": "spa-hero",
    "tild6536-6165-4238-b865-653061663032": "activity-spa-hq",
    "tild3665-3264-4533-b436-303439303638": "selector-spa-lounge",
}
NATIVE_IMAGE = re.compile(
    r"""https://(?:static|optim|thb)\.tildacdn\.com/(tild[a-z0-9-]+)/[^"'<>\s(),&]+?\.(?:webp|png|jpe?g)(?:\.webp)?"""
)
AUTUMN = re.compile(r"<script\b[^>]*>\s*window\.AUTUMN\s*=.*?</script>", re.S)

def rewrite_photos(html, assets):
    def replace(match):
        name = ALIASES.get(match[1], match[1])
        return f"{PREFIX}/br-assets/winter-{name}.webp" if name in assets else match[0]

    def normalize_tag(match):
        original = match[0]
        changed = URL.sub(replace, original)
        if original != changed and changed.lower().startswith("<img"):
            src = re.search(r"""\bsrc=["']([^"']+)""", changed, re.I)
            if src and "/br-assets/winter-" in src[1]:
                changed = SRCSET.sub("", changed)
        return changed

    html = URL.sub(replace, IMAGE.sub(normalize_tag, html))
    def native(match):
        name = NATIVE_PHOTOS.get(match[1])
        return f"{PREFIX}/br-assets/winter-{name}.webp" if name in assets else match[0]

    html = NATIVE_IMAGE.sub(native, html)
    if "spa-hero" in assets:
        html = SPA_HERO.sub(PREFIX + "/br-assets/winter-spa-hero.webp", html)
    if "activity-spa-hq" in assets:
        html = html.replace("/br-assets/program-reset-v9.webp", "/br-assets/winter-activity-spa-hq.webp")
    if "quad-woods" in assets:
        html = html.replace("/br-assets/quad-woods.webp", "/br-assets/winter-quad-woods.webp")
    story_photos = {
        key: f"{PREFIX}/br-assets/winter-{name}.webp"
        for key, name in STORIES.items()
        if name in assets
    }
    return html.replace(
        "var Ф = function (код, ш) { return",
        "var зимниеФото = " + json.dumps(story_photos)
        + "; var Ф = function (код, ш) { if (зимниеФото[код]) return зимниеФото[код]; return",
        1,
    )

def family_activities(html):
    family_start = html.index('<section class="br-nov" id="s-detmi"')
    family_end = html.index("</section>", family_start) + len("</section>")
    birthday = re.search(
        r'<section\b[^>]*\bid="detskiy-prazdnik"[^>]*>.*?</section>',
        pages.static_page("/deti"),
        re.S,
    )[0]
    activities = (
        ("playground", "Детская площадка", "Горки, игровые домики и настоящий синий трактор."),
        ("farm", "Контактная ферма", "Познакомьтесь с козлятами и кроликами. Корм можно купить в ресторане."),
        ("cinema", "Домашний кинотеатр", "Во многих домиках есть проектор и большой экран для семейного кино."),
        ("ponies", "Лошади и пони", "Конные прогулки по предварительной записи."),
    )
    cards = "".join(
        f'<article><img src="{PREFIX}/br-assets/family-{photo}.webp" alt="" loading="lazy" decoding="async">'
        f'<h3>{title}</h3><p>{description}</p></article>'
        for photo, title, description in activities
    )
    panel = (
        '<section class="br-family-activities" id="s-detmi" aria-labelledby="br-nov-family-title">'
        '<h2 id="br-nov-family-title">Чем занять детей, пока родители отдыхают</h2>'
        f'<div class="br-family-activities__grid">{cards}</div>{birthday}</section>'
    )
    return html[:family_start] + panel + html[family_end:]


def stamp_assets(html):
    pattern = re.compile(r'(<(?:link|script)\b[^>]*?(?:href|src)=["\'])(' + re.escape(PREFIX) + r'/br-assets/([^"\'?]+\.(?:css|js)))(?:\?[^"\']*)?(["\'])', re.I)
    def version(match):
        filename = match[3]
        file = HERE / 'assets' / filename
        if not file.exists(): file = pages.HERE / 'assets' / filename
        digest = hashlib.sha256(file.read_bytes()).hexdigest()[:10]
        return match[1] + match[2] + '?v=' + digest + match[4]
    return pattern.sub(version, html)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True, help="Document root of the local preview server")
    args = parser.parse_args()
    output = args.root.resolve() / PREFIX.lstrip("/")
    output.mkdir(parents=True, exist_ok=True)
    pages.PREFIX = PREFIX
    pages.ASSET_ROOT = PREFIX + "/br-assets"
    files = (HERE / "assets").glob("winter-*.webp")
    approved = {file.stem[7:] for file in files}
    shutil.copytree(pages.HERE / "assets", output / "br-assets", dirs_exist_ok=True)
    shutil.copytree(HERE / "assets", output / "br-assets", dirs_exist_ok=True)
    for route in pages.ROUTES:
        html = AUTUMN.sub("", pages.static_page(route))
        # Preview routing rewrites navigation only; canonical stays on ecobr.ru.
        canonical_pattern = r'<link\b[^>]*\brel=["\']canonical["\'][^>]*>'
        canonical = re.search(canonical_pattern, original_pages.read_original(route), re.I)[0]
        html = re.sub(canonical_pattern, lambda _: canonical, html, count=1, flags=re.I)
        html = rewrite_photos(html, approved)
        html = review_changes.apply(html, route, PREFIX)
        if route == "/aktivnosti-v-beryozovoj-roshhe":
            html = family_component.replace_family(html, pages, PREFIX)
        if route == "/deti":
            html = family_component.replace_standalone(html)
        if route in ("/deti", "/aktivnosti-v-beryozovoj-roshhe"):
            html = html.replace("</body>", f'<script src="{PREFIX}/br-assets/family-gallery.js" defer></script></body>', 1)
        if route == "/doma":
            html = html.replace(
                "new URL(h.image,assetBase)",
                "new URL(h.image,h.image.startsWith('/') ? location.origin : assetBase)",
            )
        css_link = f'<link rel="stylesheet" href="{PREFIX}/br-assets/winter.css">'
        html = html.replace("</head>", css_link + "</head>", 1)
        if route == "/":
            hero = '<section class="brx brx--s1"'
            html = html.replace(hero, '<div class="br-winter-snow" aria-hidden="true"></div>' + hero, 1)
            # The owner explicitly removed homepage program prices after review.
            html = layout_variant.without_home_prices(html)
            html = layout_variant.update_home_programs_and_events(html, PREFIX)
            html = re.sub(r'<nav class="br-nov-trust"[^>]*>.*?</nav>', "", html, count=1, flags=re.S)
            benefits = f"""
<aside id="br-home-benefits" class="br-winter-benefits" aria-label="Награда и условия отдыха">
  <ul>
    <li><a href="https://yandex.ru/maps/org/beryozovaya_roshcha/91160063546/" aria-label="«Хорошее место» Яндекса 5 лет подряд">
      <span class="br-winter-benefits__award"><img src="{PREFIX}/br-assets/brand-yandex.svg" alt="" width="24" height="24"></span>
      <span class="br-winter-benefits__full">«Хорошее место» Яндекса 5 лет подряд</span>
      <span class="br-winter-benefits__short">5 лет</span>
    </a></li>
    <li><a href="{PREFIX}/split/" aria-label="Яндекс Сплит, оплата частями">
      <span class="br-winter-benefits__split"><img src="{PREFIX}/br-assets/brand-split.svg" alt="Яндекс Сплит" width="78" height="21"></span>
      <span class="br-winter-benefits__full">Оплата частями</span>
    </a></li>
    <li>
      <span class="br-winter-benefits__full">С животными можно</span>
      <span class="br-winter-benefits__short">С питомцами</span>
    </li>
  </ul>
</aside>
"""
            hero_end = html.index("</section>", html.index(hero))
            html = html[:hero_end] + benefits + html[hero_end:]
        folder = output / route.strip("/")
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "index.html").write_text(stamp_assets(layout_variant.render_cards(html, PREFIX) if route == "/" else html))
        if route == "/":
            versions = {
                "version-1": layout_variant.render_tabs,
                "version-2": layout_variant.render_cards,
                "variant-tabs": layout_variant.render_tabs,
                "variant-3": layout_variant.render_cards,
            }
            for name, renderer in versions.items():
                variant = output / name
                variant.mkdir(exist_ok=True)
                (variant / "index.html").write_text(stamp_assets(renderer(html, PREFIX)))
    print(f"{len(pages.ROUTES)} pages, {len(approved)} winter photos · {output}")

if __name__ == "__main__":
    main()
