# Project state

**Objective.** A sales demo of a redesigned website for Okeno Sushi (451 Glen Drive, Shirley, NY).
It follows the Okeno build prompt and the Cinematic Demo Playbook: an arrival film that hands over
to an interactive storefront scene, then a full restaurant site with a readable menu.

**State (October 11, 2026).**
- Built.
- Verified locally: 61 of 61 browser checks pass (`verification/report.md`).
- Not deployed. Committed to `master` on `Minerobot23/OkenoSushi`.

**Decisions.** See "Decisions made without asking" in `README.md`. The main one: the arrival film is
a camera move over the real storefront photo, not a 3D render, because the restaurant is real and
the brief forbids generated spaces.

**Evidence.**
- `verification/report.md` and `verification/screens/`, from a headless Chromium run against the
  production build.
- `ffprobe` output from `media/storefront-film/encode.sh`.
- The ordering page check is recorded in `OWNER-HANDOFF.md`.

**Remaining issues.**
- The ordering page said "temporarily unavailable" when checked.
- Photo permissions are open.
- Not tested on real phones, Safari or iOS, or with screen readers.

**Next action.** The owner reviews the demo and `OWNER-HANDOFF.md`. Then choose hosting and deploy a
preview, which needs the owner's go-ahead because it publishes the site.
