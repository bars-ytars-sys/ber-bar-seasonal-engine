"""Seasonal presentation for the full BR preview, using the original page records."""
from html import escape
import json
from pathlib import Path
import re


HERE = Path(__file__).resolve().parent
HOUSE_COVERS = json.loads((HERE / "winter-house-covers.json").read_text())
GALLERY_RETOUCH = json.loads((HERE / "winter-gallery-retouch.json").read_text())
RECORD = re.compile(r'<div id="(rec\d+)"[^>]*>')
PHOTO_URL = re.compile(r"""https://(?:static|optim|thb)\.tildacdn\.com/(tild[a-z0-9-]+)/[^"'<>\s(),&]+""")
NATIVE_TABS = re.compile(r'(<ul\b[^>]*\bdata-tab-current="1"[^>]*>)(.*?)(</ul>)', re.S)
NATIVE_TAB = re.compile(r'<li\b[^>]*>.*?</li>', re.S)
NATIVE_SLIDE = re.compile(
    r'<div\s+class="t1148__item"[^>]*>\s*<div\b[^>]*>\s*<img\b[^>]*>\s*</div>\s*</div>', re.S,
)
SUMMER_ARCHIVE = re.compile(r'(<details class="br-season-archive">.*?</details>)', re.S)
HOME_HOUSES = re.compile(r'<section\b(?=[^>]*\bid="br-home-houses")[^>]*>.*?</section>', re.S)
HOME_HOUSE = re.compile(r'<article class="brh-card brh-house"[^>]*>.*?</article>', re.S)
HOME_PHOTO = re.compile(r'<img\b[^>]*>')
HOME_EXTERIOR = re.compile(r'<button\b(?=[^>]*\baria-label="Внешний вид")[^>]*>')
HOLIDAY_PHOTOS = "https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/new-year-20261105/"
SUMMER_GALLERIES = {
    "bariloche": ("rec2411770091", {1, 2, 3, 20, 21, 22, 23, 24, 25}),
    "chalet": ("rec1737097191", {1, 2, 3, 4, 24, 25, 27}),
    "panorama": ("rec1737025491", {2, 3, 4, 5, 6, 36, 38, 39, 40, 41, 42}),
    "scandi": ("rec1737080361", {1, 2, 11, 12, 13, 14, 15}),
}
SEASONAL_PHOTOS = {
    "tild6639-3861-4535-a534-336133643938": "winter-playground.webp",
    "tild3766-6464-4637-b865-346163633362": "winter-glamping.webp",
    "tild6362-3266-4330-b836-353861383930": "winter-glamping.webp",
    "tild3938-3061-4336-b230-396361343533": "winter-panorama.webp",
    "tild3736-6361-4438-b632-343562663664": "winter-reception.webp",
    "tild6436-3761-4635-b134-303833343966": "winter-reception.webp",
    "tild6338-3836-4531-a665-666238636533": "winter-aframe-luxe-white.webp",
    "tild3239-6634-4135-a663-333565636338": "winter-panorama-tub.webp",
    "tild6530-3230-4462-a430-383433303839": "winter-outdoor-spa.webp",
    "tild3132-3061-4366-b965-623461633166": "winter-outdoor-spa.webp",
    "tild3731-3761-4065-a265-316663363832": "winter-activity-farm-hq.webp",
    "tild3730-6465-4933-a530-306163333162": "winter-br-koni-v.webp",
    "tild6464-3062-4236-a339-353834353033": "winter-activity-koni-hq.webp",
    "tild6461-3866-4937-a562-333030663635": "winter-br-koni-v.webp",
    "tild6661-3336-4866-b537-633661613032": "winter-activity-fish-hq.webp",
    "tild3635-6430-4538-b739-376564343432": "winter-activity-sup-hq.webp",
    "tild6330-3133-4062-a262-616263626665": "hero-winter-spa-hq.webp",
    "tild6339-6561-4130-b464-646463313361": "hero-winter-spa-hq.webp",
    "tild3664-3965-4431-a537-396337656361": "hero-winter-spa-hq.webp",
    "tild6139-3532-4136-a431-333736333265": "hero-winter-spa-hq.webp",
    "tild3761-3162-4066-b435-326639616461": "winter-buggy.webp",
    "tild3831-6231-4262-b431-376566303264": "winter-baus-1.webp",
    "tild6130-6631-4137-b063-366531356132": "winter-svidanie.webp",
    "tild6330-3564-4464-b436-343134346661": "winter-svidanie.webp",
    "tild3837-6233-4139-b836-346330666361": "winter-chalet.webp",
    "tild3162-3130-4130-a236-353635383732": "winter-svidanie.webp",
    "tild6238-6164-4034-b934-313134363965": "winter-svidanie.webp",
    "tild6566-3631-4332-b066-373733393136": "winter-card-chan.webp",
    "tild3734-6265-4438-b538-373338396636": "winter-activity-farm-hq.webp",
    "tild6564-3334-4631-a264-343061383363": "winter-activity-farm-hq.webp",
    "tild6433-3061-4366-b733-313138333136": "winter-activity-fish-hq.webp",
    "tild3632-6635-4631-b938-343964323138": "winter-activity-fish-hq.webp",
    "tild3862-3638-4365-b136-653063353863": "winter-baus-bath.webp",
    "tild6139-3761-4166-a530-613038636236": "winter-baus-bath.webp",
    "tild6564-3761-4362-b836-343032333061": "winter-baus-lounge.webp",
    "tild3831-3233-4630-b465-636138323430": "winter-svidanie.webp",
    "tild3533-6665-4632-a634-383865366132": "winter-baus-1.webp",
    "tild3466-3135-4639-b366-663934376631": "hero-winter-spa-hq.webp",
    "tild6666-3164-4966-a164-353561646566": "winter-glamping.webp",
    "tild3131-3736-4261-a637-326261306138": "winter-baus-1.webp",
    "tild3937-3638-4664-b035-343763643331": "winter-baus-1.webp",
    "tild6666-3534-4936-b735-333763383361": "winter-svidanie.webp",
    "tild3233-6137-4033-b962-323933393263": "winter-activity-koni-hq.webp",
    "tild6266-6536-4766-a338-303837633662": "winter-farm-deer.webp",
    "tild3237-6331-4331-a466-376635303833": "winter-svidanie.webp",
    "tild3832-3533-4562-b163-656264613232": "winter-group-lounge.webp",
    "tild3231-3238-4966-a334-323963666132": "winter-card-chan.webp",
    "tild3662-3666-4537-b639-353836353062": "winter-outdoor-spa.webp",
    **{media_id: info["asset"] for media_id, info in GALLERY_RETOUCH.items()},
}

