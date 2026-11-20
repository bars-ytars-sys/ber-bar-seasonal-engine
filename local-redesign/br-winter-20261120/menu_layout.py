"""Add the shared, flowing preview menu; keep all page SEO and native blocks."""
from pathlib import Path
import hashlib,re

HERE=Path(__file__).resolve().parent
def apply(source,prefix):
    for kind,tag,attr in [('css','link','href'),('js','script','src')]:
        name='menu-layout.'+kind
        source=re.sub(r'<link\b[^>]*href=["\'][^"\']*/menu-layout\.css[^"\']*["\'][^>]*>','',source) if kind=='css' else re.sub(r'<script\b[^>]*src=["\'][^"\']*/menu-layout\.js[^"\']*["\'][^>]*></script>','',source)
        digest=hashlib.sha256((HERE/'assets'/name).read_bytes()).hexdigest()[:10]
        url=f'{prefix}/br-assets/{name}?v={digest}'
        code=f'<link rel="stylesheet" href="{url}">' if kind=='css' else f'<script src="{url}" defer></script>'
        close='</head>' if kind=='css' else '</body>'
        assert close in source
        source=source.replace(close,code+close,1)
    return source
