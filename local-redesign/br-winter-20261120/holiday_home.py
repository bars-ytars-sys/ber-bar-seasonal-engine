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
    hero = hero.replace("22 дома. В 40 минутах от Москвы.", "В 40 минутах от Москвы.", 1)
    hero = hero.replace(
        "</picture></div>",
        '</picture><div class="br-winter-snow" aria-hidden="true"></div></div>',
        1,
    )
    holiday_link = (
        f'<a class="br-ny-hero__holiday" href="{prefix}/new-year/">'
        '<span aria-hidden="true">❄︎</span> Новый год и каникулы</a>'
    )
    hero, number = re.subn(r'(</a>)(<a class="brx__ghost")', r'\1' + holiday_link + r'\2', hero, count=1)
    assert number == 1
    html = html.replace('<div class="br-winter-snow" aria-hidden="true"></div>' + before, hero, 1)
    assert html.count('class="br-winter-snow"') == 1 and before not in html
    return html.replace(
        "</head>",
        f'<link rel="stylesheet" href="{prefix}/br-assets/holiday-home.css"></head>',
        1,
    )
