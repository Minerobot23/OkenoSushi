import { useEffect, useRef } from "react";
import { MENU_SCANS } from "../data/images";
import { CloseIcon } from "./Icons";

/**
 * The scanned printed menu from the restaurant's earlier website, kept as a reference. It is
 * clearly labelled: items and prices there may be out of date.
 */
export function OriginalMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      document.documentElement.classList.add("is-locked");
    }
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="original"
      aria-labelledby="original-title"
      onClose={() => {
        document.documentElement.classList.remove("is-locked");
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <div className="original__inner">
        <div className="original__head">
          <div>
            <h2 id="original-title" className="original__title">Original printed menu</h2>
            <p className="original__note">
              A reference copy of the printed menu. Items and prices may have changed; the online ordering menu is
              current.
            </p>
          </div>
          <button type="button" className="original__close" onClick={() => dialog.current?.close()}>
            <CloseIcon />
            <span className="sr-only">Close the original menu</span>
          </button>
        </div>
        {open && (
          <div className="original__pages">
            {MENU_SCANS.map((scan) => (
              <picture key={scan.src}>
                <source type="image/webp" srcSet={scan.webp} />
                <img src={scan.src} alt={scan.alt} width={scan.width} height={scan.height} loading="lazy" decoding="async" />
              </picture>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
