import { useEffect, useRef, useState } from "react";
import { HeroFilm } from "../experience/HeroFilm";
import { Hotspot } from "../experience/Hotspot";
import { coverBox } from "../experience/coverBox";
import { CUT_RATIO, WIDE_CUT, currentCut, type Cut } from "../experience/cuts";
import { prefersReducedMotion } from "../experience/reducedMotion";
import film from "../data/film.json";
import { FILM } from "../data/images";
import { BUSINESS, LINKS } from "../data/business";

type Phase = "film" | "scene";
type Spot = keyof typeof film.tall.hotspots;

type Align = "left" | "right" | "above";

/**
 * The storefront scene's destinations, each on the real object it belongs to. `narrow` is the
 * label side when the frame is under 600px wide, where the Hours and Menu labels would meet.
 */
const DESTINATIONS: { id: Spot; label: string; hint: string; href: string; external?: boolean; align: Align; narrow?: Align }[] = [
  { id: "call", label: "Call", hint: BUSINESS.phone, href: LINKS.call, align: "above" },
  { id: "hours", label: "Hours", hint: "and directions", href: "#visit", align: "right" },
  { id: "menu", label: "Menu", hint: "Find your next favorite", href: "#menu", align: "left", narrow: "right" },
  { id: "order", label: "Order online", hint: "Pickup on Glen Drive", href: LINKS.order, external: true, align: "left" },
];

/** After a skip or a failed film, the film layer fades over this long before it is removed. */
const FADE_MS = 450;

/**
 * The arrival: a camera move up to the real storefront, ending on that same frame as an
 * interactive scene with hotspots on the menu in the window, the OPEN sign, the phone number on
 * the sign and the door. The page around it (navigation, Order, Call) works the whole time.
 */
export function ArrivalStage() {
  const [phase, setPhase] = useState<Phase>("film");
  const [sceneMounted, setSceneMounted] = useState(false);
  const [filmLeaving, setFilmLeaving] = useState(false);
  const [filmKey, setFilmKey] = useState(0);
  const [entered, setEntered] = useState(false);
  const [reduced, setReduced] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<ReturnType<typeof coverBox> | null>(null);
  const [cut, setCut] = useState<Cut>("tall");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a media query, client only
    setReduced(prefersReducedMotion());
  }, []);

  // Keep the hotspot box matched to the cover-cropped end frame at any panel size.
  useEffect(() => {
    if (!sceneMounted || !frame.current) return;
    const element = frame.current;
    const measure = () => {
      const next = currentCut();
      setCut(next);
      setBox(coverBox(element.clientWidth, element.clientHeight, CUT_RATIO[next]));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [sceneMounted]);

  // Hotspots ease in once the scene is showing; the end state is written by a timer, not an
  // animation callback.
  useEffect(() => {
    if (phase !== "scene") return;
    const timer = window.setTimeout(() => setEntered(true), 40);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!filmLeaving) return;
    const timer = window.setTimeout(() => setFilmLeaving(false), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [filmLeaving]);

  const onFinished = ({ held }: { held: boolean }) => {
    setSceneMounted(true);
    setPhase("scene");
    // Ended on the scene's own frame: a plain cut. Otherwise a short fade.
    setFilmLeaving(!held);
  };

  const replay = () => {
    setEntered(false);
    setPhase("film");
    setFilmLeaving(false);
    setFilmKey((key) => key + 1);
  };

  const spots = film[cut].hotspots;
  const showFilm = phase === "film" || filmLeaving;

  return (
    <div className="arrival" ref={frame} data-hotspot-frame>
      {sceneMounted && (
        <div className={`scene${entered ? " is-entered" : ""}`} aria-hidden={phase !== "scene"}>
          <picture>
            <source media={WIDE_CUT} srcSet={FILM.wide.end} />
            <img
              src={FILM.tall.end}
              alt="The Okeno Sushi storefront on Glen Drive: the lit sign with the phone number, the OPEN sign and menu in the window, and the glass door"
              className="film__frame"
              decoding="async"
            />
          </picture>
          {phase === "scene" && box && (
            <div
              className="scene__spots"
              style={{ width: box.width, height: box.height, left: box.left, top: box.top }}
            >
              {DESTINATIONS.map((d, index) => (
                <Hotspot
                  key={d.id}
                  at={spots[d.id]}
                  label={d.label}
                  hint={box.width < 600 ? undefined : d.hint}
                  href={d.href}
                  external={d.external}
                  align={box.width < 600 && d.narrow ? d.narrow : d.align}
                  index={index}
                />
              ))}
            </div>
          )}
          {phase === "scene" && !reduced && (
            <button type="button" className="scene__replay" onClick={replay}>
              <span aria-hidden="true">↺</span> Replay the arrival
            </button>
          )}
        </div>
      )}

      {showFilm && (
        <div className={`arrival__film${phase === "scene" ? " is-leaving" : ""}`}>
          <HeroFilm
            key={filmKey}
            sources={{
              tall: { webm: FILM.tall.webm, mp4: FILM.tall.video },
              wide: { webm: FILM.wide.webm, mp4: FILM.wide.video },
            }}
            posters={{ tall: FILM.tall.poster, wide: FILM.wide.poster }}
            label="A slow camera move up from the curb to the Okeno Sushi storefront on Glen Drive"
            skipLabel="Skip"
            onStarted={() => setSceneMounted(true)}
            onFinished={onFinished}
          >
            {({ progress }) => (
              <p className={`film__caption${progress > 0.78 ? " is-hidden" : ""}`} aria-hidden="true">
                <span>Arriving at</span> {BUSINESS.street}, {BUSINESS.city}
              </p>
            )}
          </HeroFilm>
        </div>
      )}
    </div>
  );
}
