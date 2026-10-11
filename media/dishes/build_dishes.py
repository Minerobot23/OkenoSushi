"""Cuts the restaurant's own dish photos out of its printed menu and ordering page.

    python media/dishes/build_dishes.py      (needs Pillow and numpy)

Sources, both published by Okeno Sushi itself:
  - media/sources/reference-menu/menu1-4.jpg: the printed menu from the old website. Each roll
    photo is printed in a thin frame directly above its name, so the name is known for certain.
  - media/sources/ordering-photos/*.jpg: the dish photos on the restaurant's online-ordering page,
    each attached to its menu item there (sources.tsv has the URLs). The ordering system pads
    them to 16:9 with plain bars, which are trimmed here.
    Left out on purpose: the shrimp fried rice photo (it looks like a generic stock image) and the
    ordering page's banner images (a styled overhead spread that also looks like stock).

Only cropping, trimming and re-encoding happen here. Nothing is upscaled, retouched or generated.
Writes public/images/dishes/ and src/data/dishes.json, plus a labelled contact sheet for checking
that every name matches its picture (media/dishes/contact-sheet.jpg).
"""
import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MENU = os.path.join(ROOT, "media", "sources", "reference-menu")
ORDER = os.path.join(ROOT, "media", "sources", "ordering-photos")
OUT = os.path.join(ROOT, "public", "images", "dishes")
DATA = os.path.join(ROOT, "src", "data", "dishes.json")

# Printed menu grid: (page, column x-range, row y-range, name as it appears in src/data/menu.json).
COLS3_L, COLS3_R = [(23, 205), (217, 399)], [(448, 629), (643, 824)]
ROWS3_L = [(171, 267), (333, 432), (505, 606), (666, 759), (819, 909)]
ROWS3_R = [(28, 141), (194, 297), (350, 460), (523, 628), (680, 784), (834, 934)]
NAMES3_L = ["Holiday Roll", "Summer Roll", "Burning Love Roll", "Fancy Lobster Roll", "Amazing Roll", "Scorpion",
            "Coconut Shrimp Roll", "Crazy Tuna Roll", "Fire Ball Roll", "Dynamite Roll"]
NAMES3_R = ["Eel Dragon", "Godzilla", "Golden Shrimp Tempura", "Happy Roll", "Ikura Salmon Roll", "Sun Kissed Roll",
            "Jade Roll", "Kabuki Roll", "Kiwi Vegetable", "Lobster Roll", "TJ Roll", "U.P.S. Roll"]
COLS4_L, COLS4_R = [(29, 210), (223, 404)], [(457, 638), (647, 828)]
ROWS4_L = [(29, 142), (200, 303), (364, 474), (521, 626), (673, 776), (828, 928)]
ROWS4_R = [(30, 135), (208, 311), (370, 479), (548, 650), (720, 821)]
NAMES4_L = ["Millennium Roll", "Lost Roll", "Out of Control", "Phoenix Roll", "Angry Bird Roll", "Red Dragon",
            "Samurai Roll", "Seaweed Vegetable", "Snow Dragon", "Snow Mountain", "Wasabi Roll", "Volcano Roll"]
NAMES4_R = ["Spider Roll", "Tiger Roll", "Shirley Roll", "Wonderful Roll", "Xanadu Roll", "Yankee Roll",
            "Steak N Shrimp Roll", "Sunshine Roll", "Diamond Roll", None]  # the X'Mas photo is unframed

# The five appetizer photos across the top of page 2, each above its name.
APPETIZERS = [("Stuffed Shrimp", (3, 3, 169, 134)), ("King Crab Rangoon", (182, 3, 355, 134)),
              ("Fire Ball", (362, 3, 524, 134)), ("Tuna Carpaccio with Wasabi Sauce", (531, 3, 688, 134)),
              ("Tuna Avocado Salad", (694, 3, 848, 134))]

# Round platters on page 1: centre and radii of the black platter rim (a slight ellipse).
PLATTERS = [("Sushi & Sashimi For 1", (678, 136, 126, 110)), ("Sushi & Sashimi Combo For 2", (686, 422, 123, 113)),
            ("Party Platter (A)", (153, 809, 129, 116)), ("Party Platter (B)", (413, 799, 124, 118)),
            ("Party Platter (C)", (684, 803, 124, 118))]

# Ordering-page photo file -> menu name.
ORDERING = {
    "california-roll": "California Roll", "spicy-tuna-roll": "Spicy Tuna Roll", "spicy-salmon-roll": "Spicy Salmon Roll",
    "spicy-kani-roll": "Spicy Kani Roll", "xanadu-roll": "Xanadu Roll", "maki-combo": "Maki Combo",
    "sashimi-regular": "Sashimi Regular", "sushi-sashimi-combo-for-2": "Sushi & Sashimi Combo For 2",
    "chicken-teriyaki-bento": "Chicken Teriyaki Bento", "gyoza-pork": "Gyoza (Pork)", "edamame": "Edamame",
    "seaweed-salad": "Seaweed Salad", "kani-salad": "Kani Salad", "avocado-salad": "Avocado Salad",
    "baby-octopus-salad": "Baby Octopus Salad", "rock-shrimp": "Rock Shrimp", "fire-ball": "Fire Ball",
    "beef-negimaki": "Beef Negimaki", "shrimp-veg-tempura-app": "Shrimp & Veg Tempura",
    "spring-roll-veg": "Spring Roll (Veg.)", "chicken-vegetable-udon": "Chicken Vegetable Udon",
    "chicken-fried-rice": "Chicken Fried Rice",
}


