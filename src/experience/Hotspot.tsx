import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { FocalPoint } from "./coverBox";

type Props = {
  /** Position inside the end frame (fractions), used inside the cover-sized box. */
  at: FocalPoint;
  label: string;
  /** Short line shown with the label on hover or focus. */
  hint?: string;
  href: string;
  /** Opens in a new tab (external destinations). */
  external?: boolean;
  /**
   * Preferred side for the label. "left" and "right" flip by themselves when that side would run
   * off the frame; "above" keeps the label clear of what the dot points at (a phone number).
   */
  align?: "left" | "right" | "above";
  /** Stagger index for the entrance. */
  index?: number;
};

/**
 * A point of interest that belongs to the storefront: a breathing light on the object itself.
 *
 * Ported from the Cinematic Demo Playbook (appendix F). It is a real link (keyboard, focus ring,
 * accessible name) because every destination is a place on the page or an outside page, and its
 * label is always visible, not hover-only.
 */
export function Hotspot({ at, label, hint, href, external, align = "right", index = 0 }: Props) {
  const link = useRef<HTMLAnchorElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [side, setSide] = useState(align);

  // Keep the label inside the frame: use the preferred side unless only the other one has room.
  useLayoutEffect(() => {
    const element = link.current;
    if (!element) return;
    const frame = element.closest<HTMLElement>("[data-hotspot-frame]");
    const fit = () => {
      if (!text.current || align === "above") return;
      const dot = element.getBoundingClientRect();
      const bounds = frame?.getBoundingClientRect() ?? { left: 0, right: window.innerWidth };
      // The label decides the side; the hover hint is allowed to extend past it.
      const width = text.current.querySelector<HTMLElement>(".hotspot__label")?.offsetWidth ?? text.current.offsetWidth;
      const margin = 10;
      const right = dot.right + width <= bounds.right - margin;
      const left = dot.left - width >= bounds.left + margin;
      const other = align === "right" ? "left" : "right";
      setSide((align === "right" ? right : left) || !(align === "right" ? left : right) ? align : other);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(document.documentElement);
    if (frame) observer.observe(frame);
    // The scene can still be settling (its entrance) when first measured.
    const timers = [400, 1500].map((delay) => window.setTimeout(fit, delay));
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [align, label, hint]);

  return (
    <a
      ref={link}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
      className="hotspot"
      style={{ left: `${at.x * 100}%`, top: `${at.y * 100}%`, "--i": index } as CSSProperties}
    >
      <span className="hotspot__beacon" aria-hidden="true" />
      <span ref={text} className={`hotspot__text hotspot__text--${side}`}>
        <span className="hotspot__label">{label}</span>
        {hint && <span className="hotspot__hint">{hint}</span>}
      </span>
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
