// Browser verification of the production build: the Cinematic Demo Playbook's phase 8 checks,
// adapted to this experience (noren arrival, scenes, counter belt), plus the Okeno brief's checks.
//
//   npm run build && npm run preview          (in one terminal)
//   npm run verify                             (in another; BASE=http://localhost:4173/ by default)
//
// Writes verification/report.md and screenshots to verification/screens/. Exits 1 if a check fails.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.env.BASE ?? "http://localhost:4173/";
const outDir = path.join(root, "verification");
const shots = path.join(outDir, "screens");
fs.rmSync(shots, { recursive: true, force: true });
fs.mkdirSync(shots, { recursive: true });
const SCENES = ["counter", "menu", "platters", "gallery", "visit"];

const results = [];
const record = (group, name, pass, detail = "") => {
  results.push({ group, name, pass: !!pass, detail: String(detail) });
  console.log(`${pass ? "PASS" : "FAIL"}  ${group} / ${name}${detail ? `  (${detail})` : ""}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (page, name) => page.screenshot({ path: path.join(shots, `${name}.jpg`), type: "jpeg", quality: 80 });

const browser = await chromium.launch();
async function open({ width = 1440, height = 900, reducedMotion = "no-preference", init, timezoneId, javaScriptEnabled = true } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion, timezoneId, javaScriptEnabled });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  if (init) await page.addInitScript(init);
  return { page, context, errors };
}
const sceneOf = (page) => page.evaluate(() => document.documentElement.dataset.scene);
const visibleHeading = (page, id) =>
  page.evaluate((sid) => {
    const h = document.querySelector(`#scene-${sid} [data-scene-focus]`);
    if (!h) return false;
    const r = h.getBoundingClientRect();
    return getComputedStyle(h.closest(".scene")).visibility === "visible" && r.top >= 0 && r.bottom <= innerHeight && r.width > 0;
  }, id);
const beltLeft = (page) => page.evaluate(() => document.querySelector(".belt__track").scrollLeft);

// ---------------------------------------------------------------- Arrival (noren)
{
  const { page, context, errors } = await open();
  await page.mouse.move(2, 2);
  await page.goto(BASE);
  const atStart = await page.evaluate(() => document.documentElement.classList.contains("arrive"));
  await wait(700);
  await shot(page, "arrival-0700ms");
  await wait(600);
  await shot(page, "arrival-1300ms");
  await wait(2400);
  const after = await page.evaluate(() => ({
    arrive: document.documentElement.classList.contains("arrive"),
    noren: getComputedStyle(document.querySelector(".noren")).visibility,
    title: getComputedStyle(document.querySelector(".counter__title .word")).opacity,
  }));
  record("Arrival", "noren arrival runs and ends by itself", atStart && !after.arrive && after.noren === "hidden" && after.title === "1", JSON.stringify(after));
  await shot(page, "desktop-1440-counter");
  record("Console", "no errors (desktop arrival)", errors.length === 0, errors.join(" | "));
  await context.close();
}
{
  const { page, context } = await open();
  await page.goto(BASE);
  await wait(600);
  await page.mouse.click(700, 500);
  await wait(600);
  const gone = await page.evaluate(() => !document.documentElement.classList.contains("arrive"));
  record("Arrival", "a click skips the arrival", gone);
  await context.close();
}
{
  const { page, context } = await open();
  await page.goto(BASE);
  await wait(500);
  await page.locator(".dock").getByRole("link", { name: "Menu" }).click();
  await wait(3500);
  record("Arrival", "the dock works during the arrival", (await sceneOf(page)) === "menu" && (await visibleHeading(page, "menu")));
  await context.close();
}
{
  const { page, context } = await open({ reducedMotion: "reduce" });
  await page.goto(BASE);
  await wait(300);
  const s = await page.evaluate(() => ({ arrive: document.documentElement.classList.contains("arrive"), noren: getComputedStyle(document.querySelector(".noren")).display }));
  record("Arrival", "reduced motion: no arrival at all", !s.arrive && s.noren === "none", JSON.stringify(s));
  const before = await beltLeft(page);
  await wait(1500);
  record("Belt", "reduced motion: the belt does not move by itself", (await beltLeft(page)) === before);
  record("Belt", "reduced motion: no pause control is needed", (await page.locator(".belt__toggle").count()) === 0);
  await context.close();
}
{
  const { page, context } = await open({ init: () => (window.requestAnimationFrame = () => 0) });
  await page.goto(BASE);
  await wait(3600);
  const s = await page.evaluate(() => ({
    arrive: document.documentElement.classList.contains("arrive"),
    title: getComputedStyle(document.querySelector(".counter__title .word")).opacity,
  }));
  record("Arrival", "no animation frames: arrival still ends, headline visible", !s.arrive && s.title === "1", JSON.stringify(s));
  await page.locator(".dock").getByRole("link", { name: "Visit" }).click();
  await wait(1200);
  record("Scenes", "no animation frames: scenes still switch", (await sceneOf(page)) === "visit");
  await context.close();
}
{
  const { page, context } = await open({ javaScriptEnabled: false });
  await page.goto(BASE);
  await wait(400);
  const s = await page.evaluate(() => ({
    scenes: [...document.querySelectorAll(".scene")].filter((el) => getComputedStyle(el).visibility === "visible").length,
    menuText: document.body.innerText.includes("Shirley Roll"),
    hours: document.body.innerText.includes("Monday"),
  }));
  record("Fallback", "without JavaScript every scene is readable as one page", s.scenes === 5 && s.menuText && s.hours, JSON.stringify(s));
  await context.close();
}

