"""Build an independent, read-only winter preview from the current BR demo."""
import argparse
import importlib
import json
from pathlib import Path
import re
import shutil
import sys

import layout_variant

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "br-tasks-20261119"))
pages = importlib.import_module("build_pages")

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

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True, help="Document root of the local preview server")
    args = parser.parse_args()
    output = args.root.resolve() / PREFIX.lstrip("/")
    output.mkdir(parents=True, exist_ok=True)
    pages.PREFIX = PREFIX
    pages.ASSET_ROOT = PREFIX + "/br-assets"
    files = (HERE / "assets").glob("winter-*.webp")
    approved = {file.stem[7:] for file in files}
    shutil.copytree(pages.HERE / "assets", output / "br-assets", dirs_exist_ok=True)
    shutil.copytree(HERE / "assets", output / "br-assets", dirs_exist_ok=True)
    for route in pages.ROUTES:
        html = AUTUMN.sub("", pages.static_page(route))
        html = rewrite_photos(html, approved)
        if route == "/doma":
            html = html.replace(
                "new URL(h.image,assetBase)",
                "new URL(h.image,h.image.startsWith('/') ? location.origin : assetBase)",
            )
        css_link = f'<link rel="stylesheet" href="{PREFIX}/br-assets/winter.css">'
        html = html.replace("</head>", css_link + "</head>", 1)
        if route == "/":
            hero = '<section class="brx brx--s1"'
            html = html.replace(hero, '<div class="br-winter-snow" aria-hidden="true"></div>' + hero, 1)
        folder = output / route.strip("/")
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "index.html").write_text(html)
        if route == "/":
            variant = output / "variant-3"
            variant.mkdir(exist_ok=True)
            (variant / "index.html").write_text(layout_variant.render(html, PREFIX))
    print(f"{len(pages.ROUTES)} pages, {len(approved)} winter photos · {output}")

if __name__ == "__main__":
    main()
