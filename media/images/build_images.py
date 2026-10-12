"""Writes web-sized copies of the source photos and menu scans to public/images/.

    python media/images/build_images.py

Originals stay untouched in media/sources/. Only resizing and re-encoding happens here: no
cropping, retouching or generated content. Sizes never exceed the original pixels.
"""
import json
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(ROOT, "media", "sources")
OUT = os.path.join(ROOT, "public", "images")

JOBS = [
    ("photos/okeno-storefront.jpg", "storefront", [600, 1200]),
    ("photos/okeno-counter-with-rolls.jpg", "counter", [600, 1200]),
    ("photos/okeno-rolls-on-slate.jpg", "rolls", [600, 1200]),
    ("photos/okeno-bento-platter.jpg", "bento", [600, 1200]),
    ("reference-menu/menu1.jpg", "menu-scan-1", [850]),
    ("reference-menu/menu2.jpg", "menu-scan-2", [850]),
    ("reference-menu/menu3.jpg", "menu-scan-3", [850]),
    ("reference-menu/menu4.jpg", "menu-scan-4", [850]),
]

os.makedirs(OUT, exist_ok=True)
manifest = {}
for rel, name, widths in JOBS:
    img = Image.open(os.path.join(SRC, rel)).convert("RGB")
    manifest[name] = {"width": img.width, "height": img.height, "files": []}
    for w in widths:
        w = min(w, img.width)
        h = round(img.height * w / img.width)
        resized = img if w == img.width else img.resize((w, h), Image.LANCZOS)
        jpg = f"{name}-{w}.jpg"
        webp = f"{name}-{w}.webp"
        resized.save(os.path.join(OUT, jpg), quality=82, optimize=True, progressive=True)
        resized.save(os.path.join(OUT, webp), quality=80, method=6)
        manifest[name]["files"].append({"w": w, "h": h, "jpg": jpg, "webp": webp})
with open(os.path.join(HERE, "manifest.json"), "w") as fh:
    json.dump(manifest, fh, indent=1)
print("\n".join(f"{f} {os.path.getsize(os.path.join(OUT, f)) // 1024}KB" for f in sorted(os.listdir(OUT))))
