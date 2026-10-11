import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource-variable/dm-sans/index.css";
import "./styles/base.css";
import "./styles/hero.css";
import "./styles/sections.css";
import { App } from "./App";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
// The production build is prerendered (scripts/prerender.mjs); the dev server is not.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
