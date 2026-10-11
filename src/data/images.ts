/**
 * The four real photographs of Okeno Sushi used on the page, with captions and credits.
 * Source records: media/sources/photo-sources.json and PHOTO-CREDITS.md. Web copies are made by
 * media/images/build_images.py.
 */
export type Photo = {
  id: string;
  alt: string;
  caption: string;
  credit: string;
  width: number;
  height: number;
  /** Largest web copy (jpg) and its webp twin, plus a smaller copy when one exists. */
  src: string;
  webp: string;
  srcSet: string;
  webpSet: string;
};

const photo = (
  id: string,
  base: string,
  width: number,
  height: number,
  widths: number[],
  rest: Pick<Photo, "alt" | "caption" | "credit">,
): Photo => {
  const max = widths[widths.length - 1];
  return {
    id,
    width,
    height,
    src: `/images/${base}-${max}.jpg`,
    webp: `/images/${base}-${max}.webp`,
    srcSet: widths.map((w) => `/images/${base}-${w}.jpg ${w}w`).join(", "),
    webpSet: widths.map((w) => `/images/${base}-${w}.webp ${w}w`).join(", "),
    ...rest,
  };
};

const MAPS = "Photo: Google Maps listing";
const MARLYN = "Photo: marlyn meneses, via Google Maps";
const DOORDASH = "Photo: DoorDash listing, via Google Maps";

/** All crops of real photos at full resolution (media/images/build_images.py). */
export const PHOTOS = {
  heroWide: photo("hero-wide", "hero-wide", 2550, 1700, [1280, 1920, 2550], {
    alt: "A plate of sauced rolls with pickled ginger and wasabi, chopsticks, soy sauce and a green tea cup on a table at Okeno Sushi",
    caption: "Rolls at Okeno Sushi.",
    credit: MARLYN,
  }),
  heroTall: photo("hero-tall", "hero-tall", 1500, 2250, [750, 1125, 1500], {
    alt: "Rolls on a table in front of Okeno Sushi's wooden sushi counter, with two chefs at work behind it",
    caption: "The table and the sushi counter.",
    credit: MARLYN,
  }),
  counter: photo("counter", "counter", 1200, 1600, [600, 1200], {
    alt: "A plate of sauced rolls with ginger and wasabi on a table, with the wooden sushi counter and two chefs behind it",
    caption: "Rolls at a table by the sushi counter.",
    credit: MARLYN,
  }),
  detailRolls: photo("detail-rolls", "detail-rolls", 1400, 955, [800, 1400], {
    alt: "Close-up of seared salmon-topped rolls with eel sauce, ginger and wasabi on a dark plate",
    caption: "Rolls, close up.",
    credit: MARLYN,
  }),
  detailCounter: photo("detail-counter", "detail-counter", 1400, 795, [800, 1400], {
    alt: "Two chefs at work behind Okeno Sushi's sushi counter, with shelves of plates behind them",
    caption: "Behind the sushi counter.",
    credit: MARLYN,
  }),
  detailTea: photo("detail-tea", "detail-tea", 1000, 1000, [600, 1000], {
    alt: "A bottle of soy sauce, a dish of soy sauce and a green ceramic tea cup on a wooden table",
    caption: "Soy sauce and tea at the table.",
    credit: MARLYN,
  }),
  rolls: photo("rolls", "rolls", 1200, 669, [600, 1200], {
    alt: "Sauce-topped sushi rolls on a round dark slate with pickled ginger and wasabi",
    caption: "Rolls from Okeno Sushi.",
    credit: DOORDASH,
  }),
  bento: photo("bento", "bento", 1200, 669, [600, 1200], {
    alt: "A bento tray with grilled chicken and broccoli, a sesame roll, tempura, dumplings and sashimi",
    caption: "A bento from Okeno Sushi.",
    credit: DOORDASH,
  }),
  storefront: photo("storefront", "storefront", 1200, 1600, [600, 1200], {
    alt: "The Okeno Sushi storefront: a brick shopfront with a lit sign reading Okeno Sushi 631-668-8188, an OPEN sign in the window and a glass door",
    caption: "The storefront at 451 Glen Drive.",
    credit: MAPS,
  }),
  sign: photo("sign", "detail-sign", 1800, 476, [900, 1800], {
    alt: "The lit Okeno Sushi sign with the red swirl logo and the phone number 631-668-8188",
    caption: "The sign on Glen Drive.",
    credit: MAPS,
  }),
} as const;

/** The gallery: only full-resolution photos, so nothing is shown larger than it really is. */
export const GALLERY: Photo[] = [
  PHOTOS.detailRolls,
  PHOTOS.counter,
  PHOTOS.detailCounter,
  PHOTOS.rolls,
  PHOTOS.detailTea,
  PHOTOS.storefront,
  PHOTOS.bento,
  PHOTOS.sign,
];

/**
 * A short video for the hero, if the restaurant supplies one (a steady 6 to 12 second clip of
 * the counter or a plate being finished, muted). Put the files in public/video/ and set the paths
 * here; the photo stays as its poster. Left empty: there is no real footage yet, and the site
 * does not fake any.
 */
export const HERO_VIDEO: { mp4: string; webm?: string } | null = null;

/** Scans of the printed menu from the restaurant's previous website (© 2014). */
export const MENU_SCANS = [1, 2, 3, 4].map((n) => ({
  src: `/images/menu-scan-${n}-850.jpg`,
  webp: `/images/menu-scan-${n}-850.webp`,
  width: 850,
  height: 992,
  alt: `Printed menu, page ${n} of 4`,
}));
