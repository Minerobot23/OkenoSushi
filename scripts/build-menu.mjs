// Builds src/data/menu.json from the online-ordering snapshot in media/sources/.
//
//   node scripts/build-menu.mjs
//
// Names and descriptions come from the ordering menu (prices too). Where the ordering system has a
// typo, the printed menu (reference-menu/menu1-4.jpg) decides the spelling; every such fix is listed
// in NAME_FIXES / DESCRIPTION_FIXES below so it can be reviewed. Running this overwrites any hand
// edits to src/data/menu.json, so after launch edit that file directly instead.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshot = JSON.parse(
  fs.readFileSync(path.join(root, "media/sources/mealkeyway-menu-2026-10-11.json"), "utf8"),
);

/** Ordering-system spelling -> spelling on the printed menu. */
const NAME_FIXES = {
  "Anary Bird Roll": "Angry Bird Roll",
  "Avo Peauts Roll": "Avo Peanuts Roll",
  lkura: "Ikura",
  "UPS Roll": "U.P.S. Roll",
  "XMas Roll": "X'Mas Roll",
  "Coconut Shrimp Appt": "Coconut Shrimp",
  "Shrimp & Veg Tempura App": "Shrimp & Veg Tempura",
  "Chicken & Veg Tempura App": "Chicken & Veg Tempura",
  "Fish Tempura App": "Fish Tempura",
  "Smoke Salmon Cream Cheese Roll": "Smoked Salmon Cream Cheese Roll",
};

/** Descriptions missing or garbled in the ordering system, taken from the printed menu. */
const DESCRIPTION_FIXES = {
  "Angry Bird Roll": "Shrimp tempura, spicy tuna inside, spicy snow crab, topped in soy paper",
  "Tuna Dumpling": "Tuna wrapped snow crab, seaweed salad, topped with avocado cilantro sauce",
  "Ika (Squid)": "",
  "Sushi Regular": "1 California roll and 7 pcs sushi",
};

const SECTIONS = [
  {
    id: "special-rolls",
    label: "Special rolls",
    blurb: "The house's signature rolls, from the Shirley Roll to the Godzilla.",
    groups: [{ from: "Special Fancy Roll", title: "Special fancy rolls" }],
  },
  {
    id: "rolls",
    label: "Rolls & hand rolls",
    blurb: "Classic maki, spicy rolls and vegetable rolls.",
    groups: [{ from: "Roll/Hand Roll", title: "Roll or hand roll" }],
  },
  {
    id: "sushi",
    label: "Sushi & sashimi",
    blurb: "By the piece, as a set, or as a platter for the table.",
    groups: [
      { from: "Sushi & Sashimi", title: "Sushi & sashimi", note: "2 pcs each order" },
      { from: "Sashimi & Sushi Special", title: "Sushi & sashimi specials" },
      { from: "Party Platter", title: "Party platters" },
    ],
  },
  {
    id: "bento",
    label: "Bento",
    blurb: "A full tray: the main, a California roll, a daily appetizer and sushi or sashimi.",
    groups: [{ from: "Bento Dinner", title: "Bento dinner" }],
  },
  {
    id: "kitchen",
    label: "Kitchen",
    blurb: "Teriyaki, tempura, udon and fried rice from the kitchen.",
    groups: [
      { from: "Kitchen Entree", title: "Kitchen entrées", note: "All entrées come with soup or salad" },
      { from: "Udon Noodle", title: "Udon noodles" },
      { from: "Rice", title: "Rice" },
    ],
  },
  {
    id: "starters",
    label: "Starters",
    blurb: "Soups, salads and house special appetizers.",
    groups: [
      { from: "Soup & Salad", title: "Soup & salad" },
      { from: "House Special Appetizer", title: "House special appetizers" },
    ],
  },
  {
    id: "lunch",
    label: "Lunch",
    blurb: "Tuesday to Friday, 11 AM to 3 PM, excluding holidays.",
    groups: [
      { from: "Bento Lunch", title: "Bento lunch", note: "Served with California roll and daily appetizer" },
      { from: "Kitchen Entree Lunch", title: "Kitchen entrée lunch", note: "Served with soup or salad" },
      { from: "Sushi Bar Lunch", title: "Sushi bar lunch" },
    ],
  },
];

const tidyName = (raw) => {
  let name = raw.trim().replace(/^\((L|D)\)\s*/, "");
  name = NAME_FIXES[name] ?? name;
  return name
    .replace(/(\S)\(/g, "$1 (")
    .replace(/\(Veg\)/, "(Veg.)")
    .replace(/ w\.\s*/, " with ");
};

const tidyText = (raw) => {
  const text = raw
    .trim()
    .replace(/\bw\.\s*/gi, "with ")
    .replace(/^\((\d+) ?pcs big roll\)\s*/i, "$1 pcs big roll: ")
    .replace(/(\d)pcs\b/gi, "$1 pcs")
    .replace(/\s*\(ikura\)/i, " (ikura)")
    .replace(/\s*\.\s*(?=[a-zA-Zñé])/g, ", ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*&\s*/g, " & ")
    .replace(/\bCaliformia\b/g, "California")
    .replace(/\bseweed\b/g, "seaweed")
    .replace(/^Cook squash/, "Cooked squash")
    .replace(/\s+/g, " ")
    .replace(/,\s*$/, "");
  // Sentence case, keeping the one proper noun on this menu.
  const lower = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  return lower.replace(/\bcalifornia\b/g, "California");
};

const tidyPrices = (prices) => {
  const labelled = prices.filter((p) => p.size);
  const same = labelled.length > 1 && labelled.every((p) => p.amount === labelled[0].amount);
  if (same) {
    const labels = labelled.map((p) => p.size.toLowerCase());
    const label = labels.slice(0, -1).join(", ") + " or " + labels.at(-1);
    return [{ label: label.charAt(0).toUpperCase() + label.slice(1), amount: labelled[0].amount }];
  }
  return prices.map((p) => ({ ...(p.size ? { label: p.size } : {}), amount: p.amount }));
};

const isSpicy = (name, description) => /spicy|jalape/i.test(`${name} ${description}`);

const sections = SECTIONS.map(({ groups, ...section }) => ({
  ...section,
  groups: groups.map(({ from, title, note }) => {
    const category = snapshot.categories.find((c) => c.name === from);
    if (!category) throw new Error(`Category not in snapshot: ${from}`);
    return {
      title,
      ...(note ? { note } : {}),
      items: category.items.map((item) => {
        const name = tidyName(item.name);
        let description = tidyText(item.description ?? "");
        // The ordering system repeats the Japanese name as the "description" for sushi; keep it only
        // when it adds something.
        if (description && name.toLowerCase().startsWith(description.toLowerCase())) description = "";
        if (DESCRIPTION_FIXES[name] !== undefined) description = DESCRIPTION_FIXES[name];
        if (/^Served with California roll, daily appetizer/.test(description) && from.startsWith("Bento")) {
          description = "";
        }
        return {
          name,
          ...(description ? { description } : {}),
          prices: tidyPrices(item.prices),
          ...(isSpicy(name, description) ? { spicy: true } : {}),
        };
      }),
    };
  }),
}));

const out = {
  source: snapshot.source,
  checked: snapshot.capturedAt,
  sections,
};
const dest = path.join(root, "src/data/menu.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
const count = sections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.items.length, 0), 0);
console.log(`menu.json: ${sections.length} sections, ${count} items`);
