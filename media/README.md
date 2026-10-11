# Media

Everything here is a source or a script. Only `public/` is served.

## Status

| Item | State | Files |
| --- | --- | --- |
| Arrival film, tall cut (864×1080, 4:5) | Done: 216 frames, 9.0 s, 24 fps, H.264 1.9 MB + VP9 1.0 MB | `public/film/arrival-tall.*` |
| Arrival film, wide cut (1024×768, 4:3) | Done: 216 frames, 9.0 s, 24 fps, H.264 1.3 MB + VP9 0.8 MB | `public/film/arrival-wide.*` |
| Posters (first frames) and end frames (last frames) | Done | `public/film/*-poster.jpg`, `*-end.webp` |
| Hotspot positions | Generated with the film | `src/data/film.json` |
| Web photos and menu scans | Done | `public/images/` |
| Logo (vector) | Traced from the printed menu | `src/data/logo.json`, preview in `logo/logo-preview.png` |
| Favicon, touch icon | From the logo's swirl | `public/favicon.svg`, `public/apple-touch-icon.png` |

## Arrival film (`storefront-film/`)

This deviates from the Cinematic Demo Playbook's 3D method, on purpose. The film is one continuous
camera move over the real storefront photograph:

1. It starts at the window and door and cranes up and back to the whole storefront.
2. The exposure lifts from dim to natural over the first 60% of the shot.
3. It eases to a stop on a level, composed frame.

Okeno Sushi is a real restaurant, and its brief forbids generated interiors and fabricated video,
so nothing is modelled or generated. The script's docstring has the shot plan.

```bash
# needs Python 3 with Pillow and numpy, and FFmpeg with libx264 and libvpx
python media/storefront-film/build_film.py --variant tall --mode stills --frames 1,70,150,216   # check stills first
python media/storefront-film/build_film.py --variant tall --mode final
python media/storefront-film/build_film.py --variant wide --mode final
bash media/storefront-film/encode.sh       # MP4 + WebM + poster + end frame per cut, then ffprobe
```

Frames go to `storefront-film/renders-*/` (git-ignored). Each run also rewrites
`src/data/film.json` with the hotspot positions, as fractions of each cut's last frame. A key that
would push the crop past the photo's edge stops the render with an error rather than drawing black
corners.

**Replacing it with real footage.** A steady 10–15 s phone clip of walking up to the door, shot by
the owner at dusk, would beat any still. Encode it to the same file names and sizes, take its last
frame as `arrival-*-end.webp`, and update the hotspot fractions in `src/data/film.json`. No code
changes are needed.

## Sources (`sources/`)

- `photos/`: the four Google Maps photos, untouched. See `../PHOTO-CREDITS.md`.
- `photo-sources.json`: original download URLs and asset ids.
- `reference-menu/menu1-4.jpg`: the printed menu from the old website.
- `mealkeyway-menu-2026-10-11.json`: trimmed snapshot of the online-ordering menu, the source of
  `src/data/menu.json` (`npm run menu:build`).

## Licences

No third-party stock, 3D models or textures are used. The photos' commercial permission is still
open (see `../OWNER-HANDOFF.md`). The fonts, Instrument Serif and DM Sans, are SIL Open Font
License, self-hosted through Fontsource.
