import { useRef, useState, type CSSProperties } from "react";
import { GALLERY, type Photo } from "../data/images";
import { FOOD_WALL } from "../lib/dishes";
import { Lightbox } from "../components/Lightbox";

/** The four photos of the place, then twelve of Okeno's own dish photos. */
const PHOTOS: Photo[] = [
  GALLERY[0],
  ...FOOD_WALL.slice(0, 3).map(toPhoto),
  GALLERY[1],
  ...FOOD_WALL.slice(3, 7).map(toPhoto),
  GALLERY[3],
  ...FOOD_WALL.slice(7, 10).map(toPhoto),
  GALLERY[2],
  ...FOOD_WALL.slice(10).map(toPhoto),
];

function toPhoto(d: (typeof FOOD_WALL)[number]): Photo {
  const p = d.photo!;
  return {
    id: `dish-${d.name}`,
    alt: `${d.name} from Okeno Sushi`,
    caption: d.name,
    credit: "Photo: Okeno Sushi's online-ordering page",
    width: p.width,
    height: p.height,
    src: p.src,
    webp: p.webp,
    srcSet: `${p.src} ${p.width}w`,
    webpSet: `${p.webp} ${p.width}w`,
  };
}

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
            <li key={photo.id} className={`wall__item${photo.height > photo.width * 1.1 ? " wall__item--tall" : ""}`} style={{ "--n": i } as CSSProperties}>
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
                  <source type="image/webp" srcSet={photo.webpSet} sizes="(min-width: 1024px) 25vw, 50vw" />
                  <img src={photo.src} srcSet={photo.srcSet} sizes="(min-width: 1024px) 25vw, 50vw" alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
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