def validate_assets(folder):
    names = {house["asset"] for house in HOUSE_COVERS.values()} | set(SEASONAL_PHOTOS.values())
    names.update(("winter-farm-goat.webp", "winter-birthday-panoramic.webp", "winter-open-pool.webp",
                  "hero-panorama-garland-mobile.avif", "territory-map.webp"))
    for name in sorted(names):
        if not (folder / name).is_file():
            raise FileNotFoundError(folder / name)


def replace_outside_summer_archive(html, transform):
    fragments = SUMMER_ARCHIVE.split(html)
    fragments[::2] = map(transform, fragments[::2])
    return ''.join(fragments)


def within_record(html, target, transform):
    records = list(RECORD.finditer(html))
    for index, record in enumerate(records):
        if record[1] == target:
            finish = records[index + 1].start() if index + 1 < len(records) else len(html)
            return html[:record.start()] + transform(html[record.start():finish]) + html[finish:]
    raise ValueError(f"Missing record {target}")


def activate_winter_tab(html):
    def activate(match):
        tabs = NATIVE_TAB.findall(match[2])
        if len(tabs) != 2 or "ЗИМНИЕ ФОТО" not in tabs[1] or "ЛЕТНИЕ ФОТО" not in tabs[0]:
            return match[0]
        first = re.sub(r'\s+t1281__[\w-]+_active', '', tabs[0])
        first = first.replace('aria-selected="true"', 'aria-selected="false"').replace('tabindex="0"', 'tabindex="-1"')
        second = re.sub(r'(\bclass="[^"]*\bt1281__tab\b)(?!-|_)', r'\1 t1281__tab_active t1281__tab-style2_active', tabs[1], count=1)
        second = second.replace('aria-selected="false"', 'aria-selected="true"').replace('tabindex="-1"', 'tabindex="0"')
        start = match[1].replace('data-tab-current="1"', 'data-tab-current="2"')
        return start + first + second + match[3]

    html = NATIVE_TABS.sub(activate, html)
    return re.sub(r'(<option value="\d+")>ЗИМНИЕ ФОТО</option>', r'\1 selected>ЗИМНИЕ ФОТО</option>', html, count=1)


