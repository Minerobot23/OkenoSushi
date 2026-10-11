import type { CSSProperties } from "react";
import { ArrivalStage } from "./ArrivalStage";
import { ArrowIcon, StarIcon } from "./Icons";
import { ADDRESS_LINE, GOOGLE_RATING, LINKS } from "../data/business";
import { PHOTOS } from "../data/images";

/** Stagger index for the entrance sequence (CSS, see hero.css). */
const rise = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Split hero: the editorial headline and actions on one side, the arrival film (which becomes the
 * interactive storefront) on the other, with a small real photo of the rolls.
 */
export function Hero() {
  const rolls = PHOTOS.rolls;
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow hero__rise" style={rise(0)}>
          Okeno Sushi · Shirley, NY
        </p>
        <h1 id="hero-title" className="hero__title hero__rise" style={rise(1)}>
          Your next favorite roll is right here.
        </h1>
        <p className="hero__lede hero__rise" style={rise(2)}>
          Sushi, sashimi, and Japanese favorites on Glen Drive.
        </p>
        <div className="hero__actions hero__rise" style={rise(3)}>
          <a className="button button--red button--large" href={LINKS.order} target="_blank" rel="noopener">
            Order online <ArrowIcon />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="button button--ghost button--large" href="#menu">
            Explore the menu
          </a>
        </div>
        <ul className="hero__meta hero__rise" style={rise(4)}>
          <li>
            <a href={LINKS.directions} target="_blank" rel="noopener">
              {ADDRESS_LINE}
              <span className="sr-only"> (directions, opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={GOOGLE_RATING.url} target="_blank" rel="noopener" className="rating">
              <StarIcon className="rating__star" />
              <span>
                <strong>{GOOGLE_RATING.stars}</strong> Google rating · {GOOGLE_RATING.reviews} reviews
              </span>
              <span className="rating__date">as of {GOOGLE_RATING.checked}</span>
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="hero__stage hero__rise hero__rise--image" style={rise(1)}>
        <ArrivalStage />
        <figure className="hero__inset">
          <div className="frame drift drift--now">
            <picture>
              <source type="image/webp" srcSet={rolls.webp} />
              <img src={rolls.src} alt={rolls.alt} width={rolls.width} height={rolls.height} decoding="async" />
            </picture>
          </div>
          <figcaption>{rolls.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
