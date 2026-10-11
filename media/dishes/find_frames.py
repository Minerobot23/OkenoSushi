"""Finds the framed dish photos on the printed menu scans (thin gray rectangles) and prints boxes."""
import sys

import numpy as np
from PIL import Image


def frames(path, min_w=150, min_h=70):
    a = np.asarray(Image.open(path).convert("RGB")).astype(int)
    lum = a.mean(axis=2)
    spread = a.max(axis=2) - a.min(axis=2)
    line = (lum > 70) & (lum < 200) & (spread < 60)
    h, w = line.shape
    horiz = []
    for y in range(h):
        row = line[y]
        x = 0
        while x < w:
            if row[x]:
                x0 = x
                while x < w and row[x]:
                    x += 1
                if x - x0 >= min_w:
                    horiz.append((y, x0, x))
            x += 1
    boxes = []
    for i, (y, x0, x1) in enumerate(horiz):
        for (y2, a0, a1) in horiz[i + 1:]:
            if y2 - y < min_h:
                continue
            if y2 - y > 220:
                break
            if abs(a0 - x0) <= 6 and abs(a1 - x1) <= 6:
                # left and right edges must be mostly line pixels too
                lcol = line[y:y2, x0:x0 + 3].any(axis=1).mean()
                rcol = line[y:y2, x1 - 3:x1].any(axis=1).mean()
                if lcol > 0.55 and rcol > 0.55:
                    boxes.append((x0, y, x1, y2))
                    break
    # merge near-duplicates (double lines)
    out = []
    for b in sorted(boxes, key=lambda b: (b[1], b[0])):
        if any(abs(b[0] - o[0]) < 8 and abs(b[1] - o[1]) < 8 for o in out):
            continue
        out.append(b)
    return out


for p in sys.argv[1:]:
    bs = frames(p)
    print(p, len(bs))
    for b in bs:
        print("  ", b, "size", b[2] - b[0], "x", b[3] - b[1])
