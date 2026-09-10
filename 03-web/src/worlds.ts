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
    garment: "GOTHAM TACTICAL BOMBER AND VEST",
    garmentType: "jacket",
    price: "$120",
    description: "Constructed from 480 GSM heavy brushed fleece with matte silicone bat emblem and military-spec hardware. Engineered for nocturnal training and city movement.",
    details: [
      "480 GSM Heavyweight Brushed Fleece",
      "Matte silicone tonal Bat insignia",
      "Reinforced tactical utility chest harness",
      "Heavy-gauge two-way matte black zipper",
      "Drop shoulder oversized silhouette"
    ],
    printTag: "GOTHAM",
    accent: "#38bdf8",
    secondaryAccent: "#1e293b",
    angle: -56,
    xNorm: -0.78,
    crestShape: "bat",
    assetUrl: `${base}assets/worlds/batman.png`,
    garmentImgUrl: `${base}assets/garments/batman_garment.png`,
    colors: [
      { name: "Gotham Black", hex: "#0b0c10" },
      { name: "Shadow Charcoal", hex: "#1f242d" },
      { name: "Arkham Slate", hex: "#334155" }
    ]
  },
  {
    id: "the-boys",
    slug: "the-boys",
    name: "THE BOYS",
    franchise: "VOUGHT INT. × YOUNGLA",
    tagline: "No capes. No mercy. Built by Vought.",
    garment: "VOUGHT OVERSIZED LEATHERETTE RACER",
    garmentType: "jacket",
    price: "$130",
    description: "Full grain vegan leather with custom embossed Vought crest lining, raw cut hem, and blood-red contrast stitching. Unapologetic streetwear dominance.",
    details: [
      "Premium heavyweight vegan leather shell",
      "High-density red Vought monogram lining",
      "Distressed industrial snap collar",
      "Custom gunmetal hardware pulls",
      "Boxy athletic cropped cut"
    ],
    printTag: "THE BOYS",
    accent: "#ef4444",
    secondaryAccent: "#991b1b",
    angle: -36,
    xNorm: -0.52,
    crestShape: "vought",
    assetUrl: `${base}assets/worlds/the-boys.png`,
    garmentImgUrl: `${base}assets/garments/the_boys_garment.png`,
    colors: [
      { name: "Compound Red", hex: "#b91c1c" },
      { name: "Vought Obsidian", hex: "#09090b" },
      { name: "Supes Crimson", hex: "#7f1d1d" }
    ]
  },
  {
    id: "demon-slayer",
    slug: "demon-slayer",
    name: "DEMON SLAYER",
    franchise: "KIMETSU × YOUNGLA",
    tagline: "Total concentration. Precision cut through darkness.",
    garment: "WATER BREATHING KIMONO HAORI AND CARGO",
    garmentType: "hoodie",
    price: "$98",
    description: "Traditional haori drape re-engineered with modern 420 GSM structured cotton twill, geometric checkered print, and reinforced drop-shoulder fit.",
    details: [
      "420 GSM Structured Cotton Twill",
      "Subtle jacquard checkered weave",
      "Reinforced kimono collar band",
      "Dual hidden magnetic seam closures",
      "Water Breathing wave hem embroidery"
    ],
    printTag: "SLAYER",
    accent: "#10b981",
    secondaryAccent: "#065f46",
    angle: -18,
    xNorm: -0.28,
    crestShape: "katana",
    assetUrl: `${base}assets/worlds/demon-slayer.png`,
    garmentImgUrl: `${base}assets/garments/demon_slayer_garment.png`,
    colors: [
      { name: "Nichirin Emerald", hex: "#065f46" },
      { name: "Demon Raven", hex: "#0f172a" },
      { name: "Mist Teal", hex: "#115e59" }
    ]
  },
  {
    id: "youngla-originals",
    slug: "youngla-originals",
    name: "YOUNGLA ORIGINALS",
    franchise: "THE HOUSE LINE",
    tagline: "Discipline creates freedom. The architectural foundation.",
    garment: "IMMORTAL 500 GSM HEAVYWEIGHT HOODIE",
    garmentType: "hoodie",
    price: "$88",
    description: "The core YoungLA standard. 500 GSM ultra-heavy organic loopback terry with architectural cut, double-layered hood, and vintage mineral wash.",
    details: [
      "500 GSM 100% Organic French Terry",
      "Double-layered heavyweight structured hood",
      "Distressed vintage stone wash finish",
      "Seamless kangaroo pocket with bar-tack reinforcement",
      "Signature YoungLA puff-print branding"
    ],
    printTag: "ORIGINALS",
    accent: "#ffffff",
    secondaryAccent: "#64748b",
    angle: 0,
    xNorm: 0.0,
    crestShape: "hexagon",
    assetUrl: `${base}assets/worlds/youngla-originals.png`,
    garmentImgUrl: `${base}assets/garments/youngla_originals_garment.png`,
    colors: [
      { name: "Washed Mineral Black", hex: "#18181b" },
      { name: "Brutalist Bone", hex: "#e2e8f0" },
      { name: "Raw Concrete", hex: "#3f3f46" }
    ]
  },
  {
    id: "attack-on-titan",
    slug: "attack-on-titan",
    name: "ATTACK ON TITAN",
    franchise: "SURVEY CORPS × YOUNGLA",
    tagline: "Beyond the walls, built different. Dedicate your heart.",
    garment: "SURVEY CORPS COMBAT PARKA",
    garmentType: "jacket",
    price: "$135",
    description: "Weatherproof ripstop technical shell featuring dual Wings of Freedom high-density embroidery, modular tactical utility harness, and magnetic cowl.",
    details: [
      "3-Layer DWR Weatherproof Ripstop",
      "High-density Wings of Freedom chest and back embroidery",
      "Modular quick-release utility harness",
      "Storm flap with dual YKK waterproof zippers",
      "Internal thermal insulated lining"
    ],
    printTag: "TITAN",
    accent: "#84cc16",
    secondaryAccent: "#3f6212",
    angle: 18,
    xNorm: 0.28,
    crestShape: "wings",
    assetUrl: `${base}assets/worlds/attack-on-titan.png`,
    garmentImgUrl: `${base}assets/garments/attack_on_titan_garment.png`,
    colors: [
      { name: "Scout Military Olive", hex: "#365314" },
      { name: "Wall Rose Stone", hex: "#1c1917" },
      { name: "Titan Clay", hex: "#451a03" }
    ]
  },
  {
    id: "naruto-shippuden",
    slug: "naruto-shippuden",
    name: "NARUTO SHIPPUDEN",
    franchise: "KONOHA × YOUNGLA",
    tagline: "The will of fire. Defy destiny.",
    garment: "SHADOW CLONE HEAVY TRACKSUIT",
    garmentType: "tracksuit",
    price: "$115",
    description: "Black and Konoha gold metallic track suit with embroidered Hidden Leaf village crest, sealed chakra cord toggles, and tailored taper.",
    details: [
      "Heavyweight poly-cotton technical tricot",
      "Metallic Konoha leaf embroidery on chest",
      "Gold side piping with tonal swirl motif",
      "Custom engraved Uzumaki spiral zipper pull",
      "Ribbed athletic cuffs with ankle zips"
    ],
    printTag: "NARUTO",
    accent: "#f97316",
    secondaryAccent: "#c2410c",
    angle: 36,
    xNorm: 0.53,
    crestShape: "swirl",
    assetUrl: `${base}assets/worlds/naruto.png`,
    garmentImgUrl: `${base}assets/garments/naruto_garment.png`,
    colors: [
      { name: "Konoha Gold / Onyx", hex: "#0c0a09" },
      { name: "Sage Orange", hex: "#c2410c" },
      { name: "Shinobi Slate", hex: "#292524" }
    ]
  },
  {
    id: "one-punch-man",
    slug: "one-punch-man",
    name: "ONE PUNCH MAN",
    franchise: "HERO ASSOCIATION × YOUNGLA",
    tagline: "Overwhelming power, zero excess.",
    garment: "OPM OVERSIZED HEAVY HOODIE",
    garmentType: "hoodie",
    price: "$95",
    description: "Hero Association heavyweight fleece with Saitama fist silicone emblem, custom drop-shoulder tailoring, and signature contrast eyelets.",
    details: [
      "460 GSM Heavyweight French Terry",
      "Saitama One Punch silicone micro-patch",
      "High-density yellow contrast cord",
      "Deep kangaroo pocket",
      "Oversized boxy luxury silhouette"
    ],
    printTag: "OPM",
    accent: "#eab308",
    secondaryAccent: "#854d0e",
    angle: 56,
    xNorm: 0.80,
    crestShape: "diamond",
    assetUrl: `${base}assets/worlds/one-punch-man.png`,
    garmentImgUrl: `${base}assets/garments/one_punch_man_garment.png`,
    colors: [
      { name: "Hero Yellow / Black", hex: "#18181b" },
      { name: "Punch Gold", hex: "#a16207" },
      { name: "City Z Charcoal", hex: "#27272a" }
    ]
  }
];

export function getWorldBySlug(slug: string | null): World | undefined {
  if (!slug) return undefined;
  return WORLDS.find((w) => w.slug === slug || w.id === slug);
}
