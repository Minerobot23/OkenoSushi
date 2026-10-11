// Writes public/favicon.svg and public/apple-touch-icon.png from the traced logo mark.
//
//   node scripts/build-icons.mjs
//
// The icon is the red swirl from the restaurant's own logo (src/data/logo.json) on charcoal.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const logo = JSON.parse(fs.readFileSync(path.join(root, "src/data/logo.json"), "utf8"));

// The mark path also holds the thin rule under the wordmark; the swirl sits above y = 132.
const nums = logo.mark.match(/-?\d+(\.\d+)?/g).map(Number);
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (let i = 0; i + 1 < nums.length; i += 2) {
  const [x, y] = [nums[i], nums[i + 1]];
  if (y > 132) continue;
  minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
}
const size = Math.max(maxX - minX, maxY - minY);
const pad = size * 0.16;
const box = [minX - pad, (minY + maxY) / 2 - size / 2 - pad, size + pad * 2, size + pad * 2].map((n) => n.toFixed(1));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(" ")}"><defs><clipPath id="c"><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${(132 - box[1]).toFixed(1)}"/></clipPath></defs><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" rx="${(size * 0.22).toFixed(1)}" fill="#171A17"/><path clip-path="url(#c)" fill-rule="evenodd" fill="#C9473B" d="${logo.mark}"/></svg>\n`;
fs.writeFileSync(path.join(root, "public/favicon.svg"), svg);

const { chromium } = await import("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
await page.setContent(`<style>html,body{margin:0;background:#171A17}</style>${svg.replace("<svg ", '<svg width="180" height="180" ')}`);
await page.screenshot({ path: path.join(root, "public/apple-touch-icon.png") });
await browser.close();
console.log("favicon.svg + apple-touch-icon.png written; mark box", box.join(" "));
