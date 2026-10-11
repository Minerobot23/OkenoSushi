# Verification report

Run against http://localhost:4173/ on 2026-10-11T21:41:47.539Z with Playwright Chromium (headless).

**61 of 61 checks passed.**

| Group | Check | Result | Detail |
| --- | --- | --- | --- |
| Film | plays after 3 s | pass | t=3.01 arrival-tall.webm |
| Film | plays in real time | pass | rate 1.00x, samples 3.0, 5.0, 7.0 |
| Film | plays to the end, hands over to the scene | pass | 4 hotspots |
| Console | no errors (desktop film run) | pass |  |
| Film | 390px gets the tall cut | pass | arrival-tall.webm |
| Film | 768px gets the wide cut | pass | arrival-wide.webm |
| Film | 1440px gets the tall cut | pass | arrival-tall.webm |
| Film | 2560px gets the wide cut | pass | arrival-wide.webm |
| Film | pause holds, play resumes | pass | 2.08 → 2.08 → 3.59 |
| Film | Skip at 2 s opens the scene | pass |  |
| Film | Replay restarts the film | pass | t=1.98 |
| Film | navigation during the film is not undone | pass | menu top at 84px after the film ended |
| Film | reduced motion: no film, scene at once | pass | video=0 replay=0 |
| Film | blocked film file falls through to the scene | pass |  |
| Film | no requestAnimationFrame: scene still reached | pass | hero title opacity 1 |
| Hero | headline visible without animation frames | pass |  |
| Hotspots | audit at 11 sizes: on screen, unclipped, apart, 44px targets | pass |  |
| Layout 390 | no horizontal overflow | pass | 0px |
| Layout 390 | no broken images | pass |  |
| Layout 390 | images have alt text and dimensions | pass |  |
| Layout 390 | every in-page link has a target | pass |  |
| Layout 390 | touch targets at least 40px | pass |  |
| Layout 390 | mobile bar never covers the end of the page | pass |  |
| Layout 390 | exactly one h1 | pass |  |
| Console 390 | no errors | pass |  |
| Layout 768 | no horizontal overflow | pass | 0px |
| Layout 768 | no broken images | pass |  |
| Layout 768 | images have alt text and dimensions | pass |  |
| Layout 768 | every in-page link has a target | pass |  |
| Layout 768 | touch targets at least 40px | pass |  |
| Layout 768 | mobile bar never covers the end of the page | pass |  |
| Layout 768 | exactly one h1 | pass |  |
| Console 768 | no errors | pass |  |
| Layout 1440 | no horizontal overflow | pass | 0px |
| Layout 1440 | no broken images | pass |  |
| Layout 1440 | images have alt text and dimensions | pass |  |
| Layout 1440 | every in-page link has a target | pass |  |
| Layout 1440 | touch targets at least 40px | pass |  |
| Layout 1440 | mobile bar never covers the end of the page | pass |  |
| Layout 1440 | exactly one h1 | pass |  |
| Console 1440 | no errors | pass |  |
| Menu | tab switches the panel | pass |  |
| Menu | arrow keys move between tabs | pass | focused Kitchen |
| Menu | search finds dishes across categories | pass | 17 dishes match “eel” |
| Menu | search ignores accents | pass |  |
| Menu | empty state | pass |  |
| Menu | clearing the search restores the tab | pass |  |
| Menu | Show all expands the preview | pass | 12 → 45 |
| Mobile nav | opens, focuses the panel, Escape closes and returns focus | pass |  |
| Mobile nav | a link closes the menu and goes to the section | pass | visit top 72 |
| Lightbox | opens with focus on Close, arrows move, Tab is trapped | pass | 2 / 4 |
| Lightbox | Escape closes and focus returns to the photo | pass |  |
| Lightbox | swipe moves to the next photo | pass |  |
| Original menu | opens labelled as a reference, shows 4 pages, Escape closes | pass | 4 pages |
| Hours | open/closed computed in New York time from a Los Angeles browser | pass |  |
| Links | phone links all dial +1 631 668 8188 | pass | tel:+16316688188 |
| Links | new-tab links use rel=noopener | pass |  |
| Links | external links are only the ordering page and Google Maps | pass | https://order.mealkeyway.com/customer/release/index?mid=46446152716f555a75486368787758744767753937673d3d , https://www.google.com/maps/dir/?api=1&destination=Okeno+Sushi+451+Glen+Dr+Shirley+NY , https://www.google.com/maps/search/?api=1&query=Okeno+Sushi+451+Glen+Dr+Shirley+NY&query_place_id=ChIJi_5RpCVb6IkRGTkRnC8s4h4 |
| SEO | Restaurant structured data, no ratings or reviews | pass |  |
| SEO | title, description and favicon | pass | Okeno Sushi / Sushi & Japanese food on Glen Drive, Shirley, NY |
| SEO | page content is prerendered HTML (menu included) | pass |  |

Not covered here: real phones, Safari (it will receive the H.264 MP4; headless Chromium played the VP9 WebM), screen readers, and the ordering provider's own pages.
