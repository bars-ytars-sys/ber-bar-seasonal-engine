"""Lera's review corrections, applied only to the winter BR preview."""
import re


def apply(html, route, prefix):
    html = html.replace(
        f'<a href="{prefix}/spa/">SPA, бани и банные чаны</a>',
        f'<a href="{prefix}/spa/">SPA и релакс</a>'
        f'<a href="{prefix}/banchan/">Банные программы и чаны</a>',
    )
    # The owner approved the original buggy photograph for this activity.
    for name in ("quad-woods.webp", "winter-quad-woods.webp"):
        html = html.replace(f'{prefix}/br-assets/{name}', f'{prefix}/br-assets/activity-baggi-real.webp')

    # This thumbnail must show the SPA itself, without suggesting hotel rooms.
    html = html.replace(f'{prefix}/br-assets/winter-activity-spa-hq.webp',
                        f'{prefix}/br-assets/winter-selector-spa-lounge.webp')

    if route == "/vip-programmy":
        photographs = (
            (r'<article data-br-category="couple">', "br-date-evening.webp", "Свидание года"),
            (r'<article data-br-category="relax">(?=<h3>Полная)', "winter-selector-spa-lounge.webp", "Полная перезагрузка"),
            (r'<article data-br-category="relax">(?=<h3>Банный)', "drive-samovar.webp", "Банный отдых с самоваром"),
            (r'<article>(?=<h3>В берёзовом)', "drive-samovar.webp", "Самовар и чай в бане"),
            (r'<article>(?=<h3>Баня по-русски)', "bath-program-photo.webp", "Банный отдых"),
        )
        for pattern, photo, title in photographs:
            html, count = re.subn(
                pattern,
                lambda match: match[0] + f'<img class="br-review-program-photo" '
                f'src="{prefix}/br-assets/{photo}" alt="{title}" '
                'width="960" height="640" loading="lazy" decoding="async">',
                html, count=1,
            )
            assert count == 1, title
    return html