def seasonal_gallery(record, cover, summer_indices):
    matches = list(NATIVE_SLIDE.finditer(record))
    assert matches and max(summer_indices) <= len(matches), cover
    assert record.count('aria-roledescription="slide"') == len(matches), cover
    summer = [matches[index - 1][0] for index in sorted(summer_indices)]
    kept = [m[0] for index, m in enumerate(matches, 1) if index not in summer_indices]
    winter = re.sub(r'\b(src|data-original|data-img-zoom-url)="[^"]+"', lambda m: f'{m[1]}="{cover}"', matches[0][0])
    slides = [winter, *kept]
    for index, item in enumerate(slides):
        item = re.sub(r'aria-label="\d+ из \d+"', f'aria-label="{index + 1} из {len(slides)}"', item, count=1)
        item = re.sub(r'aria-current="(?:true|false)"', f'aria-current="{str(index == 0).lower()}"', item, count=1)
        slides[index] = re.sub(
            r'(data-index="|data-zoom-target="|imgfield="gi_img__)\d+',
            lambda m: f'{m[1]}{index}', item,
        )
    record = record[:matches[0].start()] + ' '.join(slides) + record[matches[-1].end():]
    originals = [re.search(r'\bdata-img-zoom-url="([^"]+)"', photo)[1] for photo in summer]
    pictures = ''.join(
        f'<a href="{escape(url, quote=True)}"><img src="{escape(url, quote=True)}" '
        f'alt="Летний вид дома, фото {index}" loading="lazy" decoding="async"></a>'
        for index, url in enumerate(originals, 1)
    )
    return record + f'<details class="br-season-archive"><summary>Летние фото</summary><div>{pictures}</div></details>'


def house_page(html, slug, prefix):
    cover = HOUSE_COVERS[slug]
    cover_path = f"{prefix}/br-assets/{cover['asset']}"

    def replace_cover(record):
        image = lambda m: cover_path if m[1] == cover["old"] else m[0]
        replaced = PHOTO_URL.sub(image, record)
        assert replaced != record, slug
        return replaced.replace(f'id="{cover["record"]}"', f'id="{cover["record"]}" data-br-winter-cover="{slug}"', 1)

    html = within_record(html, cover["record"], replace_cover)
    if slug in SUMMER_GALLERIES:
        record, summer_indices = SUMMER_GALLERIES[slug]
        return within_record(html, record, lambda fragment: seasonal_gallery(fragment, cover_path, summer_indices))
    assert ">ЗИМНИЕ ФОТО<" in html, slug
    return activate_winter_tab(html)


def catalogue_covers(html, prefix):
    pattern = re.compile(r'("id":\s*"([^"]+)",\s*"name":\s*"[^"]+",\s*"roomId":\s*\d+,\s*"url":\s*"[^"]+",\s*"image":\s*")[^"]+"')
    def rewrite(match):
        cover = HOUSE_COVERS.get(match[2])
        return match[1] + f'{prefix}/br-assets/{cover["asset"]}"' if cover else match[0]
    changed, count = pattern.subn(rewrite, html)
    assert count == len(HOUSE_COVERS), count
    return changed