// ---------------------------------------------------------------- Scenes
{
  const { page, context, errors } = await open({ reducedMotion: "reduce" });
  await page.goto(BASE);
  await wait(300);
  const bad = [];
  for (const id of SCENES.slice(1).concat("counter")) {
    await page.locator(`.dock a[data-dock="${id}"]`).click();
    await wait(250);
    const ok = (await sceneOf(page)) === id && (await visibleHeading(page, id));
    const focused = await page.evaluate((sid) => document.activeElement === document.querySelector(`#scene-${sid} [data-scene-focus]`), id);
    const title = await page.title();
    if (!ok || !focused) bad.push(`${id}: shown=${ok} focused=${focused} title="${title}"`);
  }
  record("Scenes", "every dock link opens its scene and moves focus to its heading", bad.length === 0, bad.join("; "));
  await page.goBack();
  await wait(300);
  record("Scenes", "the back button returns to the previous scene", (await sceneOf(page)) === "visit");
  record("Console", "no errors (scene tour)", errors.length === 0, errors.join(" | "));
  await context.close();
}
{
  const { page, context } = await open();
  await page.goto(BASE + "#visit");
  await wait(200);
  record("Scenes", "a deep link (#visit) opens that scene before anything else", (await sceneOf(page)) === "visit");
  await wait(3200);
  await page.locator('.dock a[data-dock="menu"]').click();
  await wait(80);
  await page.locator('.dock a[data-dock="platters"]').click();
  await wait(2000);
  record("Scenes", "two quick clicks during a curtain wipe end on the last one", (await sceneOf(page)) === "platters", await sceneOf(page));
  await context.close();
}

// ---------------------------------------------------------------- Belt and dish sheet
{
  const { page, context } = await open();
  await page.mouse.move(5, 5);
  await page.goto(BASE);
  await wait(3600);
  const a = await beltLeft(page);
  await wait(2000);
  const b = await beltLeft(page);
  record("Belt", "the belt advances by itself", b - a > 40, `${a} → ${b}`);
  const belt = await page.locator(".belt__track").boundingBox();
  await page.mouse.move(belt.x + belt.width / 2, belt.y + belt.height / 2);
  await wait(300);
  const c = await beltLeft(page);
  await wait(1200);
  record("Belt", "hovering stops the belt", (await beltLeft(page)) === c);
  await page.mouse.move(5, 5);
  await page.locator(".belt__toggle").click();
  const d = await beltLeft(page);
  await wait(1500);
  record("Belt", "Pause the belt holds it", (await beltLeft(page)) === d && (await page.locator(".belt__toggle").getAttribute("aria-pressed")) === "true");
  await page.locator(".belt__toggle").click();

  // A drag scrolls the belt and does not open a dish.
  await page.mouse.move(belt.x + belt.width * 0.7, belt.y + belt.height / 2);
  await page.mouse.down();
  await page.mouse.move(belt.x + belt.width * 0.3, belt.y + belt.height / 2, { steps: 8 });
  await page.mouse.up();
  await wait(300);
  record("Belt", "dragging scrolls without opening a dish", (await page.locator(".sheet").count()) === 0);

  const plates = await page.evaluate(() => ({
    focusable: [...document.querySelectorAll(".plate__button")].filter((b) => b.tabIndex >= 0 && !b.closest("[aria-hidden]")).length,
    clonesHidden: [...document.querySelectorAll(".plate[aria-hidden] .plate__button")].every((b) => b.tabIndex === -1),
  }));
  record("Belt", "each dish is reachable by keyboard once (the loop copy is hidden)", plates.focusable === 22 && plates.clonesHidden, JSON.stringify(plates));

  const target = page.locator('.plate:not([aria-hidden]) .plate__button[data-dish="Godzilla"]');
  await target.focus();
  await page.keyboard.press("Enter");
  await wait(500);
  const sheetTitle = await page.locator("#sheet-title").innerText();
  await shot(page, "desktop-1440-dish-sheet");
  record("Dish sheet", "a plate opens its dish", sheetTitle.startsWith("Godzilla"), sheetTitle);
  for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
  record("Dish sheet", "Tab stays inside the sheet", await page.evaluate(() => !!document.activeElement.closest(".sheet")));
  await page.keyboard.press("Escape");
  await wait(400);
  const back = await page.evaluate(() => document.activeElement?.dataset.dish);
  record("Dish sheet", "Escape closes it and focus returns to the plate", (await page.locator(".sheet").count()) === 0 && back === "Godzilla", back);

  await target.click({ force: true });
  await wait(400);
  await page.getByRole("button", { name: "Find it on the menu" }).click();
  await wait(1300);
  const q = await page.getByRole("searchbox", { name: "Search the menu" }).inputValue();
  const found = await page.locator(".menu__panel").innerText();
  record("Dish sheet", "Find it on the menu opens the menu searched for the dish", (await sceneOf(page)) === "menu" && q === "Godzilla" && found.includes("Godzilla"), q);
  await context.close();
}

