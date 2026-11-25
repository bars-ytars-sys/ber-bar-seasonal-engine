"""Render the winter homepage with three treatments of the same panorama."""
import re

from home_review import section


VERSIONS = {
    "ny-photo": "photo",
    "ny-light": "brand",
    "ny-card": "houses",
}


def render(html, prefix, layout):
    before = section(html, "br-home-start")
    opening = before[:before.index(">") + 1].replace(
        "br-review-hero", f"br-winter-hero br-winter-hero--{layout}", 1,
    )
    slides = re.search(r'<div class="brx__slides">.*?</picture></div>', before, re.S)[0]
    panorama = "hero-panorama-garland.webp" if layout == "brand" else "hero-panorama-warm.webp"
    slides = slides.replace("hero-winter-panorama-hq.webp", panorama)
    if layout == "brand":
        mobile_photo = f'{prefix}/br-assets/hero-panorama-garland-mobile.avif'
        mobile_source = f'<source media="(max-width: 960px)" type="image/avif" srcset="{mobile_photo}">'
        slides = slides.replace('<source media="(max-width: 960px)"', mobile_source + '<source media="(max-width: 960px)"', 1)
    slides = slides.replace(
        "</picture></div>",
        '</picture><div class="br-winter-hero__snow br-winter-snow" aria-hidden="true"></div></div>',
        1,
    )
    booking = '<a class="brx__cta" href="#br-home-booking">Проверить даты и цены</a>'
    help_link = '<a class="brx__ghost" href="#zayavka">Помочь выбрать дом</a>'
    houses_link = '<a class="brx__cta" href="#br-home-houses">Смотреть дома</a>'
    if layout == "brand":
        copy = (
            re.search(r'<h1\b.*?</h1>', before, re.S)[0]
            + '<p class="brx__script">Ради нас берут выходной</p>'
            + '<p class="brx__sub">Зимний отдых в 40 минутах от Москвы. 22 дома, SPA с бассейном, ресторан и ферма.</p>'
        )
        actions = booking + help_link
    else:
        copy = (
            '<h1 id="br-home-title" class="brx__h1">Зима в «Берёзовой роще»</h1>'
            '<p class="brx__sub">Дома и SPA в 40 минутах от Москвы.</p>'
        )
        if layout == "houses":
            actions = houses_link + booking.replace("brx__cta", "brx__ghost")
        else:
            actions = booking + f'<a class="brx__ghost" href="{prefix}/new-year/">Новый год</a>'

    benefits = re.search(r'<aside id="br-home-benefits".*?</aside>', before, re.S)[0]
    award, split = re.findall(r'<li><a\b.*?</li>', benefits, re.S)
    benefits = re.sub(r'<ul>.*?</ul>', lambda _: f"<ul>{split}{award}</ul>", benefits, count=1, flags=re.S)
    hero = (
        opening + slides + '<div class="brx__copy">'
        '<div class="br-winter-hero__intro">' + copy + '</div>'
        '<div class="br-winter-hero__footer"><div class="brx__row">' + actions + '</div>'
        + benefits + '</div></div></section>'
    )
    standalone_snow = '<div class="br-winter-snow" aria-hidden="true"></div>'
    html = html.replace(standalone_snow + before, hero, 1)
    assert before not in html

    if layout == "houses":
        booking_section = section(html, "br-home-booking")
        houses_section = section(html, "br-home-houses")
        html = html.replace(booking_section, "", 1)
        html = html.replace(houses_section, houses_section + booking_section, 1)

    return html.replace(
        "</head>",
        f'<link rel="stylesheet" href="{prefix}/br-assets/holiday-home.css"></head>',
        1,
    )
