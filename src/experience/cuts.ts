/**
 * Which cut of the arrival film fits a screen. The hero shows the film in a tall panel on phones
 * and in the desktop split layout, and in a wide panel on tablets. On desktop screens wider than
 * 19:10 (ultrawide monitors) the split panel itself is wider than tall, so it gets the wide cut;
 * the tall cut would lose the sign at the top of the frame there.
 */
export const WIDE_CUT = "(min-width: 600px) and (max-width: 1023.98px), (min-width: 1024px) and (min-aspect-ratio: 19/10)";

export type Cut = "tall" | "wide";

export const CUT_RATIO: Record<Cut, number> = { tall: 864 / 1080, wide: 1024 / 768 };

export function currentCut(): Cut {
  return typeof window !== "undefined" && window.matchMedia(WIDE_CUT).matches ? "wide" : "tall";
}
