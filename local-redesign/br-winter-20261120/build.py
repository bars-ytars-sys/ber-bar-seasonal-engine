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
import menu_layout
import home_review
import holiday_home
import winter_routes
import winter_site
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
    "tild6332-6365-4533-b938-383537656539": "aframe-luxe-white",
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
    html = html.replace(">Сценарии отдыха</a>", ">Программы отдыха</a>")
    html = html.replace(
        f'href="{PREFIX}/#prazdniki">Праздники и мероприятия</a>',
        f'href="{PREFIX}/vip-programmy/#prazdniki">Праздники и мероприятия</a>',
    )
    html = menu_layout.apply(html, PREFIX)
    pattern = re.compile(r'(<(?:link|script)\b[^>]*?(?:href|src)=["\'])(' + re.escape(PREFIX) + r'/br-assets/([^"\'?]+\.(?:css|js)))(?:\?[^"\']*)?(["\'])', re.I)
    def version(match):
        filename = match[3]
        file = HERE / 'assets' / filename
        if not file.exists(): file = pages.HERE / 'assets' / filename
        digest = hashlib.sha256(file.read_bytes()).hexdigest()[:10]
        return match[1] + match[2] + '?v=' + digest + match[4]
    return pattern.sub(version, html)


WARM_PHOTOS = {
    "winter-house-house-2-2.webp": "house-2-warm.webp",
    "winter-barn-2.webp": "barn-2-warm.webp",
    "winter-bariloche.webp": "bariloche-warm.webp",
}


