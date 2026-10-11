import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { MENU, money, search, sharedLabel, type Group } from "../lib/menu";
import { ArrowIcon, CloseIcon, SearchIcon } from "./Icons";
import { LINKS } from "../data/business";
import { PHOTOS } from "../data/images";

/** Long groups show this many dishes until "Show all" is pressed (the rest stay in the HTML). */
const PREVIEW = 12;

function DishList({ group, preview = false }: { group: Group; preview?: boolean }) {
  const shared = sharedLabel(group);
  const [expanded, setExpanded] = useState(false);
  const collapsible = preview && group.items.length > PREVIEW + 2;
  const listId = useId();
  return (
    <div className="dish-group">
      <h3 className="dish-group__title">{group.title}</h3>
      {(group.note || shared) && (
        <p className="dish-group__note">{[group.note, shared && `Price per order, ${shared.toLowerCase()}`].filter(Boolean).join(" · ")}</p>
      )}
      <ul className="dishes" id={listId}>
        {group.items.map((dish, index) => (
          <li className="dish" key={dish.name} hidden={collapsible && !expanded && index >= PREVIEW}>
            <div className="dish__head">
              <span className="dish__name">
                {dish.name}
                {dish.spicy && <span className="dish__tag">Spicy</span>}
              </span>
              <span className="dish__leader" aria-hidden="true" />
              <span className="dish__price">
                {dish.prices.map((p, i) => (
                  <span key={i}>
                    {p.label && !shared && <span className="dish__size">{p.label} </span>}
                    {money(p.amount)}
                  </span>
                ))}
              </span>
            </div>
            {dish.description && <p className="dish__desc">{dish.description}</p>}
          </li>
        ))}
      </ul>
      {collapsible && (
        <button
          type="button"
          className="dish-group__more"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show fewer" : `Show all ${group.items.length} ${group.title.toLowerCase()}`}
        </button>
      )}
    </div>
  );
}

export function MenuSection({ onOpenOriginal }: { onOpenOriginal: () => void }) {
  const [active, setActive] = useState(MENU.sections[0].id);
  const [query, setQuery] = useState("");
  const tabs = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const baseId = useId();
  const results = useMemo(() => search(query), [query]);
  const searching = query.trim().length > 0;
  const section = MENU.sections.find((s) => s.id === active) ?? MENU.sections[0];
  const resultCount = results.reduce((n, r) => n + r.groups.reduce((m, g) => m + g.items.length, 0), 0);

  // Slide the indicator under the active tab, and keep that tab scrolled into the strip.
  useLayoutEffect(() => {
    const strip = tabs.current;
    if (!strip) return;
    const place = () => {
      const tab = strip.querySelector<HTMLElement>(`[data-tab="${active}"]`);
      if (!tab) return;
      setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
      const target = tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2;
      strip.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    // Fonts change tab widths after they load.
    document.fonts?.ready.then(() => {
      const tab = tabs.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
      if (tab) setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
    });
  }, [active]);

  const choose = (id: string) => {
    setActive(id);
    setQuery("");
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const ids = MENU.sections.map((s) => s.id);
    const index = ids.indexOf(active);
    const next =
      event.key === "ArrowRight" ? ids[(index + 1) % ids.length]
      : event.key === "ArrowLeft" ? ids[(index - 1 + ids.length) % ids.length]
      : event.key === "Home" ? ids[0]
      : event.key === "End" ? ids[ids.length - 1]
      : null;
    if (!next) return;
    event.preventDefault();
    choose(next);
    tabs.current?.querySelector<HTMLElement>(`[data-tab="${next}"]`)?.focus();
  };

  return (
    <section className="menu" id="menu" aria-labelledby="menu-title">
      <div className="container">
        <div className="menu__intro" data-reveal>
          <div>
            <p className="eyebrow">The menu</p>
            <h2 id="menu-title" className="section-title">Find your next favorite</h2>
          </div>
          <div className="menu__search">
            <label htmlFor={`${baseId}-q`} className="sr-only">
              Search the menu
            </label>
            <SearchIcon className="menu__search-icon" />
            <input
              id={`${baseId}-q`}
              type="search"
              placeholder="Search rolls, fish, ingredients…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              enterKeyHint="search"
            />
            {searching && (
              <button type="button" className="menu__clear" onClick={() => setQuery("")}>
                <CloseIcon />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
        </div>

        <div className={`tabs${searching ? " is-dimmed" : ""}`} data-reveal>
          <div className="tabs__strip" role="tablist" aria-label="Menu categories" ref={tabs}>
            {MENU.sections.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${s.id}`}
                data-tab={s.id}
                aria-selected={!searching && s.id === active}
                aria-controls={`${baseId}-panel`}
                tabIndex={s.id === active ? 0 : -1}
                className="tabs__tab"
                onClick={() => choose(s.id)}
                onKeyDown={onTabKey}
              >
                {s.label}
              </button>
            ))}
            {indicator && (
              <span className="tabs__indicator" aria-hidden="true" style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }} />
            )}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {searching ? (resultCount ? `${resultCount} ${resultCount === 1 ? "dish matches" : "dishes match"}` : "No dishes match") : ""}
        </p>
        <div
          id={`${baseId}-panel`}
          className="menu__panel"
          role={searching ? "region" : "tabpanel"}
          aria-labelledby={searching ? undefined : `${baseId}-tab-${section.id}`}
          aria-label={searching ? "Search results" : undefined}
        >
          {searching ? (
            resultCount ? (
              <>
                <p className="menu__count">
                  {resultCount} {resultCount === 1 ? "dish matches" : "dishes match"} “{query.trim()}”
                </p>
                {results.map(({ section: s, groups }) => (
                  <div key={s.id} className="menu__result">
                    <p className="menu__result-section">{s.label}</p>
                    <div className="menu__groups">
                      {groups.map((g) => (
                        <DishList key={g.title} group={g} />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="menu__empty">
                <p className="menu__empty-title">Nothing on the menu matches “{query.trim()}”.</p>
                <p>Try a fish or an ingredient, like “salmon”, “eel” or “avocado”, or browse the categories.</p>
                <button type="button" className="button button--ghost-dark" onClick={() => setQuery("")}>
                  Clear the search
                </button>
              </div>
            )
          ) : (
            <div key={section.id} className="menu__section">
              <p className="menu__blurb">{section.blurb}</p>
              {section.id === "bento" && (
                <figure className="menu__figure">
                  <div className="frame">
                    <picture>
                      <source type="image/webp" srcSet={PHOTOS.bento.webp} />
                      <img src={PHOTOS.bento.src} alt={PHOTOS.bento.alt} width={PHOTOS.bento.width} height={PHOTOS.bento.height} loading="lazy" decoding="async" />
                    </picture>
                  </div>
                  <figcaption>{PHOTOS.bento.caption}</figcaption>
                </figure>
              )}
              <div className="menu__groups">
                {section.groups.map((g) => (
                  <DishList key={g.title} group={g} preview />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="menu__foot" data-reveal>
          <p className="menu__fine">Prices are from the online ordering menu and may change.</p>
          <div className="menu__foot-actions">
            <a className="button button--red" href={LINKS.order} target="_blank" rel="noopener">
              Order from the full menu <ArrowIcon />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <button type="button" className="button button--ghost-dark" onClick={onOpenOriginal}>
              View the original printed menu
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
