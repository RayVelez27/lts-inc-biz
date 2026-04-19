/**
 * Maps common apparel/SanMar color names to hex codes for swatch rendering.
 * Used by the product listing and detail pages when colorSwatches[].hex is
 * empty (DecoNetwork's API doesn't return hex).
 *
 * The resolver tries an exact match first, then normalizes and does a fuzzy
 * substring match so "True Navy/Grey Heather" resolves to Navy.
 */

const COLOR_MAP: Record<string, string> = {
  // ── blacks ────────────────────────────────────────────────────────────
  black: "#1a1a1a",
  "jet black": "#111111",
  "true black": "#0a0a0a",
  "deep black": "#050505",
  "black heather": "#2d2d2d",
  "dark heather": "#383838",

  // ── whites / naturals ────────────────────────────────────────────────
  white: "#f5f5f5",
  "bright white": "#ffffff",
  natural: "#f3ede0",
  cream: "#fef3c7",
  ivory: "#fffff0",
  "light sand": "#d5bfa7",
  sand: "#c2b280",
  oatmeal: "#d9cbac",
  "oatmeal heather": "#cec3a9",

  // ── greys ─────────────────────────────────────────────────────────────
  grey: "#808080",
  gray: "#808080",
  "light grey": "#b0b0b0",
  "light gray": "#b0b0b0",
  "athletic heather": "#b0b0b0",
  "light heather grey": "#c4c4c4",
  "steel grey": "#71797e",
  "steel gray": "#71797e",
  graphite: "#5c5c5c",
  "graphite heather": "#6e6e6e",
  charcoal: "#3c3c3c",
  "charcoal heather": "#484848",
  "dark charcoal": "#333333",
  silver: "#c0c0c0",
  ash: "#b2beb5",
  smoke: "#96969c",
  "grey heather": "#9c9c9c",
  "sport grey": "#90908e",
  "rs sport grey": "#90908e",
  slate: "#708090",

  // ── navies / dark blues ──────────────────────────────────────────────
  navy: "#1a3a5c",
  "true navy": "#1e2d48",
  "new navy": "#1c2e4a",
  "dark navy": "#0e1d36",
  "classic navy": "#1b3056",
  "navy blazer": "#1e2952",
  "college navy": "#1b2a4a",
  "navy frost": "#3a4f6f",
  midnight: "#191970",
  "midnight navy": "#141e3c",

  // ── blues ─────────────────────────────────────────────────────────────
  blue: "#2563eb",
  royal: "#4169e1",
  "true royal": "#3a5ba0",
  "deep royal": "#1a4290",
  "sport royal": "#2856a3",
  "electric blue": "#5f80b2",
  "light blue": "#93c5fd",
  "ice blue": "#add0e9",
  "carolina blue": "#7bafd4",
  "pacific blue": "#1ca9c9",
  "aquatic blue": "#48a9c4",
  "powder blue": "#b0d4f1",
  cobalt: "#0047ab",
  teal: "#008080",
  cyan: "#00bcd4",

  // ── reds ──────────────────────────────────────────────────────────────
  red: "#cc1133",
  "true red": "#c6113a",
  "sport red": "#c6113a",
  "deep red": "#a01030",
  "dark red": "#8b0000",
  crimson: "#dc143c",
  cardinal: "#c41e3a",
  scarlet: "#ff2400",
  "university red": "#cc0033",

  // ── maroons / burgundy ───────────────────────────────────────────────
  maroon: "#6e243d",
  burgundy: "#800020",
  "dark maroon": "#5c0923",
  wine: "#722f37",
  "sport maroon": "#6e243d",

  // ── pinks ─────────────────────────────────────────────────────────────
  pink: "#ec4899",
  "awareness pink": "#ea76a6",
  "flush pink": "#9a2855",
  "light pink": "#f9a8d4",
  "hot pink": "#ff69b4",
  "neon pink": "#ff6ec7",
  blush: "#de5d83",
  rose: "#b65b64",
  coral: "#ff7f50",
  salmon: "#fa8072",

  // ── oranges ───────────────────────────────────────────────────────────
  orange: "#f97316",
  "sport orange": "#ed4d1b",
  "neon orange": "#ff6700",
  "safety orange": "#ff6600",
  "texas orange": "#bf5700",
  tangerine: "#ff9966",
  rust: "#b7410e",

  // ── yellows / golds ──────────────────────────────────────────────────
  yellow: "#eab308",
  gold: "#d4a017",
  "athletic gold": "#d4a017",
  "safety yellow": "#dbf26e",
  "neon yellow": "#ccff00",
  "light yellow": "#ffffe0",
  maize: "#fbc02d",
  "vegas gold": "#c5b358",
  sunflower: "#ffda03",

  // ── greens ────────────────────────────────────────────────────────────
  green: "#16a34a",
  "forest green": "#166534",
  "forest": "#166534",
  "true hunter": "#0a4a2f",
  "dark green": "#0d4b28",
  "sport dark green": "#215c3e",
  "sport forest": "#045b48",
  kelly: "#00955d",
  "sport kelly": "#217856",
  lime: "#84cc16",
  "neon green": "#39ff14",
  "safety green": "#6bff00",
  olive: "#6b8e23",
  sage: "#9caf88",
  basil: "#596c62",
  "army green": "#4b5320",
  hunter: "#355e3b",
  mint: "#98fb98",

  // ── purples ───────────────────────────────────────────────────────────
  purple: "#7c3aed",
  "team purple": "#3f2955",
  "sport purple": "#4f2781",
  "deep purple": "#3c1874",
  "dark purple": "#301934",
  violet: "#8b5cf6",
  lavender: "#b57edc",
  plum: "#8e4585",
  eggplant: "#614051",

  // ── browns / tans ────────────────────────────────────────────────────
  brown: "#8b4513",
  "dark brown": "#573b2e",
  "sport dark brown": "#573b2e",
  "coyote brown": "#9c9175",
  tan: "#d2b48c",
  khaki: "#bdb76b",
  "dark khaki": "#9c8a5d",
  taupe: "#8b7d6b",
  camel: "#c19a6b",
  "duck brown": "#665544",
  "carhartt brown": "#6b4423",
  bittersweet: "#835a3a",

  // ── specialty ─────────────────────────────────────────────────────────
  "hi-vis yellow": "#f0e130",
  "hi-vis orange": "#ff5f15",
  "hi-vis green": "#66ff00",
  "safety green/navy": "#6bff00",
  "brite orange": "#ff6600",
  realtree: "#4a5c3a",
  mossy: "#4a5032",
  camo: "#5c6642",
  denim: "#3c4f6e",
  indigo: "#3f51b5",
  "washed indigo": "#5c6bc0",
  porcelain: "#e8e8e0",
  saltwater: "#89bdb9",
};

const normalized = new Map<string, string>();
for (const [k, v] of Object.entries(COLOR_MAP)) {
  normalized.set(k, v);
}

/**
 * Resolve a color name (e.g. "True Navy/Grey Heather") to a hex code.
 * Returns the fallback color if nothing matches.
 */
export function resolveColorHex(name: string, fallback = "#94a3b8"): string {
  if (!name) return fallback;

  const lower = name.toLowerCase().trim();

  // Exact match
  const exact = normalized.get(lower);
  if (exact) return exact;

  // For compound names like "True Navy/True Navy" or "Khaki/True Black",
  // try the first part, then the second.
  if (lower.includes("/")) {
    for (const part of lower.split("/")) {
      const hex = normalized.get(part.trim());
      if (hex) return hex;
    }
  }

  // Fuzzy: check if any key is a substring of the input.
  // Sort by longest key first so "dark navy" beats "navy" for "dark navy heather".
  const keys = [...normalized.keys()].sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return normalized.get(key)!;
  }

  return fallback;
}