// ---------------------------------------------------------------- Menu
{
  const { page, context } = await open({ reducedMotion: "reduce" });
  await page.goto(BASE + "#menu");
  await wait(400);
  const cards = await page.evaluate(() => ({
    cards: document.querySelectorAll(".rolls .roll").length,
    photos: [...document.querySelectorAll(".rolls .roll img")].length,
  }));
  record("Menu", "45 special rolls as cards, 43 with their own photo", cards.cards === 45 && cards.photos === 43, JSON.stringify(cards));
  await page.locator(".menu__panel img").last().scrollIntoViewIfNeeded();
  await wait(600);
  const broken = await page.evaluate(() => [...document.querySelectorAll(".menu__panel img")].filter((i) => !i.complete || !i.naturalWidth).length);
  record("Menu", "all roll photos load", broken === 0, `${broken} broken`);
  const panel = () => page.locator(".menu__panel").innerText();
  await page.getByRole("tab", { name: "Bento" }).click();
  record("Menu", "tabs switch the panel", (await panel()).includes("Chicken Teriyaki Bento") && !(await panel()).includes("Godzilla"));
  await page.getByRole("tab", { name: "Bento" }).press("ArrowRight");
  record("Menu", "arrow keys move between tabs", (await page.evaluate(() => document.activeElement.textContent)) === "Kitchen");
  const search = page.getByRole("searchbox", { name: "Search the menu" });
  await search.fill("eel");
  record("Menu", "search finds dishes across categories", /dishes match/.test(await panel()) && (await panel()).includes("Eel Avocado Roll"));
  await search.fill("jalapeno");
  record("Menu", "search ignores accents", (await panel()).includes("Scorpion"));
  await search.fill("pizza burger");
  record("Menu", "empty state", (await panel()).includes("Nothing on the menu matches"));
  await page.getByRole("button", { name: "Clear the search" }).click();
  await page.locator('.dish[data-dish="Udon"], .dish[data-dish="Chicken Vegetable Udon"]').first().click();
  await wait(300);
  record("Menu", "a menu row opens the dish sheet", (await page.locator("#sheet-title").innerText()).includes("Chicken Vegetable Udon"));
  await page.keyboard.press("Escape");
  await wait(400);
  await page.getByRole("button", { name: "View the original printed menu" }).click();
  await wait(500);
  const note = await page.locator(".original__note").innerText();
  await page.locator(".original__pages img").last().scrollIntoViewIfNeeded();
  await wait(700);
  const pages = await page.evaluate(() => [...document.querySelectorAll(".original__pages img")].filter((i) => i.complete && i.naturalWidth).length);
  await page.keyboard.press("Escape");
  await wait(300);
  record("Menu", "original printed menu: labelled as a reference, 4 pages, Escape closes", /may have changed/.test(note) && pages === 4 && !(await page.evaluate(() => document.querySelector("dialog.original").open)));
  await context.close();
}

