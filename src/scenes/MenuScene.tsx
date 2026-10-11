import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { MENU, money, search, sharedLabel, type Group, type Section } from "../lib/menu";
import { dish as findDish, photoFor, type DishInfo } from "../lib/dishes";
import { useScene } from "../lib/scenes";
import { ArrowIcon, CloseIcon, SearchIcon } from "../components/Icons";
import { LINKS } from "../data/business";

/** A menu dish as a DishInfo, so it can open in the dish sheet. */
const info = (name: string, section: Section, group: Group): DishInfo => {
  try {
    const d = findDish(name);
    if (d.section === section.id) return d;
  } catch {
    /* fall through */
  }
  const item = group.items.find((i) => i.name === name)!;
  return { ...item, section: section.id, sectionLabel: section.label, group: group.title, photo: photoFor(name) };
};

function Thumb({ d }: { d: DishInfo }) {
  if (!d.photo) return <span className="dish__thumb dish__thumb--none" aria-hidden="true" />;
  return (
    <span className="dish__thumb" aria-hidden="true">
      <picture>
        <source type="image/webp" srcSet={d.photo.webp} />
        <img src={d.photo.src} alt="" width={d.photo.width} height={d.photo.height} loading="lazy" decoding="async" />
      </picture>
    </span>
  );
}

function DishRows({ group, section }: { group: Group; section: Section }) {
  const { openDish } = useScene();
  const shared = sharedLabel(group);
  return (
    <div className="dish-group">
      <h3 className="dish-group__title">{group.title}</h3>
      {(group.note || shared) && (
        <p className="dish-group__note">{[group.note, shared && `Price per order, ${shared.toLowerCase()}`].filter(Boolean).join(" · ")}</p>
      )}
      <ul className="dishes">
        {group.items.map((item, index) => {
          const d = info(item.name, section, group);
          return (
            <li key={item.name} style={{ "--n": Math.min(index, 14) } as CSSProperties}>
              <button type="button" className="dish" onClick={(event) => openDish(d, event.currentTarget)} data-dish={item.name}>
                <Thumb d={d} />
                <span className="dish__text">
                  <span className="dish__head">
                    <span className="dish__name">
                      {item.name}
                      {item.spicy && <span className="dish__tag">Spicy</span>}
                    </span>
                    <span className="dish__leader" aria-hidden="true" />
                    <span className="dish__price">
                      {item.prices.map((p, i) => (
                        <span key={i}>
                          {p.label && !shared && <span className="dish__size">{p.label} </span>}
                          {money(p.amount)}
                        </span>
                      ))}
                    </span>
                  </span>
                  {item.description && <span className="dish__desc">{item.description}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Special rolls as photo cards: 43 of the 45 have their own photo from the printed menu. */
function RollCards({ section }: { section: Section }) {
  const { openDish } = useScene();
  const group = section.groups[0];
  return (
    <ul className="rolls">
      {group.items.map((item, index) => {
        const d = { ...info(item.name, section, group), photo: photoFor(item.name, "printed") };
        return (
          <li key={item.name} style={{ "--n": Math.min(index, 18) } as CSSProperties}>
            <button type="button" className="roll" onClick={(event) => openDish(d, event.currentTarget)} data-dish={item.name}>
              <span className="roll__photo">
                {d.photo ? (
                  <picture>
                    <source type="image/webp" srcSet={d.photo.webp} />
                    <img src={d.photo.src} alt="" width={d.photo.width} height={d.photo.height} loading="lazy" decoding="async" />
                  </picture>
                ) : (
                  <span className="roll__nophoto">No photo</span>
                )}
              </span>
              <span className="roll__head">
                <span className="roll__name">{item.name}</span>
                <span className="roll__price">{money(item.prices[0].amount)}</span>
              </span>
              {item.description && <span className="roll__desc">{item.description}</span>}
              {item.spicy && <span className="dish__tag roll__tag">Spicy</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function MenuScene({ onOpenOriginal }: { onOpenOriginal: () => void }) {
  const { menuQuery, setMenuQuery } = useScene();
  const [active, setActive] = useState(MENU.sections[0].id);
  const [query, setQuery] = useState("");
  const tabs = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const baseId = useId();
  const results = useMemo(() => search(query), [query]);
  const searching = query.trim().length > 0;
  const section = MENU.sections.find((s) => s.id === active) ?? MENU.sections[0];
  const resultCount = results.reduce((n, r) => n + r.groups.reduce((m, g) => m + g.items.length, 0), 0);

  // "Find it on the menu" from the dish sheet.
  useEffect(() => {
    if (!menuQuery) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hand-off from the dish sheet
    setQuery(menuQuery);
    setMenuQuery("");
  }, [menuQuery, setMenuQuery]);

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
    document.fonts?.ready.then(place);
    return () => observer.disconnect();
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
    <section id="scene-menu" className="scene scene--menu" aria-labelledby="menu-title">
      <div className="scene__inner">
        <div className="menu__intro">
          <div>
            <p className="eyebrow">The menu · {MENU.sections.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.items.length, 0), 0)} dishes</p>
            <h2 id="menu-title" className="scene__title" tabIndex={-1} data-scene-focus>
              Find your next favorite
            </h2>
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

        <div className={`tabs${searching ? " is-dimmed" : ""}`}>
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
              <div key={`q-${query}`} className="menu__section">
                <p className="menu__count">
                  {resultCount} {resultCount === 1 ? "dish matches" : "dishes match"} “{query.trim()}”
                </p>
                {results.map(({ section: s, groups }) => (
                  <div key={s.id} className="menu__result">
                    <p className="menu__result-section">{s.label}</p>
                    <div className="menu__groups">
                      {groups.map((g) => (
                        <DishRows key={g.title} group={g} section={s} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="menu__empty">
                <p className="menu__empty-title">Nothing on the menu matches “{query.trim()}”.</p>
                <p>Try a fish or an ingredient, like “salmon”, “eel” or “avocado”, or browse the categories.</p>
                <button type="button" className="button button--ghost" onClick={() => setQuery("")}>
                  Clear the search
                </button>
              </div>
            )
          ) : (
            <div key={section.id} className="menu__section">
              <p className="menu__blurb">{section.blurb}</p>
              {section.id === "special-rolls" ? (
                <RollCards section={section} />
              ) : (
                <div className="menu__groups">
                  {section.groups.map((g) => (
                    <DishRows key={g.title} group={g} section={section} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="menu__foot">
          <p className="menu__fine">Prices are from the online-ordering menu and may change.</p>
          <div className="menu__foot-actions">
            <a className="button button--red" href={LINKS.order} target="_blank" rel="noopener">
              Order from the full menu <ArrowIcon />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <button type="button" className="button button--ghost" onClick={onOpenOriginal}>
              View the original printed menu
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
