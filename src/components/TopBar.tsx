import { Logo } from "./Logo";
import { PhoneIcon } from "./Icons";
import { BUSINESS, LINKS } from "../data/business";

/** Logo (back to the counter), the phone number and the one main action, on every scene. */
export function TopBar() {
  return (
    <header className="topbar">
      <a className="topbar__brand" href="#counter" aria-label="Okeno Sushi, back to the counter">
        <Logo />
      </a>
      <div className="topbar__actions">
        <a className="topbar__call" href={LINKS.call}>
          <PhoneIcon />
          <span className="topbar__call-number">{BUSINESS.phone}</span>
          <span className="topbar__call-short">Call</span>
        </a>
        <a className="button button--red button--small" href={LINKS.order} target="_blank" rel="noopener">
          Order online<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </header>
  );
}
