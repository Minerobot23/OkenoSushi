# Owner handoff: confirm before launch

The demo is built and runs locally. These items still need the restaurant's confirmation before
the site goes public.

1. **Ordering link.** Every "Order online" button goes to the MealKeyway / MenuSifu ordering page
   the owner posted on Google Maps (`ORDER_URL` in `src/data/business.ts`). On Sunday, October 11,
   2026 at 4:58 PM ET (inside posted hours), that page loaded with the right name, address and menu,
   but it said **"Our online ordering is temporarily unavailable."** Confirm that it is the ordering
   system the restaurant uses now and that it takes orders. The old website's ChowNow link
   (`https://ordering.chownow.com/order/10013/locations`) could not be checked: it blocked our test
   browser. If it is retired, remove it from the old site too.
2. **Prices.** They come from the online-ordering menu as of October 11, 2026, and the page says
   they may change. Confirm, or update `src/data/menu.json`.
3. **Hours.** Mon closed; Tue–Thu 11 AM–9 PM; Fri 11 AM–10 PM; Sat noon–10 PM; Sun noon–9 PM. Lunch
   specials Tue–Fri 11 AM–3 PM, excluding holidays. These come from the printed menu and match the
   ordering page's pickup windows. Confirm, and say whether holiday hours should be shown.
4. **Catering.** The printed menu advertised catering for home and office. The page invites people
   to call about it and does not promise it. Confirm it is still offered.
5. **Photo permission.** The four photos are from the restaurant's Google Maps gallery:
   - the counter photo is by a customer (marlyn meneses);
   - two food photos are attributed to DoorDash;
   - the storefront photo's uploader is unknown.

   Being visible on Google Maps does not grant commercial rights. Before launch, get permission or
   replace them with the owner's own photos. Drop-in replacements need the same file names and
   sizes; see `PHOTO-CREDITS.md`.
6. **Logo.** It was traced from the printed menu. If the owner has the original vector logo, use
   that instead (`src/data/logo.json`).
7. **Google rating.** "4.6 · 678 reviews" is a snapshot from October 11, 2026, labelled with that
   date. Update it now and then, or remove it (`GOOGLE_RATING` in `src/data/business.ts`).
8. **Delivery.** It is not mentioned because it was not verified. Add it only if the restaurant
   offers it through its own ordering page.
9. **Arrival film.** It is a camera move over the storefront photo, so it shares that photo's
   permission status (item 5). A 10–15 second phone clip of walking up to the door, filmed by the
   owner, can replace it without code changes; see `media/README.md`.
10. **Domain and hosting.** Nothing is deployed. Choose where it goes and when.
