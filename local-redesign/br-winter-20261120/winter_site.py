"""Seasonal presentation for the full BR preview, using the original page records."""
from html import escape
import json
from pathlib import Path
import re


HERE = Path(__file__).resolve().parent
HOUSE_COVERS = json.loads((HERE / "winter-house-covers.json").read_text())
HOUSE_GALLERIES = json.loads((HERE / "winter-house-galleries.json").read_text())
GALLERY_RETOUCH = json.loads((HERE / "winter-gallery-retouch.json").read_text())
RECORD = re.compile(r'<div id="(rec\d+)"[^>]*>')
PHOTO_URL = re.compile(r"""https://(?:static|optim|thb)\.tildacdn\.com/(tild[a-z0-9-]+)/[^"'<>\s(),&]+""")
HOUSE_SLIDE_START = re.compile(r'<div\s+class="t1148__item"[^>]*>')
SUMMER_ARCHIVE = re.compile(
    r'(<section class="br-season-archive"[^>]*>.*?</section>|<div id="rec\d+"[^>]*data-br-season-panel="summer"[^>]*>.*?(?=<div id="rec\d+"|<footer id="t-footer"|$))',
    re.S,
)
HOME_HOUSES = re.compile(r'<section\b(?=[^>]*\bid="br-home-houses")[^>]*>.*?</section>', re.S)
HOME_HOUSE = re.compile(r'<article class="brh-card brh-house"[^>]*>.*?</article>', re.S)
HOME_PHOTO = re.compile(r'<img\b[^>]*>')
HOME_EXTERIOR = re.compile(r'<button\b(?=[^>]*\baria-label="(?:Внешний вид|Фасад)")[^>]*>\s*</button>')
HOME_PHOTO_CHOICES = re.compile(r'(<div class="brh-house__photos"[^>]*>)(.*?)(</div>)', re.S)
HOME_CARD_ACTIONS = re.compile(r'<a class="brh-house__button"[^>]*>.*?</a>\s*<a class="brh-house-details"[^>]*>.*?</a>', re.S)
HOLIDAY_PHOTOS = "https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/demo/assets/new-year-20261105/"
SUMMER_GALLERIES = {
    "bariloche": ("rec2411770091", {1, 2, 3, 20, 21, 22, 23, 24, 25}),
    "chalet": ("rec1737097191", {1, 2, 3, 4, 24, 25, 27}),
    "panorama": ("rec1737025491", {2, 3, 4, 5, 6, 36, 38, 39, 40, 41, 42}),
    "scandi": ("rec1737080361", {1, 2, 11, 12, 13, 14, 15}),
}
SEASONAL_PHOTOS = {
    "tild6162-6538-4165-a561-656533643362": "banya-hero-hq.webp",
    "tild6234-6433-4562-a662-656638363335": "banya-hero-hq.webp",
    "tild3037-3864-4139-a366-363534616231": "banya-hero-hq.webp",
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
    "tild6139-3532-4136-a431-333736333265": "spa-open-pool-20261125.webp",
    "tild3766-3164-4638-a161-373538633736": "restaurant-set-menu-20261125.jpg",
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
    "tild3831-6631-4534-a630-383066633037": HOUSE_COVERS["barn-1"]["asset"],
    "tild6261-3334-4038-b531-643962386566": "house-winter-sfera.webp",
}

def validate_assets(folder):
    names = {house["asset"] for house in HOUSE_COVERS.values()} | set(SEASONAL_PHOTOS.values())
    names.update(("winter-farm-goat.webp", "winter-birthday-panoramic.webp", "winter-open-pool.webp",
                  "hero-panorama-garland-mobile.avif", "territory-map.webp", "winter-samovar-program.webp"))
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


def season_switch(winter, summer):
    return f'''<div class="br-house-seasons" role="group" aria-label="Сезон фотогалереи" data-br-season-switch>
  <button type="button" aria-controls="{winter}" aria-pressed="true">Зимние фото</button>
  <button type="button" aria-controls="{summer}" aria-pressed="false">Летние фото</button>
</div>'''


def house_photo(url, alt=""):
    url = escape(url, quote=True)
    return (
        '<div class="t1148__item" role="group" aria-roledescription="slide" aria-label="1 из 1" aria-current="false">'
        '<div class="t1148__img-wrapper" style="--height:530px; --mob-height:340px">'
        f'<img class="t-img t1148__img" src="{url}" data-original="{url}" data-img-zoom-url="{url}" '
        f'data-index="0" imgfield="gi_img__0" data-zoomable="yes" data-zoom-target="0" draggable="false" '
        f'alt="{escape(alt, quote=True)}" loading="lazy" decoding="async"></div></div>'
    )


