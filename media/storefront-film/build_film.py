"""Okeno Sushi arrival film: one continuous camera move over the real storefront photograph.

    python media/storefront-film/build_film.py --variant tall --mode stills --frames 1,80,150,216
    python media/storefront-film/build_film.py --variant tall --mode final
    python media/storefront-film/build_film.py --variant wide --mode final

Why a photograph and not a rendered 3D scene (the Cinematic Demo Playbook's default): Okeno Sushi is
a real restaurant, and the brief forbids generated interiors, invented spaces and fabricated video.
Every pixel here comes from the storefront photo in media/sources/photos/okeno-storefront.jpg; the
only changes are the camera move (crop, scale, a little roll) and a grade that lifts from dim to
natural during the shot. No text is drawn into the film: the sign is the restaurant's real sign,
and all branding on the page is HTML.

Shot plan (playbook phase 1)
  Start   Close, at eye level with the lower half of the shop window and the door: the printed
          menu in the window, the sidewalk below. Slightly dim, camera rolled 1.6 degrees.
  Path    The camera cranes up and eases back, levelling out, so the windows, the OPEN sign and
          then the sign with its phone number come into view, in that order.
  Event   The exposure lifts from dim to natural over the first 60% of the shot, as if stepping
          out of the car into the light.
  End     Level, composed and still: the whole storefront. The last two keys sit close together
          so the move eases to a near stop.
  Hotspots (fractions are written to src/data/film.json for the page)
          Menu on the menu poster in the window, Hours on the OPEN sign, Call on the phone number
          painted on the sign, Order online on the door.
  Honest limit: a photograph has no depth, so nothing can cross the foreground; the move reads as
          a crane over a still, not as footage. A real 12-second walk-up clip filmed by the owner
          can replace it without code changes (see media/README.md).

Two cuts with their own camera keys, because the page shows the film in a tall panel (phones and the
desktop split hero) and in a wide one (tablets):
  tall  864 x 1080 (4:5)
  wide  1024 x 768 (4:3)
"""
import argparse
import json
import math
import os

import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(ROOT, "media", "sources", "photos", "okeno-storefront.jpg")

FPS = 24
FRAMES = 216  # 9 s

# Camera keys: frame -> (centre x, centre y, crop height, roll in degrees, exposure), in source
# pixels of the 768 x 1024 photograph. Crop width follows from the cut's aspect ratio.
VARIANTS = {
    "tall": {
        "size": (864, 1080),
        "keys": {
            1: (468, 640, 520, -1.6, 0.74),
            70: (452, 600, 620, -1.1, 0.86),
            150: (402, 548, 840, -0.25, 1.0),
            200: (385, 514, 952, 0.0, 1.0),
            216: (384, 512, 960, 0.0, 1.0),
        },
    },
    "wide": {
        "size": (1024, 768),
        "keys": {
            1: (468, 560, 330, -1.6, 0.74),
            70: (455, 530, 390, -1.1, 0.86),
            150: (404, 440, 530, -0.25, 1.0),
            200: (385, 400, 571, 0.0, 1.0),
            216: (384, 398, 576, 0.0, 1.0),
        },
    },
}

# Points of interest in source pixels; converted to fractions of each cut's last frame.
HOTSPOTS = {
    "menu": (455, 500),  # left edge of the printed menu poster in the middle window
    "hours": (176, 458),  # just under the OPEN sign in the left window, so the sign stays readable
    "call": (585, 206),  # the dash in the phone number on the sign (label sits above it)
    "order": (612, 600),  # the glass door
}


def smoother(t):
    return t * t * t * (t * (t * 6 - 15) + 10)


def camera_at(keys, frame):
    """Monotone (Fritsch-Carlson style) interpolation through the keys on an eased clock."""
    frames = sorted(keys)
    # Eased global clock so the whole move accelerates gently and settles.
    t = smoother((frame - frames[0]) / (frames[-1] - frames[0]))
    f = frames[0] + t * (frames[-1] - frames[0])
    for a, b in zip(frames, frames[1:]):
        if a <= f <= b:
            u = (f - a) / (b - a)
            u = u * u * (3 - 2 * u)
            return tuple(ka + (kb - ka) * u for ka, kb in zip(keys[a], keys[b]))
    return keys[frames[-1]]


