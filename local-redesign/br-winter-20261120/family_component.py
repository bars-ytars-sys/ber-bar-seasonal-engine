"""BR family section using the owner's original copy and two original photographs."""
import re

ACTIVITIES = (
    ('playground', 'Детская площадка', 'Горки, игровые домики и синий трактор.'),
    ('farm', 'Контактная ферма', 'Козлята и кролики. Корм — в ресторане.'),
    ('cinema', 'Домашний кинотеатр', 'Семейное кино в домиках с проектором.'),
    ('ponies', 'Лошади и пони', 'Конные прогулки по предварительной записи.'),
)

def birthday(source, instance='family'):
    heading = re.search(r'<h3>([\s\S]*?)</h3>', source)[1]
    paragraphs = re.findall(r'<p>[\s\S]*?</p>', source)
    photos = re.findall(r'<img\b[^>]*>', source)
    button = re.search(r'<a class="br-nov-button"[^>]*>[\s\S]*?</a>', source)[0]
    assert len(paragraphs) == 2 and len(photos) == 2
    figures = ''.join(f'<figure role="group" aria-label="Фото {i+1} из 2">{img}</figure>' for i, img in enumerate(photos))
    return (
        '<article class="br-family-birthday" id="detskiy-prazdnik">'
        '<div class="br-family-birthday__media" data-br-family-gallery>'
        f'<div class="br-family-birthday__photos" id="br-family-gallery-{instance}" tabindex="0" aria-label="Фотографии детских праздников">{figures}</div>'
        '<div class="br-family-birthday__navigation">'
        '<span data-br-photo-count aria-live="polite">1 / 2</span><div>'
        f'<button type="button" data-br-photo-prev aria-controls="br-family-gallery-{instance}" aria-label="Предыдущее фото">'
        '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m14 6-6 6 6 6"/></svg></button>'
        f'<button type="button" data-br-photo-next aria-controls="br-family-gallery-{instance}" aria-label="Следующее фото">'
        '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m10 6 6 6-6 6"/></svg></button>'
        '</div></div></div>'
        '<div class="br-family-birthday__copy"><p class="br-family-birthday__eyebrow">Детские праздники</p>'
        f'<h3>{heading}</h3>{paragraphs[0]}'
        '<details><summary>Как организовать праздник</summary>' + paragraphs[1] + '</details>'
        + button + '</div></article>'
    )

def replace_family(html, pages, prefix):
    start = html.index('<section class="br-nov" id="s-detmi"')
    end = html.index('</section>', start) + len('</section>')
    original = re.search(r'<section\b[^>]*\bid="detskiy-prazdnik"[^>]*>[\s\S]*?</section>', pages.static_page('/deti'))[0]
    cards = ''.join(
        f'<article><img src="{prefix}/br-assets/family-{image}.webp" alt="{title}" width="600" height="449" loading="lazy" decoding="async">'
        f'<div><h3>{title}</h3><p>{description}</p></div></article>'
        for image, title, description in ACTIVITIES
    )
    panel = (
        '<section class="br-family-activities" id="s-detmi" aria-labelledby="br-nov-family-title">'
        '<div class="br-family-activities__heading"><h2 id="br-nov-family-title">Чем занять детей, пока родители отдыхают</h2>'
        '<a href="#detskiy-prazdnik" class="br-family-jump">Детский день рождения <span aria-hidden="true">↓</span></a></div>'
        f'<div class="br-family-activities__grid">{cards}</div>{birthday(original)}</section>'
    )
    return html[:start] + panel + html[end:]

def replace_standalone(html):
    pattern = r'<section\b[^>]*\bid="detskiy-prazdnik"[^>]*>[\s\S]*?</section>'
    source = re.search(pattern, html)[0]
    return re.sub(pattern, lambda _: '<section class="br-family-activities br-family-activities--birthday" aria-label="Детские праздники">' + birthday(source, 'deti') + '</section>', html, count=1)
