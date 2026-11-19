"""Build the read-only public BR preview for the repository's GitHub Pages."""
import json
from pathlib import Path
import re
import shutil
from urllib.parse import urlsplit

from serve import HERE, ROUTES, render

SITE = HERE.parents[1] / "prevyu/lid/br-november-20261119"
PREFIX = "/ber-bar-seasonal-engine/prevyu/lid/br-november-20261119"
ASSET_ROOT = PREFIX + "/br-assets"
HREF = re.compile(r"""(\bhref\s*=\s*)(["'])(.*?)\2""", re.I)

def static_href(match):
    attribute, quote, href = match.groups()
    if not href.startswith(("/", "https://ecobr.ru", "http://ecobr.ru")):
        return match[0]
    url = urlsplit(href)
    if url.netloc and url.hostname != "ecobr.ru":
        return match[0]
    path = url.path.rstrip("/") or "/"
    if path in ROUTES:
        target = PREFIX + ("" if path == "/" else path) + "/"
    elif path == "/custom.css":
        target = ASSET_ROOT + "/site-custom.css"
    else:
        return match[0]
    target += ("?" + url.query if url.query else "") + ("#" + url.fragment if url.fragment else "")
    return attribute + quote + target + quote

def static_page(route):
    html = render(route).decode()
    html = html.replace('"/br-assets/', f'"{ASSET_ROOT}/').replace("'/br-assets/", f"'{ASSET_ROOT}/")
    html = HREF.sub(static_href, html)
    html = html.replace(ASSET_ROOT + "/november.css", ASSET_ROOT + "/november.css?v=9")
    html = html.replace(
        "if (location.hostname !== '127.0.0.1' && location.hostname !== 'localhost') return;",
        f"const demoPrefix = {json.dumps(PREFIX)};",
        1,
    ).replace(
        "anchor.href = location.origin + url.pathname + url.search + url.hash;",
        """const path = url.pathname.replace(/\/$/, '');
      anchor.href = location.origin + demoPrefix + path + '/' + url.search + url.hash;""",
        1,
    ).replace(
        "url.hostname === 'ecobr.ru' &&",
        "(url.hostname === 'ecobr.ru' || url.origin === location.origin) &&",
        1,
    ).replace(
        "navigator.sendBeacon = () => false;",
        "HTMLFormElement.prototype.submit = () => {}; navigator.sendBeacon = () => false;",
        1,
    )
    html = html.replace("</head>", '<meta name="robots" content="noindex, nofollow"></head>', 1)
    if route == "/booking":
        html = html.replace(
            "function initBooking(){",
            """function initBooking(){
      const target = document.getElementById('booking_iframe');
      if (target) target.textContent = 'В демо бронирование отключено.';
      return;
""",
            1,
        )
    return html

def main():
    SITE.mkdir(parents=True, exist_ok=True)
    shutil.copytree(HERE / "assets", SITE / "br-assets", dirs_exist_ok=True)
    for route in ROUTES:
        folder = SITE / route.strip("/")
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "index.html").write_text(static_page(route))
    print(f"{len(ROUTES)} pages generated")

if __name__ == "__main__":
    main()
