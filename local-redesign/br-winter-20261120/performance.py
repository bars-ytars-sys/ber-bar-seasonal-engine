"""Prioritize the visible photography and load remote embeds near the viewport."""
import re
from html import escape


HERO = re.compile(r'<picture class="brx__slide is-on" data-k="house">(.*?)</picture>', re.S)
OLD_HERO_PRELOAD = re.compile(
    r'<link\b(?=[^>]*\brel="preload")(?=[^>]*\bas="image")(?=[^>]*\bhref="[^"]*/winter-br-hero-pano-20261116(?:-mobile)?\.webp")[^>]*>\s*'
)
HOME_IMAGES = re.compile(
    r'<section\b(?=[^>]*\bid="br-home-(?:houses|activities)")[^>]*>.*?</section>'
    r'|<section class="br-winter-holiday(?:"|\s)[^>]*>.*?</section>'
    r'|<article\b(?=[^>]*\bid="(?:uyutnye-budni|podarochnyy-sertifikat)")[^>]*>.*?</article>',
    re.S,
)
LAZY_IMAGE = re.compile(
    r'<img\b(?=[^>]*\bloading="lazy")(?![^>]*\b(?:srcset|data-original)=)[^>]*>'
)
TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
MAP_FRAME = re.compile(
    r"""(<iframe\b[^>]*?\s)src=(["'])(https://yandex\.ru/map-widget/v1/[^"']+)\2([^>]*>\s*</iframe>)"""
)
BOOKING_SCRIPT = '<script src="//widget.reservationsteps.ru/js/bnovo.js" defer></script>'
BOOKING_INIT = "  if(window.Bnovo_Widget){initBnovo();}\n  else{document.addEventListener('DOMContentLoaded',initBnovo);}"
BOOKING_TIMEOUT = """  const loadingTimeout = window.setTimeout(() => {
    if (panel.dataset.widgetState === 'loading') panel.dataset.widgetState = 'failed';
  }, 6500);"""


def preload_hero(html):
    hero = HERO.search(html)
    if not hero:
        return html
    old_preload = OLD_HERO_PRELOAD.search(html, 0, hero.start())
    if not old_preload:
        return html
    mobile = re.search(r'<source\b[^>]*\bsrcset="([^"]+)"', hero[1])
    desktop = re.search(r'<img\b[^>]*\bsrc="([^"]+)"', hero[1])
    if not desktop:
        return html

    def tag(url, media="", format_type=""):
        attrs = f' media="{media}"' if media else ""
        if format_type:
            attrs += f' type="{format_type}"'
        return f'<link rel="preload" as="image" href="{escape(url, quote=True)}" fetchpriority="high"{attrs}>'

    desktop_url = desktop[1]
    if mobile and mobile[1] != desktop_url:
        mobile_type = "image/avif" if mobile[1].endswith(".avif") else ""
        tags = tag(mobile[1], "(max-width: 960px)", mobile_type)
        tags += tag(desktop_url, "(min-width: 961px)")
    else:
        tags = tag(desktop_url)
    return html[:old_preload.start()] + tags + OLD_HERO_PRELOAD.sub("", html[old_preload.end():])


def defer_home_images(html, prefix):
    if not HERO.search(html):
        return html

    def delay(image):
        source = re.search(r'(?<=\s)src="([^"]+)"', image[0])
        if not source or not source[1].startswith(prefix + "/br-assets/"):
            return image[0]
        pending = f'src="{TRANSPARENT_PIXEL}" data-br-image-src="{source[1]}"'
        return image[0][:source.start()] + pending + image[0][source.end():] + f'<noscript>{image[0]}</noscript>'

    return HOME_IMAGES.sub(lambda section: LAZY_IMAGE.sub(delay, section[0]), html)


def lazy_booking(html):
    if not all(part in html for part in (BOOKING_SCRIPT, BOOKING_INIT, BOOKING_TIMEOUT)):
        return html
    html = html.replace(BOOKING_SCRIPT, '<span hidden data-br-load-booking></span>', 1)
    html = html.replace(
        BOOKING_INIT,
        "  document.addEventListener('br:booking-ready', initBnovo, {once:true});",
        1,
    )
    return html.replace(
        BOOKING_TIMEOUT,
        """  let loadingTimeout;
  panel.addEventListener('br:booking-loading', () => {
    loadingTimeout = window.setTimeout(() => {
      if (panel.dataset.widgetState === 'loading') panel.dataset.widgetState = 'failed';
    }, 6500);
  }, {once:true});""",
        1,
    )


def optimize(html, prefix):
    html = defer_home_images(preload_hero(html), prefix)
    html, maps = MAP_FRAME.subn(
        lambda match: f'{match[1]}data-br-map-src={match[2]}{match[3]}{match[2]}{match[4]}<noscript>{match[0]}</noscript>',
        html,
    )
    html = lazy_booking(html)
    images = "data-br-image-src" in html
    if maps or images:
        fallback = "<noscript><style>iframe[data-br-map-src],img[data-br-image-src]{display:none!important}</style></noscript>"
        html = html.replace("</head>", fallback + "</head>", 1)
    if maps or images or "data-br-load-booking" in html:
        html = html.replace(
            "</body>",
            f'<script defer src="{prefix}/br-assets/performance.js"></script></body>',
            1,
        )
    return html
