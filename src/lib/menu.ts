import data from "../data/menu.json";

export type Price = { label?: string; amount: number };
export type Dish = { name: string; description?: string; prices: Price[]; spicy?: boolean };
export type Group = { title: string; note?: string; items: Dish[] };
export type Section = { id: string; label: string; blurb: string; groups: Group[] };

export const MENU = data as { source: string; checked: string; sections: Section[] };

export const money = (amount: number) => `$${amount.toFixed(2)}`;

/** Lowercase, accents removed, so "jalapeno" finds "jalapeño". */
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Every word of the query must appear in the dish name, description or group title. */
export function search(query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return MENU.sections
    .map((section) => ({
      section,
      groups: section.groups
        .map((group) => ({
          ...group,
          items: group.items.filter((dish) => {
            const hay = normalize(`${dish.name} ${dish.description ?? ""} ${group.title} ${dish.spicy ? "spicy" : ""}`);
            return words.every((w) => hay.includes(w));
          }),
        }))
        .filter((group) => group.items.length),
    }))
    .filter((result) => result.groups.length);
}

/** A label shared by every dish in a group ("Sushi or sashimi") is shown once, on the group. */
export function sharedLabel(group: Group) {
  const first = group.items[0]?.prices;
  if (!first || first.length !== 1 || !first[0].label) return undefined;
  const label = first[0].label;
  return group.items.every((d) => d.prices.length === 1 && d.prices[0].label === label) ? label : undefined;
}
