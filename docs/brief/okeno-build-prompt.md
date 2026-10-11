# Okeno Sushi — paste this prompt into Claude

Build the complete working website demo described below. Implement it, run it, inspect it, and fix it. Do not stop at a design plan. This is a sales demo for a real restaurant lead: the first screen should make the owner immediately understand the value of a professional redesign.

## Goal and original website

Redesign http://www.okenosushi.com/ into a polished, lively, appetizing, mobile-friendly restaurant website. The current website consists primarily of an Order Online text link followed by four scanned menu images. Transform that into a real browsing experience with strong photography, readable information, clear calls to action, and smooth interactions.

The site should feel custom and ready to sell to this restaurant. Elevate their presentation while accurately representing their actual food, storefront, and modest neighborhood sushi bar. Do not invent a luxury dining room, waterfront setting, cocktail program, chef biography, founding year, awards, or reservation system.

## Verified business information

- Name: Okeno Sushi.
- Location: 451 Glen Drive, Shirley, NY 11967. This is Shirley, not Southampton.
- Phone: (631) 668-8188. Use tel:+16316688188.
- Existing website's ordering destination: https://ordering.chownow.com/order/10013/locations
- A newer Google Maps owner post also links to https://order.mealkeyway.com/customer/release/index?mid=46446152716f555a75486368787758744767753937673d3d
- Check those ordering pages before selecting the final destination. Confirm that the destination visibly belongs to Okeno Sushi in Shirley. Prefer the current owner-posted link if it works and matches; otherwise use the verified existing website link. Keep the chosen URL in one configuration constant. Never build a fake checkout.
- Google Maps listing: https://www.google.com/maps/search/?api=1&query=Okeno+Sushi+451+Glen+Dr+Shirley+NY&query_place_id=ChIJi_5RpCVb6IkRGTkRnC8s4h4
- Safer directions link if place ID resolution fails: https://www.google.com/maps/dir/?api=1&destination=Okeno+Sushi+451+Glen+Dr+Shirley+NY
- Hours from the original menu: Monday closed; Tuesday–Thursday 11 AM–9 PM; Friday 11 AM–10 PM; Saturday noon–10 PM; Sunday noon–9 PM. Lunch Tuesday–Friday 11 AM–3 PM. Verify against the current official ordering page before publishing. Do not use conflicting directory hours silently.
- The original menu advertises catering for home and office. Use a call-to-inquire CTA, not an unconnected form.
- Google Maps was inspected on October 11, 2026 and showed 4.6 stars from 678 reviews. If displayed, label this a Google rating with a link; treat the count as a dated snapshot rather than live data. Do not animate the rating or invent testimonials.

## Real photos supplied with this prompt

Use the attached assets. They were downloaded from this exact restaurant's Google Maps photo gallery and visually inspected. Never substitute generic stock sushi or generated restaurant interiors.

- assets/okeno-storefront.jpg: real brick storefront with the Okeno Sushi sign. Use in the visit section; this helps customers recognize the entrance.
- assets/okeno-counter-with-rolls.jpg: real dining table, sushi plate, and wooden sushi counter with chefs in the background. Strong vertical image for the restaurant story.
- assets/okeno-rolls-on-slate.jpg: sauce-topped rolls on dark slate, with ginger and wasabi. Use for the food-led hero and a gallery tile. This is a roughly 520px-wide image, so do not stretch it across a 4K screen; use a composed split hero with a restrained image panel.
- assets/okeno-bento-platter.jpg: actual bento tray with grilled chicken, rolls, tempura, dumplings, and sashimi. Use in a menu category or gallery. Also roughly 520px wide; size appropriately.

The latter two photos are attributed to DoorDash in the Maps gallery; the counter photo is attributed to marlyn meneses. Retain source information in photo-sources.json and a readable PHOTO-CREDITS.md. Google Maps visibility does not establish commercial image rights: include a brief owner handoff note to confirm permission or replace customer/provider photos with owner-supplied originals before commercial launch. Do not put that internal handoff note into the customer-facing website.

Preserve the true plating, colors, space, signage, and food. Crop carefully; do not hallucinate wider scenes, erase identifying details, or generate dishes. Do not label an unlabeled roll photo as a particular named menu item. Suitable caption: “Rolls from Okeno Sushi.” Put assets locally in the project; do not rely on fragile Google image hotlinks.

Original menu scans are attached in reference-menu/menu1.jpg through menu4.jpg. Use them for exact menu names and ingredients. They appear on a legacy site with a 2014 copyright, so their prices may be stale. Prefer the current official ordering menu for prices. If current prices cannot be verified, omit prices and link to the ordering menu instead of presenting old prices as current. Keep the original scans accessible in an optional “Original menu” viewer, clearly labeled as a reference menu with prices subject to change.

## Art direction

