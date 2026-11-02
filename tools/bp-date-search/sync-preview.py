"""Sync only the local BP date-search script from its canonical sources. No publish."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
preview = ROOT / "prevyu/lid/bp-production-preview.html"
html = preview.read_text()
blocks = list(re.finditer(r"<script\b[^>]*>(.*?)</script>", html, re.S | re.I))
matches = [m for m in blocks if "/* BP date-first search:" in m.group(1)]
if len(matches) != 1:
    raise SystemExit("Expected one existing local date-search script; refusing other edits")
files = [
    "prevyu/lid/bp-date-search-core.js",
    "prevyu/lid/bp-date-search.js",
]
body = "\n" + "\n".join((ROOT / path).read_text() for path in files)
block = matches[0]
preview.write_text(html[:block.start(1)] + body + html[block.end(1):])
print("Local BP picker synchronized. No Git/Tilda/network writes.")
