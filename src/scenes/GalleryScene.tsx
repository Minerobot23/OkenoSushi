import { useRef, useState } from "react";
import { GALLERY as PHOTOS } from "../data/images";
import { Lightbox } from "../components/Lightbox";

/** Eight photos of the food and the place, all at full resolution so none is shown blurry. */
export function GalleryScene() {
  const [index, setIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const opener = useRef(0);
  return (
    <section id="scene-gallery" className="scene scene--gallery" aria-labelledby="gallery-title">
      <div className="scene__inner">
        <p className="eyebrow">Gallery</p>
        <h2 id="gallery-title" className="scene__title" tabIndex={-1} data-scene-focus>
          From the kitchen, and the room.
        </h2>
        <ul className="wall">
          {PHOTOS.map((photo, i) => (
            <li key={photo.id} className="wall__item">
              <button
                type="button"
                ref={(el) => {
                  triggers.current[i] = el;
                }}
                className="wall__button"
                onClick={() => {
                  opener.current = i;
                  setIndex(i);
                }}
              >
                <picture>
                  <source type="image/webp" srcSet={photo.webpSet} sizes="(min-width: 768px) 33vw, 50vw" />
                  <img src={photo.src} srcSet={photo.srcSet} sizes="(min-width: 768px) 33vw, 50vw" alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
                </picture>
                <span className="wall__caption">{photo.caption}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {index !== null && (
        <Lightbox
          photos={PHOTOS}
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
