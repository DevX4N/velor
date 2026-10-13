import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";

// Display: a true Didone with an optical-size axis, so the hairlines sharpen as the type grows.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

// Secondary: a geometric sans in its light weights, the quiet voice beside the serif.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VÉLOR Nº 01 — The Art of Presence",
  description:
    "VÉLOR Nº 01, Extrait de Parfum. Uma experiência cinematográfica de perfumaria — marca fictícia, peça de portfólio de Creative Development.",
  // Fictional brand: keep it out of search results.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bodoni.variable} ${jost.variable}`} data-tone="dark" suppressHydrationWarning>
      <head>
        {/* JS is available: the preloader may hold the first frame in the dark. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <div
          hidden
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: A perfume campaign shot as one continuous studio take. Light is the narrator: the bottle is revealed, dismantled, dissolved into scent and returned, never boxed into sections. Refuses the category default of a product hero + feature grid + buy button.
OWN-WORLD: Black cyclorama #080808, carbon #141414, graphite #292929; champagne gold #C4A77D only where light falls; ivory #F0E9DF as the daylight set. Bodoni Moda (optical size) against light Jost caps. Hairlines, no cards, no shadows on UI.
STORY: The visitor watches a bottle wake in the dark, studies it, sees it come apart, walks through its three notes, reads the manifesto, then meets it in daylight and opens its dossier.
FIRST VIEWPORT: Procedural smoked-glass bottle centred, lit by a sweeping gold strip; the VÉLOR wordmark set full-width behind it and refracted through the glass; slate and scroll cue at the foot.
FORM: Product-photography studio session, candidate 4 of 7 (seed c7c0aa0a); raises: glazier (motion is light brightening, not sliding), nixie (gold is the only warm accent, lit by light alone).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`,
          }}
        />
        <a href="#main" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
