import type { CSSProperties } from "react";
import type { DishInfo } from "../lib/dishes";
import { money } from "../lib/menu";

/** One dish on the belt, on a round plate. */
export function Plate({ dish, index, clone, onOpen }: { dish: DishInfo; index: number; clone?: boolean; onOpen: (el: HTMLElement) => void }) {
  const photo = dish.photo!;
  return (
    <li className="plate" style={{ "--k": index % 5 } as CSSProperties} aria-hidden={clone || undefined}>
      <button
        type="button"
        className="plate__button"
        tabIndex={clone ? -1 : undefined}
        onClick={(event) => onOpen(event.currentTarget)}
        aria-label={`${dish.name}, ${money(dish.prices[0].amount)}. Open details`}
        data-dish={dish.name}
      >
        <span className="plate__dish">
          <picture>
            <source type="image/webp" srcSet={photo.webp} />
            <img src={photo.src} alt="" width={photo.width} height={photo.height} decoding="async" draggable={false} />
          </picture>
        </span>
        <span className="plate__tag">
          <span className="plate__name">{dish.name}</span>
          <span className="plate__price">{money(dish.prices[0].amount)}</span>
        </span>
      </button>
    </li>
  );
}
