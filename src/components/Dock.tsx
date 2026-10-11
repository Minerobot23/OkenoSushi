import { useLayoutEffect, useRef, useState } from "react";
import { SCENES, useScene } from "../lib/scenes";
import { BagIcon, GridIcon, HomeIcon, MenuBookIcon, PinIcon, PlatterIcon } from "./Icons";
import { LINKS } from "../data/business";

const ICONS = { counter: HomeIcon, menu: MenuBookIcon, platters: PlatterIcon, gallery: GridIcon, visit: PinIcon };

/**
 * The persistent navigation: every scene is one tap away from anywhere, with a pill that slides to
 * the current one. On phones it is the bottom bar, with Order in red.
 */
export function Dock() {
  const { scene } = useScene();
  const list = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return;
    const place = () => {
      // Measure the list item: the link's own offset is relative to that item, not to the list.
      const active = element.querySelector<HTMLElement>(`[data-dock="${scene}"]`)?.parentElement;
      if (active && active.offsetWidth) setPill({ left: active.offsetLeft, width: active.offsetWidth });
      else setPill(null);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(element);
    document.fonts?.ready.then(place);
    return () => observer.disconnect();
  }, [scene]);

  return (
    <nav className="dock" aria-label="Scenes">
      <ul ref={list} className="dock__list">
        {pill && <li className="dock__pill" aria-hidden="true" style={{ transform: `translateX(${pill.left}px)`, width: pill.width }} />}
        {SCENES.map((s) => {
          const Icon = ICONS[s.id];
          return (
            <li key={s.id} className={`dock__item dock__item--${s.id}`}>
              <a href={`#${s.id}`} data-dock={s.id} aria-current={scene === s.id ? "page" : undefined}>
                <Icon />
                <span>{s.label}</span>
              </a>
            </li>
          );
        })}
        <li className="dock__item dock__item--order">
          <a href={LINKS.order} target="_blank" rel="noopener" className="dock__order">
            <BagIcon />
            <span>Order</span>
            <span className="sr-only"> online (opens in a new tab)</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