def gallery_bounds(record):
    starts = list(HOUSE_SLIDE_START.finditer(record))
    assert starts
    end = re.search(r'</div>\s*</div>\s*</div>\s*<style>', record[starts[-1].end():])
    assert end
    # Include the closing item and wrapper while leaving the slider and outer containers intact.
    last_start = starts[-1].end() + end.start()
    image_end = record.rfind('/>', starts[-1].start(), last_start) + 2
    closings = re.match(r'\s*</div>\s*</div>', record[image_end:])
    if closings:
        end_position = image_end + closings.end()
    else:
        # Last slide embeds a video. The slider, gallery and block close immediately before the styles.
        end_position = last_start
    boundaries = [match.start() for match in starts] + [end_position]
    return boundaries[0], boundaries[-1], [record[a:b].strip() for a, b in zip(boundaries, boundaries[1:])]


def slide_url(slide):
    return re.search(r'\bdata-img-zoom-url="([^"]+)"', slide)[1]


def render_gallery(record, slug, cover, interiors, summer_indices):
    start, end, original = gallery_bounds(record)
    summer = [original[index - 1] for index in sorted(summer_indices)]
    retained = [slide for index, slide in enumerate(original, 1) if index not in summer_indices]
    tagged = {slide_url(slide): slide for slide in retained}
    primary = house_photo(cover, "Фасад дома «Сфера» зимой" if slug == "sfera" else "Дом зимой")
    selected = [tagged.get(url) or house_photo(url, "Интерьер дома") for url in interiors]
    known = set(interiors) | {cover}
    first_url = slide_url(original[0])
    if not summer_indices or first_url in known:
        known.add(first_url)
    if slug == "baus-2":
        # The same uncovered hammock appears at the centre of the terrace on this second exterior.
        known.add(slide_url(original[8]))
    slides = [primary, *selected]
    if slug != "sfera":
        if 'class="t1148__play"' in original[0] and first_url in known:
            # Keep the original walk-through with the updated winter photo as its poster.
            slides.append(re.sub(r'\b(src|data-original|data-img-zoom-url)="[^"]+"',
                                 lambda match: f'{match[1]}="{cover}"', original[0]))
        slides.extend(slide for slide in retained if slide_url(slide) not in known)
    for index, item in enumerate(slides):
        item = re.sub(r'aria-label="\d+ из \d+"', f'aria-label="{index + 1} из {len(slides)}"', item, count=1)
        item = re.sub(r'aria-current="(?:true|false)"', f'aria-current="{str(index == 0).lower()}"', item, count=1)
        slides[index] = re.sub(
            r'(data-index="|data-zoom-target="|imgfield="gi_img__)\d+',
            lambda m: f'{m[1]}{index}', item,
        )
    record = record[:start] + ' '.join(slides) + record[end:]
    if not summer:
        return record
    winter_id = HOUSE_GALLERIES[slug]["winter"]
    summer_id = winter_id + "-summer"
    pictures = ''.join(
        f'<a href="{escape(url, quote=True)}"><img src="{escape(url, quote=True)}" '
        f'alt="Летний вид дома, фото {index}" loading="lazy" decoding="async"></a>'
        for index, url in enumerate(map(slide_url, summer), 1)
    )
    archive = f'<section class="br-season-archive" id="{summer_id}" data-br-season-panel="summer" hidden aria-label="Летние фото"><div>{pictures}</div></section>'
    return season_switch(winter_id, summer_id) + record + archive


def sfera_hero(record, record_id, cover, prefix):
    assert f'href="{prefix}/booking/"' in record
    end = record.rfind("</div>") + len("</div>")
    return f'''<div id="{record_id}" class="r t-rec" data-br-winter-cover="sfera">
  <section class="br-sfera-hero" aria-labelledby="br-sfera-title">
    <div class="br-sfera-hero__copy">
      <h1 id="br-sfera-title">Сфера</h1>
      <p>Купольный дом с панорамными окнами, собственной баней и банным чаном.</p>
      <ul aria-label="Удобства"><li>До 4 гостей</li><li>Баня</li><li>Банный чан</li></ul>
      <a class="br-winter-primary" href="{prefix}/booking/">Проверить даты</a>
    </div>
    <img src="{cover}" width="1500" height="1000" alt="Фасад купольного дома «Сфера» зимой" fetchpriority="high">
  </section>
</div>''' + record[end:]


