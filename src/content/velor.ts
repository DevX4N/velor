// Every word the film shows, in one place. Campaign titles stay in English/French,
// descriptive copy and signatures in Portuguese, as written in the brief.

export type SceneId = "awakening" | "revelation" | "anatomy" | "essence" | "presence" | "desire" | "statement";

export const scenes: { id: SceneId; title: string; nav?: string }[] = [
  { id: "awakening", title: "The Awakening" },
  { id: "revelation", title: "The Revelation", nav: "Revelation" },
  { id: "anatomy", title: "The Anatomy of Luxury", nav: "Anatomy" },
  { id: "essence", title: "The Essence", nav: "Essence" },
  { id: "presence", title: "The Art of Presence", nav: "Presence" },
  { id: "desire", title: "The Object of Desire" },
  { id: "statement", title: "The Final Statement" },
];

export const hero = {
  product: "Extrait de Parfum — Nº 01",
  line: "A presença não precisa de palavras.",
  cue: "Scroll to discover",
};

export const revelation = {
  title: ["Crafted", "to be", "remembered"],
  body: "Um extrait de alta concentração, guardado em vidro fumê de paredes espessas e coroado em ouro escovado. A luz entra pelas arestas e não encontra pressa para sair.",
  facts: ["Vidro fumê", "Ouro champagne", "50 ml"],
};

export const anatomy = {
  title: ["The anatomy", "of luxury"],
  parts: [
    {
      id: "cap",
      label: "Precision-crafted cap",
      text: "Metal maciço, escovado em ouro champagne. Fecha com um peso que se ouve.",
    },
    {
      id: "glass",
      label: "Smoked glass",
      text: "Paredes espessas e base de vidro sólido, fumê na massa, não pintado.",
    },
    {
      id: "essence",
      label: "Concentrated essence",
      text: "A forma mais concentrada da perfumaria. Poucas gotas bastam.",
    },
    {
      id: "volume",
      label: "50 ml — Extrait de Parfum",
      text: "Proporção pensada para a mão; peso que se sente ao segurar.",
    },
  ],
} as const;

export type CalloutId = (typeof anatomy.parts)[number]["id"];

export const essence = {
  title: "The Essence",
  intro: "Três camadas. Uma única presença.",
  notes: [
    {
      tier: "Top notes",
      name: "Bergamot",
      text: "Fresca e luminosa. A primeira luz que toca a pele — cítrica, nítida, quase metálica.",
    },
    {
      tier: "Heart notes",
      name: "Black Amber",
      text: "Quente, misteriosa, profunda. Uma resina escura que aquece devagar e se recusa a partir.",
    },
    {
      tier: "Base notes",
      name: "Vetiver & Oud",
      text: "Terrosa e marcante. Raiz, madeira e fumaça — o rastro que fica depois que você deixa a sala.",
    },
  ],
};

export const presence = {
  lines: [
    ["Not", "made"],
    ["to", "be", "noticed."],
    ["Made", "to", "be"],
    ["remembered."],
  ],
  marginalia: ["VÉLOR Nº 01"],
};

export const desire = {
  name: "VÉLOR Nº 01",
  kind: "Extrait de Parfum",
  volume: "50 ml",
  quote: "Uma assinatura invisível. Uma presença inesquecível.",
  cta: "Explore the fragrance",
  dragHint: "Arraste para girar o frasco",
};

export const dossier = {
  title: "VÉLOR Nº 01",
  subtitle: "Extrait de Parfum · 50 ml",
  lede: "Uma assinatura invisível. Uma presença inesquecível.",
  pyramid: [
    { tier: "Saída", name: "Bergamota", text: "Luz cítrica, nítida, que abre a pele nos primeiros minutos." },
    { tier: "Coração", name: "Âmbar negro", text: "Resina quente e escura; o centro que dá peso à fragrância." },
    { tier: "Fundo", name: "Vetiver & Oud", text: "Raiz terrosa e madeira defumada; o rastro que permanece." },
  ],
  object: [
    { k: "Frasco", v: "Vidro fumê espesso, base sólida" },
    { k: "Tampa", v: "Metal maciço escovado, ouro champagne" },
    { k: "Volume", v: "50 ml" },
    { k: "Concentração", v: "Extrait de parfum — o grau mais concentrado da perfumaria" },
  ],
  ritual:
    "Aplique nos pontos de pulso, a um palmo de distância. Não esfregue: deixe que o calor da pele revele cada camada, uma de cada vez.",
  disclaimer:
    "VÉLOR é uma marca fictícia, criada como estudo de Creative Development. Não há produto à venda nem loja por trás desta página.",
};

export const statement = {
  word: "VÉLOR",
  signature: "The art of presence.",
  credits:
    "VÉLOR — Parfums é uma marca fictícia. Conceito, direção de arte, frasco 3D procedural e desenvolvimento como peça de portfólio.",
};
