import type { CSSProperties } from "react";
import { dish, photoFor } from "../lib/dishes";
import { useScene } from "../lib/scenes";

const CARDS = ["Sushi & Sashimi Combo For 2", "Spicy Tuna Roll", "Sashimi Regular"].map((name, i) => ({
  dish: { ...dish(name), photo: photoFor(name, "ordering") },
  i,
}));

/**
 * Three of Okeno's own dish photos fanned out like menu cards. They drift slowly, lean toward the
 * pointer (CSS variables set by the counter scene), spread apart on hover, and open the dish.
 */
export function TastingFan() {
  const { openDish } = useScene();
  return (
    <div className="fan" aria-label="From the kitchen" role="group">
      {CARDS.map(({ dish: d, i }) => (
        <button
          key={d.name}
          type="button"
          className={`fan__card fan__card--${i}`}
          style={{ "--c": i } as CSSProperties}
          onClick={(event) => openDish(d, event.currentTarget)}
        >
          <span className="fan__photo">
            <picture>
              <source type="image/webp" srcSet={d.photo!.webp} />
              <img src={d.photo!.src} alt="" width={d.photo!.width} height={d.photo!.height} decoding="async" />
            </picture>
          </span>
          <span className="fan__label">{d.name}</span>
        </button>
      ))}
    </div>
  );
}
