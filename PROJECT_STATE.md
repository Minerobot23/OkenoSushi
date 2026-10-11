# Project state

**Objective.** A sales demo of a redesigned website for Okeno Sushi (451 Glen Drive, Shirley, NY),
in the spirit of the Fluxline demos but its own idea: take a seat at the counter. It has a noren
arrival, a conveyor of the restaurant's real dishes, and full-screen scenes for the menu, platters,
gallery and visit.

**State (October 11, 2026).**
- Second version, built after feedback on the first. The first version is on `master` and
  deployed as a Vercel preview; this one is on branch `counter-experience`.
- 42 of 42 browser checks pass (`verification/report.md`).
- Feedback addressed:
  - the photo zoom-out is removed;
  - the replay button is removed;
  - much more sushi (75 real dish photos) and much more motion;
  - Fluxline-style format with a different concept.

**Evidence.** `verification/report.md` and `verification/screens/`, plus
`media/dishes/contact-sheet.jpg` for the photo-to-name mapping.

**Remaining issues.**
- Photo permissions.
- The ordering page said "temporarily unavailable" when checked.
- Not tested on real phones, Safari or iOS, or with screen readers.
- The printed-menu photos are small (about 180 px), so the owner's originals would sharpen the site.

**Next action.** Review the preview. If approved, merge `counter-experience` into `master`.
Pushing `master` deploys production on Vercel, so that waits for the go-ahead.
