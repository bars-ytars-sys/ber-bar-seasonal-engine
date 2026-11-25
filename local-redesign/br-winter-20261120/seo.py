"""Keep verified production SEO and real destinations for legacy navigation."""
from html import escape
import re
from urllib.parse import urlsplit, urlunsplit


# Values on ecobr.ru/about that superseded the November HTML snapshot.
ABOUT_TITLE = "О «Берёзовой роще» — наши ценности и награды"
ABOUT_DESCRIPTION = (
    "Ценности «Берёзовой рощи»: забота о гостях, комфорт, приватность и экологичность. "
    "Узнайте о нашем подходе к отдыху и наградах базы."
)
GLAMPING_DESCRIPTION = (
    "Глэмпинг в «Берёзовой роще» под Солнечногорском. Отдельные дома среди берёз, "
    "баня и тёплый бассейн на территории базы."
)
LEGACY_ROUTES = {
    "/barnvip1": "/doma/barn-2",
    "/barnvip2": "/doma/barn-3",
    "/ferma": "/aktivnosti-v-beryozovoj-roshhe",
    "/perezagruzka": "/vip-programmy/perezagruzka",
    "/svidanie": "/vip-programmy/svidanie",
}
HREF = re.compile(r"""(\bhref\s*=\s*)(["'])(.*?)\2""", re.I)


def keep_current_metadata(page, route):
    if route in ("/about", "/glamping"):
        head, closing, body = page.partition("</head>")
        description = ABOUT_DESCRIPTION if route == "/about" else GLAMPING_DESCRIPTION
        values = {"description": description, "og:description": description}
        if route == "/about":
            head, titles = re.subn(r"<title>[^<]*</title>", f"<title>{escape(ABOUT_TITLE)}</title>", head)
            assert titles == 1
            values["og:title"] = ABOUT_TITLE
        for name, value in values.items():
            meta = re.compile(
                rf"""(<meta\s+(?:name|property)=["']{name}["']\s+content=)(["'])(.*?)\2""",
                re.I,
            )
            head, matches = meta.subn(lambda m: m[1] + m[2] + escape(value, quote=True) + m[2], head)
            assert matches == 1, name
        return head + closing + body
    if route == "/contacts":
        # The live contact page no longer announces a room price in its JSON-LD.
        page, prices = re.subn(r'^\s*"priceRange": "от 10 000 ₽ за ночь",\n', "", page, flags=re.M)
        assert prices == 1
    return page


def resolve_legacy_links(page, prefix, house_slugs):
    def redirect(match):
        if not match[3].startswith(("/", "https://ecobr.ru", "http://ecobr.ru")):
            return match[0]
        url = urlsplit(match[3])
        if url.hostname not in (None, "ecobr.ru"):
            return match[0]
        path = url.path.rstrip("/")
        route = LEGACY_ROUTES.get(path)
        if path.removeprefix("/") in house_slugs:
            route = "/doma" + path
        if route is None:
            return match[0]
        anchor = "rec2863877901" if path == "/ferma" else url.fragment
        href = urlunsplit(("", "", prefix + route + "/", url.query, anchor))
        return match[1] + match[2] + href + match[2]

    page = HREF.sub(redirect, page)
    page = page.replace('href="http://brnew.tilda.ws/privacy"', f'href="{prefix}/privacy/"')
    # The mobile action bar builds its booking link after the page loads.
    return page.replace("кнопка('/booking',", f"кнопка('{prefix}/booking/',")
