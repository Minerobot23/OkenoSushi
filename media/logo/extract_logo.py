"""Traces the Okeno Sushi logo from the printed menu scan into SVG paths.

    python media/logo/extract_logo.py      (needs: pip install pillow numpy potracer)

The only clean copy of the logo available is the one printed on reference-menu/menu1.jpg. This
separates it from the light-blue background by colour (the red swirl and rule vs the black script
and "SUSHI"), traces both shapes with potrace and writes src/data/logo.json, which the Logo
component renders with CSS colours. Nothing is redrawn by hand. Replace it with the owner's
vector logo when one is available.
"""
import json
import os

import numpy as np
import potrace
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(ROOT, "media", "sources", "reference-menu", "menu1.jpg")
OUT = os.path.join(ROOT, "src", "data", "logo.json")
PREVIEW = os.path.join(HERE, "logo-preview.png")

BOX = (22, 22, 528, 192)  # logo region in the scan (left, top, right, bottom)
UP = 4  # trace at 4x so curves come out smooth

img = Image.open(SRC).convert("RGB").crop(BOX)
img = img.resize((img.width * UP, img.height * UP), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
a = np.asarray(img).astype(np.int16)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = 0.299 * r + 0.587 * g + 0.114 * b
redness = r - np.maximum(g, b)

swirl = redness > 42
script = (lum < 150) & (redness <= 42)

# The street address printed under the logo shares rows with "SUSHI"; keep it out.
h, w = lum.shape
yy, xx = np.mgrid[0:h, 0:w]
address = (xx < 280 * UP) & (yy > 150 * UP)
script &= ~address
swirl &= ~address


def trace(mask):
    bm = potrace.Bitmap(~mask)  # potracer traces the False pixels
    path = bm.trace(turdsize=40 * UP, alphamax=1.0, opticurve=True, opttolerance=0.2)
    parts = []
    for curve in path:
        s = curve.start_point
        d = [f"M{s.x / UP:.2f} {s.y / UP:.2f}"]
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x / UP:.2f} {seg.c.y / UP:.2f}L{seg.end_point.x / UP:.2f} {seg.end_point.y / UP:.2f}")
            else:
                d.append(
                    f"C{seg.c1.x / UP:.2f} {seg.c1.y / UP:.2f} {seg.c2.x / UP:.2f} {seg.c2.y / UP:.2f} "
                    f"{seg.end_point.x / UP:.2f} {seg.end_point.y / UP:.2f}"
                )
        d.append("Z")
        parts.append("".join(d))
    return "".join(parts)


data = {
    "source": "reference-menu/menu1.jpg (printed menu), traced by media/logo/extract_logo.py",
    "viewBox": f"0 0 {BOX[2] - BOX[0]} {BOX[3] - BOX[1]}",
    "mark": trace(swirl),
    "type": trace(script),
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump(data, f)

preview = np.full((h, w, 3), 23, np.uint8)
preview[script] = (246, 241, 231)
preview[swirl] = (185, 53, 43)
Image.fromarray(preview).save(PREVIEW)
print("wrote", OUT, "mark", len(data["mark"]), "type", len(data["type"]))