def home_covers(html, prefix):
    def rewrite_card(match):
        card = match[0]
        slug = re.search(r'\bhref="[^"]*/doma/([^/"]+)/?"', card)[1]
        if slug == "barn-2":
            return card
        name = re.search(r'<h3 class="brh-card__name">([^<]+)</h3>', card)[1]
        alt = f"{name} — зимний внешний вид"
        cover = f"{prefix}/br-assets/{HOUSE_COVERS[slug]['asset']}"

        def rewrite_photo(image):
            image = re.sub(r'\s+(?:srcset|sizes)="[^"]*"', '', image[0])
            image = re.sub(r'\bsrc="[^"]*"',
                           f'src="{cover}"', image, count=1)
            return re.sub(r'\balt="[^"]*"', f'alt="{alt}"', image, count=1)

        def rewrite_exterior(button):
            button = button[0].replace('aria-pressed="false"', 'aria-pressed="true"')
            button = re.sub(r'\bdata-src="[^"]*"', f'data-src="{cover}"', button, count=1)
            return re.sub(r'\bdata-alt="[^"]*"', f'data-alt="{alt}"', button, count=1)

        card = HOME_PHOTO.sub(rewrite_photo, card, count=1)
        card = card.replace('aria-pressed="true"', 'aria-pressed="false"')
        return HOME_EXTERIOR.sub(rewrite_exterior, card, count=1)

    return HOME_HOUSES.sub(lambda section: HOME_HOUSE.sub(rewrite_card, section[0]), html, count=1)


def booking_link(html):
    # Keep the demo's write guard while letting guests carry their choice to the live booking page.
    html = html.replace("if (!anchor) return;", "if (!anchor || anchor.hasAttribute('data-br-live-booking')) return;", 1)
    disabled = "if (target) target.textContent = 'В демо бронирование отключено.';"
    assert html.count(disabled) == 1
    return html.replace(disabled, """if (target) {
        const destination = new URL('https://ecobr.ru/booking');
        const choice = new URLSearchParams(location.search);
        for (const [key, value] of choice) destination.searchParams.append(key, value);
        const link = document.createElement('a');
        link.setAttribute('data-br-live-booking', '');
        link.href = destination.href;
        link.textContent = 'Открыть онлайн-бронирование';
        target.replaceChildren(link);
      }""", 1)


def apply(html, route, prefix):
    html = html.replace("<body", '<body data-br-season="winter"', 1)
    if route == "/mayskiye2026":
        return html
    replacements = {key: f"{prefix}/br-assets/{value}" for key, value in SEASONAL_PHOTOS.items()}
    def replace_photos(part):
        part = PHOTO_URL.sub(lambda m: replacements.get(m[1], m[0]), part)
        part = part.replace(f"{prefix}/br-assets/family-playground.webp", f"{prefix}/br-assets/winter-playground.webp")
        part = part.replace(f"{prefix}/br-assets/family-farm.webp", f"{prefix}/br-assets/winter-farm-goat.webp")
        part = part.replace(f"{prefix}/br-assets/br-birthday-panoramic.webp", f"{prefix}/br-assets/winter-birthday-panoramic.webp")
        part = part.replace(f"{prefix}/br-assets/br-romance-tub.webp", f"{prefix}/br-assets/winter-panorama-tub.webp")
        return part.replace(f"{prefix}/br-assets/activity-baggi-real.webp", f"{prefix}/br-assets/winter-buggy.webp")

    html = replace_outside_summer_archive(html, replace_photos)
    if route == "/":
        html = home_covers(html, prefix)
    if route == "/booking":
        html = booking_link(html)
    if route == "/aktivnosti-v-beryozovoj-roshhe":
        html = html.replace(">Сапборд</h2>", ">Сапборд в тёплый сезон</h2>", 1)
    if route == "/new-year":
        html = html.replace(HOLIDAY_PHOTOS + "br-panorama.webp", f"{prefix}/br-assets/hero-panorama-garland.webp")
        html = html.replace(HOLIDAY_PHOTOS, f"{prefix}/br-assets/holiday/")
    if route in ("/", "/special"):
        html = re.sub(
            r'<article class="to-card"[^>]*>(?:(?!</article>).)*?<h3 class="to-t">Ароматная осень</h3>.*?</article>',
            "", html, flags=re.S,
        )
        html = html.replace("'<h2>Тёплая осень</h2><p>Ради нас берут выходной!</p>'", "'<h2>Специальные предложения</h2>'")
    return html
