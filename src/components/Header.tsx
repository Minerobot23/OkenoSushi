import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { CloseIcon, MenuIcon, PhoneIcon } from "./Icons";
import { BUSINESS, LINKS } from "../data/business";

const NAV = [
  { href: "#menu", label: "Menu" },
  { href: "#gallery", label: "Gallery" },
  { href: "#visit", label: "Visit" },
  { href: "#catering", label: "Catering" },
];

/** Sticky header: clear at the top, a solid bar once the page scrolls. */
export function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: focus the first link, close on Escape, keep Tab inside, restore focus on close.
  useEffect(() => {
    if (!open) return;
    const links = () => Array.from(panel.current?.querySelectorAll<HTMLElement>("a, button") ?? []);
    links()[0]?.focus();
    document.documentElement.classList.add("is-locked");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === "Tab") {
        const items = [toggle.current, ...links()].filter(Boolean) as HTMLElement[];
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("is-locked");
    };
  }, [open]);

  useEffect(() => {
    const close = () => setOpen(false);
    const wide = window.matchMedia("(min-width: 1024px)");
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, []);

  return (
    <header className={`header${solid || open ? " is-solid" : ""}${open ? " is-open" : ""}`}>
      <div className="header__bar">
        <a className="header__brand" href="#top" aria-label="Okeno Sushi, back to top">
          <Logo />
        </a>
        <nav className="header__nav" aria-label="Main">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header__actions">
          <a className="header__phone" href={LINKS.call}>
            <PhoneIcon />
            <span>{BUSINESS.phone}</span>
          </a>
          <a className="button button--red button--small header__order" href={LINKS.order} target="_blank" rel="noopener">
            Order online<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <button
            ref={toggle}
            type="button"
            className="header__toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>
      <div id="mobile-nav" ref={panel} className="header__panel" hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header__panel-actions">
          <a className="button button--red" href={LINKS.order} target="_blank" rel="noopener" onClick={() => setOpen(false)}>
            Order online<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a className="button button--ghost" href={LINKS.call}>
            <PhoneIcon /> {BUSINESS.phone}
          </a>
        </div>
      </div>
    </header>
  );
}
