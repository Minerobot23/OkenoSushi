import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "./reducedMotion";
import { WIDE_CUT, currentCut, type Cut } from "./cuts";

type Props = {
  /** Film files per cut, served from /public. Only the one that fits the screen and browser is requested. */
  sources: Record<Cut, { webm: string; mp4: string }>;
  /** First frame of each cut, shown at once while the film loads. */
  posters: Record<Cut, string>;
  /** Accessible description of what the film shows. */
  label: string;
  skipLabel?: string;
  /**
   * Called once: the film ended, was skipped, could not play, or motion is reduced.
   * `held` is true only when the film played to its last frame, which is the frame the scene
   * opens on, so the handover can be a plain cut.
   */
  onFinished: (result: { held: boolean }) => void;
  /** Called the first time the film is actually playing (used to start loading the scene). */
  onStarted?: () => void;
  /** Copy drawn over the film. `progress` runs 0 to 1 so text can leave on a beat. */
  children?: (state: { progress: number; playing: boolean }) => ReactNode;
};

/** VP9 WebM when the browser is sure it can play it (it is about half the size), otherwise H.264 MP4. */
function pickFile(files: { webm: string; mp4: string }) {
  const probe = document.createElement("video");
  return probe.canPlayType('video/webm; codecs="vp9"') === "probably" ? files.webm : files.mp4;
}

/** If the film has not started this long after mounting, stop waiting for it. */
const START_LIMIT_MS = 9000;

/**
 * The arrival film: plays once, muted and inline, over its own poster.
 *
 * Ported from the Cinematic Demo Playbook (appendix E). The film is decoration and never owns
 * access: there is always a Skip control, a failed or refused playback falls back to the poster,
 * reduced motion skips it, and a timer moves on if it never starts. Everything here runs on media
 * events and timers, never on animation frames.
 */
export function HeroFilm({ sources, posters, label, skipLabel = "Skip", onFinished, onStarted, children }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const finished = useRef(false);
  const started = useRef(false);
  const callbacks = useRef({ onFinished, onStarted });
  useEffect(() => {
    callbacks.current = { onFinished, onStarted };
  });
  // The cut and file for this screen, chosen once on the client.
  const [choice, setChoice] = useState<{ cut: Cut; file: string } | null>(null);
  const cut = choice?.cut ?? null;
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [progress, setProgress] = useState(0);

  const finish = useCallback((held = false) => {
    if (finished.current) return;
    finished.current = true;
    video.current?.pause();
    callbacks.current.onFinished({ held });
  }, []);

  // Pick the cut for this screen once, on the client, so only one file is ever requested.
  useEffect(() => {
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    const next = currentCut();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the viewport, which only exists on the client
    setChoice({ cut: next, file: pickFile(sources[next]) });
    // Chosen once per mount on purpose: switching files mid-film would restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finish]);

  const start = useCallback(() => {
    const element = video.current;
    if (!element) return;
    element.play().then(
      () => setBlocked(false),
      (error: unknown) => {
        // Autoplay refused (data saver, low-power mode): keep the poster and offer a Play button.
        if (error instanceof DOMException && error.name === "NotAllowedError") setBlocked(true);
      },
    );
  }, []);

  useEffect(() => {
    if (cut === null) return;
    start();
    const guard = window.setTimeout(() => {
      if (!video.current || video.current.currentTime === 0) finish();
    }, START_LIMIT_MS);
    return () => window.clearTimeout(guard);
  }, [cut, start, finish]);

  // Leaving by another route must not fire a late "finished".
  useEffect(
    () => () => {
      finished.current = true;
    },
    [],
  );

  const toggle = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused) start();
    else element.pause();
  };

  return (
    <div className="film">
      <picture>
        <source media={WIDE_CUT} srcSet={posters.wide} />
        {/* A plain image: the poster paints before the film or any script is ready. */}
        <img src={posters.tall} alt="" className="film__frame" fetchPriority="high" decoding="async" />
      </picture>
      {choice && (
        <video
          ref={video}
          src={choice.file}
          muted
          playsInline
          preload="auto"
          aria-label={label}
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => {
            setVisible(true);
            setPlaying(true);
            if (!started.current) {
              started.current = true;
              callbacks.current.onStarted?.();
            }
          }}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => {
            const element = event.currentTarget;
            if (element.duration) setProgress(element.currentTime / element.duration);
          }}
          onEnded={() => finish(true)}
          onError={() => finish()}
          className={`film__video${visible ? " is-visible" : ""}`}
        />
      )}

      {children?.({ progress, playing })}

      <div className="film__controls">
        <button type="button" className="film__button" onClick={toggle} disabled={cut === null}>
          {blocked ? "Play film" : playing ? "Pause" : "Play"}
        </button>
        <button type="button" className="film__button film__button--solid" onClick={() => finish()}>
          {skipLabel} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
