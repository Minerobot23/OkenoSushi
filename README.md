# Okeno Sushi: website redesign demo

A working redesign of [okenosushi.com](http://www.okenosushi.com/) for Okeno Sushi, 451 Glen Drive,
Shirley, NY 11967. It is a sales demo for the restaurant's owner. It is not deployed and is not the
restaurant's live site.

It follows two briefs: the Okeno build prompt (`docs/brief/okeno-build-prompt.md`) and the
**Cinematic Demo Playbook** (Fluxline Solutions, v1.0). The page opens on a short arrival film that
ends on an interactive scene of the real storefront.

## What improved

Compared with the current site (an "Order Online" link above four scanned menu pages):

- **Scanned menu pages → a readable, searchable menu.** 198 dishes in 7 categories as real HTML text,
  with tabs, search across the whole menu (accent-insensitive), spicy tags, and current prices from
  the online-ordering menu. The original scans are still one click away, labelled as a reference.
- **Plain ordering link → ordering everywhere.** A red "Order online" button in the header, the hero,
  the menu, the storefront scene and the closing section. On phones, a bottom bar gives Order, Call
  and Directions.
- **Menu-only presentation → real photography.** The four real photos of this restaurant: its
  storefront, its sushi counter, its rolls and a bento. Plus the restaurant's own logo, traced from
  its printed menu.
- **Static page → an arrival and smooth interactions.** A 9-second camera move up to the real
  storefront hands over to an interactive scene: the menu poster in the window opens the menu, the
  OPEN sign opens hours, the phone number on the sign calls, the door orders. There is also a
  gallery with a lightbox, responsive navigation, and section reveals. All of it respects
  reduced-motion settings.
- **Information inside images → clear facts.** Address, weekly hours with a live "Open now" that is
  calculated in New York time, a call button, directions, lunch hours, and catering by phone.

## Run it

```bash
npm install
npm run dev            # development server
npm run build          # type-check, build, prerender to dist/
npm run preview        # serve dist/ on http://localhost:4173
npm run verify         # browser checks against the preview server (see verification/report.md)
npm run lint
```

Node 22. `npm run verify` uses Playwright's Chromium.

## Where things live

| To change | Edit |
| --- | --- |
| Address, phone, hours, ordering link, Google rating snapshot | `src/data/business.ts` (`ORDER_URL` is the one ordering link) |
| Menu dishes, descriptions, prices | `src/data/menu.json` (or re-run `npm run menu:build` from a new ordering snapshot; see below) |
| Photos, captions, credits | `src/data/images.ts`, web copies from `media/images/build_images.py` |
| Arrival film and its hotspots | `media/storefront-film/` (see `media/README.md`) |
| Logo | `src/data/logo.json`, traced by `media/logo/extract_logo.py` |

```
src/
  experience/      HeroFilm (film player), Hotspot, coverBox, cuts: ported from the playbook
  components/      page sections (Header, Hero, ArrivalStage, MenuSection, Gallery, Lightbox, Visit, ...)
  data/            business facts, menu.json, film.json (hotspot positions), images, logo
  lib/             hours ("open now"), menu search, section reveals
  styles/          base.css (tokens), hero.css, sections.css
public/film/       arrival films (WebM + MP4 per cut), posters, end frames
public/images/     web-sized photos and menu scans
media/             sources, film script, image and logo scripts (not served)
scripts/           build-menu, prerender, build-icons, verify
verification/      report.md and screenshots from the last `npm run verify`
```

The production build is prerendered (`scripts/prerender.mjs`), so all content, the menu included,
is in the HTML before any script runs. It also writes Restaurant structured data with verified
facts only: no ratings and no reviews.

## Menu data

`media/sources/mealkeyway-menu-2026-10-11.json` is a trimmed snapshot of the public online-ordering
menu (visible items only), taken on October 11, 2026. `scripts/build-menu.mjs` turns it into
`src/data/menu.json` in seven sections:

- Ordering-system typos are corrected to the printed menu's spelling, for example "Anary Bird Roll"
  → "Angry Bird Roll". Every correction is listed in the script.
- Text is tidied ("w." → "with", sentence case).
- Identical size prices are collapsed ("Sushi or sashimi $5.00").

Sides and drinks are left to the ordering page. Re-running the script overwrites hand edits to
`menu.json`.

## Decisions made without asking

These are reversible, and each one is described in the code where it lives:

1. **The arrival film is a camera move over the real storefront photograph, not a rendered 3D
   scene.** The playbook's default is a Blender scene. The Okeno brief forbids generated
   interiors, invented spaces and fabricated video for this real restaurant, and this machine has
   no Blender or GPU anyway. Every pixel comes from the storefront photo. The film is one
   continuous move with no cuts, no text rendered into it, and a poster and end frame taken from
   its own first and last frames.
2. **Film length is 9 s rather than 12–14 s.** A move over a single still holds attention for less
   time than a 3D walk-through.
3. **The film sits in the split hero's image panel, not full screen.** The source photos are 520 and
   768 px wide, so full-screen would mean a 2–4× upscale, and the Okeno brief asks for a split hero.
   There are two cuts with their own camera paths: tall (4:5) for phones and desktop, wide (4:3) for
   tablets and ultrawide monitors.
4. **The ordering destination is the MealKeyway (MenuSifu) link the owner posted on Google Maps.**
   It loads, is titled "Okeno Sushi" and shows 451 Glen Drive with the current menu. The old
   ChowNow link could not be checked from here (Cloudflare blocked it).
5. **Prices are shown**, because they come from the current ordering menu (October 11, 2026). They
   carry a "may change" note.
6. **Delivery is not mentioned.** It was not verified. The service strip says "Dine in · Takeout ·
   Catering inquiries".
7. **Hotspots are links**, not buttons, because every destination is a place on the page or an
   outside page. They are still keyboard-focusable, labelled and always visible.
8. **Films come as VP9 WebM and H.264 MP4.** The player requests one: WebM where the browser is
   sure it can play it (it is about half the size), otherwise MP4.
9. **The menu shows 12 dishes per long category, then "Show all".** The full list stays in the
   HTML.
10. **Photo credits appear in the lightbox captions.** The permission note is in
    `OWNER-HANDOFF.md`, not on the page.
11. **Left out on purpose:** a map embed (the brief made it optional; it would add third-party
    requests), parallax (optional) and Framer Motion (CSS and timers were enough).

## What was verified, and what was not

`npm run verify` ran 61 checks in headless Chromium against the production build, and all passed.
`verification/report.md` has the full list.

- **The film:** plays in real time, the right cut per screen, pause and resume, skip, replay, and
  navigation during the film. It also falls back correctly with reduced motion, when the film file
  is blocked, and when animation frames never arrive.
- **The hotspot audit:** at 11 screen sizes, from 360×740 to 2560×1080.
- **Layout and accessibility:** no overflow at 390/768/1440, no broken images, alt text, dead-link
  check, touch targets, and the mobile bar never covering content.
- **Interactions:** menu tabs, search and its empty state, mobile navigation, lightbox keyboard,
  swipe and focus return, and the original-menu viewer.
- **Hours:** "open now" in New York time, tested from a Los Angeles browser and across standard
  and daylight time.
- **Links and structured data.**

Not verified: real phones, Safari and iOS (they get the MP4 file), screen readers, and placing an
order through the ordering provider. See `OWNER-HANDOFF.md` for the items the owner must confirm
before launch.
