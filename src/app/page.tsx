import { Experience } from "@/components/experience/Experience";
import { Footer } from "@/components/layout/Footer";
import { ExplodedView } from "@/components/scenes/ExplodedView";
import { FinalProductReveal } from "@/components/scenes/FinalProductReveal";
import { FinalStatement } from "@/components/scenes/FinalStatement";
import { FragranceNotes } from "@/components/scenes/FragranceNotes";
import { HeroScene } from "@/components/scenes/HeroScene";
import { KineticTypography } from "@/components/scenes/KineticTypography";
import { ProductReveal } from "@/components/scenes/ProductReveal";

export default function Home() {
  return (
    <Experience>
      <HeroScene />
      <ProductReveal />
      <ExplodedView />
      <FragranceNotes />
      <KineticTypography />
      <FinalProductReveal />
      <FinalStatement />
      <Footer />
    </Experience>
  );
}
