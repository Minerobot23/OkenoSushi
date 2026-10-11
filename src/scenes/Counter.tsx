import { useRef, type CSSProperties } from "react";
import { Belt } from "../components/Belt";
import { TastingFan } from "../components/TastingFan";
import { ArrowIcon, StarIcon } from "../components/Icons";
import { ADDRESS_LINE, GOOGLE_RATING, LINKS } from "../data/business";
import { PHOTOS } from "../data/images";
import { useScene } from "../lib/scenes";

/** Headline words as spans, so they can rise one after another. */
const words = (list: string[], first: number) =>
  list.flatMap((word, i) => {
    const el = (
      <span key={word} className="word" style={{ "--i": first + i } as CSSProperties}>
        {word}
      </span>
    );
    return i < list.length - 1 ? [el, " "] : [el];
  });

/**
 * The counter: the first scene. A headline, three dishes fanned out, and the belt of Okeno's real
 * dishes running along a honey-wood counter like the one in the restaurant, with the dining room
 * itself, blurred, as the light behind it.
 */
export function Counter() {
  const { scene } = useScene();
  const root = useRef<HTMLElement>(null);

  // Pointer parallax for the fan and the room light: CSS variables only, no animation loop.
  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !root.current) return;
    const r = root.current.getBoundingClientRect();
    root.current.style.setProperty("--px", ((event.clientX - r.left) / r.width - 0.5).toFixed(3));
    root.current.style.setProperty("--py", ((event.clientY - r.top) / r.height - 0.5).toFixed(3));
  };

  return (
    <section
      ref={root}
      id="scene-counter"
      className="scene scene--counter"
      aria-labelledby="counter-title"
      onPointerMove={onPointerMove}
    >
      <div className="counter__room" aria-hidden="true">
        <img src={PHOTOS.counter.src} alt="" width={PHOTOS.counter.width} height={PHOTOS.counter.height} />
      </div>
      <div className="counter__glow" aria-hidden="true" />

      <div className="counter__stage">
        <div className="counter__copy">
          <p className="eyebrow counter__rise" style={{ "--i": 0 } as CSSProperties}>
            Okeno Sushi · Shirley, NY
          </p>
          <h1 id="counter-title" className="counter__title" tabIndex={-1} data-scene-focus>
            {words(["Your", "next"], 1)}
            <span className="brushed">
              {words(["favorite", "roll"], 3)}
              <svg className="brush" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
                <path d="M6 26 C 70 13, 150 11, 230 17 S 360 29, 394 13" pathLength={1} />
              </svg>
            </span>{" "}
            {words(["is", "right", "here."], 5)}
          </h1>
          <p className="counter__lede counter__rise" style={{ "--i": 8 } as CSSProperties}>
            Sushi, sashimi, and Japanese favorites on Glen Drive. Pick a plate off the belt.
          </p>
          <div className="counter__actions counter__rise" style={{ "--i": 9 } as CSSProperties}>
            <a className="button button--red button--large" href={LINKS.order} target="_blank" rel="noopener">
              Order online <ArrowIcon />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a className="button button--ghost button--large" href="#menu">
              Explore the menu
            </a>
          </div>
          <p className="counter__meta counter__rise" style={{ "--i": 10 } as CSSProperties}>
            <a href={GOOGLE_RATING.url} target="_blank" rel="noopener" className="rating">
              <StarIcon className="rating__star" />
              <strong>{GOOGLE_RATING.stars}</strong> on Google · {GOOGLE_RATING.reviews} reviews
              <span className="rating__date">as of {GOOGLE_RATING.checked}</span>
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
            <span className="counter__address">{ADDRESS_LINE}</span>
          </p>
        </div>
        <TastingFan />
      </div>

      <div className="counter__wood">
        <Belt active={scene === "counter"} />
      </div>
    </section>
  );
}
