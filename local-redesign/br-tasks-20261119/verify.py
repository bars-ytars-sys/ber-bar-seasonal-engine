"""Verify the local BR sources and the targets of links introduced by the review."""
from html import unescape
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

from serve import FRAGMENTS, ROUTES, SPA, read_original, render

HERE = Path(__file__).resolve().parent
FORMS = r"<form\b[^>]*>.*?</form>"
SEO = r"<title\b[^>]*>.*?</title>|<meta\b[^>]*>|<link\b[^>]*rel=['\"]canonical['\"][^>]*>|<script\b[^>]*type=['\"]application/ld\+json['\"][^>]*>.*?</script>"
SCHEMA = r"<script\b[^>]*type=['\"]application/ld\+json['\"][^>]*>.*?</script>"
IFRAMES = r"<iframe\b[^>]*>"
FLAGS = re.S | re.I

all_pages = {path: render(path).decode() for path in ROUTES}
for path in ROUTES:
    old = read_original(path)
    new = all_pages[path]
    for pattern, label in [(FORMS, "forms"), (SCHEMA, "structured data"), (IFRAMES, "iframes")]:
        assert re.findall(pattern, old, FLAGS) == re.findall(pattern, new, FLAGS), (path, label)
    assert re.findall(SEO, old.split("</head>")[0], FLAGS) == re.findall(SEO, new.split("</head>")[0], FLAGS), path
    assert not re.search(r"[Бб]агги|БАГГИ", re.sub(r"<script\b[^>]*>.*?</script>", "", new.split("</head>")[1], flags=FLAGS)), path

links = set()
for snippet in FRAGMENTS.values():
    for href in re.findall(r'href="([^"]+)"', snippet):
        if href.startswith("/"):
            links.add(href)
links |= set(SPA)
for href in sorted(links):
    url = urlsplit(unescape(href))
    page = all_pages[url.path]
    if url.fragment:
        needle = re.escape(url.fragment)
        assert re.search(r'\bid=["\']' + needle + r'["\']|data-tooltip-hook=["\']#' + needle + r'["\']', page), href

report = {
    "br_routes": len(all_pages),
    "new_local_links_and_anchors": len(links),
    "forms_iframes_metadata_unchanged": True,
    "no_visible_buggy_wording_in_markup": True,
}
(HERE / "qa").mkdir(exist_ok=True)
(HERE / "qa/source-check.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report))