// ---------------------------------------------------------------- Platters, gallery
{
  const { page, context } = await open({ reducedMotion: "reduce" });
  await page.goto(BASE + "#platters");
  await wait(600);
  const p = await page.evaluate(() => ({
    count: document.querySelectorAll(".platter").length,
    loaded: [...document.querySelectorAll(".platter img")].filter((i) => i.complete && i.naturalWidth).length,
    tel: document.querySelector(".catering a").getAttribute("href"),
  }));
  record("Platters", "five real platters load; catering calls the restaurant", p.count === 5 && p.loaded === 5 && p.tel === "tel:+16316688188", JSON.stringify(p));
  await page.goto(BASE + "#gallery");
  await wait(500);
  const first = page.locator(".wall__button").first();
  await first.click();
  await wait(300);
  const focusClose = await page.evaluate(() => document.activeElement.classList.contains("lightbox__close"));
  await page.keyboard.press("ArrowRight");
  const count = await page.locator(".lightbox__count").innerText();
  await shot(page, "desktop-1440-lightbox");
  await page.keyboard.press("Escape");
  await wait(400);
  const returned = await page.evaluate(() => document.activeElement === document.querySelector(".wall__button"));
  record("Gallery", "16 photos; lightbox opens on Close, arrows move, Escape returns focus", (await page.locator(".wall__button").count()) === 16 && focusClose && count.startsWith("2 /") && returned, count);
  await context.close();
}

// ---------------------------------------------------------------- Hours ("open now" in New York time)
{
  const cases = [
    ["2026-10-12T15:00:00Z", "Closed now · opens tomorrow at 11 AM"],
    ["2026-10-13T14:59:00Z", "Closed now · opens today at 11 AM"],
    ["2026-10-13T15:00:00Z", "Open now · until 9 PM"],
    ["2026-10-17T01:59:00Z", "Open now · until 10 PM"],
    ["2026-10-17T02:00:00Z", "Closed now · opens tomorrow at Noon"],
    ["2026-12-21T03:30:00Z", "Closed now · opens Tuesday at 11 AM"],
  ];
  const wrong = [];
  for (const [time, expected] of cases) {
    const { page, context } = await open({ reducedMotion: "reduce", timezoneId: "America/Los_Angeles" });
    await page.clock.setFixedTime(new Date(time));
    await page.goto(BASE + "#visit");
    await wait(250);
    const text = (await page.locator(".hours__status").innerText()).trim();
    if (text !== expected) wrong.push(`${time}: "${text}" not "${expected}"`);
    await context.close();
  }
  record("Hours", "open/closed computed in New York time from a Los Angeles browser", wrong.length === 0, wrong.join(" | "));
}

