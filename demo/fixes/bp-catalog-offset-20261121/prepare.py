"""Add the catalog offset to the BP winter demo only; never publish to Tilda."""
from pathlib import Path
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PAGE = ROOT / 'prevyu/lid/bp-winter-houses-20261119.html'
STYLE_ID = 'bp-catalog-offset-css-20261121'
SCRIPT_ID = 'bp-catalog-offset-js-20261121'


def strip_fix(source):
    source = re.sub(r'<style id="' + STYLE_ID + r'">.*?</style>', '', source, flags=re.S)
    return re.sub(r'<script id="' + SCRIPT_ID + r'">.*?</script>', '', source, flags=re.S)


def apply(source):
    baseline = strip_fix(source)
    anchor = '<main class="bph-catalog">'
    assert baseline.count(anchor) == 1
    style = '<style id="' + STYLE_ID + '">' + (HERE / 'offset.css').read_text() + '</style>'
    script = '<script id="' + SCRIPT_ID + '">' + (HERE / 'offset.js').read_text() + '</script>'
    result = baseline.replace(anchor, style + anchor, 1).replace('</body>', script + '</body>', 1)
    assert strip_fix(result) == baseline, 'The original page must stay byte-for-byte unchanged.'
    assert result.split('</head>', 1)[0] == baseline.split('</head>', 1)[0]
    return result


if __name__ == '__main__':
    PAGE.write_text(apply(PAGE.read_text()))
    print(PAGE.relative_to(ROOT))
