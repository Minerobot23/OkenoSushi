import { useEffect, useState } from "react";
import { ADDRESS_LINE, BUSINESS, HOURS, LINKS, LUNCH_HOURS, SERVICES } from "../data/business";
import { PHOTOS } from "../data/images";
import { formatRange, openState, restaurantClock, type OpenState } from "../lib/hours";
import { PhoneIcon, PinIcon } from "../components/Icons";

/** Monday first, the way the week reads on a door sign. */
const WEEK = [1, 2, 3, 4, 5, 6, 0];

export function VisitScene() {
  const photo = PHOTOS.storefront;
  // Computed on the client only (the prerendered page shows the weekly schedule alone).
  const [state, setState] = useState<OpenState | null>(null);
  const [today, setToday] = useState<number | null>(null);

  useEffect(() => {
    const update = () => {
      setState(openState());
      setToday(restaurantClock().day);
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="scene-visit" className="scene scene--visit" aria-labelledby="visit-title">
      <div className="scene__inner visit">
        <figure className="visit__photo">
          <div className="visit__frame">
            <picture>
              <source type="image/webp" srcSet={photo.webpSet} sizes="(min-width: 1024px) 34vw, 92vw" />
              <img src={photo.src} srcSet={photo.srcSet} sizes="(min-width: 1024px) 34vw, 92vw" alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
            </picture>
          </div>
          <figcaption>Look for the lit sign on Glen Drive.</figcaption>
        </figure>

        <div className="visit__info">
          <p className="eyebrow">Visit</p>
          <h2 id="visit-title" className="scene__title" tabIndex={-1} data-scene-focus>
            Come in, or call ahead.
          </h2>
          <address className="visit__address">
            <span>{BUSINESS.street}</span>
            <span>
              {BUSINESS.city}, {BUSINESS.region} {BUSINESS.postalCode}
            </span>
          </address>
          <ul className="visit__services">
            {SERVICES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="visit__actions">
            <a className="button button--red" href={LINKS.directions} target="_blank" rel="noopener">
              <PinIcon /> Get directions
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
            <a className="button button--ghost" href={LINKS.call}>
              <PhoneIcon /> Call {BUSINESS.phone}
            </a>
          </div>

          <div className="hours">
            <div className="hours__head">
              <h3 className="hours__title">Hours</h3>
              {state && (
                <p className={`hours__status${state.open ? " is-open" : ""}`}>
                  <span className="hours__dot" aria-hidden="true" />
                  {state.text}
                </p>
              )}
            </div>
            <table className="hours__table">
              <caption className="sr-only">Weekly opening hours, Eastern Time</caption>
              <tbody>
                {WEEK.map((d) => (
                  <tr key={d} className={d === today ? "is-today" : undefined} aria-current={d === today ? "date" : undefined}>
                    <th scope="row">{HOURS[d].day}</th>
                    <td>{formatRange(HOURS[d])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="hours__note">{LUNCH_HOURS}</p>
          </div>
          <p className="visit__maps">
            <a className="text-link" href={LINKS.maps} target="_blank" rel="noopener">
              {ADDRESS_LINE} on Google Maps
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <p className="visit__fine">© {new Date().getFullYear()} Okeno Sushi · Shirley, New York</p>
        </div>
      </div>
    </section>
  );
}
