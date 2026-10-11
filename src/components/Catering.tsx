import { BUSINESS, LINKS } from "../data/business";
import { MENU, money } from "../lib/menu";
import { PhoneIcon } from "./Icons";

const platters = MENU.sections.flatMap((s) => s.groups).find((g) => g.title === "Party platters")?.items ?? [];

export function Catering() {
  return (
    <section className="catering" id="catering" aria-labelledby="catering-title">
      <div className="container catering__grid">
        <div data-reveal>
          <p className="eyebrow">Catering</p>
          <h2 id="catering-title" className="section-title">Sushi for the office, or the family table.</h2>
          <p className="catering__lede">
            Planning for a group at home or at the office? Call the restaurant to ask about catering: the size of your
            group, the day, and what you would like.
          </p>
          <a className="button button--ivory button--large" href={LINKS.call}>
            <PhoneIcon /> Call about catering
          </a>
          <p className="catering__phone">{BUSINESS.phone}</p>
        </div>
        {platters.length > 0 && (
          <div className="platters" data-reveal>
            <h3 className="platters__title">Party platters on the menu</h3>
            <ul>
              {platters.map((p) => (
                <li key={p.name}>
                  <span className="platters__name">{p.name.replace("Party Platter ", "Platter ")}</span>
                  <span className="platters__desc">{p.description}</span>
                  <span className="platters__price">{money(p.prices[0].amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
