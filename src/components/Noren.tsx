import { useEffect } from "react";
import logo from "../data/logo.json";

/** How long the arrival runs if nobody skips it (matches the timer in index.html). */
export const ARRIVAL_MS = 2700;

/**
 * The noren: the split fabric curtain that hangs in a Japanese restaurant's doorway.
 *
 * On arrival (html.arrive, set before first paint by index.html) the restaurant's own swirl logo
 * draws itself on the curtain, then the four strips part and the counter appears. Between scenes
 * (html.wipe) the curtain swings shut and open again. It is decoration only: the top bar and the
 * dock sit above it and work the whole time, a click or key press skips the arrival, a timer ends
 * it regardless, and reduced motion never shows it.
 */
export function Noren() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("arrive")) return;
    const skip = () => {
      if (!root.classList.contains("arrive")) return;
      root.classList.add("arrive-skip");
      window.setTimeout(() => root.classList.remove("arrive", "arrive-skip"), 380);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") skip();
    };
    const curtain = document.querySelector(".noren");
    curtain?.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", skip, { passive: true });
    const done = window.setTimeout(() => root.classList.remove("arrive", "arrive-skip"), ARRIVAL_MS + 200);
    return () => {
      curtain?.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", skip);
      window.clearTimeout(done);
    };
  }, []);

  return (
    <div className="noren" aria-hidden="true">
      <div className="noren__rod" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`noren__strip noren__strip--${i}`} style={{ ["--s" as string]: i }} />
      ))}
      <svg className="noren__logo" viewBox={logo.viewBox}>
        <path d={logo.mark} pathLength={1} className="noren__mark" />
        <path d={logo.type} className="noren__type" />
      </svg>
    </div>
  );
}