Premium neighborhood sushi bar: rich charcoal (#171A17), warm ivory (#F6F1E7), restrained vermilion (#B9352B) inspired by the existing red circular logo, natural wood tones, and a small muted green accent. The food should supply most of the color.

Use a refined editorial serif for major headings with a clean sans serif for body copy and menus. Generous spacing, clear hierarchy, thin rules, confident oversized typography, and asymmetric photography. Avoid the generic startup landing-page look, endless rounded cards, purple gradients, glassmorphism, emoji icons, or excessive gold decoration. Use the existing logo if it can be cleanly extracted from their supplied menu or obtained from their official assets. Otherwise create a tasteful text wordmark using the actual restaurant name; never pretend a new symbol is their official logo.

Keep the copy warm, specific, and concise. Suggested hero: “Your next favorite roll is right here.” Eyebrow: “Okeno Sushi · Shirley, NY.” Supporting line: “Sushi, sashimi, and Japanese favorites on Glen Drive.” Primary CTA: “Order online.” Secondary: “Explore the menu.” Avoid unsupported “best in New York” or “award-winning” claims.

## Page and interaction requirements

1. Sticky desktop header with wordmark, Menu, Gallery, Visit, phone link, and a red Order Online button. Start with a clean header that gains a subtle solid background on scroll. Working accessible mobile navigation.
2. Distinctive split hero: large editorial headline and CTAs on one side, a beautifully framed real sushi image on the other. Pair with a small real counter image if the composition benefits. Do not hide important text inside the photography. Include a short Shirley location line and linked Google rating snapshot.
3. A slim service strip: “Dine in · Takeout · Catering inquiries.” Delivery may be included only if verified through the selected official ordering provider.
4. “Find your next favorite” menu preview with working category tabs and text search. Use real categories from the supplied menu/current ordering site. Include sushi and sashimi, rolls, bento, and kitchen dishes only where verified. Render items as real HTML text, with exact names and verified descriptions. Include a graceful empty-results state. Do not claim featured dishes are bestsellers unless there is direct evidence.
5. Editorial story section using the real counter photo. Keep it short: a neighborhood restaurant on Glen Drive, a small sushi counter, and Japanese favorites. No fictional origin story.
6. Curated food-and-place gallery using all four supplied photos with varied proportions. Working accessible lightbox with captions, next/previous controls, Escape to close, correct focus handling, and touch support. Do not repeat images until the page feels padded.
7. Visit section with the real storefront image, exact address, readable weekly hours, call button, and working directions link. A real location map embed is optional; never show a decorative fake map. If adding “Open now,” calculate using America/New_York and explicitly account for overnight boundaries; otherwise simply show the weekly schedule.
8. Catering section with concise copy and “Call about catering” using the verified phone number.
9. Strong final order CTA and complete footer with address, phone, hours, menu link, and Maps link. No invented social accounts.
10. Mobile bottom action bar with Order, Call, and Directions. Respect safe-area insets and leave enough bottom spacing so it never covers content.

## Make it feel alive

Use intentional motion throughout the website, not just one animated headline:

- Hero text and image enter with a coordinated sequence, roughly 500–700ms and small stagger delays. Text remains readable immediately if animation fails.
- Subtle slow image scale from 1.02 to 1.06 within a clipped frame. Pause it for reduced-motion users; no fabricated video or fake steam.
- Section reveal transitions with 16–24px movement and 400–600ms duration, triggered once. Avoid making entire sections invisible until JavaScript loads.
- Image hover zoom around 1.035, smooth CTA feedback, and animated category indicator.
- Smooth lightbox and mobile-navigation transitions.
- Optional gentle desktop image parallax capped at about 20px; disable on touch devices and reduced motion.

Respect prefers-reduced-motion, keyboard access, readable contrast, and touch targets of at least 44px. No autoplay sound, loading intro, scroll hijacking, custom cursor, aggressive looping, or distracting floating sushi graphics.

## Implementation and acceptance

Use the existing project stack if one exists. Otherwise use React, TypeScript, Vite, and a straightforward CSS system. Use Framer Motion only if helpful and available. Organize business facts, menu data, image data, and links so an owner can update them easily. Avoid unnecessary backend services.

Optimize image sizes, use lazy loading below the fold, specify image dimensions, and keep the hero fast. Add accurate page title and description, favicon, semantic headings, alt text, and Restaurant structured data limited to verified facts. No keyword stuffing or invented aggregate reviews.

Run the build and inspect at 390px, 768px, and 1440px. Verify no horizontal overflow, cropped CTAs, unreadable text, broken images, dead controls, invalid links, or obscured content. Test menu filtering, search, mobile navigation, keyboard lightbox behavior, and all external action links. Inspect the rendered demo and correct layout issues before delivering it.

Deliver the runnable source, a preview link if your environment supports it, screenshots of desktop and mobile, PHOTO-CREDITS.md, and a short owner handoff covering only remaining verification items. Do not claim deployment, bookings, checkout, or integrations work unless verified.

Finish with a concise “What improved” list based on what you actually implemented:

- Scanned menu pages → readable, searchable menu sections.
- Plain ordering link → prominent ordering CTAs and mobile quick actions.
- Menu-only presentation → real food, counter, and storefront photography.
- Static page → smooth transitions, interactive gallery, and responsive navigation.
- Information inside images → clear address, hours, phone, and directions.

Keep that comparison in the handoff message or README, not in the restaurant's customer-facing page. Be honest about any partial implementation. The result should be a compelling restaurant demo the owner can explore immediately.
