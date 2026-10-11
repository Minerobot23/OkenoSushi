import { useEffect, useRef, useState } from "react";
import { useScene } from "../lib/scenes";
import { money } from "../lib/menu";
import { LINKS } from "../data/business";
import { ArrowIcon, CloseIcon } from "./Icons";

const CLOSE_MS = 260;

const SOURCE: Record<string, string> = {
  printed: "Photo from Okeno Sushi's printed menu",
  ordering: "Photo from Okeno Sushi's online-ordering page",
  platter: "Photo from Okeno Sushi's printed menu",
};

/** The dish you picked: its photo, what is in it, the price, and the way to order it. */
export function DishSheet() {
  const { dish, closeDish, go, setMenuQuery } = useScene();
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!dish) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the transition for each dish
    setClosing(false);
    closeButton.current?.focus();
    const timer = window.setTimeout(() => setShown(true), 20);
    return () => {
      window.clearTimeout(timer);
      setShown(false);
    };
  }, [dish]);

  const close = () => {
    setClosing(true);
    window.setTimeout(closeDish, CLOSE_MS);
  };

  useEffect(() => {
    if (!dish) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setClosing(true);
        window.setTimeout(closeDish, CLOSE_MS);
      }
      if (event.key === "Tab") {
        const items = Array.from(panel.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dish, closeDish]);

  if (!dish) return null;
  const photo = dish.photo;

  return (
    <div
      className={`sheet${shown && !closing ? " is-open" : ""}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div ref={panel} className="sheet__panel" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <button ref={closeButton} type="button" className="sheet__close" onClick={close}>
          <CloseIcon />
          <span className="sr-only">Close</span>
        </button>
        {photo && (
          <figure className={`sheet__photo sheet__photo--${photo.kind}`}>
            <picture key={photo.webp}>
              <source type="image/webp" srcSet={photo.webp} />
              <img src={photo.src} alt={`${dish.name} from Okeno Sushi`} width={photo.width} height={photo.height} />
            </picture>
            <figcaption>{SOURCE[photo.kind]}</figcaption>
          </figure>
        )}
        <div className="sheet__body">
          <p className="eyebrow">
            {dish.sectionLabel} · {dish.group}
          </p>
          <h2 id="sheet-title" className="sheet__title">
            {dish.name}
            {dish.spicy && <span className="dish__tag">Spicy</span>}
          </h2>
          {dish.description && <p className="sheet__desc">{dish.description}</p>}
          <ul className="sheet__prices">
            {dish.prices.map((p, i) => (
              <li key={i}>
                <span>{p.label ?? "Price"}</span>
                <strong>{money(p.amount)}</strong>
              </li>
            ))}
          </ul>
          <div className="sheet__actions">
            <a className="button button--red button--large" href={LINKS.order} target="_blank" rel="noopener">
              Order online <ArrowIcon />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <button
              type="button"
              className="button button--ghost button--large"
              onClick={() => {
                setMenuQuery(dish.name);
                closeDish();
                go("menu");
              }}
            >
              Find it on the menu
            </button>
          </div>
          <p className="sheet__fine">Prices are from the online-ordering menu and may change.</p>
        </div>
      </div>
    </div>
  );
}
