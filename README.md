# Okeno Sushi: website redesign demo

A working redesign of [okenosushi.com](http://www.okenosushi.com/) for Okeno Sushi, 451 Glen Drive,
Shirley, NY 11967. It is a sales demo for the restaurant's owner. It is not the restaurant's live
site.

It follows the Okeno build prompt (`docs/brief/okeno-build-prompt.md`) and the **Cinematic Demo
Playbook** (Fluxline Solutions). Like the Fluxline demos, it is a full-screen experience you move
through rather than a long page: an arrival, a main scene you interact with, and destinations one
tap away. The idea is its own, though: **take a seat at the counter.**

- **The arrival.** You walk in under a noren, the split fabric curtain in a Japanese restaurant's
  doorway. Okeno's own swirl logo draws itself on the vermilion cloth, then the four strips part
  onto a dark room whose lights come up. The room is a sharp, full-screen close-up of Okeno's
  rolls at the table, which drifts very slowly closer. It takes about 3 seconds. A click, a key or
  the wheel skips it, and the navigation works throughout.
- **The counter.** Under the photo, a slim belt carries 16 of Okeno's real dishes on round
  plates. It moves slowly by itself, stops when you hover or touch it, and can be dragged, swiped,
  paused or tabbed through. Tap a plate to open the dish: its photo, ingredients, price, Order
  online, and "Find it on the menu".
- **The scenes.** Menu, Platters, Gallery and Visit open from the navigation with a short, soft
  dip to dark. The curtain is kept for the arrival only, and motion elsewhere is quiet: fades, gentle
  hovers, nothing that bounces or spins.
  - **Menu:** 198 dishes, with 43 of the 45 special rolls shown as photo cards.
  - **Platters:** the five real platters, plus catering.
  - **Gallery:** 8 full-resolution photos with a lightbox.
  - **Visit:** live "Open now", hours and directions.

## What improved

Compared with the current site (an "Order Online" link above four scanned menu pages):

- **Scanned menu pages → a readable, searchable menu with photos.**
  - 198 dishes as real text, with tabs and accent-insensitive search.
  - 72 of them now show the restaurant's own photo.
  - Current prices come from the ordering menu.
  - Every dish opens in a detail sheet.
  - The original scans remain one click away, labelled as a reference.
- **Plain ordering link → ordering everywhere.** Order online sits in the top bar, the dock, the
  counter, every dish sheet and the menu. Call is on every screen.
- **Menu-only presentation → real food, all over.** 75 photos of Okeno's own dishes, cut from its
  printed menu and its ordering page, plus its storefront, counter and logo. Nothing is generated
  or stock.
- **Static page → a place to explore.** It has:
  - the noren arrival;
  - the moving belt;
  - curtain transitions between scenes;
  - words rising in turn;
  - a brush stroke that draws itself;
  - turning platters;
  - pointer parallax;
  - staggered card entrances;
  - a lightbox.

  All of it respects reduced-motion settings.
- **Information inside images → clear facts.** Address, weekly hours with "Open now" calculated in
  New York time, directions, lunch hours, and catering by phone.

## Run it

```bash
npm install
npm run dev            # development server
npm run build          # type-check, build, prerender to dist/
npm run preview        # serve dist/ on http://localhost:4173
npm run verify         # 43 browser checks against the preview server (verification/report.md)
npm run lint
```

## Where things live

| To change | Edit |
| --- | --- |
| Address, phone, hours, ordering link, Google rating snapshot | `src/data/business.ts` (`ORDER_URL` is the one ordering link) |
| Menu dishes, descriptions, prices | `src/data/menu.json` (or `npm run menu:build` from a new ordering snapshot) |
| Which dishes ride the belt, the gallery's food photos | `BELT` and `FOOD_WALL` in `src/lib/dishes.ts` |
| Dish photos | `media/dishes/build_dishes.py` writes `public/images/dishes/` and `src/data/dishes.json` |
| Place photos, captions, credits | `src/data/images.ts` (web copies from `media/images/build_images.py`) |
| Logo | `src/data/logo.json`, traced by `media/logo/extract_logo.py` |

```
src/
  App.tsx            top bar, scenes, dock, noren, dish sheet
  lib/scenes.tsx     scene director: hash routing, curtain wipes on timers, focus, titles
  lib/dishes.ts      joins dish photos to menu items; belt and gallery line-ups
  scenes/            Counter, MenuScene, PlattersScene, GalleryScene, VisitScene
  components/        Noren, Belt, Plate, TastingFan, DishSheet, Dock, TopBar, Lightbox, ...
  styles/            base.css (tokens), chrome.css, counter.css, scenes.css
media/               sources and scripts (not served)
scripts/             build-menu, prerender, build-icons, verify
verification/        report.md and screenshots from the last `npm run verify`
```

How it holds up when things go wrong:

- **Prerendered:** the production build renders every scene into `index.html`, so content is in the
  HTML before any script runs.
- **No JavaScript:** the scenes simply stack into one readable page.
- **Before the app loads:** a tiny inline script picks the scene from the URL before first paint,
  ends the arrival on a timer, and keeps dock links working even if the app bundle never loads.

## Sharp photos

Earlier versions used the 768 px and 520 px copies of the Google Maps photos. The same photos are
available at full size: the counter photo and the storefront are 3000 × 4000, and the two food
photos 1200 × 669. The hero, the gallery and Visit are all cut from these, in several widths, so
each screen downloads one that is sharp at its pixel density. Smaller sources are shown no larger
than they really are:
- the printed-menu roll photos (about 180 px) appear as small thumbnails;
- the platter cutouts appear at 160 px.

## A hero video, when there is one

There is no real footage of Okeno yet, and the site does not fake any. If the restaurant films a
steady 6 to 12 second clip (the counter, or a plate being finished), set `HERO_VIDEO` in
`src/data/images.ts`. It plays muted behind the headline, with the photo as its poster.

## Decisions made without asking

1. **The arrival film was removed, at your request.** The noren curtain replaces it: a CSS
   animation built only from Okeno's real logo, not a video. After the second round of feedback,
   it opens onto the sharp hero photo instead of a blurred room.
2. **More sushi comes from the restaurant's own published photos.**
   - The printed menu: 48 photos printed above their dish names, so each label is certain.
   - The online-ordering page: 22 photos, each attached to its item.

   I left out two banner images and one fried-rice photo because they look like generic stock.
   See `PHOTO-CREDITS.md`.
3. **The conveyor belt is an interface idea, not a claim.** Okeno is not a conveyor-belt
   restaurant, and the site doesn't say it is. The plates carry no kaiten-style price colours.
4. **Fluxline was used for the format only:** full-screen scenes, a persistent dock, a
   main-action button. There is no 3D room, no glowing-light hotspots and no film. The concept,
   the transitions and the look are different.
5. **The ordering link stays MealKeyway (MenuSifu),** the link the owner posted on Google Maps.
   It is verified as Okeno at 451 Glen Drive. When I checked on October 11, it said ordering was
   temporarily unavailable.
6. **Prices are shown** from the ordering menu, with a "may change" note. **Delivery is not
   mentioned**, because it was not verified.

## Verified, and not

`npm run verify` runs 43 checks in headless Chromium against the production build. All passed
(`verification/report.md`):

- **Arrival:**
  - runs and ends by itself;
  - a click skips it;
  - the dock works during it;
  - reduced motion skips it;
  - it still ends when animation frames never arrive.
- **Scenes:** every scene opens and takes focus, back button, deep links, rapid clicks during a wipe,
  and the no-JavaScript fallback.
- **Belt:** advances, hover stops it, pause holds it, dragging doesn't open dishes, and every dish is
  reachable by keyboard once.
- **Dish sheet:** Tab is trapped inside it, Escape closes it with focus returned, and "Find it on
  the menu" works.
- **Menu:** cards, photos, tabs, search and the empty state.
- **Platters, gallery and lightbox.**
- **Hours:** "Open now" in New York time, tested from a Los Angeles browser.
- **Layout:** 9 screen sizes × 5 scenes, checking overflow, broken or stretched images, touch
  targets, and that the belt clears the phone navigation.
- **Sharpness:** at 2× pixel density (retina phones and laptops), no photo is stretched more than
  1.35× its real pixels.
- **Links and structured data.**

Not verified: real phones, Safari and iOS, screen readers, and placing an order. See
`OWNER-HANDOFF.md` for what the owner must confirm before launch.