def vignette(size):
    w, h = size
    y, x = np.mgrid[0:h, 0:w]
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / math.sqrt(2)
    return (1.0 - 0.22 * np.clip((d - 0.45) / 0.55, 0, 1) ** 1.6)[..., None]


def render(src, conf, frame, vig):
    out_w, out_h = conf["size"]
    cx, cy, ch, roll, exposure = camera_at(conf["keys"], frame)
    # Source is pre-upscaled 2x, so work in those coordinates.
    s = 2.0
    scale = (ch * s) / out_h
    rad = math.radians(roll)
    cos, sin = math.cos(rad) * scale, math.sin(rad) * scale
    # Inverse affine: output pixel (u, v) -> source pixel.
    ox, oy = out_w / 2, out_h / 2
    a, b = cos, -sin
    d, e = sin, cos
    c = cx * s - (a * ox + b * oy)
    f = cy * s - (d * ox + e * oy)
    # Every corner of the rotated crop must land on the photograph (no black wedges).
    for u, v in ((0, 0), (out_w, 0), (0, out_h), (out_w, out_h)):
        x, y = a * u + b * v + c, d * u + e * v + f
        if not (0 <= x <= src.width and 0 <= y <= src.height):
            raise SystemExit(f"frame {frame}: crop leaves the photograph at ({x / s:.0f}, {y / s:.0f})")
    img = src.transform((out_w, out_h), Image.AFFINE, (a, b, c, d, e, f), resample=Image.BICUBIC)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=35, threshold=2))
    arr = np.asarray(img).astype(np.float32) / 255.0
    # Grade: exposure lift, a touch of contrast, a little cool in the shadows while dim.
    arr = arr * exposure
    arr = np.clip((arr - 0.5) * 1.06 + 0.5, 0, 1)
    cool = (1.0 - exposure) * 0.35
    arr[..., 2] = np.clip(arr[..., 2] * (1 + cool * 0.25), 0, 1)
    arr[..., 0] = np.clip(arr[..., 0] * (1 - cool * 0.15), 0, 1)
    arr *= vig
    return Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8))


def end_fractions(conf):
    out_w, out_h = conf["size"]
    cx, cy, ch, _, _ = conf["keys"][max(conf["keys"])]
    cw = ch * out_w / out_h
    left, top = cx - cw / 2, cy - ch / 2
    return {k: (round((x - left) / cw, 4), round((y - top) / ch, 4)) for k, (x, y) in HOTSPOTS.items()}


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--variant", choices=sorted(VARIANTS), required=True)
    p.add_argument("--mode", choices=["stills", "final"], required=True)
    p.add_argument("--frames", help="comma-separated frames (stills mode)")
    args = p.parse_args()

    conf = VARIANTS[args.variant]
    src = Image.open(SRC).convert("RGB")
    src = src.resize((src.width * 2, src.height * 2), Image.LANCZOS)
    vig = vignette(conf["size"])

    frames = [int(x) for x in args.frames.split(",")] if args.mode == "stills" else range(1, FRAMES + 1)
    out = os.path.join(HERE, f"renders-{args.variant}", args.mode)
    os.makedirs(out, exist_ok=True)
    for frame in frames:
        path = os.path.join(out, f"frame_{frame:04d}.png")
        if os.path.exists(path) and os.path.getsize(path) > 0:
            continue
        render(src, conf, frame, vig).save(path)

    # Hotspot positions for the page, as fractions of this cut's last frame.
    film_json = os.path.join(ROOT, "src", "data", "film.json")
    data = json.load(open(film_json)) if os.path.exists(film_json) else {}
    data[args.variant] = {
        "size": conf["size"],
        "frames": FRAMES,
        "fps": FPS,
        "hotspots": {k: {"x": x, "y": y} for k, (x, y) in end_fractions(conf).items()},
    }
    with open(film_json, "w") as fh:
        json.dump(data, fh, indent=2)
    print("RENDER_SUMMARY", json.dumps({"variant": args.variant, "mode": args.mode, "frames": len(frames), "out": out}))


main()
