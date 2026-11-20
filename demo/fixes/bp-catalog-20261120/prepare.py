"""Apply the reviewed photo frame and February horizon to BP winter demos only."""
from pathlib import Path
import json
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
FILES = (
    ROOT / "prevyu/lid/bp-winter-20261119.html",
)
PHOTO = (
    "https://bars-ytars-sys.github.io/ber-bar-seasonal-engine/"
    "demo/assets/bp-winter-house-gallery-20261120/p310.webp"
)


def apply(source):
    before_head = source.split("</head>", 1)[0]
    marker = '<style id="bp-catalog-photo-fix-20261120">'
    source = re.sub(re.escape(marker) + r".*?</style>", "", source, flags=re.S)
    assert source.count("bookingEnd='2027-02-01'") + source.count("bookingEnd='2027-03-01'") == 1
    source = source.replace("bookingEnd='2027-02-01'", "bookingEnd='2027-03-01'")
    source = source.replace("1 февраля 2027", "1 марта 2027")

    pattern = r"window\.BBStayData\s*=\s*(\{[^\n]+\});"
    match = re.search(pattern, source)
    assert match, "House data missing"
    data = json.loads(match[1])
    garden = [h for h in data["bp"] if h["id"] == "garden3"]
    assert len(garden) == 1
    garden[0]["image"] = PHOTO
    source = source[:match.start(1)] + json.dumps(data, ensure_ascii=False) + source[match.end(1):]
    source = source.replace("</body>", marker + (HERE / "photos.css").read_text() + "</style></body>", 1)
    assert source.split("</head>", 1)[0] == before_head, "HEAD must remain exact"
    return source


if __name__ == "__main__":
    for file in FILES:
        file.write_text(apply(file.read_text()))
        print(file.relative_to(ROOT))