def catalog_houses_first(html):
    cover_photos = {
        "winter-panorama.webp": "hero-panorama-warm.webp",
        "br-guest/assets/houses/house-2.webp": "house-2-warm.webp",
    }
    for source, cover in cover_photos.items():
        html = re.sub(
            rf'("image": ")[^"]*{re.escape(source)}"',
            rf'\1{PREFIX}/br-assets/{cover}"', html, count=1,
        )
    html = re.sub(
        r'("url": ")https://ecobr\.ru(/doma/[^"]+?)/?"',
        rf'\1{PREFIX}\2/"', html,
    )
    houses_source = "const houses=D.houses,assetBase="
    assert html.count(houses_source) == 1
    html = html.replace(
        houses_source,
        'const coverOrder = ["bariloche", "panorama", "baus-1", "house-2"];\n'
        '  const coverRank = id => coverOrder.includes(id) ? coverOrder.indexOf(id) : coverOrder.length;\n'
        '  const houses = [...D.houses].sort((a, b) => coverRank(a.id) - coverRank(b.id)),assetBase=',
        1,
    )
    start = '<div class="brp-search" role="search"'
    end = '</div><div class="brp-results-head">'
    assert html.count(start) == 1
    before, search = html.split(start, 1)
    filters, after = search.split(end, 1)
    filter_start = '<div class="brp-scenarios"'
    before, scenarios = before.split(filter_start, 1)
    before = re.sub(
        r'<p class="brp-eyebrow">.*?</p><h2 id="brp-title">.*?</h2><p class="brp-intro">.*?</p>',
        '<h1 id="brp-title" class="br-winter-catalog-title">Каталог домов</h1>',
        before, count=1,
    )
    disclosure = (
        '<details class="br-winter-catalog-search"><summary>Подобрать по датам и гостям</summary>'
        + filter_start + scenarios + start + filters + '</div></details>'
    )
    html = before + disclosure + '<div class="brp-results-head">' + after
    directory = re.search(r'<section id="br-catalog-directory".*?</section>', html, re.S)[0]
    html = html.replace(directory, '', 1)
    marker = '    target.before(section);'
    assert html.count(marker) == 1
    html = html.replace(
        marker,
        marker + '\n    section.after(document.getElementById("br-catalog-directory"));',
        1,
    )
    html = html.replace('</body>', directory + '</body>', 1)
    html = re.sub(
        r'<h1([^>]*>Каталог домов в Берёзовой роще)</h1>',
        r'<p\1</p>', html, count=1,
    )
    return html.replace(
        "</head>",
        f'<link rel="stylesheet" href="{PREFIX}/br-assets/catalog-houses-first.css"></head>',
        1,
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True, help="Document root of the local preview server")
    args = parser.parse_args()
    output = args.root.resolve() / PREFIX.lstrip("/")
    output.mkdir(parents=True, exist_ok=True)
    pages.PREFIX = PREFIX
    pages.ASSET_ROOT = PREFIX + "/br-assets"
    winter_site.validate_assets(HERE / "assets")
    files = (HERE / "assets").glob("winter-*.webp")
    approved = {file.stem[7:] for file in files}
    shutil.copytree(pages.HERE / "assets", output / "br-assets", dirs_exist_ok=True)
    shutil.copytree(HERE / "assets", output / "br-assets", dirs_exist_ok=True)
    guide_photo = HERE.parents[1] / "prevyu/lid/br-guest/assets/bath.webp"
    shutil.copyfile(guide_photo, output / "br-assets/bath-guide.webp")
    shutil.copytree(HERE / "certificate", output / "certificate", dirs_exist_ok=True)
    routes = ["/", *(route for route in pages.ROUTES if route != "/")]
    bath_source = review_changes.apply(pages.static_page("/vip-programmy"), "/vip-programmy", PREFIX)
    bath_programs = home_review.section(bath_source, "samovar")
    bath_programs = re.sub(r"<strong>[^<]*₽</strong>", "", bath_programs)
    bath_programs = bath_programs.replace(" Акции не суммируются.", "")
    for route in routes:
        html = AUTUMN.sub("", pages.static_page(route))
        # Preview routing rewrites navigation only; canonical stays on ecobr.ru.
        canonical_pattern = r'<link\b[^>]*\brel=["\']canonical["\'][^>]*>'
        canonical = re.search(canonical_pattern, original_pages.read_original(route), re.I)[0]
        html = re.sub(canonical_pattern, lambda _: canonical, html, count=1, flags=re.I)
        if route.startswith("/doma/"):
            html = winter_site.house_page(html, route.rsplit("/", 1)[1], PREFIX)
        if route != "/mayskiye2026":
            html = winter_site.replace_outside_summer_archive(html, lambda fragment: rewrite_photos(fragment, approved))
        html = review_changes.apply(html, route, PREFIX)
        if route == "/aktivnosti-v-beryozovoj-roshhe":
            html = family_component.replace_family(html, pages, PREFIX)
        if route == "/deti":
            html = family_component.replace_standalone(html)
            html = html.replace(
                "</body>",
                f'<script src="{PREFIX}/br-assets/deti-callback.js" defer></script></body>',
                1,
            )
        if route in ("/deti", "/aktivnosti-v-beryozovoj-roshhe"):
            html = html.replace("</body>", f'<script src="{PREFIX}/br-assets/family-gallery.js" defer></script></body>', 1)
        if route == "/doma":
            html = catalog_houses_first(html)
            html = winter_site.catalogue_covers(html, PREFIX)
            html = html.replace(
                "new URL(h.image,assetBase)",
                "new URL(h.image,h.image.startsWith('/') ? location.origin : assetBase)",
            )
        if route in ("/", "/deti", "/banchan", "/aktivnosti-v-beryozovoj-roshhe") or route.startswith("/vip-programmy"):
            html = html.replace(
                "</head>",
                f'<link rel="stylesheet" href="{PREFIX}/br-assets/program-contact.css">'
                f'<script src="{PREFIX}/br-assets/program-contact.js" defer></script></head>',
                1,
            )
        css_link = (f'<link rel="stylesheet" href="{PREFIX}/br-assets/br-controls.css">'
                    f'<link rel="stylesheet" href="{PREFIX}/br-assets/winter.css">')
        html = html.replace("</head>", css_link + "</head>", 1)
        if route == "/":
            hero = '<section class="brx brx--s1"'
            html = html.replace(hero, '<div class="br-winter-snow" aria-hidden="true"></div>' + hero, 1)
            # The owner explicitly removed homepage program prices after review.
            html = layout_variant.without_home_prices(html)
            html = layout_variant.update_home_programs_and_events(html, PREFIX)
            home_events = home_review.section(html, "prazdniki")
            html = re.sub(r'<nav class="br-nov-trust"[^>]*>.*?</nav>', "", html, count=1, flags=re.S)
            benefits = f"""
<aside id="br-home-benefits" class="br-winter-benefits" aria-label="Оплата частями и награда Яндекса">
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
  </ul>
</aside>
"""
            hero_end = html.index("</section>", html.index(hero))
            html = html[:hero_end] + benefits + html[hero_end:]
        folder = output / route.strip("/")
        folder.mkdir(parents=True, exist_ok=True)
        result = home_review.apply(html, PREFIX) if route == "/" else html
        if route == "/vip-programmy":
            result = home_review.add_events_to_programs(result, home_events, PREFIX)
        for source, warm in WARM_PHOTOS.items():
            result = result.replace(f"{PREFIX}/br-assets/{source}", f"{PREFIX}/br-assets/{warm}")
        homepage = holiday_home.render(result, PREFIX, "brand") if route == "/" else result
        page = winter_routes.apply(winter_site.apply(homepage, route, PREFIX), route, PREFIX, bath_programs)
        if route == "/new-year":
            holiday_source = HERE.parents[1] / "demo/assets/new-year-20261105"
            holiday_output = output / "br-assets/holiday"
            holiday_output.mkdir(exist_ok=True)
            for filename in sorted(set(re.findall(r'/br-assets/holiday/(br-[a-z-]+\.webp)', page))):
                shutil.copyfile(holiday_source / filename, holiday_output / filename)
        (folder / "index.html").write_text(stamp_assets(page))
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
                page = winter_site.apply(renderer(html, PREFIX), route, PREFIX)
                (variant / "index.html").write_text(stamp_assets(winter_routes.apply(page, route, PREFIX)))
            for name, layout in holiday_home.VERSIONS.items():
                variant = output / name
                variant.mkdir(exist_ok=True)
                page = winter_site.apply(holiday_home.render(result, PREFIX, layout), route, PREFIX)
                (variant / "index.html").write_text(stamp_assets(winter_routes.apply(page, route, PREFIX)))
    print(f"{len(pages.ROUTES)} pages, {len(approved)} winter photos · {output}")

if __name__ == "__main__":
    main()