def slug(name):
    return "".join(c if c.isalnum() else "-" for c in name.lower()).strip("-").replace("--", "-").replace("--", "-")


def save(img, base, alpha=False):
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, base + ".webp"), quality=84, method=6)
    if alpha:
        img.save(os.path.join(OUT, base + ".png"), optimize=True)
        return f"/images/dishes/{base}.png", f"/images/dishes/{base}.webp"
    img.convert("RGB").save(os.path.join(OUT, base + ".jpg"), quality=86, optimize=True, progressive=True)
    return f"/images/dishes/{base}.jpg", f"/images/dishes/{base}.webp"


def trim_bars(img):
    """Remove the plain side (or top/bottom) bars the ordering system pads photos with."""
    a = np.asarray(img).astype(int)
    col_std = a.std(axis=0).mean(axis=1)
    row_std = a.std(axis=1).mean(axis=1)
    cols = np.nonzero(col_std > 6)[0]
    rows = np.nonzero(row_std > 6)[0]
    return img.crop((cols[0] + 2, rows[0] + 2, cols[-1] - 1, rows[-1] - 1))


dishes = []
pages = {n: Image.open(os.path.join(MENU, f"menu{n}.jpg")).convert("RGB") for n in (1, 2, 3, 4)}


def grid(page, cols, rows, names):
    i = 0
    for (y0, y1) in rows:
        for (x0, x1) in cols:
            name = names[i] if i < len(names) else None
            i += 1
            if not name:
                continue
            # Inset by 3px to drop the printed frame.
            crop = pages[page].crop((x0 + 3, y0 + 3, x1 - 2, y1 - 2))
            src, webp = save(crop, "printed-" + slug(name))
            dishes.append({"name": name, "kind": "printed", "src": src, "webp": webp, "width": crop.width,
                           "height": crop.height, "source": f"Printed menu, page {page}"})


grid(3, COLS3_L, ROWS3_L, NAMES3_L)
grid(3, COLS3_R, ROWS3_R, NAMES3_R)
grid(4, COLS4_L, ROWS4_L, NAMES4_L)
grid(4, COLS4_R, ROWS4_R, NAMES4_R)

for name, box in APPETIZERS:
    crop = pages[2].crop(box)
    src, webp = save(crop, "printed-" + slug(name))
    dishes.append({"name": name, "kind": "printed", "src": src, "webp": webp, "width": crop.width,
                   "height": crop.height, "source": "Printed menu, page 2"})

for name, (cx, cy, rx, ry) in PLATTERS:
    box = (cx - rx, cy - ry, cx + rx, cy + ry)
    crop = pages[1].crop(box).convert("RGBA")
    scale = 4
    mask = Image.new("L", (crop.width * scale, crop.height * scale), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, crop.width * scale - 1, crop.height * scale - 1), fill=255)
    crop.putalpha(mask.resize(crop.size, Image.LANCZOS))
    src, webp = save(crop, "platter-" + slug(name), alpha=True)
    dishes.append({"name": name, "kind": "platter", "src": src, "webp": webp, "width": crop.width,
                   "height": crop.height, "source": "Printed menu, page 1"})

for file, name in ORDERING.items():
    img = trim_bars(Image.open(os.path.join(ORDER, file + ".jpg")).convert("RGB"))
    if img.width > 520:
        img = img.resize((520, round(img.height * 520 / img.width)), Image.LANCZOS)
    src, webp = save(img, "ordering-" + file)
    dishes.append({"name": name, "kind": "ordering", "src": src, "webp": webp, "width": img.width,
                   "height": img.height, "source": "Online-ordering page"})

with open(DATA, "w") as fh:
    json.dump(dishes, fh, indent=1)

# Contact sheet: every crop with the name it will carry, for a human check.
cell_w, cell_h = 220, 170
cols = 8
rows = (len(dishes) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (24, 26, 24))
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default()
for i, d in enumerate(dishes):
    img = Image.open(os.path.join(ROOT, "public", d["webp"].lstrip("/")))
    img.thumbnail((cell_w - 12, cell_h - 30))
    x, y = (i % cols) * cell_w, (i // cols) * cell_h
    sheet.paste(img, (x + 6, y + 6), img if img.mode == "RGBA" else None)
    draw.text((x + 6, y + cell_h - 20), d["name"][:30], fill=(246, 241, 231), font=font)
sheet.save(os.path.join(HERE, "contact-sheet.jpg"), quality=82)
print(len(dishes), "dishes;", sum(d["kind"] == "printed" for d in dishes), "printed,",
      sum(d["kind"] == "platter" for d in dishes), "platters,", sum(d["kind"] == "ordering" for d in dishes), "ordering")
