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

/** Small copy of the counter photo for the blurred light behind the counter scene. */
export const COUNTER_GLOW = "/images/counter-600.jpg";

export const PHOTOS = {
  counter: photo("counter", "counter", 1200, 1600, [600, 1200], {
    alt: "A plate of sauced rolls with ginger and wasabi on a table, with the wooden sushi counter and two chefs behind it",
    caption: "Rolls at a table by the sushi counter.",
    credit: "Photo: marlyn meneses, via Google Maps",
  }),
  rolls: photo("rolls", "rolls", 1200, 669, [600, 1200], {
    alt: "Sauce-topped sushi rolls on a round dark slate with pickled ginger and wasabi",
    caption: "Rolls from Okeno Sushi.",
    credit: "Photo: DoorDash listing, via Google Maps",
  }),
  bento: photo("bento", "bento", 1200, 669, [600, 1200], {
    alt: "A bento tray with grilled chicken and broccoli, a sesame roll, tempura, dumplings and sashimi",
    caption: "A bento from Okeno Sushi.",
    credit: "Photo: DoorDash listing, via Google Maps",
  }),
  storefront: photo("storefront", "storefront", 1200, 1600, [600, 1200], {
    alt: "The Okeno Sushi storefront: a brick shopfront with a lit sign reading Okeno Sushi 631-668-8188, an OPEN sign in the window and a glass door",
    caption: "The storefront at 451 Glen Drive.",
    credit: "Photo: Google Maps listing",
  }),
} as const;

/** Gallery order: tall, wide, wide, tall. */
export const GALLERY: Photo[] = [PHOTOS.counter, PHOTOS.rolls, PHOTOS.bento, PHOTOS.storefront];

/** Scans of the printed menu from the restaurant's previous website (© 2014). */
export const MENU_SCANS = [1, 2, 3, 4].map((n) => ({
  src: `/images/menu-scan-${n}-850.jpg`,
  webp: `/images/menu-scan-${n}-850.webp`,
  width: 850,
  height: 992,
  alt: `Printed menu, page ${n} of 4`,
}));
