import { PHOTOS } from "../data/images";

/** Short and factual: the place, the counter, the menu. No invented history. */
export function Story() {
  const photo = PHOTOS.counter;
  return (
    <section className="story" aria-labelledby="story-title">
      <div className="container story__grid">
        <figure className="story__photo" data-reveal>
          <div className="frame frame--tall drift">
            <picture>
              <source type="image/webp" srcSet={photo.webpSet} sizes="(min-width: 1024px) 40vw, 92vw" />
              <img
                src={photo.src}
                srcSet={photo.srcSet}
                sizes="(min-width: 1024px) 40vw, 92vw"
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
          <figcaption>{photo.caption}</figcaption>
        </figure>
        <div className="story__copy" data-reveal>
          <p className="eyebrow">On Glen Drive</p>
          <h2 id="story-title" className="section-title">A neighborhood sushi bar, with the counter in view.</h2>
          <p>
            Okeno Sushi is a small restaurant on Glen Drive in Shirley. Take a seat with the sushi counter in sight, or
            pick up an order on the way home.
          </p>
          <p>
            The menu runs from classic maki, sushi and sashimi to more than forty special rolls, with teriyaki,
            tempura, udon and bento from the kitchen.
          </p>
          <a className="text-link" href="#menu">
            See the menu
          </a>
        </div>
      </div>
    </section>
  );
}
