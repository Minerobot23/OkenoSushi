import photos from "../data/dishes.json";
import { MENU, type Dish } from "./menu";

/** A photo of one of Okeno's own dishes (media/dishes/build_dishes.py). */
export type DishPhoto = {
  name: string;
  kind: "printed" | "platter" | "ordering";
  src: string;
  webp: string;
  width: number;
  height: number;
  source: string;
};

/** A menu dish with where it sits on the menu and its best photo, if any. */
export type DishInfo = Dish & { section: string; sectionLabel: string; group: string; photo?: DishPhoto };

const PHOTOS = photos as DishPhoto[];

/** Ordering-page photos are larger, so they win over the printed menu's when both exist. */
const rank = { ordering: 0, printed: 1, platter: 2 } as const;

export function photoFor(name: string, prefer?: DishPhoto["kind"]): DishPhoto | undefined {
  const all = PHOTOS.filter((p) => p.name === name);
  if (prefer) {
    const preferred = all.find((p) => p.kind === prefer);
    if (preferred) return preferred;
  }
  return all.sort((a, b) => rank[a.kind] - rank[b.kind])[0];
}

const ALL: DishInfo[] = MENU.sections.flatMap((section) =>
  section.groups.flatMap((group) =>
    group.items.map((dish) => ({
      ...dish,
      section: section.id,
      sectionLabel: section.label,
      group: group.title,
      photo: photoFor(dish.name),
    })),
  ),
);

/** First match wins, so dinner dishes are found before their lunch versions. */
export function dish(name: string): DishInfo {
  const found = ALL.find((d) => d.name === name);
  if (!found) throw new Error(`Not on the menu: ${name}`);
  return found;
}

export const PLATTER_PHOTOS = PHOTOS.filter((p) => p.kind === "platter");

/**
 * The dishes that ride the counter belt: the restaurant's ordering-page photos, the largest dish
 * photos available, on round plates small enough that they stay sharp on high-density screens.
 */
export const BELT: DishInfo[] = [
  "Sashimi Regular",
  "Spicy Tuna Roll",
  "Sushi & Sashimi Combo For 2",
  "California Roll",
  "Gyoza (Pork)",
  "Spicy Salmon Roll",
  "Xanadu Roll",
  "Edamame",
  "Chicken Teriyaki Bento",
  "Seaweed Salad",
  "Spicy Kani Roll",
  "Shrimp & Veg Tempura",
  "Chicken Vegetable Udon",
  "Kani Salad",
  "Fire Ball",
  "Spring Roll (Veg.)",
].map((name) => ({ ...dish(name), photo: photoFor(name, "ordering") }));
