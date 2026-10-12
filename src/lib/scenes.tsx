import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { DishInfo } from "./dishes";

export type SceneId = "counter" | "menu" | "platters" | "gallery" | "visit";

export const SCENES: { id: SceneId; label: string; title: string }[] = [
  { id: "counter", label: "Counter", title: "Okeno Sushi | Sushi & Japanese food on Glen Drive, Shirley, NY" },
  { id: "menu", label: "Menu", title: "Menu · Okeno Sushi, Shirley NY" },
  { id: "platters", label: "Platters", title: "Platters & catering · Okeno Sushi, Shirley NY" },
  { id: "gallery", label: "Gallery", title: "Gallery · Okeno Sushi, Shirley NY" },
  { id: "visit", label: "Visit", title: "Hours & directions · Okeno Sushi, Shirley NY" },
];

const isScene = (value: string): value is SceneId => SCENES.some((s) => s.id === value);

/** The curtain closes over this long, the scene swaps, then it opens again over the same time. */
export const WIPE_MS = 420;

type Ctx = {
  scene: SceneId;
  go: (id: SceneId) => void;
  dish: DishInfo | null;
  openDish: (dish: DishInfo, opener?: HTMLElement | null) => void;
  closeDish: () => void;
  /** A dish name the menu should search for when it opens (set by "Find it on the menu"). */
  menuQuery: string;
  setMenuQuery: (query: string) => void;
};

const SceneContext = createContext<Ctx | null>(null);

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error("useScene outside SceneProvider");
  return ctx;
}

/**
 * Switches between full-screen scenes, the way the Fluxline demos move between places, with a
 * noren-curtain wipe. The visible scene is the `data-scene` attribute on <html> (set before first
 * paint by index.html from the URL hash), so the prerendered page never flashes the wrong scene.
 *
 * Nothing waits on an animation: every step of a wipe is a timer, a navigation that arrives
 * mid-wipe is queued and run when the wipe ends, and reduced motion swaps at once.
 */
export function SceneProvider({ children }: { children: ReactNode }) {
  const [scene, setScene] = useState<SceneId>("counter");
  const [dish, setDish] = useState<DishInfo | null>(null);
  const [menuQuery, setMenuQuery] = useState("");
  const current = useRef<SceneId>("counter");
  const busy = useRef(false);
  const pending = useRef<SceneId | null>(null);
  const dishOpener = useRef<HTMLElement | null>(null);
  /** The latest `go`, so a navigation queued during a wipe can run when the wipe ends. */
  const goRef = useRef<(id: SceneId) => void>(() => {});

  const show = useCallback((id: SceneId) => {
    const root = document.documentElement;
    root.dataset.scene = id;
    current.current = id;
    setScene(id);
    document.title = SCENES.find((s) => s.id === id)!.title;
    const element = document.getElementById(`scene-${id}`);
    if (element) {
      element.scrollTop = 0;
      // Entrance animations run while this class is on; a timer takes it off (end state = visible).
      element.classList.add("is-entering");
      window.setTimeout(() => element.classList.remove("is-entering"), 1600);
    }
    // Move focus to the new scene's heading so keyboard and screen-reader users land in it.
    const heading = element?.querySelector<HTMLElement>("[data-scene-focus]");
    const focus = () => heading?.focus({ preventScroll: true });
    window.setTimeout(() => {
      focus();
      if (heading && document.activeElement !== heading) window.setTimeout(focus, 150);
    }, 40);
  }, []);

  const go = useCallback(
    (id: SceneId) => {
      if (busy.current) {
        pending.current = id;
        return;
      }
      if (id === current.current) return;
      const root = document.documentElement;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        show(id);
        return;
      }
      busy.current = true;
      root.classList.add("wipe");
      window.setTimeout(() => {
        show(id);
        root.classList.remove("wipe");
        window.setTimeout(() => {
          busy.current = false;
          const next = pending.current;
          pending.current = null;
          if (next && next !== current.current) goRef.current(next);
        }, WIPE_MS);
      }, WIPE_MS);
    },
    [show],
  );

  useEffect(() => {
    goRef.current = go;
  }, [go]);

  // Follow the URL hash: links to #menu, #visit, ... and the browser's back and forward buttons.
  useEffect(() => {
    (window as Window & { __okeno?: boolean }).__okeno = true;
    const initial = document.documentElement.dataset.scene ?? "counter";
    if (isScene(initial) && initial !== "counter") {
      current.current = initial;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs with the attribute set before hydration
      setScene(initial);
    }
    const onHash = () => {
      const id = window.location.hash.slice(1) || "counter";
      if (isScene(id)) go(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [go]);

  const navigate = useCallback((id: SceneId) => {
    const hash = id === "counter" ? "#counter" : `#${id}`;
    if (window.location.hash !== hash) window.location.hash = hash;
    else go(id);
  }, [go]);

  const openDish = useCallback((next: DishInfo, opener?: HTMLElement | null) => {
    dishOpener.current = opener ?? (document.activeElement as HTMLElement | null);
    setDish(next);
  }, []);

  const closeDish = useCallback(() => {
    setDish(null);
    // The page behind the sheet is inert until React re-renders, so return focus just after.
    const opener = dishOpener.current;
    window.setTimeout(() => opener?.focus({ preventScroll: true }), 40);
  }, []);

  return (
    <SceneContext.Provider value={{ scene, go: navigate, dish, openDish, closeDish, menuQuery, setMenuQuery }}>
      {children}
    </SceneContext.Provider>
  );
}
