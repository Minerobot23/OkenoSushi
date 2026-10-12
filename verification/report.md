# Verification report

Run against http://localhost:4173/ on 2026-10-12T13:08:05.700Z with Playwright Chromium (headless).

**42 of 42 checks passed.**

| Group | Check | Result | Detail |
| --- | --- | --- | --- |
| Arrival | noren arrival runs and ends by itself | pass | {"arrive":false,"noren":"hidden","title":"1"} |
| Console | no errors (desktop arrival) | pass |  |
| Arrival | a click skips the arrival | pass |  |
| Arrival | the dock works during the arrival | pass |  |
| Arrival | reduced motion: no arrival at all | pass | {"arrive":false,"noren":"none"} |
| Belt | reduced motion: the belt does not move by itself | pass |  |
| Belt | reduced motion: no pause control is needed | pass |  |
| Arrival | no animation frames: arrival still ends, headline visible | pass | {"arrive":false,"title":"1"} |
| Scenes | no animation frames: scenes still switch | pass |  |
| Fallback | without JavaScript every scene is readable as one page | pass | {"scenes":5,"menuText":true,"hours":true} |
| Scenes | every dock link opens its scene and moves focus to its heading | pass |  |
| Scenes | the back button returns to the previous scene | pass |  |
| Console | no errors (scene tour) | pass |  |
| Scenes | a deep link (#visit) opens that scene before anything else | pass |  |
| Scenes | two quick clicks during a curtain wipe end on the last one | pass | platters |
| Belt | the belt advances by itself | pass | 135 → 210 |
| Belt | hovering stops the belt | pass |  |
| Belt | Pause the belt holds it | pass |  |
| Belt | dragging scrolls without opening a dish | pass |  |
| Belt | each dish is reachable by keyboard once (the loop copy is hidden) | pass | {"focusable":22,"clonesHidden":true} |
| Dish sheet | a plate opens its dish | pass | Godzilla |
| Dish sheet | Tab stays inside the sheet | pass |  |
| Dish sheet | Escape closes it and focus returns to the plate | pass | Godzilla |
| Dish sheet | Find it on the menu opens the menu searched for the dish | pass | Godzilla |
| Menu | 45 special rolls as cards, 43 with their own photo | pass | {"cards":45,"photos":43} |
| Menu | all roll photos load | pass | 0 broken |
| Menu | tabs switch the panel | pass |  |
| Menu | arrow keys move between tabs | pass |  |
| Menu | search finds dishes across categories | pass |  |
| Menu | search ignores accents | pass |  |
| Menu | empty state | pass |  |
| Menu | a menu row opens the dish sheet | pass |  |
| Menu | original printed menu: labelled as a reference, 4 pages, Escape closes | pass |  |
| Platters | five real platters load; catering calls the restaurant | pass | {"count":5,"loaded":5,"tel":"tel:+16316688188"} |
| Gallery | 16 photos; lightbox opens on Close, arrows move, Escape returns focus | pass | 2 / 16 |
| Hours | open/closed computed in New York time from a Los Angeles browser | pass |  |
| Layout | 9 sizes × 5 scenes: no overflow, no broken images, 40px targets, bars clear | pass |  |
| Links | phone links all dial +1 631 668 8188 | pass | tel:+16316688188 |
| Links | new-tab links use rel=noopener | pass |  |
| Links | external links are only the ordering page and Google Maps | pass | https://order.mealkeyway.com/customer/release/index?mid=46446152716f555a75486368787758744767753937673d3d , https://www.google.com/maps/search/?api=1&query=Okeno+Sushi+451+Glen+Dr+Shirley+NY&query_place_id=ChIJi_5RpCVb6IkRGTkRnC8s4h4 , https://www.google.com/maps/dir/?api=1&destination=Okeno+Sushi+451+Glen+Dr+Shirley+NY |
| SEO | Restaurant structured data, no ratings or reviews | pass |  |
| SEO | content is prerendered HTML (menu and belt included) | pass |  |

Not covered here: real phones, Safari and iOS, screen readers, and the ordering provider's own pages.
