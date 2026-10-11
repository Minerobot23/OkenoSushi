import { ADDRESS_LINE, BUSINESS, HOURS, LINKS } from "../data/business";
import { formatRange } from "../lib/hours";
import { Logo } from "./Logo";

/** Compact hours: consecutive days with the same hours share a line. */
function compactHours() {
  const week = [1, 2, 3, 4, 5, 6, 0].map((d) => HOURS[d]);
  const lines: { days: string; hours: string }[] = [];
  for (const day of week) {
    const hours = formatRange(day);
    const last = lines[lines.length - 1];
    if (last && last.hours === hours) last.days = `${last.days.split("–")[0]}–${day.short}`;
    else lines.push({ days: day.short, hours });
  }
  return lines;
}

export function Footer({ onOpenOriginal }: { onOpenOriginal: () => void }) {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>Sushi, sashimi, and Japanese favorites on Glen Drive.</p>
        </div>
        <div>
          <h2 className="footer__title">Find us</h2>
          <p>
            <a href={LINKS.directions} target="_blank" rel="noopener">
              {ADDRESS_LINE}
              <span className="sr-only"> (directions, opens in a new tab)</span>
            </a>
          </p>
          <p>
            <a href={LINKS.call}>{BUSINESS.phone}</a>
          </p>
          <p>
            <a href={LINKS.maps} target="_blank" rel="noopener">
              Google Maps<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </div>
        <div>
          <h2 className="footer__title">Hours</h2>
          <dl className="footer__hours">
            {compactHours().map((line) => (
              <div key={line.days}>
                <dt>{line.days}</dt>
                <dd>{line.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="footer__title">Menu</h2>
          <p>
            <a href="#menu">Browse the menu</a>
          </p>
          <p>
            <a href={LINKS.order} target="_blank" rel="noopener">
              Order online<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <p>
            <button type="button" className="footer__link-button" onClick={onOpenOriginal}>
              Original printed menu
            </button>
          </p>
        </div>
      </div>
      <div className="container footer__base">
        <p>© {new Date().getFullYear()} Okeno Sushi · Shirley, New York</p>
      </div>
    </footer>
  );
}
