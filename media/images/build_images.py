"""Writes web-sized copies and crops of the place photos and menu scans to public/images/.

    python media/images/build_images.py

The four place photos are the full-resolution originals from Okeno Sushi's Google Maps gallery
(media/sources/photos/; the counter and storefront photos are 3000 x 4000). Each output is a
crop of a real photo, resized down only, never up, so it stays sharp. Several widths per image let
the browser pick one that is sharp on its screen. Nothing is retouched, extended or generated.
"""
import json
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(ROOT, "media", "sources")
OUT = os.path.join(ROOT, "public", "images")

# (source, output name, crop box or None, widths)
JOBS = [
    # The hero: the rolls on the table in front of the real sushi counter.
    ("photos/okeno-counter-with-rolls.jpg", "hero-wide", (450, 1850, 3000, 3550), [1280, 1920, 2550]),
    ("photos/okeno-counter-with-rolls.jpg", "hero-tall", (300, 400, 2700, 4000), [750, 1125, 1500]),
    # Gallery: the whole photo and details from it.
    ("photos/okeno-counter-with-rolls.jpg", "counter", None, [600, 1200]),
    ("photos/okeno-counter-with-rolls.jpg", "detail-rolls", (400, 2400, 2600, 3900), [800, 1400]),
    ("photos/okeno-counter-with-rolls.jpg", "detail-counter", (1150, 450, 3000, 1500), [800, 1400]),
    ("photos/okeno-counter-with-rolls.jpg", "detail-tea", (380, 1820, 1660, 3100), [600, 1000]),
    ("photos/okeno-storefront.jpg", "storefront", None, [600, 1200]),
    ("photos/okeno-storefront.jpg", "detail-sign", (100, 560, 2900, 1300), [900, 1800]),
    ("photos/okeno-rolls-on-slate.jpg", "rolls", None, [600, 1200]),
    ("photos/okeno-bento-platter.jpg", "bento", None, [600, 1200]),
    ("reference-menu/menu1.jpg", "menu-scan-1", None, [850]),
    ("reference-menu/menu2.jpg", "menu-scan-2", None, [850]),
    ("reference-menu/menu3.jpg", "menu-scan-3", None, [850]),
    ("reference-menu/menu4.jpg", "menu-scan-4", None, [850]),
]

os.makedirs(OUT, exist_ok=True)
manifest = {}
for rel, name, box, widths in JOBS:
    img = Image.open(os.path.join(SRC, rel)).convert("RGB")
    if box:
        img = img.crop(box)
    manifest[name] = {"width": img.width, "height": img.height, "files": []}
    for w in widths:
        w = min(w, img.width)
        h = round(img.height * w / img.width)
        resized = img if w == img.width else img.resize((w, h), Image.LANCZOS)
        jpg, webp = f"{name}-{w}.jpg", f"{name}-{w}.webp"
        resized.save(os.path.join(OUT, jpg), quality=84, optimize=True, progressive=True)
        resized.save(os.path.join(OUT, webp), quality=82, method=6)
        manifest[name]["files"].append({"w": w, "h": h, "jpg": jpg, "webp": webp})
with open(os.path.join(HERE, "manifest.json"), "w") as fh:
    json.dump(manifest, fh, indent=1)

# Contact sheet of every crop, for checking composition.
thumbs = [Image.open(os.path.join(OUT, m["files"][0]["jpg"])) for m in manifest.values()]
for t in thumbs:
    t.thumbnail((300, 300))
sheet = Image.new("RGB", (4 * 310, ((len(thumbs) + 3) // 4) * 310), (24, 26, 24))
for i, t in enumerate(thumbs):
    sheet.paste(t, ((i % 4) * 310 + 5, (i // 4) * 310 + 5))
sheet.save(os.path.join(HERE, "contact-sheet.jpg"), quality=80)
print("\n".join(f"{k}: {v['width']}x{v['height']} -> {[f['w'] for f in v['files']]}" for k, v in manifest.items()))
