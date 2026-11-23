"""Three winter homepage layouts that share links and content with the BR demo."""
import re

from home_review import section


VERSIONS = {
    "ny-photo": "photo",
    "ny-light": "light",
    "ny-card": "card",
}


def render(html, prefix, layout):
    before = section(html, "br-home-start")
    hero = before.replace("br-review-hero", f"br-review-hero br-ny-hero br-ny-hero--{layout}", 1)
    hero, title_count = re.subn(
        r'(<h1 id="br-home-title" class="brx__h1">).*?</h1>',
        r'\1Зима в «Берёзовой роще»</h1>',
        hero, count=1, flags=re.S,
    )
    assert title_count == 1
    hero = hero.replace(
        '<h2 class="brx__sub">22 дома. В 40 минутах от Москвы.</h2>',
        '<p class="brx__sub">Дома и SPA в 40 минутах от Москвы.</p>',
        1,
    )
    hero = hero.replace(
        "</picture></div>",
        '</picture><div class="br-winter-snow" aria-hidden="true"></div></div>',
        1,
    )
    holiday_link = (
        f'<a class="br-ny-hero__holiday" href="{prefix}/new-year/">'
        '<span aria-hidden="true">❄︎</span> Новый год</a>'
    )
    help_link = '<a class="brx__ghost" href="#zayavka">Помочь выбрать дом</a>'
    assert hero.count(help_link) == 1
    hero = hero.replace(help_link, holiday_link, 1)
    hero = hero.replace(">Проверить даты и цены</a>", ">Проверить даты</a>", 1)
    benefits = re.search(r'<aside id="br-home-benefits".*?</aside>', hero, re.S)[0]
    pets = re.search(r'\s*<li>\s*<span class="br-winter-benefits__full">С животными можно</span>.*?</li>', benefits, re.S)[0]
    brands = benefits.replace(pets, "", 1).replace(
        'aria-label="Награда и условия отдыха"', 'aria-label="Яндекс и оплата частями"', 1,
    )
    actions_end = holiday_link + "</div></div>"
    assert hero.count(actions_end) == 1
    hero = hero.replace(benefits, "", 1).replace(actions_end, holiday_link + "</div>" + brands + "</div>", 1)
    html = html.replace('<div class="br-winter-snow" aria-hidden="true"></div>' + before, hero, 1)
    assert html.count('class="br-winter-snow"') == 1 and before not in html
    booking = section(html, "br-home-booking")
    help_link = help_link.replace('class="brx__ghost"', 'class="brh-link br-ny-booking-help"')
    pets_note = '<aside class="br-winter-benefits" aria-label="Условия отдыха"><ul>' + pets + "</ul></aside>"
    html = html.replace(booking, booking.replace("</section>", help_link + "</section>", 1) + pets_note, 1)
    return html.replace(
        "</head>",
        f'<link rel="stylesheet" href="{prefix}/br-assets/holiday-home.css"></head>',
        1,
    )
