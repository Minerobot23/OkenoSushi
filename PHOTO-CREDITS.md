# Photo credits and provenance

Every photo on the site shows Okeno Sushi's own food or premises. None is stock or generated.
Nothing is upscaled, retouched or extended: the scripts in `media/` only crop, trim padding,
resize down and re-encode.

## Dish photos (75), published by the restaurant itself

`media/dishes/build_dishes.py` writes them to `public/images/dishes/` and lists them in
`src/data/dishes.json`. `media/dishes/contact-sheet.jpg` shows every crop with its name, for
checking.

| Source | Count | How the dish name is known |
| --- | --- | --- |
| Printed menu, pages 2–4 (`media/sources/reference-menu/`, from the old website, © 2014) | 43 special rolls + 5 appetizers | Each photo is printed in a frame directly above its name |
| Printed menu, page 1 | 5 round platters | Printed beside their names and prices |
| Online-ordering page (MealKeyway / MenuSifu; originals in `media/sources/ordering-photos/`, URLs in `sources.tsv`) | 22 | Each is attached to its menu item on the ordering page |

Left out on purpose:
- the ordering page's two banner images (a styled overhead spread that looks like stock);
- its shrimp fried rice photo (it looks like a generic stock image);
- duplicate photos (the same gyoza and bento photos used for two items each).

The ordering-page photos are small originals that the ordering system padded to 960×540. The
padding is trimmed and the photo shown at or below its real size. The printed-menu photos are
about 180×100 px and are shown at roughly that size, on plates and cards. Each dish sheet says
which source its photo came from.

## Place photos (4), from Okeno Sushi's Google Maps gallery

Downloaded and visually inspected on October 11, 2026. The original URLs are in
`media/sources/photo-sources.json`; the files are in `media/sources/photos/`.

| File | What it shows | Gallery attribution / asset id | Used on the site |
| --- | --- | --- | --- |
| okeno-storefront.jpg (768×1024) | The brick storefront and lit Okeno Sushi sign | Maps gallery; uploader not established; b0670bde9442b264 | Visit, Gallery |
| okeno-counter-with-rolls.jpg (768×1024) | Rolls on a table, the sushi counter and chefs | marlyn meneses, July 2025; 27261a11ff87fc66 | Counter background (blurred), Gallery |
| okeno-rolls-on-slate.jpg (520×290) | Sauce-topped rolls on slate | DoorDash; de812f97fb415514 | Gallery |
| okeno-bento-platter.jpg (520×290) | A bento tray | DoorDash; 81644b64a14948b1 | Gallery |

The gallery lightbox credits each photo.

## Permission

**Commercial permission has not been established for any of these photos.** The printed-menu and
ordering-page photos were published by the restaurant, but the photographer (for example the menu
printer) may hold the rights. Visibility on Google Maps grants nothing. Confirm with the owner
before launch, or replace the photos with the owner's own originals.

The logo is traced from the printed menu (`media/logo/extract_logo.py`).
