import { useState } from "react";
import { SceneProvider, useScene } from "./lib/scenes";
import { Noren } from "./components/Noren";
import { TopBar } from "./components/TopBar";
import { Dock } from "./components/Dock";
import { DishSheet } from "./components/DishSheet";
import { OriginalMenu } from "./components/OriginalMenu";
import { Counter } from "./scenes/Counter";
import { MenuScene } from "./scenes/MenuScene";
import { PlattersScene } from "./scenes/PlattersScene";
import { GalleryScene } from "./scenes/GalleryScene";
import { VisitScene } from "./scenes/VisitScene";

function Experience() {
  const [originalOpen, setOriginalOpen] = useState(false);
  const { dish } = useScene();
  return (
    <>
      <a className="skip-link" href="#scene-menu">
        Skip to the menu
      </a>
      <TopBar />
      <main id="main" className="scenes" inert={dish ? true : undefined}>
        <Counter />
        <MenuScene onOpenOriginal={() => setOriginalOpen(true)} />
        <PlattersScene />
        <GalleryScene />
        <VisitScene />
      </main>
      <Dock />
      <Noren />
      <DishSheet />
      <OriginalMenu open={originalOpen} onClose={() => setOriginalOpen(false)} />
    </>
  );
}

export function App() {
  return (
    <SceneProvider>
      <Experience />
    </SceneProvider>
  );
}
