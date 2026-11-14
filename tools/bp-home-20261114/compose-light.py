"""Свет в окнах Шале: из правки нейросети в реальное фото переносятся только стёкла.

Просьба Валерии 14.11.2026: «свет включить в доме, хоть чуть, не ярко».
Нейросеть (kie.ai nano-banana-pro, те же пропорции) включает свет во всём кадре, но
слегка перерисовывает дом. Поэтому её результат выравнивается по оригиналу, и в
оригинал вклеиваются только стёкла окон/дверей и мягкий тёплый отсвет вокруг
(только там, где стало светлее). Остальное — пиксели исходной фотографии.

    python3 compose-light.py ORIGINAL AI_RESULT {mobile|desktop|forest} OUT.webp [strength=1]
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

# Стекло (x0, y0, x1, y1) в пикселях оригиналов, с отступом от рам.
WINDOWS = {
    # выше перил: балясины и поручень лестницы остаются пикселями оригинала
    'mobile': [(226, 482, 316, 597), (480, 490, 549, 597), (759, 486, 821, 594), (826, 486, 898, 597)],
    'desktop': [(460, 572, 546, 686), (706, 575, 788, 686), (982, 574, 1068, 780), (1080, 574, 1163, 780)],
    'forest': [],  # архив Бново, Шале/022.jpg: только карта «стало светлее»
}
LAMPS = {'mobile': [(583, 478, 597, 506)], 'desktop': [(879, 523, 891, 714)], 'forest': []}


def gray(a):
    return a @ np.array([0.299, 0.587, 0.114], dtype=np.float32)


def shift(orig, ai):
    """Сдвиг ai относительно orig (фазовая корреляция по яркости)."""
    a, b = gray(orig), gray(ai)
    a = (a - a.mean()) * np.hanning(a.shape[0])[:, None] * np.hanning(a.shape[1])[None, :]
    b = (b - b.mean()) * np.hanning(b.shape[0])[:, None] * np.hanning(b.shape[1])[None, :]
    F = np.fft.fft2(a) * np.conj(np.fft.fft2(b))
    r = np.fft.ifft2(F / (np.abs(F) + 1e-6)).real
    dy, dx = np.unravel_index(np.argmax(r), r.shape)
    h, w = r.shape
    return (dy - h if dy > h // 2 else dy), (dx - w if dx > w // 2 else dx)


def mask(size, boxes, blur, grow=0, ellipse=False):
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    for x0, y0, x1, y1 in boxes:
        (d.ellipse if ellipse else d.rectangle)((x0 - grow, y0 - grow, x1 + grow, y1 + grow), fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(blur)), dtype=np.float32)[..., None] / 255.0


FACADE = {'mobile': (150, 430, 980, 720), 'desktop': (360, 470, 1450, 820), 'forest': (780, 0, 1680, 880)}


def main(orig_path, ai_path, kind, out_path, strength=1.0):
    orig_im = ImageOps.exif_transpose(Image.open(orig_path)).convert('RGB')
    w, h = orig_im.size
    ai_im = Image.open(ai_path).convert('RGB').resize((w, h), Image.LANCZOS)
    orig = np.asarray(orig_im, dtype=np.float32) / 255.0
    ai = np.asarray(ai_im, dtype=np.float32) / 255.0
    dy, dx = shift(orig, ai)
    ai = np.roll(ai, (dy, dx), axis=(0, 1))
    print(kind, 'size', (w, h), 'shift', (dy, dx))

    # Карта света: где нейросеть сделала светлее (окна, светильники, отсвет) — внутри фасада.
    gain = np.clip((gray(ai) - gray(orig) - 0.03) / 0.12, 0, 1)
    box = np.zeros((h, w), dtype=np.float32)
    x0, y0, x1, y1 = FACADE[kind]
    box[y0:y1, x0:x1] = 1
    box = np.asarray(Image.fromarray((box * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(12)), dtype=np.float32) / 255.0
    light = np.asarray(Image.fromarray((gain * box * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)), dtype=np.float32) / 255.0
    glass = mask((w, h), WINDOWS[kind], 2.5)[..., 0] * (gray(ai) > gray(orig))
    k = (np.maximum(light, glass) * strength)[..., None]
    out = orig * (1 - k) + ai * k
    Image.fromarray(np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8)).save(out_path, 'WEBP', quality=80, method=6)
    changed = (np.abs(out - orig).max(axis=2) > 2 / 255).mean()
    print(kind, 'changed pixels', f'{changed:.1%}')


if __name__ == '__main__':
    main(*sys.argv[1:5], *(float(x) for x in sys.argv[5:6]))
