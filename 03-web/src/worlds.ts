export type CrestShape = "bat" | "vought" | "katana" | "wings" | "swirl" | "hexagon" | "diamond";

export interface WorldColor {
  name: string;
  hex: string;
}

export interface World {
  id: string;
  slug: string;
  name: string;
  franchise: string;
  tagline: string;
  garment: string;
  garmentType: "hoodie" | "jacket" | "tee" | "cargo" | "tracksuit";
  price: string;
  description: string;
  details: string[];
  printTag: string;
  accent: string;
  secondaryAccent: string;
  angle?: number;
  /** Normalized X position across the concept image (-1 on left to +1 on right) */
  xNorm: number;
  crestShape: CrestShape;
  assetUrl: string;
  garmentImgUrl: string;
  lookbookImgUrl?: string;
  colors: WorldColor[];
}

const base = import.meta.env.BASE_URL || "./";

export const WORLDS: World[] = [
  {
    id: "batman",
    slug: "batman",
    name: "BATMAN",
    franchise: "DC COMICS × YOUNGLA",
    tagline: "Gotham after dark. Shadows, discipline and tactical armor.",
    garment: "5209 BATMAN ARMORED ZIP-UP",
    garmentType: "jacket",
    price: "$82",
    description: "Heavyweight zip-up engineered with structured tonal armored chest paneling for a sculpted, tactical silhouette. Features raw-edge detailing, reinforced flatlock seams, washed finish, and heavy-gauge hardware.",
    details: [
      "460 GSM Heavyweight French Terry Fleece",
      "Tonal sculpted Batman armored chest paneling",
      "Raw edge distress detailing and reinforced seams",
      "Heavy-gauge two-way matte gunmetal zipper",
      "Officially licensed by DC Comics & Warner Bros."
    ],
    printTag: "GOTHAM",
    accent: "#38bdf8",
    secondaryAccent: "#1e293b",
    angle: -56,
    xNorm: -0.78,
    crestShape: "bat",
    assetUrl: `${base}assets/worlds/batman.png`,
    garmentImgUrl: `${base}assets/garments/batman_garment.png`,
    lookbookImgUrl: `${base}assets/lookbook/batman_lookbook.jpg`,
    colors: [
      { name: "Grey Wash", hex: "#383b42" },
      { name: "Black Wash", hex: "#18181b" },
      { name: "Dark Knight Slate", hex: "#26262a" }
    ]
  },
  {
    id: "the-boys",
    slug: "the-boys",
    name: "THE BOYS",
    franchise: "VOUGHT INT. × YOUNGLA",
    tagline: "No capes. No mercy. Built by Vought.",
    garment: "5076 THE BOYS HOMELANDER HOODIE",
    garmentType: "hoodie",
    price: "$63",
    description: "Heavyweight 460 GSM pullover built from 100% cotton with a gritty vintage mineral wash. Features bold front stencil typography with Homelander laser portrait and distressed 'YOU NEED ME' statement art across the back.",
    details: [
      "460 GSM 100% Cotton Heavyweight Fleece",
      "Distressed Homelander laser portrait front graphic",
      "Monumental 'YOU NEED ME' distressed back print",
      "Deep double-layered hood with reinforced kangaroo pocket",
      "Officially licensed by Sony Pictures & Amazon MGM Studios"
    ],
    printTag: "THE BOYS",
    accent: "#ef4444",
    secondaryAccent: "#991b1b",
    angle: -36,
    xNorm: -0.52,
    crestShape: "vought",
    assetUrl: `${base}assets/worlds/the-boys.png`,
    garmentImgUrl: `${base}assets/garments/the_boys_garment.png`,
    lookbookImgUrl: `${base}assets/lookbook/the_boys_lookbook.jpg`,
    colors: [
      { name: "Compound V Black", hex: "#09090b" },
      { name: "Homelander Red", hex: "#b91c1c" },
      { name: "Vought Slate", hex: "#1e293b" }
    ]
  },
  {
    id: "demon-slayer",
    slug: "demon-slayer",
    name: "DEMON SLAYER",
    franchise: "KIMETSU NO YAIBA × YOUNGLA",
    tagline: "Total concentration. Precision cut through darkness.",
    garment: "5068 DEMON SLAYER HINOKAMI KAGURA HOODIE",
    garmentType: "hoodie",
    price: "$60",
    description: "Loose-fitting heavyweight pullover hoodie celebrating Tanjiro's legendary Dance of the Fire God. Full back features dynamic Hinokami Kagura anime artwork with traditional kanji '滅' (Metsu) and flame typography.",
    details: [
      "460 GSM Ultra-Heavyweight Cotton Terry",
      "Hinokami Kagura Dance of the Fire God back graphic",
      "Traditional kanji '滅' (Metsu) sleeve and back embroidery",
      "Double-lined structured hood with custom branded eyelets",
      "Officially licensed ©Koyoharu Gotoge / SHUEISHA, Aniplex, ufotable"
    ],
    printTag: "SLAYER",
    accent: "#10b981",
    secondaryAccent: "#065f46",
    angle: -18,
    xNorm: -0.28,
    crestShape: "katana",
    assetUrl: `${base}assets/worlds/demon-slayer.png`,
    garmentImgUrl: `${base}assets/garments/demon_slayer_garment.png`,
    lookbookImgUrl: `${base}assets/lookbook/demon_slayer_lookbook.jpg`,
    colors: [
      { name: "Hinokami Onyx", hex: "#09090b" },
      { name: "Nichirin Emerald", hex: "#065f46" },
      { name: "Flame Breathing Amber", hex: "#b45309" }
    ]
  },
  {
    id: "youngla-originals",
    slug: "youngla-originals",
    name: "YOUNGLA ORIGINALS",
    franchise: "YOUNGLA ARCHIVES",
    tagline: "Discipline creates freedom. The architectural foundation.",
    garment: "5222 GHOST 500 GSM HEAVYWEIGHT ZIP-UP",
    garmentType: "jacket",
    price: "$63",
    description: "The architectural cornerstone of the YoungLA house line. Constructed from 500 GSM ultra-heavyweight cotton loopback terry with an oversized boxy cut, distressed vintage stone wash, dual-way heavy gunmetal zipper, and arched YoungLA heraldic gothic crest embroidery.",
    details: [
      "500 GSM Ultra-Heavyweight 100% Cotton Terry",
      "Arched YoungLA Heraldic Gothic crest chest embroidery",
      "Two-way heavy-gauge oxidized metal zipper",
      "Structured double-layer hood and seamless kangaroo pocket",
      "Architectural drop-shoulder boxy luxury cut"
    ],
    printTag: "ORIGINALS",
    accent: "#ffffff",
    secondaryAccent: "#64748b",
    angle: 0,
    xNorm: 0.0,
    crestShape: "hexagon",
    assetUrl: `${base}assets/worlds/youngla-originals.png`,
    garmentImgUrl: `${base}assets/garments/youngla_originals_garment.png`,
    lookbookImgUrl: `${base}assets/lookbook/youngla_originals_lookbook.jpg`,
    colors: [
      { name: "Mineral Black Wash", hex: "#18181b" },
      { name: "Brutalist Bone", hex: "#e2e8f0" },
      { name: "Charcoal Concrete", hex: "#3f3f46" }
    ]
  },
  {
    id: "attack-on-titan",
    slug: "attack-on-titan",
    name: "ATTACK ON TITAN",
    franchise: "SURVEY CORPS × YOUNGLA",
    tagline: "Beyond the walls, built different. Dedicate your heart.",
    garment: "5138 AOT SCOUT REGIMENT ZIP-UP HOODIE",
    garmentType: "hoodie",
    price: "$70",
    description: "Official Scout Regiment heavyweight zip-up hoodie in military green. Rocking bold graphics on the back featuring the monumental Wings of Freedom emblem, '調査兵団' Japanese typography, and front chest Scout shield embroidery.",
    details: [
      "460 GSM Heavyweight Cotton Fleece",
      "Oversized Wings of Freedom high-density back print",
      "Front chest Scout Regiment shield insignia",
      "Heavy dual YKK zipper and ribbed athletic cuffs",
      "Officially licensed by Kodansha Attack on Titan"
    ],
    printTag: "TITAN",
    accent: "#84cc16",
    secondaryAccent: "#3f6212",
    angle: 18,
    xNorm: 0.28,
    crestShape: "wings",
    assetUrl: `${base}assets/worlds/attack-on-titan.png`,
    garmentImgUrl: `${base}assets/garments/attack_on_titan_garment.png`,
    lookbookImgUrl: `${base}assets/lookbook/attack_on_titan_lookbook.jpg`,
    colors: [
      { name: "Scout Military Green", hex: "#2e4028" },
      { name: "Wall Rose Black", hex: "#18181b" },
      { name: "Survey Corps Slate", hex: "#334155" }
    ]
  },
  {
    id: "naruto-shippuden",
    slug: "naruto-shippuden",
    name: "NARUTO SHIPPUDEN",
    franchise: "NARUTO SHIPPUDEN × YOUNGLA",
    tagline: "The will of fire. Defy destiny.",
    garment: "5133 NARUTO AKATSUKI DISTRESSED DENIM JACKET",
    garmentType: "jacket",
    price: "$78",
    description: "A loose-fitting premium black denim jacket with extensive artisanal distressing. Back features an interior red Akatsuki cloud pattern panel revealed through shredded tears, paired with custom engraved Naruto Shippuden metal shank buttons.",
    details: [
      "390 GSM Heavyweight 100% Cotton Denim",
      "Distressed back slit revealing red Akatsuki cloud tapestry",
      "Custom engraved Uzumaki / Akatsuki metal shank buttons",
      "Loose streetwear silhouette with drop-shoulder fit",
      "Officially licensed ©2002MK - 2007SP Naruto Shippuden"
    ],
    printTag: "NARUTO",
    accent: "#f97316",
    secondaryAccent: "#c2410c",
    angle: 36,
    xNorm: 0.53,
    crestShape: "swirl",
    assetUrl: `${base}assets/worlds/naruto.png`,
    garmentImgUrl: `${base}assets/garments/naruto_garment.png`,
    lookbookImgUrl: `${base}assets/lookbook/naruto_lookbook.jpg`,
    colors: [
      { name: "Akatsuki Washed Black", hex: "#171717" },
      { name: "Jinchuriki Indigo Wash", hex: "#1e293b" },
      { name: "Konoha Slate", hex: "#475569" }
    ]
  },
  {
    id: "one-punch-man",
    slug: "one-punch-man",
    name: "ONE PUNCH MAN",
    franchise: "HERO ASSOCIATION × YOUNGLA",
    tagline: "Overwhelming power, zero excess.",
    garment: "5053 ONE PUNCH MAN OVERSIZED HOODIE",
    garmentType: "hoodie",
    price: "$55",
    description: "Built to hit just as hard as the hero himself. Heavyweight 460 GSM oversized fleece pullover featuring a radiant full-back graphic of Saitama in explosive combat stance, with Japanese typography and signature red silicone branding patch on the front chest.",
    details: [
      "460 GSM Heavyweight 100% Cotton Fleece",
      "Full-back radiant Saitama Serious Punch high-impact artwork",
      "Silicone high-density YoungLA x OPM chest patch",
      "Oversized relaxed boxy streetwear drape",
      "Officially licensed ONE, Yusuke Murata / SHUEISHA, Hero Association HQ"
    ],
    printTag: "OPM",
    accent: "#eab308",
    secondaryAccent: "#854d0e",
    angle: 56,
    xNorm: 0.80,
    crestShape: "diamond",
    assetUrl: `${base}assets/worlds/one-punch-man.png`,
    garmentImgUrl: `${base}assets/garments/one_punch_man_garment.png`,
    lookbookImgUrl: `${base}assets/lookbook/one_punch_man_lookbook.jpg`,
    colors: [
      { name: "Hero Yellow / Black", hex: "#18181b" },
      { name: "Garou Bloodshot", hex: "#7f1d1d" },
      { name: "City Z Charcoal", hex: "#27272a" }
    ]
  }
];

export function getWorldBySlug(slug: string | null): World | undefined {
  if (!slug) return undefined;
  return WORLDS.find((w) => w.slug === slug || w.id === slug);
}
