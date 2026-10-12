import { useEffect, useRef, useState } from "react";
import { BELT } from "../lib/dishes";
import { useScene } from "../lib/scenes";
import { Plate } from "./Plate";
import { PauseIcon, PlayIcon } from "./Icons";

/** Belt speed in CSS pixels per second. */
const SPEED = 38;
/** After the visitor drags, swipes or leaves the belt, it waits this long before moving again. */
const RESUME_MS = 2200;

/**
 * The conveyor: Okeno's own dishes ride past on plates. It is a real horizontal scroller, so it
 * can be swiped on a phone, dragged with a mouse, or tabbed through; it advances by itself, slowly,
 * and stops while you hover, touch or focus it. If animation frames never arrive it simply stays
 * still and scrollable. The plate list is drawn twice so the loop has no seam; the copy is hidden
 * from assistive technology and from the tab order.
 */
export function Belt({ active }: { active: boolean }) {
  const { openDish } = useScene();
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const hold = useRef(0); // timestamp until which the belt stays still
  const hovering = useRef(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a media query, client only
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const element = track.current;
    if (!element || !active || paused || reduced) return;
    let frame = 0;
    let last = performance.now();
    let carry = 0;
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const still = hovering.current || drag.current || now < hold.current || document.hidden;
      if (!still) {
        carry += (SPEED * dt) / 1000;
        const step = Math.floor(carry);
        if (step) {
          carry -= step;
          const half = element.scrollWidth / 2;
          element.scrollLeft = element.scrollLeft + step >= half ? element.scrollLeft + step - half : element.scrollLeft + step;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, paused, reduced]);

  const rest = () => {
    hold.current = performance.now() + RESUME_MS;
  };

  // Mouse drag to scroll (touch and trackpads scroll natively).
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !track.current) return;
    drag.current = { x: event.clientX, left: track.current.scrollLeft, moved: false };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !track.current) return;
    const dx = event.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    if (d.moved) {
      const half = track.current.scrollWidth / 2;
      let left = d.left - dx;
      if (left < 0) left += half;
      if (left >= half) left -= half;
      track.current.scrollLeft = left;
    }
  };
  const endDrag = () => {
    if (drag.current?.moved) {
      // Swallow the click that ends a drag, so dragging never opens a dish.
      const stop = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
      };
      window.addEventListener("click", stop, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener("click", stop, { capture: true }), 50);
    }
    drag.current = null;
    rest();
  };

  const open = (name: string, el: HTMLElement) => {
    const dish = BELT.find((d) => d.name === name);
    if (dish) openDish(dish, el);
  };

  return (
    <div className="belt" aria-label="Dishes on the counter belt" role="region">
      <div
        ref={track}
        className="belt__track"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") hovering.current = true;
        }}
        onPointerLeave={() => {
          hovering.current = false;
          endDrag();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onTouchStart={rest}
        onTouchEnd={rest}
        onWheel={rest}
        onFocus={() => (hovering.current = true)}
        onBlur={() => {
          hovering.current = false;
          rest();
        }}
      >
        <ul className="belt__plates">
          {[false, true].map((clone) =>
            BELT.map((dish, i) => (
              <Plate key={`${clone ? "c" : "o"}-${dish.name}`} dish={dish} index={i} clone={clone} onOpen={(el) => open(dish.name, el)} />
            )),
          )}
        </ul>
      </div>
      {!reduced && (
        <button type="button" className="belt__toggle" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? <PlayIcon /> : <PauseIcon />}
          <span>{paused ? "Run the belt" : "Pause the belt"}</span>
        </button>
      )}
    </div>
  );
}
