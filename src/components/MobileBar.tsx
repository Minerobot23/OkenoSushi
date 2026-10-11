import { LINKS } from "../data/business";
import { BagIcon, PhoneIcon, PinIcon } from "./Icons";

/** Phones only: Order, Call and Directions always one tap away. */
export function MobileBar() {
  return (
    <nav className="mobile-bar" aria-label="Quick actions">
      <a className="mobile-bar__order" href={LINKS.order} target="_blank" rel="noopener">
        <BagIcon /> Order<span className="sr-only"> online (opens in a new tab)</span>
      </a>
      <a href={LINKS.call}>
        <PhoneIcon /> Call
      </a>
      <a href={LINKS.directions} target="_blank" rel="noopener">
        <PinIcon /> Directions<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </nav>
  );
}
