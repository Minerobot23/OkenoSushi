import { SERVICES } from "../data/business";

export function ServiceStrip() {
  return (
    <div className="strip" role="note" aria-label="Services">
      <ul>
        {SERVICES.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>
    </div>
  );
}
