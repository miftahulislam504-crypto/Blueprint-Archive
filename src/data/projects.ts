/**
 * The Archive's actual contents — every sheet in the scroll is a real,
 * shipped project. No placeholder copy. `glyph` selects which procedural
 * line-art category RibbonPanel draws (see scenes/glyphs.ts); `seed`
 * drives the per-sheet procedural variation (dimension-line placement,
 * hatch density, registration-mark style) so no two sheets read the same
 * way when scrolling past — the same lesson Igloo learned with their ice
 * blocks: one reused template goes flat fast, so every sheet gets its own
 * hand-drafted feel from a single generator.
 */

export type GlyphKind =
  | "structural"
  | "hub"
  | "ledger"
  | "toolkit"
  | "molecule"
  | "pulse"
  | "network"
  | "function"
  | "commerce"
  | "archive";

export type ArchiveProject = {
  id: string;
  sheetNumber: string; // title-block drawing number, e.g. "A-01"
  title: string;
  system: string; // one-line role in the ecosystem
  description: string;
  stack: string[];
  glyph: GlyphKind;
  seed: number;
  href?: string;
};

export const PROJECTS: ArchiveProject[] = [
  {
    id: "civion",
    sheetNumber: "A-01",
    title: "CIVION",
    system: "Personal portfolio — cinematic 3D",
    description:
      "The archive you're standing in's predecessor: a scroll-driven Three.js world built around a duplex villa, touring every project as a room.",
    stack: ["Next.js", "Three.js", "GSAP", "Lenis"],
    glyph: "archive",
    seed: 11,
    href: "https://mrcivion.vercel.app",
  },
  {
    id: "civilos-structural",
    sheetNumber: "A-02",
    title: "CivilOS Structural",
    system: "Structural analysis engine",
    description:
      "Full 6-DOF space-frame solver — 12×12 stiffness matrices, bi-directional BNBC 2020 seismic loading, story-drift checks with torsional amplification.",
    stack: ["JavaScript", "BNBC 2020", "ACI 318-19", "Firebase"],
    glyph: "structural",
    seed: 4,
  },
  {
    id: "civilos-hub",
    sheetNumber: "A-03",
    title: "CivilOS Hub",
    system: "Ecosystem control room",
    description:
      "The switchboard for six sibling CivilOS apps sharing one Firebase project — unified auth, language toggle, and a single set of Firestore rules across all of them.",
    stack: ["Next.js", "Firebase", "i18n"],
    glyph: "hub",
    seed: 27,
  },
  {
    id: "civilos-estimate",
    sheetNumber: "A-04",
    title: "CivilOS Estimate",
    system: "Cost estimation & BOQ",
    description:
      "Quantity takeoff and cost estimation for construction projects, with a roadmap toward quotation exports, vendor comparison, and revision history.",
    stack: ["JavaScript", "Firebase"],
    glyph: "ledger",
    seed: 9,
  },
  {
    id: "enginex",
    sheetNumber: "A-05",
    title: "EngineX Suite",
    system: "Engineering tool cluster",
    description:
      "Structural, project management, architectural drawing, estimation, reporting, and learning modules, sharing one design system across six apps.",
    stack: ["Next.js", "TypeScript", "Firebase"],
    glyph: "toolkit",
    seed: 33,
  },
  {
    id: "chemistry-unfiltered",
    sheetNumber: "A-06",
    title: "Chemistry Unfiltered",
    system: "Bengali chemistry education",
    description:
      "A বিষয় → অধ্যায় → টপিক hierarchy over Firestore, with a full revision module, notes, and an admin panel for building the whole curriculum in-browser.",
    stack: ["Next.js", "Firestore", "Bengali i18n"],
    glyph: "molecule",
    seed: 18,
  },
  {
    id: "brotherfit",
    sheetNumber: "A-07",
    title: "BrotherFit",
    system: "Fitness commerce + AI inbox",
    description:
      "A fitness e-commerce admin panel with a WhatsApp Business inbox and a Groq-powered auto-reply engine handling customer conversations.",
    stack: ["Next.js", "Firebase", "WhatsApp API", "Groq"],
    glyph: "pulse",
    seed: 22,
  },
  {
    id: "ummahnet",
    sheetNumber: "A-08",
    title: "UmmahNet",
    system: "Social network",
    description:
      "A community feed with a center-FAB post composer, a Zustand-driven UI store, and navigation built for fast one-thumb use.",
    stack: ["Next.js", "Zustand", "Firebase"],
    glyph: "network",
    seed: 41,
  },
  {
    id: "mathx",
    sheetNumber: "A-09",
    title: "MathX",
    system: "Mathematics learning PWA",
    description:
      "A mathematics learning app converted into a full installable PWA — icon sets, manifest, offline shell, and an install banner, tuned in dark violet.",
    stack: ["Next.js", "PWA", "Service Worker"],
    glyph: "function",
    seed: 7,
  },
  {
    id: "buildmart-bd",
    sheetNumber: "A-10",
    title: "BuildMart BD",
    system: "Construction materials marketplace",
    description:
      "A full storefront for Bangladeshi construction materials — catalog, orders, bKash and SSLCommerz checkout, and an admin panel behind it.",
    stack: ["Next.js 14", "Firebase", "bKash", "SSLCommerz"],
    glyph: "commerce",
    seed: 15,
  },
];
