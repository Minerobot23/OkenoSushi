import type { CSSProperties } from "react";
import { dish, PLATTER_PHOTOS } from "../lib/dishes";
import { money } from "../lib/menu";
import { useScene } from "../lib/scenes";
import { BUSINESS, LINKS } from "../data/business";
import { PhoneIcon } from "../components/Icons";

const PLATTERS = PLATTER_PHOTOS.map((photo) => ({ ...dish(photo.name), photo }));

/** The five round platters from Okeno's printed menu, turning slowly like a lazy Susan, and catering. */
export function PlattersScene() {
  const { openDish } = useScene();
  return (
    <section id="scene-platters" className="scene scene--platters" aria-labelledby="platters-title">
      <div className="scene__inner">
        <div className="platters__intro">
          <p className="eyebrow">Platters & catering</p>
          <h2 id="platters-title" className="scene__title" tabIndex={-1} data-scene-focus>
            Bring a whole table of sushi.
          </h2>
          <p className="scene__lede">
            Sushi and sashimi for one or two, and party platters of maki and nigiri for a crowd. These are the
            platters from Okeno's own menu.
          </p>
        </div>
        <ul className="platters">
          {PLATTERS.map((p, i) => (
            <li key={p.name} style={{ "--i": i } as CSSProperties}>
              <button type="button" className="platter" onClick={(event) => openDish(p, event.currentTarget)} data-dish={p.name}>
                <span className="platter__disc">
                  <picture>
                    <source type="image/webp" srcSet={p.photo.webp} />
                    <img src={p.photo.src} alt={`${p.name} from Okeno Sushi`} width={p.photo.width} height={p.photo.height} loading="lazy" decoding="async" />
                  </picture>
                </span>
                <span className="platter__name">{p.name.replace("Combo ", "")}</span>
                {p.description && <span className="platter__desc">{p.description}</span>}
                <span className="platter__price">{money(p.prices[0].amount)}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="catering">
          <div>
            <h3 className="catering__title">Feeding a group at home or at the office?</h3>
            <p>Call the restaurant to ask about catering: how many people, which day, and what you would like.</p>
          </div>
          <a className="button button--red button--large" href={LINKS.call}>
            <PhoneIcon /> Call about catering · {BUSINESS.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
