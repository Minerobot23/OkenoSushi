import { BUSINESS, LINKS } from "../data/business";
import { ArrowIcon, PhoneIcon } from "./Icons";

export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="container final__inner" data-reveal>
        <p className="eyebrow">Hungry?</p>
        <h2 id="final-title" className="final__title">Order ahead and pick it up on Glen Drive.</h2>
        <div className="final__actions">
          <a className="button button--red button--large" href={LINKS.order} target="_blank" rel="noopener">
            Order online <ArrowIcon />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="button button--ghost button--large" href={LINKS.call}>
            <PhoneIcon /> {BUSINESS.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
