import type { CSSProperties } from "react";
import { Belt } from "../components/Belt";
import { ArrowIcon, StarIcon } from "../components/Icons";
import { ADDRESS_LINE, GOOGLE_RATING, LINKS } from "../data/business";
import { HERO_VIDEO, PHOTOS } from "../data/images";
import { useScene } from "../lib/scenes";

const rise = (i: number) => ({ "--i": i }) as CSSProperties;

/** Portrait screens get the tall crop (counter and chefs above the rolls); others the close-up. */
const TALL = "(max-aspect-ratio: 4/5)";

/**
 * The counter: what the noren opens onto. One sharp, full-bleed photo of Okeno's own rolls at the
 * table, the restaurant's name and two actions, and the belt of real dishes along the bottom.
 */
export function Counter() {
  const { scene } = useScene();
  const wide = PHOTOS.heroWide;
  const tall = PHOTOS.heroTall;
  return (
    <section id="scene-counter" className="scene scene--counter" aria-labelledby="counter-title">
      <div className="hero">
        <div className="hero__frame">
          <picture>
            <source media={TALL} type="image/webp" srcSet={tall.webpSet} sizes="100vw" />
            <source media={TALL} srcSet={tall.srcSet} sizes="100vw" />
            <source type="image/webp" srcSet={wide.webpSet} sizes="100vw" />
            <img
              className="hero__img"
              src={wide.src}
              srcSet={wide.srcSet}
              sizes="100vw"
              alt={wide.alt}
              width={wide.width}
              height={wide.height}
              fetchPriority="high"
            />
          </picture>
          {HERO_VIDEO && (
            <video className="hero__img hero__video" autoPlay muted loop playsInline poster={wide.src} aria-hidden="true">
              {HERO_VIDEO.webm && <source src={HERO_VIDEO.webm} type="video/webm" />}
              <source src={HERO_VIDEO.mp4} type="video/mp4" />
            </video>
          )}
        </div>
        <div className="hero__shade" aria-hidden="true" />

        <div className="hero__copy">
          <p className="eyebrow hero__in" style={rise(0)}>
            Okeno Sushi · Shirley, NY
          </p>
          <h1 id="counter-title" className="hero__title hero__in" style={rise(1)} tabIndex={-1} data-scene-focus>
            Your next <em>favorite roll</em> is right here.
          </h1>
          <p className="hero__lede hero__in" style={rise(2)}>
            Sushi, sashimi, and Japanese favorites on Glen Drive.
          </p>
          <div className="hero__actions hero__in" style={rise(3)}>
            <a className="button button--red button--large" href={LINKS.order} target="_blank" rel="noopener">
              Order online <ArrowIcon />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a className="button button--ghost button--large" href="#menu">
              Explore the menu
            </a>
          </div>
          <p className="hero__meta hero__in" style={rise(4)}>
            <a href={GOOGLE_RATING.url} target="_blank" rel="noopener" className="rating">
              <StarIcon className="rating__star" />
              <strong>{GOOGLE_RATING.stars}</strong> on Google · {GOOGLE_RATING.reviews} reviews
              <span className="rating__date">as of {GOOGLE_RATING.checked}</span>
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
            <span className="hero__address">{ADDRESS_LINE}</span>
          </p>
        </div>
      </div>

      <div className="counter__belt">
        <p className="counter__belt-label">From the menu · tap a plate</p>
        <Belt active={scene === "counter"} />
      </div>
    </section>
  );
}
