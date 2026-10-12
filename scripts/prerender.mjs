// Writes the rendered page into dist/index.html, so the content (menu text included) is in the
// HTML before any script runs, and adds Restaurant structured data built from verified facts only.
//
// Runs after `vite build` and `vite build --ssr` (see the "build" script in package.json).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const server = path.join(root, "dist-ssr", "entry-server.js");

const { render } = await import(pathToFileURL(server).href);
const { BUSINESS, HOURS, LINKS } = await import(pathToFileURL(path.join(root, "dist-ssr", "business.js")).href);

const days = HOURS.map((h, i) => ({ ...h, schema: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i] }));
const structured = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: BUSINESS.name,
  image: "/images/storefront-1200.jpg",
  telephone: "+1-631-668-8188",
  servesCuisine: ["Sushi", "Japanese"],
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.street,
    addressLocality: BUSINESS.city,
    addressRegion: BUSINESS.region,
    postalCode: BUSINESS.postalCode,
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng },
  hasMap: LINKS.maps,
  hasMenu: LINKS.order,
  openingHoursSpecification: days
    .filter((d) => d.open)
    .map((d) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: d.schema, opens: d.open, closes: d.close })),
};

const file = path.join(dist, "index.html");
let html = fs.readFileSync(file, "utf8");
html = html.replace("<!--app-html-->", render());
html = html.replace(
  "<!--structured-data-->",
  `<script type="application/ld+json">${JSON.stringify(structured).replace(/</g, "\\u003c")}</script>`,
);
fs.writeFileSync(file, html);
fs.rmSync(path.join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`prerendered dist/index.html (${Math.round(html.length / 1024)} KB)`);