// ---------------------------------------------------------------- Layout at many sizes, every scene
{
  const sizes = [[390, 844], [360, 740], [768, 1024], [1024, 768], [1280, 720], [1366, 768], [1440, 900], [1920, 1080], [2560, 1080]];
  const problems = [];
  for (const [w, h] of sizes) {
    const { page, context, errors } = await open({ width: w, height: h, reducedMotion: "reduce" });
    await page.goto(BASE);
    await wait(500);
    for (const id of SCENES) {
      await page.evaluate((sid) => (location.hash = sid), id);
      await wait(250);
      // Scroll the scene through so lazy images load.
      await page.evaluate(async (sid) => {
        const el = document.getElementById(`scene-${sid}`);
        for (let y = 0; y <= el.scrollHeight; y += el.clientHeight * 0.8) {
          el.scrollTop = y;
          await new Promise((r) => setTimeout(r, 60));
        }
        el.scrollTop = el.scrollHeight;
        await new Promise((r) => setTimeout(r, 500));
        el.scrollTop = 0;
      }, id);
      const info = await page.evaluate((sid) => {
        const scene = document.getElementById(`scene-${sid}`);
        const imgs = [...scene.querySelectorAll("img")].filter((i) => i.offsetParent !== null || i.closest(".counter__room"));
        const small = [...scene.querySelectorAll("a, button, input")]
          .filter((e) => e.offsetParent !== null && !e.closest("[aria-hidden]") && !e.closest(".sr-only"))
          .map((e) => ({ e, r: e.getBoundingClientRect() }))
          .filter(({ r }) => r.width > 0 && (r.height < 40 || r.width < 40))
          .map(({ e, r }) => `${(e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 24)} ${Math.round(r.width)}x${Math.round(r.height)}`);
        const logo = document.querySelector(".topbar .logo").getBoundingClientRect();
        const dock = document.querySelector(".dock").getBoundingClientRect();
        const heading = scene.querySelector("[data-scene-focus]").getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - innerWidth + (scene.scrollWidth - scene.clientWidth),
          broken: imgs.filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src.split("/").pop()),
          small,
          logo: logo.width > 60,
          dockOnScreen: dock.bottom <= innerHeight + 1 && dock.width > 200,
          headingClear: heading.top >= document.querySelector(".topbar").getBoundingClientRect().bottom - 30 && heading.bottom <= dock.top,
          // On the counter the whole belt, labels included, must sit above the dock on the first screen.
          beltClear:
            sid !== "counter" ||
            [...document.querySelectorAll(".plate:not([aria-hidden]) .plate__tag")]
              .map((t) => t.getBoundingClientRect())
              .filter((r) => r.right > 0 && r.left < innerWidth)
              .every((r) => r.bottom <= dock.top + 1 || r.right <= dock.left || r.left >= dock.right),
        };
      }, id);
      const issues = [];
      if (info.overflow) issues.push(`overflow ${info.overflow}`);
      if (info.broken.length) issues.push(`broken ${info.broken.join(",")}`);
      if (info.small.length) issues.push(`small ${info.small.join("; ")}`);
      if (!info.logo) issues.push("logo missing");
      if (!info.dockOnScreen) issues.push("dock off screen");
      if (!info.headingClear) issues.push("heading under the bars");
      if (!info.beltClear) issues.push("belt labels under the dock");
      if (issues.length) problems.push(`${w}x${h} ${id}: ${issues.join(", ")}`);
      if ([390, 768, 1440].includes(w)) await shot(page, `${w}-${id}`);
    }
    if (errors.length) problems.push(`${w}x${h} console: ${errors.join(" | ")}`);
    await context.close();
  }
  record("Layout", "9 sizes × 5 scenes: no overflow, no broken images, 40px targets, bars clear", problems.length === 0, problems.join(" || "));
}

// ---------------------------------------------------------------- Links and SEO
{
  const { page, context } = await open({ reducedMotion: "reduce" });
  await page.goto(BASE);
  const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => ({ href: a.href, target: a.target, rel: a.rel })));
  const origin = new URL(BASE).origin;
  const external = [...new Set(links.filter((l) => /^https?:/.test(l.href) && !l.href.startsWith(origin)).map((l) => l.href))];
  const tel = [...new Set(links.filter((l) => l.href.startsWith("tel:")).map((l) => l.href))];
  record("Links", "phone links all dial +1 631 668 8188", tel.length === 1 && tel[0] === "tel:+16316688188", tel.join(", "));
  record("Links", "new-tab links use rel=noopener", links.filter((l) => l.target === "_blank" && !/noopener/.test(l.rel)).length === 0);
  const allowed = [/^https:\/\/order\.mealkeyway\.com\/customer\/release\/index\?mid=/, /^https:\/\/www\.google\.com\/maps\//];
  record("Links", "external links are only the ordering page and Google Maps", external.every((u) => allowed.some((re) => re.test(u))), external.join(" , "));
  const ld = await page.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
  record("SEO", "Restaurant structured data, no ratings or reviews", ld["@type"] === "Restaurant" && !("aggregateRating" in ld) && !("review" in ld) && ld.openingHoursSpecification.length === 6);
  await context.close();
  const html = await (await fetch(BASE)).text();
  record("SEO", "content is prerendered HTML (menu and belt included)", html.includes("Find your next favorite") && html.includes("Shirley Roll") && html.includes("plate__button"));
}

await browser.close();
const failed = results.filter((r) => !r.pass);
fs.writeFileSync(
  path.join(outDir, "report.md"),
  [
    "# Verification report",
    "",
    `Run against ${BASE} on ${new Date().toISOString()} with Playwright Chromium (headless).`,
    "",
    `**${results.length - failed.length} of ${results.length} checks passed.**`,
    "",
    "| Group | Check | Result | Detail |",
    "| --- | --- | --- | --- |",
    ...results.map((r) => `| ${r.group} | ${r.name} | ${r.pass ? "pass" : "**FAIL**"} | ${r.detail.replace(/\|/g, "/").slice(0, 400)} |`),
    "",
    "Not covered here: real phones, Safari and iOS, screen readers, and the ordering provider's own pages.",
    "",
  ].join("\n"),
);
console.log(`\n${results.length - failed.length}/${results.length} passed. Report: verification/report.md`);
process.exit(failed.length ? 1 : 0);
