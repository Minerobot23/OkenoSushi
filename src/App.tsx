import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ServiceStrip } from "./components/ServiceStrip";
import { MenuSection } from "./components/MenuSection";
import { Story } from "./components/Story";
import { Gallery } from "./components/Gallery";
import { Visit } from "./components/Visit";
import { Catering } from "./components/Catering";
import { FinalCta } from "./components/FinalCta";
import { Footer } from "./components/Footer";
import { MobileBar } from "./components/MobileBar";
import { OriginalMenu } from "./components/OriginalMenu";
import { useReveal } from "./lib/useReveal";

export function App() {
  const [originalOpen, setOriginalOpen] = useState(false);
  useReveal();
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <ServiceStrip />
        <MenuSection onOpenOriginal={() => setOriginalOpen(true)} />
        <Story />
        <Gallery />
        <Visit />
        <Catering />
        <FinalCta />
      </main>
      <Footer onOpenOriginal={() => setOriginalOpen(true)} />
      <MobileBar />
      <OriginalMenu open={originalOpen} onClose={() => setOriginalOpen(false)} />
    </>
  );
}
