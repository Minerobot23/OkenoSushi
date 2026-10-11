// Browser verification of the production build (Cinematic Demo Playbook phase 8, plus the
// Okeno brief's acceptance checks). Serve the build first, then run this:
//
//   npm run build && npm run preview          (in one terminal)
//   npm run verify                             (in another; BASE=http://localhost:4173 by default)
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
fs.mkdirSync(shots, { recursive: true });

const results = [];
const record = (group, name, pass, detail = "") => {
  results.push({ group, name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${group} / ${name}${detail ? `  (${detail})` : ""}`);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();

/** A fresh page that records console errors from the site's own code. */
async function open({ width = 1440, height = 900, reducedMotion = "no-preference", init, timezoneId, route } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion, timezoneId });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  if (init) await page.addInitScript(init);
  if (route) await route(page);
  return { page, context, errors };
}
const filmState = (page) =>
  page.evaluate(() => {
    const v = document.querySelector(".arrival video");
    return v ? { t: v.currentTime, paused: v.paused, src: v.currentSrc, ended: v.ended } : null;
  });
const spotCount = (page) => page.locator(".scene .hotspot").count();

// ---------------------------------------------------------------- Film (playbook phase 8)
{
  const { page, context, errors } = await open();
  await page.goto(BASE);
  await wait(3000);
  const s = await filmState(page);
  record("Film", "plays after 3 s", !!s && s.t > 1.5 && !s.paused, s ? `t=${s.t.toFixed(2)} ${s.src.split("/").pop()}` : "no video");

  // Real-time playback: currentTime tracks the clock.
  const samples = [];
  for (let i = 0; i < 3; i++) {
    const st = await filmState(page);
    if (st) samples.push(st.t);
    await wait(2000);
  }
  const rate = samples.length > 1 ? (samples.at(-1) - samples[0]) / (2 * (samples.length - 1)) : 0;
  record("Film", "plays in real time", rate > 0.85 && rate < 1.15, `rate ${rate.toFixed(2)}x, samples ${samples.map((t) => t.toFixed(1)).join(", ")}`);

  await page.waitForFunction(() => !document.querySelector(".arrival video"), null, { timeout: 15000 }).catch(() => {});
  const spots = await spotCount(page);
  record("Film", "plays to the end, hands over to the scene", spots === 4 && !(await filmState(page)), `${spots} hotspots`);
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(shots, "desktop-1440-scene.jpg"), type: "jpeg", quality: 80 });
  record("Console", "no errors (desktop film run)", errors.length === 0, errors.join(" | "));
  await context.close();
}

// Right file per screen: tall cut on phones and the desktop split hero, wide cut on tablets.
for (const [w, h, cut] of [
  [390, 844, "tall"],
  [768, 1024, "wide"],
  [1440, 900, "tall"],
  [2560, 1080, "wide"],
]) {
  const { page, context } = await open({ width: w, height: h });
  await page.goto(BASE);
  await wait(2500);
  const s = await filmState(page);
  record("Film", `${w}px gets the ${cut} cut`, !!s && s.src.includes(`arrival-${cut}.`), s ? s.src.split("/").pop() : "no video");
  await page.screenshot({ path: path.join(shots, `film-${w}.jpg`), type: "jpeg", quality: 80 });
  await context.close();
}

// Pause and resume.
{
  const { page, context } = await open();
  await page.goto(BASE);
  await wait(2000);
  await page.getByRole("button", { name: "Pause" }).click();
  const a = (await filmState(page)).t;
  await wait(1500);
  const b = (await filmState(page)).t;
  await page.getByRole("button", { name: "Play" }).click();
  await wait(1500);
  const c = (await filmState(page)).t;
  record("Film", "pause holds, play resumes", Math.abs(b - a) < 0.05 && c > b + 0.8, `${a.toFixed(2)} → ${b.toFixed(2)} → ${c.toFixed(2)}`);
  await context.close();
}

// Skip, then replay.
{
  const { page, context } = await open();
  await page.goto(BASE);
  await wait(2000);
  await page.getByRole("button", { name: /^Skip/ }).click();
  await wait(700);
  const gone = !(await filmState(page));
  record("Film", "Skip at 2 s opens the scene", gone && (await spotCount(page)) === 4);
  await page.getByRole("button", { name: /Replay the arrival/ }).click();
  await wait(2000);
  const s = await filmState(page);
  record("Film", "Replay restarts the film", !!s && s.t > 0.8 && !s.paused, s ? `t=${s.t.toFixed(2)}` : "no video");
  await context.close();
}

// Navigation during the film: a destination stays open after the film ends.
{
  const { page, context } = await open();
  await page.goto(BASE);
  await wait(2000);
  await page.locator(".header__nav").getByRole("link", { name: "Menu" }).click();
  await wait(11000);
  const top = await page.evaluate(() => document.getElementById("menu").getBoundingClientRect().top);
  record("Film", "navigation during the film is not undone", Math.abs(top) < 120, `menu top at ${Math.round(top)}px after the film ended`);
  await context.close();
}

// Reduced motion: no film, scene at once, no replay control.
{
  const { page, context } = await open({ reducedMotion: "reduce" });
  await page.goto(BASE);
  await wait(800);
  const video = await page.locator("video").count();
  const replay = await page.getByRole("button", { name: /Replay/ }).count();
  record("Film", "reduced motion: no film, scene at once", video === 0 && (await spotCount(page)) === 4 && replay === 0, `video=${video} replay=${replay}`);
  await context.close();
}

// Film file blocked.
{
  const { page, context } = await open({
    route: (p) => p.route(/\.(webm|mp4)$/, (r) => r.abort()),
  });
  await page.goto(BASE);
  await wait(2500);
  record("Film", "blocked film file falls through to the scene", (await spotCount(page)) === 4 && !(await filmState(page)));
  await context.close();
}

// No animation frames: still reaches the scene, and the hero text is visible.
{
  const { page, context } = await open({ init: () => (window.requestAnimationFrame = () => 0) });
  await page.goto(BASE);
  await wait(12500);
  const opacity = await page.evaluate(() => getComputedStyle(document.querySelector(".hero__title")).opacity);
  record("Film", "no requestAnimationFrame: scene still reached", (await spotCount(page)) === 4, `hero title opacity ${opacity}`);
  record("Hero", "headline visible without animation frames", opacity === "1");
  await context.close();
}

// ---------------------------------------------------------------- Hotspot audit (appendix G, adapted)
{
  const sizes = [
    [1024, 768], [1280, 720], [1366, 768], [1440, 900], [1536, 864], [1920, 1080], [2560, 1080], [768, 1024], [390, 844], [360, 740], [820, 1180],
  ];
  const problems = [];
  for (const [w, h] of sizes) {
    const { page, context } = await open({ width: w, height: h, reducedMotion: "reduce" });
    await page.goto(BASE);
    await wait(900);
    const res = await page.evaluate(() => {
      const frame = document.querySelector(".arrival").getBoundingClientRect();
      const vw = window.innerWidth;
      const bad = [];
      const boxes = [];
      for (const a of document.querySelectorAll(".scene .hotspot")) {
        const dot = a.getBoundingClientRect();
        const label = a.querySelector(".hotspot__label");
        const r = label.getBoundingClientRect();
        const name = label.textContent;
        if (dot.left < frame.left || dot.right > frame.right || dot.top < frame.top || dot.bottom > frame.bottom) bad.push(`${name}: dot outside the frame`);
        if (r.left < Math.max(frame.left, 0) + 4 || r.right > Math.min(frame.right, vw) - 4 || r.top < frame.top) bad.push(`${name}: label clipped [${Math.round(r.left)}..${Math.round(r.right)}]`);
        if (dot.width < 44 || dot.height < 44) bad.push(`${name}: target ${Math.round(dot.width)}x${Math.round(dot.height)}`);
        boxes.push({ name, r, dot });
      }
      for (let i = 0; i < boxes.length; i++)
        for (let j = 0; j < boxes.length; j++) {
          if (i === j) continue;
          const a = boxes[i].r, b = boxes[j].r, d = boxes[j].dot;
          const overlap = (x, y) => x.left < y.right && x.right > y.left && x.top < y.bottom && x.bottom > y.top;
          if (i < j && overlap(a, b)) bad.push(`${boxes[i].name} label overlaps ${boxes[j].name} label`);
          if (overlap(a, { left: d.left + 12, right: d.right - 12, top: d.top + 12, bottom: d.bottom - 12 })) bad.push(`${boxes[i].name} label covers ${boxes[j].name} dot`);
        }
      return { count: boxes.length, bad };
    });
    if (res.count !== 4 || res.bad.length) problems.push(`${w}x${h}: ${res.count} spots; ${res.bad.join(", ")}`);
    await context.close();
  }
  record("Hotspots", "audit at 11 sizes: on screen, unclipped, apart, 44px targets", problems.length === 0, problems.join(" || "));
}

// ---------------------------------------------------------------- Layout and content per width
for (const [w, h, name] of [
  [390, 844, "mobile-390"],
  [768, 1024, "tablet-768"],
  [1440, 900, "desktop-1440"],
]) {
  const { page, context, errors } = await open({ width: w, height: h, reducedMotion: "reduce" });
  await page.goto(BASE);
  await wait(600);
  await page.screenshot({ path: path.join(shots, `${name}-first-screen.jpg`), type: "jpeg", quality: 80 });
  // Scroll through so lazy images load.
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += Math.round(h * 0.7)) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
    await wait(80);
  }
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await wait(1200);
  const info = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")].filter((i) => !i.closest("dialog") && i.offsetParent !== null);
    const broken = imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
    const missingSize = imgs.filter((i) => !i.getAttribute("width") && !i.classList.contains("film__frame")).map((i) => i.src);
    const missingAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).map((i) => i.src);
    const ids = new Set([...document.querySelectorAll("[id]")].map((e) => e.id));
    const deadAnchors = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href")).filter((h) => h.length > 1 && !ids.has(h.slice(1)));
    const small = [...document.querySelectorAll("a, button, input")]
      .filter((e) => e.offsetParent !== null && !e.closest(".sr-only") && !e.classList.contains("skip-link"))
      .map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && (r.height < 40 || r.width < 40))
      .map(({ e, r }) => `${(e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    const bar = document.querySelector(".mobile-bar");
    const barTop = bar && getComputedStyle(bar).display !== "none" ? bar.getBoundingClientRect().top : window.innerHeight;
    const lastText = [...document.querySelectorAll(".footer__base p")].at(-1).getBoundingClientRect().bottom;
    const headings = [...document.querySelectorAll("h1, h2, h3")].map((h) => h.tagName);
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      broken,
      missingSize,
      missingAlt,
      deadAnchors,
      small,
      coveredByBar: lastText > barTop + 1,
      h1: headings.filter((t) => t === "H1").length,
    };
  });
  record(`Layout ${w}`, "no horizontal overflow", info.overflow === 0, `${info.overflow}px`);
  record(`Layout ${w}`, "no broken images", info.broken.length === 0, info.broken.join(", "));
  record(`Layout ${w}`, "images have alt text and dimensions", info.missingAlt.length === 0 && info.missingSize.length === 0, [...info.missingAlt, ...info.missingSize].join(", "));
  record(`Layout ${w}`, "every in-page link has a target", info.deadAnchors.length === 0, info.deadAnchors.join(", "));
  record(`Layout ${w}`, "touch targets at least 40px", info.small.length === 0, info.small.join("; "));
  record(`Layout ${w}`, "mobile bar never covers the end of the page", !info.coveredByBar);
  record(`Layout ${w}`, "exactly one h1", info.h1 === 1);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await wait(300);
  await page.screenshot({ path: path.join(shots, `${name}-full.jpg`), type: "jpeg", quality: 80, fullPage: true });
  record(`Console ${w}`, "no errors", errors.length === 0, errors.join(" | "));
  await context.close();
}

// ---------------------------------------------------------------- Menu
{
  const { page, context } = await open({ reducedMotion: "reduce" });
  await page.goto(BASE + "#menu");
  await wait(500);
  const panelText = () => page.locator(".menu__panel").innerText();
  await page.getByRole("tab", { name: "Bento" }).click();
  const bento = await panelText();
  record("Menu", "tab switches the panel", bento.includes("Chicken Teriyaki Bento") && !bento.includes("Godzilla"));
  await page.getByRole("tab", { name: "Bento" }).press("ArrowRight");
  const focused = await page.evaluate(() => document.activeElement.textContent);
  record("Menu", "arrow keys move between tabs", focused === "Kitchen" && (await panelText()).includes("Udon"), `focused ${focused}`);
  const search = page.getByRole("searchbox", { name: "Search the menu" });
  await search.fill("eel");
  await wait(200);
  const results = await panelText();
  record("Menu", "search finds dishes across categories", /dishes match/.test(results) && results.includes("Godzilla") && results.includes("Eel Avocado Roll"), results.split("\n")[0]);
  await search.fill("jalapeno");
  record("Menu", "search ignores accents", (await panelText()).includes("Scorpion"));
  await search.fill("pizza burger");
  await wait(200);
  record("Menu", "empty state", (await panelText()).includes("Nothing on the menu matches"));
  await page.getByRole("button", { name: "Clear the search" }).click();
  record("Menu", "clearing the search restores the tab", (await panelText()).includes("Udon"));
  await page.getByRole("tab", { name: "Special rolls" }).click();
  const before = await page.locator(".menu__panel .dish:visible").count();
  await page.getByRole("button", { name: /Show all 45/ }).click();
  const after = await page.locator(".menu__panel .dish:visible").count();
  record("Menu", "Show all expands the preview", before === 12 && after === 45, `${before} → ${after}`);
  await page.locator(".menu").screenshot({ path: path.join(shots, "menu-desktop.jpg"), type: "jpeg", quality: 80 });
  await context.close();
}

// ---------------------------------------------------------------- Mobile navigation
{
  const { page, context } = await open({ width: 390, height: 844, reducedMotion: "reduce" });
  await page.goto(BASE);
  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  await wait(400);
  const inPanel = await page.evaluate(() => !!document.activeElement.closest("#mobile-nav"));
  await page.screenshot({ path: path.join(shots, "mobile-nav-open.jpg"), type: "jpeg", quality: 80 });
  await page.keyboard.press("Escape");
  await wait(400);
  const back = await page.evaluate(() => document.activeElement.classList.contains("header__toggle"));
  const hidden = await page.evaluate(() => getComputedStyle(document.getElementById("mobile-nav")).visibility);
  record("Mobile nav", "opens, focuses the panel, Escape closes and returns focus", inPanel && back && hidden === "hidden");
  await toggle.click();
  await wait(300);
  await page.locator("#mobile-nav").getByRole("link", { name: "Visit" }).click();
  await wait(1200);
  const top = await page.evaluate(() => document.getElementById("visit").getBoundingClientRect().top);
  const closed = await page.evaluate(() => !document.querySelector(".header").classList.contains("is-open"));
  record("Mobile nav", "a link closes the menu and goes to the section", closed && Math.abs(top) < 120, `visit top ${Math.round(top)}`);
  await context.close();
}

// ---------------------------------------------------------------- Lightbox
{
  const { page, context } = await open({ reducedMotion: "reduce" });
  await page.goto(BASE + "#gallery");
  await wait(400);
  const first = page.locator(".gallery__button").first();
  await first.click();
  await wait(300);
  const dialog = page.getByRole("dialog", { name: "Photos of Okeno Sushi" });
  const focusClose = await page.evaluate(() => document.activeElement.classList.contains("lightbox__close"));
  await page.keyboard.press("ArrowRight");
  const count = await page.locator(".lightbox__count").innerText();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const trapped = await page.evaluate(() => !!document.activeElement.closest(".lightbox"));
  await page.screenshot({ path: path.join(shots, "lightbox.jpg"), type: "jpeg", quality: 80 });
  await page.keyboard.press("Escape");
  await wait(400);
  const closed = (await dialog.count()) === 0;
  const returned = await page.evaluate(() => document.activeElement === document.querySelector(".gallery__button"));
  record("Lightbox", "opens with focus on Close, arrows move, Tab is trapped", focusClose && count.startsWith("2 /") && trapped, count);
  record("Lightbox", "Escape closes and focus returns to the photo", closed && returned);
  // Touch swipe.
  await first.click();
  await wait(300);
  const fig = await page.locator(".lightbox__figure").boundingBox();
  await page.mouse.move(fig.x + fig.width * 0.75, fig.y + fig.height / 2);
  await page.mouse.down();
  await page.mouse.move(fig.x + fig.width * 0.2, fig.y + fig.height / 2, { steps: 5 });
  await page.mouse.up();
  record("Lightbox", "swipe moves to the next photo", (await page.locator(".lightbox__count").innerText()).startsWith("2 /"));
  await context.close();
}

// ---------------------------------------------------------------- Original menu viewer
{
  const { page, context } = await open({ reducedMotion: "reduce" });
  await page.goto(BASE + "#menu");
  await page.getByRole("button", { name: "View the original printed menu" }).click();
  await wait(500);
  const open1 = await page.evaluate(() => document.querySelector("dialog.original").open);
  const note = await page.locator(".original__note").innerText();
  await page.locator(".original__pages img").last().scrollIntoViewIfNeeded();
  await wait(800);
  const loaded = await page.evaluate(() => [...document.querySelectorAll(".original__pages img")].filter((i) => i.complete && i.naturalWidth > 0).length);
  await page.keyboard.press("Escape");
  await wait(300);
  const open2 = await page.evaluate(() => document.querySelector("dialog.original").open);
  record("Original menu", "opens labelled as a reference, shows 4 pages, Escape closes", open1 && /may have changed/.test(note) && loaded === 4 && !open2, `${loaded} pages`);
  await context.close();
}

// ---------------------------------------------------------------- Hours and "open now" (America/New_York)
{
  const cases = [
    ["2026-10-12T15:00:00Z", "Closed now · opens tomorrow at 11 AM"], // Monday 11:00 ET
    ["2026-10-13T14:59:00Z", "Closed now · opens today at 11 AM"], // Tuesday 10:59 ET
    ["2026-10-13T15:00:00Z", "Open now · until 9 PM"], // Tuesday 11:00 ET
    ["2026-10-17T01:59:00Z", "Open now · until 10 PM"], // Friday 21:59 ET
    ["2026-10-17T02:00:00Z", "Closed now · opens tomorrow at Noon"], // Friday 22:00 ET
    ["2026-12-21T03:30:00Z", "Closed now · opens Tuesday at 11 AM"], // Sunday 22:30 EST (winter time)
  ];
  const wrong = [];
  for (const [time, expected] of cases) {
    const { page, context } = await open({ reducedMotion: "reduce", timezoneId: "America/Los_Angeles" });
    await page.clock.setFixedTime(new Date(time));
    await page.goto(BASE + "#visit");
    await wait(300);
    const text = await page.locator(".hours__status").innerText();
    if (text.trim() !== expected) wrong.push(`${time}: got "${text}", expected "${expected}"`);
    await context.close();
  }
  record("Hours", "open/closed computed in New York time from a Los Angeles browser", wrong.length === 0, wrong.join(" | "));
}

// ---------------------------------------------------------------- Links
{
  const { page, context } = await open({ reducedMotion: "reduce" });
  await page.goto(BASE);
  const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => ({ href: a.href, target: a.target, rel: a.rel })));
  const external = [...new Set(links.filter((l) => /^https?:/.test(l.href) && !l.href.startsWith(new URL(BASE).origin)).map((l) => l.href))];
  const tel = [...new Set(links.filter((l) => l.href.startsWith("tel:")).map((l) => l.href))];
  const unsafe = links.filter((l) => l.target === "_blank" && !/noopener/.test(l.rel));
  record("Links", "phone links all dial +1 631 668 8188", tel.length === 1 && tel[0] === "tel:+16316688188", tel.join(", "));
  record("Links", "new-tab links use rel=noopener", unsafe.length === 0);
  const allowed = [/^https:\/\/order\.mealkeyway\.com\/customer\/release\/index\?mid=/, /^https:\/\/www\.google\.com\/maps\//];
  const unknown = external.filter((u) => !allowed.some((re) => re.test(u)));
  record("Links", "external links are only the ordering page and Google Maps", unknown.length === 0, external.join(" , "));
  fs.writeFileSync(path.join(outDir, "external-links.txt"), external.join("\n") + "\n");
  const ld = await page.evaluate(() => JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent));
  record("SEO", "Restaurant structured data, no ratings or reviews", ld["@type"] === "Restaurant" && !("aggregateRating" in ld) && !("review" in ld) && ld.openingHoursSpecification.length === 6);
  const meta = await page.evaluate(() => ({ title: document.title, desc: document.querySelector('meta[name="description"]').content, icon: !!document.querySelector('link[rel="icon"]') }));
  record("SEO", "title, description and favicon", meta.title.includes("Okeno Sushi") && meta.desc.length > 80 && meta.icon, meta.title);
  await context.close();
}

// Menu text is in the HTML before any script runs (prerendered).
{
  const html = await (await fetch(BASE)).text();
  record("SEO", "page content is prerendered HTML (menu included)", html.includes("Find your next favorite") && html.includes("Shirley Roll") && html.includes("Your next favorite roll"));
}

await browser.close();

const failed = results.filter((r) => !r.pass);
const lines = [
  "# Verification report",
  "",
  `Run against ${BASE} on ${new Date().toISOString()} with Playwright Chromium (headless).`,
  "",
  `**${results.length - failed.length} of ${results.length} checks passed.**`,
  "",
  "| Group | Check | Result | Detail |",
  "| --- | --- | --- | --- |",
  ...results.map((r) => `| ${r.group} | ${r.name} | ${r.pass ? "pass" : "**FAIL**"} | ${r.detail.replace(/\|/g, "/")} |`),
  "",
  "Not covered here: real phones, Safari (it will receive the H.264 MP4; headless Chromium played the VP9 WebM), screen readers, and the ordering provider's own pages.",
  "",
];
fs.writeFileSync(path.join(outDir, "report.md"), lines.join("\n"));
console.log(`\n${results.length - failed.length}/${results.length} passed. Report: verification/report.md`);
process.exit(failed.length ? 1 : 0);