def house_page(html, slug, prefix):
    cover = HOUSE_COVERS[slug]
    cover_path = f"{prefix}/br-assets/{cover['asset']}"
    gallery = HOUSE_GALLERIES[slug]
    winter = gallery["winter"]
    summer = gallery["summer"]

    def replace_cover(record):
        if slug == "sfera":
            return sfera_hero(record, cover["record"], cover_path, prefix)
        image = lambda m: cover_path if m[1] == cover["old"] else m[0]
        replaced = PHOTO_URL.sub(image, record)
        assert replaced != record, slug
        return replaced.replace(f'id="{cover["record"]}"', f'id="{cover["record"]}" data-br-winter-cover="{slug}"', 1)

    html = within_record(html, cover["record"], replace_cover)
    interiors = [url if url.startswith("https://") else f"{prefix}/br-assets/{url}" for url in gallery["interiors"]]
    summer_indices = SUMMER_GALLERIES[slug][1] if slug in SUMMER_GALLERIES else set()
    def winter_gallery(block):
        block = block.replace(f'id="{winter}"', f'id="{winter}" data-br-season-panel="winter"', 1)
        return render_gallery(block, slug, cover_path, interiors, summer_indices)

    html = within_record(html, winter, winter_gallery)
    if not summer_indices:
        tabs = next(match[1] for match in RECORD.finditer(html) if 'data-record-type="1281"' in match[0])
        def replace_tabs(block):
            assert "ЗИМНИЕ ФОТО" in block and f'aria-controls="{winter}"' in block, slug
            return season_switch(winter, summer)
        html = within_record(html, tabs, replace_tabs)
        html = within_record(html, summer, lambda block: block.replace(f'id="{summer}"', f'id="{summer}" data-br-season-panel="summer" hidden', 1))
    return html.replace("</body>", f'<script src="{prefix}/br-assets/house-seasons.js" defer></script></body>', 1)


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
        name = re.search(r'<h3 class="brh-card__name">([^<]+)</h3>', card)[1]
        alt = f"{name} — зимний внешний вид"
        cover = f"{prefix}/br-assets/{HOUSE_COVERS[slug]['asset']}"

        def rewrite_photo(image):
            image = re.sub(r'\s+(?:srcset|sizes)="[^"]*"', '', image[0])
            image = re.sub(r'\bsrc="[^"]*"',
                           f'src="{cover}"', image, count=1)
            return re.sub(r'\balt="[^"]*"', f'alt="{alt}"', image, count=1)

        def select_exterior(choices):
            buttons = choices[2].replace('aria-pressed="true"', 'aria-pressed="false"')
            exterior = HOME_EXTERIOR.search(buttons)
            assert exterior, slug
            button = exterior[0].replace('aria-pressed="false"', 'aria-pressed="true"')
            button = re.sub(r'\bdata-src="[^"]*"', f'data-src="{cover}"', button, count=1)
            button = re.sub(r'\bdata-alt="[^"]*"', f'data-alt="{alt}"', button, count=1)
            return choices[1] + button + buttons[:exterior.start()] + buttons[exterior.end():] + choices[3]

        card = HOME_PHOTO.sub(rewrite_photo, card, count=1)
        card = HOME_PHOTO_CHOICES.sub(select_exterior, card, count=1)
        return HOME_CARD_ACTIONS.sub(lambda actions: f'<div class="brh-house__actions">{actions[0]}</div>', card, count=1)

    def order_cards(section):
        block = section[0]
        cards = list(HOME_HOUSE.finditer(block))
        featured = next(card for card in cards if 'href="' + prefix + '/doma/bariloche/' in card[0])
        if featured.start() > cards[0].start():
            first = cards[0].start()
            block = block[:first] + featured[0] + block[first:featured.start()] + block[featured.end():]
        return HOME_HOUSE.sub(rewrite_card, block)

    return HOME_HOUSES.sub(order_cards, html, count=1)


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
    menu = f"{prefix}/br-assets/restaurant-set-menu-20261125.jpg"
    html = html.replace('href="#menurestoran"', f'href="{menu}" target="_blank" rel="noopener"')
    if route == "/":
        html = home_covers(html, prefix)
    if route == "/booking":
        html = booking_link(html)
    if route == "/aktivnosti-v-beryozovoj-roshhe":
        html = html.replace(">Сапборд</h2>", ">Сапборд в тёплый сезон</h2>", 1)
    if route == "/new-year":
        html = html.replace(HOLIDAY_PHOTOS + "br-panorama.webp", f"{prefix}/br-assets/hero-panorama-garland.webp")
        html = html.replace(HOLIDAY_PHOTOS + "br-skandi.webp", f"{prefix}/br-assets/winter-new-year-scandi.webp")
        html = html.replace(HOLIDAY_PHOTOS, f"{prefix}/br-assets/holiday/")
    if route in ("/", "/special"):
        html = re.sub(
            r'<article class="to-card"[^>]*>(?:(?!</article>).)*?<h3 class="to-t">Ароматная осень</h3>.*?</article>',
            "", html, flags=re.S,
        )
        html = html.replace("'<h2>Тёплая осень</h2><p>Ради нас берут выходной!</p>'", "'<h2>Специальные предложения</h2>'")
    return html
