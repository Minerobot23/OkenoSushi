import { useEffect } from "react";
import { prefersReducedMotion } from "../experience/reducedMotion";

/**
 * Section reveals that never hide content before JavaScript runs.
 *
 * The prerendered page shows everything. After mount, only elements that are still below the
 * viewport are set back 20px and transparent; each one eases in once when it scrolls into view.
 * Without IntersectionObserver, or with reduced motion, nothing is hidden at all.
 */
export function useReveal() {
  useEffect(() => {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight,
    );
    pending.forEach((el) => el.classList.add("reveal-pending"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("reveal-in");
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    pending.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
