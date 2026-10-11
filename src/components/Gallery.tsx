import { useRef, useState } from "react";
import { GALLERY } from "../data/images";
import { Lightbox } from "./Lightbox";

/** All four real photos, in varied proportions; each opens the lightbox. */
export function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const opener = useRef(0);

  return (
    <section className="gallery" id="gallery" aria-labelledby="gallery-title">
      <div className="container">
        <div className="gallery__intro" data-reveal>
          <p className="eyebrow">Gallery</p>
          <h2 id="gallery-title" className="section-title">Food and place</h2>
        </div>
        <ul className="gallery__grid">
          {GALLERY.map((photo, i) => (
            <li key={photo.id} className={`gallery__item gallery__item--${photo.id}`} data-reveal>
              <button
                type="button"
                ref={(el) => {
                  triggers.current[i] = el;
                }}
                className="gallery__button"
                onClick={() => {
                  opener.current = i;
                  setIndex(i);
                }}
              >
                <picture>
                  <source type="image/webp" srcSet={photo.webpSet} sizes="(min-width: 1024px) 34vw, 92vw" />
                  <img
                    src={photo.src}
                    srcSet={photo.srcSet}
                    sizes="(min-width: 1024px) 34vw, 92vw"
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <span className="gallery__caption">{photo.caption}</span>
                <span className="sr-only">Open larger</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {index !== null && (
        <Lightbox
          photos={GALLERY}
          index={index}
          onIndex={setIndex}
          onClose={() => {
            setIndex(null);
            triggers.current[opener.current]?.focus();
          }}
        />
      )}
    </section>
  );
}
