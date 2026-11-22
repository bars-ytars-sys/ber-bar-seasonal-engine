"""Build two T123 changes from exact editor copies; never publish anything."""
from pathlib import Path
import argparse
import hashlib
import json
import re

HERE = Path(__file__).resolve().parent
OFFSET = HERE.parent / 'bp-catalog-offset-20261121'
GUARD = (HERE / 'cart-guard.js').read_text()


def booking(code):
    anchor = 'BnovoBookFrame.init();'
    assert code.count(anchor) == 1, 'Expected one BP Bnovo initialization'
    assert GUARD not in code, 'Already patched'
    result = code.replace(anchor, GUARD + '\n' + anchor, 1)
    assert result.replace(GUARD + '\n', '', 1) == code
    return result


def houses(code):
    anchor = '<main class="bph-catalog">'
    assert code.count(anchor) == 1
    assert 'bp-catalog-offset-css-20261121' not in code, 'Already patched'
    css = '<style id="bp-catalog-offset-css-20261121">' + (OFFSET / 'offset.css').read_text() + '</style>'
    js = '<script id="bp-catalog-offset-js-20261121">' + (OFFSET / 'offset.js').read_text() + '</script>'
    result = code.replace(anchor, css + anchor, 1) + js
    assert result.replace(css, '', 1).removesuffix(js) == code
    return result


def inject(raw, record, before, after):
    start = raw.index('id="rec' + record + '"')
    a = raw.index('<!-- nominify begin -->', start) + len('<!-- nominify begin -->')
    b = raw.index('<!-- nominify end -->', a)
    assert re.sub(r'\s', '', raw[a:b]) == re.sub(r'\s', '', before), 'Editor differs from published block'
    result = raw[:a] + after + raw[b:]
    assert result[:a] == raw[:a] and result[a + len(after):] == raw[b:]
    assert result.split('</head>', 1)[0] == raw.split('</head>', 1)[0]
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('out', type=Path)
    for name in ('booking', 'houses'):
        parser.add_argument('--' + name, required=True, type=Path)
        parser.add_argument('--raw-' + name, required=True, type=Path)
    args = parser.parse_args()
    assert not args.out.exists(), 'Use a new output directory; do not overwrite backups'
    args.out.mkdir(parents=True)
    (args.out / 'base').mkdir()
    (args.out / 'preview').mkdir()
    hashes = {}
    for name, record, transform in [('booking', '850832895', booking), ('houses', '5030490401', houses)]:
        before = getattr(args, name).read_text()
        after = transform(before)
        raw = getattr(args, 'raw_' + name).read_text()
        preview = inject(raw, record, before, after)
        for file, value in [('base/' + name + '.html', before), (name + '.html', after), ('preview/' + name + '.html', preview)]:
            (args.out / file).write_text(value)
            hashes[file] = hashlib.sha256(value.encode()).hexdigest()
    (args.out / 'SHA256.json').write_text(json.dumps(hashes, indent=2) + '\n')
    print(json.dumps(hashes, indent=2))
