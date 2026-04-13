// Regenerates src/lib/products.ts from the Throwback Threads products.ts.
//
// Usage:
//   node scripts/gen-products-ts.mjs
//
// Strategy: keep the existing shape of src/lib/products.ts (so the ~11 call
// sites that read p.colors/p.sizes/etc. keep working unchanged) but populate
// it from the Throwback catalog. Rich color data (hex) is exposed via the
// new optional `colorSwatches` field.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");

const SOURCE =
  process.env.THROWBACK_PRODUCTS_TS ||
  "C:/Users/raymo/Downloads/throwback-threads-main/throwback-threads-main/src/lib/products.ts";
const OUT = path.join(PROJECT_ROOT, "src", "lib", "products.ts");

// Default size sets per Throwback category, since Throwback source has no sizes.
const SIZES_BY_CATEGORY = {
  Tees:          ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  "Long Sleeves":["S", "M", "L", "XL", "2XL", "3XL"],
  Polos:         ["S", "M", "L", "XL", "2XL", "3XL"],
  Tanks:         ["S", "M", "L", "XL", "2XL"],
  Performance:   ["S", "M", "L", "XL", "2XL", "3XL"],
  Crewnecks:     ["S", "M", "L", "XL", "2XL", "3XL"],
  Hoodies:       ["S", "M", "L", "XL", "2XL", "3XL"],
  Jackets:       ["S", "M", "L", "XL", "2XL", "3XL"],
  Caps:          ["One Size"],
};

// ─── parse source ──────────────────────────────────────────────────────────
const src = fs.readFileSync(SOURCE, "utf8");
const declStart = src.indexOf("export const allProducts");
if (declStart === -1) throw new Error("allProducts not found");
const eq = src.indexOf("=", declStart);
const open = src.indexOf("[", eq);

let depth = 0, inStr = null, end = -1;
for (let i = open; i < src.length; i++) {
  const c = src[i];
  if (inStr) { if (c === "\\") { i++; continue; } if (c === inStr) inStr = null; continue; }
  if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
  if (c === "[") depth++;
  else if (c === "]") { depth--; if (depth === 0) { end = i; break; } }
}
if (end === -1) throw new Error("array end not found");

const allProducts = new Function(`return ${src.slice(open, end + 1)};`)();
if (!Array.isArray(allProducts) || allProducts.length === 0) {
  throw new Error("parsed allProducts was empty");
}

// ─── build TS output ───────────────────────────────────────────────────────
const jsStr = (v) => (v == null ? '""' : JSON.stringify(String(v)));

const tsProducts = allProducts.map((p) => {
  const sizes = SIZES_BY_CATEGORY[p.category] || ["One Size"];
  const colorNames = (p.colors || []).map((c) => c.name);
  const featured = p.badge === "VALUE PICK";
  const lines = [
    "  {",
    `    id: ${jsStr(p.id)},`,
    p.code  ? `    code: ${jsStr(p.code)},` : null,
    p.slug  ? `    slug: ${jsStr(p.slug)},` : null,
    `    name: ${jsStr(p.name)},`,
    `    description: ${jsStr(p.description)},`,
    `    price: ${typeof p.price === "number" ? p.price : 0},`,
    `    image: ${jsStr(p.image)},`,
    `    category: ${jsStr(p.category)},`,
    `    colors: ${JSON.stringify(colorNames)},`,
    `    colorSwatches: ${JSON.stringify(p.colors || [])},`,
    `    sizes: ${JSON.stringify(sizes)},`,
    featured ? "    featured: true," : null,
    p.badge ? `    badge: ${jsStr(p.badge)},` : null,
    "  }",
  ].filter(Boolean);
  return lines.join("\n");
});

// Collect unique categories from the data (in source order).
const categorySet = [];
for (const p of allProducts) if (!categorySet.includes(p.category)) categorySet.push(p.category);

const categoriesObj =
  "{\n" +
  categorySet
    .map(
      (c) =>
        `  ${JSON.stringify(c)}: { name: ${jsStr(c)}, subcategories: [] as string[] },`,
    )
    .join("\n") +
  "\n}";

const output = `// ─────────────────────────────────────────────────────────────────────────────
// GENERATED FILE — edit scripts/gen-products-ts.mjs and re-run, not this file.
//   node scripts/gen-products-ts.mjs
// Source: Throwback Threads catalog (${allProducts.length} products).
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  code?: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  /** Legacy LT's Business field — Throwback catalog leaves this undefined. */
  subcategory?: string;
  /** Color names only — keeps legacy UI code that iterates p.colors working. */
  colors: string[];
  /** Rich color data ({id, name, hex}) for swatch rendering. Optional for
   *  back-compat with code/tests that only populate \`colors\`. */
  colorSwatches?: ProductColor[];
  sizes: string[];
  featured?: boolean;
  new?: boolean;
  /** Throwback-style marketing badge (e.g. "VALUE PICK"). */
  badge?: string;
}

export const categories: Record<string, { name: string; subcategories: string[] }> = ${categoriesObj};

export const products: Product[] = [
${tsProducts.join(",\n")},
];

export const volumeDiscounts = [
  { minQty: 24, maxQty: 47, discount: 5, label: "5% Off" },
  { minQty: 48, maxQty: 71, discount: 10, label: "10% Off" },
  { minQty: 72, maxQty: 143, discount: 15, label: "15% Off" },
  { minQty: 144, maxQty: Number.POSITIVE_INFINITY, discount: 20, label: "20% Off" },
];

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsBySubcategory(subcategory: string): Product[] {
  return products.filter((p) => p.subcategory === subcategory);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.new);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
`;

fs.writeFileSync(OUT, output);
console.log(
  `Wrote ${allProducts.length} products + ${categorySet.length} categories to ${path.relative(PROJECT_ROOT, OUT)}`,
);
