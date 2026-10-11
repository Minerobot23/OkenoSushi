# Media

Everything here is a source or a script. Only `public/` is served.

| Item | Script | Output |
| --- | --- | --- |
| 75 dish photos (printed menu + ordering page) | `dishes/build_dishes.py` | `public/images/dishes/`, `src/data/dishes.json`, `dishes/contact-sheet.jpg` |
| Place photos and menu scans, web sizes | `images/build_images.py` | `public/images/` |
| Logo (vector, traced from the printed menu) | `logo/extract_logo.py` | `src/data/logo.json`, `logo/logo-preview.png` |
| Favicon and touch icon (the logo's swirl) | `../scripts/build-icons.mjs` | `public/favicon.svg`, `public/apple-touch-icon.png` |
| Menu data from the ordering-page snapshot | `../scripts/build-menu.mjs` | `src/data/menu.json` |

```bash
# Python 3 with Pillow and numpy (the logo script also needs potracer)
python media/dishes/build_dishes.py
python media/images/build_images.py
python media/logo/extract_logo.py
node scripts/build-icons.mjs
npm run menu:build
```

## Sources (`sources/`)

| Path | What it is |
| --- | --- |
| `photos/` | The four Google Maps photos, untouched (see `../PHOTO-CREDITS.md`) |
| `photo-sources.json` | Their original URLs and asset ids |
| `reference-menu/menu1-4.jpg` | The printed menu from the old website: menu text, dish photos and logo |
| `ordering-photos/` | Dish photos from the online-ordering page, untouched. `sources.tsv` maps each file to its URL |
| `mealkeyway-menu-2026-10-11.json` | Trimmed snapshot of the online-ordering menu, the source of `src/data/menu.json` |

The dish crops in `build_dishes.py` are fixed boxes on the printed menu's grid, each paired with
the name printed under it. `dishes/find_frames.py` is the helper that located the frames. Check
`dishes/contact-sheet.jpg` after any change.

## Licences

No third-party stock, 3D models or textures are used. The photos' commercial permission is still
open (see `../OWNER-HANDOFF.md`). The fonts, Instrument Serif and DM Sans, are under the SIL Open
Font License, self-hosted through Fontsource.
