import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";

/** Used by scripts/prerender.mjs to write the page's HTML at build time. */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
