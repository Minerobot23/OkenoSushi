import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "../data/images";
import { ChevronIcon, CloseIcon } from "./Icons";

type Props = {
  photos: Photo[];
  index: number;
  onIndex: (index: number) => void;
  /** Called after the closing transition; the caller unmounts the lightbox and restores focus. */
  onClose: () => void;
};

const CLOSE_MS = 220;

/** Accessible photo viewer: focus trap, Escape, arrow keys, swipe, and focus returned on close. */
export function Lightbox({ photos, index, onIndex, onClose }: Props) {
  const [shown, setShown] = useState(false);
  const [closing, setClosing] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const swipe = useRef<number | null>(null);
  const photo = photos[index];
  const go = useCallback((step: number) => onIndex((index + step + photos.length) % photos.length), [index, onIndex, photos.length]);

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(onClose, CLOSE_MS);
  }, [onClose]);

  useEffect(() => {
    closeButton.current?.focus();
    document.documentElement.classList.add("is-locked");
    const timer = window.setTimeout(() => setShown(true), 20);
    return () => {
      window.clearTimeout(timer);
      document.documentElement.classList.remove("is-locked");
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "Tab") {
        const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>("button") ?? []);
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
    return () => document.removeEventListener("keydown", onKey);
  }, [close, go]);

  return (
    <div
      ref={dialog}
      className={`lightbox${shown && !closing ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Photos of Okeno Sushi"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <button ref={closeButton} type="button" className="lightbox__close" onClick={close}>
        <CloseIcon />
        <span className="sr-only">Close photos</span>
      </button>
      <figure
        className="lightbox__figure"
        onPointerDown={(event) => {
          swipe.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (swipe.current === null) return;
          const dx = event.clientX - swipe.current;
          swipe.current = null;
          if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
        }}
      >
        <picture key={photo.id}>
          <source type="image/webp" srcSet={photo.webp} />
          <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} draggable={false} />
        </picture>
        <figcaption>
          <span className="lightbox__caption">{photo.caption}</span>
          <span className="lightbox__credit">{photo.credit}</span>
          <span className="lightbox__count" aria-live="polite">
            {index + 1} / {photos.length}
          </span>
        </figcaption>
      </figure>
      <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)}>
        <ChevronIcon flip />
        <span className="sr-only">Previous photo</span>
      </button>
      <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)}>
        <ChevronIcon />
        <span className="sr-only">Next photo</span>
      </button>
    </div>
  );
}
