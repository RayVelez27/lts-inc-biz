// Fetches products from the DecoNetwork Product Management API and merges
// them into src/lib/products.ts.
//
// Usage:
//   node scripts/fetch-from-deco.mjs                 # default: add 50 new products
//   node scripts/fetch-from-deco.mjs --count=100     # add up to N new products
//   node scripts/fetch-from-deco.mjs --replace       # regenerate the entire file
//   node scripts/fetch-from-deco.mjs --from-id=1000  # start from a given offset
//
// Auth is read from .env.local (DECO_API_USERNAME, DECO_API_PASSWORD).
//
// Strategy — hybrid:
//   1. manage_products/find  → paginated list of product IDs
//   2. manage_products/get?ids=a,b,c (batch of up to 100) → structured data
//      (name, code, colors, sizes, SKUs, prices, category)
//   3. scrape /blank_product/<id>/<slug> HTML → og:image + og:description
//      (the Deco API response has neither)
//   4. map to our Product shape and append to src/lib/products.ts

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const PRODUCTS_FILE = path.join(PROJECT_ROOT, "src", "lib", "products.ts");

// ─── env ───────────────────────────────────────────────────────────────────
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(PROJECT_ROOT, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);
const BASE = env.NEXT_PUBLIC_DECO_API_URL || "https://www.ltsportland.com";
const USER = env.DECO_API_USERNAME;
const PASS = env.DECO_API_PASSWORD;
if (!USER || !PASS) {
  throw new Error("DECO_API_USERNAME / DECO_API_PASSWORD missing from .env.local");
}

// ─── args ──────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const COUNT = Number(args.count ?? 50);
const REPLACE = Boolean(args.replace);
const FROM_ID_OFFSET = Number(args["from-id"] ?? 0);

// ─── default sizes by leaf category (when Deco lists no sizes) ─────────────
const DEFAULT_SIZES_BY_CATEGORY = {
  Tees: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  "Long Sleeves": ["S", "M", "L", "XL", "2XL", "3XL"],
  Polos: ["S", "M", "L", "XL", "2XL", "3XL"],
  Tanks: ["S", "M", "L", "XL", "2XL"],
  Performance: ["S", "M", "L", "XL", "2XL", "3XL"],
  Crewnecks: ["S", "M", "L", "XL", "2XL", "3XL"],
  Hoodies: ["S", "M", "L", "XL", "2XL", "3XL"],
  Jackets: ["S", "M", "L", "XL", "2XL", "3XL"],
  Caps: ["One Size"],
};

// ─── API helpers ───────────────────────────────────────────────────────────
const authParams = () =>
  `username=${encodeURIComponent(USER)}&password=${encodeURIComponent(PASS)}`;

async function apiFind({ limit = 100, offset = 0 } = {}) {
  // field=4 (Product ID) + condition=4 (>) + string=0 → "id > 0" → all products.
  // Verified against the live API: returns all 12,866 products.
  const body = new URLSearchParams({
    field: "4",
    condition: "4",
    string: "0",
    limit: String(limit),
    offset: String(offset),
    sortby: "1",
    username: USER,
    password: PASS,
  });
  const res = await fetch(`${BASE}/api/json/manage_products/find`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`find failed: ${res.status}`);
  const json = await res.json();
  if (json.response_status?.severity === "ERROR") {
    throw new Error(`find: ${json.response_status.description}`);
  }
  return json.products || json.product || [];
}

async function apiGet(ids) {
  const url = `${BASE}/api/json/manage_products/get?${authParams()}&ids=${ids.join(",")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`get failed: ${res.status}`);
  const json = await res.json();
  if (json.response_status?.severity === "ERROR") {
    throw new Error(`get: ${json.response_status.description}`);
  }
  // Single product → { product: {} }. Multiple → { products: [] }.
  return json.products || (json.product ? [json.product] : []);
}

async function fetchDetailMeta(productId, slug) {
  const slugSafe = slug || "product";
  const url = `${BASE}/blank_product/${productId}/${slugSafe}`;
  const res = await fetch(url);
  if (!res.ok) return { image: "", description: "" };
  const html = await res.text();
  const ogImage = /property="og:image"\s+content="([^"]+)"/.exec(html)?.[1] ?? "";
  const ogDesc = /property="og:description"\s+content="([^"]+)"/.exec(html)?.[1] ?? "";
  // Upgrade the default 200×200 thumb to 600×600.
  const image = ogImage.replace("/200/200/", "/600/600/");
  return { image, description: ogDesc };
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const leafCategory = (cats) => {
  if (!cats || cats.length === 0) return "Uncategorized";
  // Deco's top-level ("Mens", "Womens") is too broad; prefer the category name
  // (which is typically the leaf like "Jackets"/"Polos").
  return cats[0].name;
};

function toProduct(apiRow, detail) {
  const prices = (apiRow.skus || []).map((s) => Number(s.price)).filter((n) => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const colors = (apiRow.colors || []).map((c) => c.name).filter(Boolean);
  const colorSwatches = (apiRow.colors || []).map((c) => ({
    id: String(c.id),
    name: String(c.name),
    hex: "", // Deco API doesn't return hex; fallback UI treats empty as default.
  }));
  const category = leafCategory(apiRow.categories);
  const sizeCodes = (apiRow.sizes || []).map((s) => s.code).filter(Boolean);
  const sizes = sizeCodes.length ? sizeCodes : DEFAULT_SIZES_BY_CATEGORY[category] || ["One Size"];
  const slug = slugify(apiRow.product_name || apiRow.product_code || String(apiRow.product_id));

  return {
    id: String(apiRow.product_id),
    code: apiRow.product_code || undefined,
    slug,
    name: apiRow.product_name,
    description: detail.description || "",
    price: minPrice,
    image: detail.image || "",
    category,
    colors,
    colorSwatches,
    sizes,
  };
}

// ─── concurrency helper ─────────────────────────────────────────────────────
async function mapConcurrent(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    for (;;) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

// ─── read existing products.ts to get IDs + structure ──────────────────────
function parseExistingIds() {
  if (!fs.existsSync(PRODUCTS_FILE)) return new Set();
  const src = fs.readFileSync(PRODUCTS_FILE, "utf8");
  const ids = new Set();
  for (const m of src.matchAll(/id:\s*"(\d+)"/g)) ids.add(m[1]);
  return ids;
}

// ─── main ───────────────────────────────────────────────────────────────────
async function main() {
  const existingIds = REPLACE ? new Set() : parseExistingIds();
  console.log(`existing products: ${existingIds.size}${REPLACE ? " (will be replaced)" : ""}`);

  // 1. Paginate find() until we have `COUNT` new product IDs.
  const wantIds = [];
  let offset = FROM_ID_OFFSET;
  while (wantIds.length < COUNT) {
    const batch = await apiFind({ limit: 100, offset });
    if (!batch.length) {
      console.log(`find() returned empty at offset ${offset}; stopping`);
      break;
    }
    for (const p of batch) {
      const id = String(p.product_id);
      if (existingIds.has(id)) continue;
      wantIds.push(id);
      if (wantIds.length >= COUNT) break;
    }
    offset += batch.length;
    process.stdout.write(`\r  find offset ${offset} → ${wantIds.length}/${COUNT} new IDs`);
  }
  console.log();

  if (!wantIds.length) {
    console.log("nothing to fetch");
    return;
  }

  // 2. Batch get() in groups of 100.
  const detailed = [];
  for (let i = 0; i < wantIds.length; i += 100) {
    const chunk = wantIds.slice(i, i + 100);
    const rows = await apiGet(chunk);
    detailed.push(...rows);
    console.log(`  get() batch ${i / 100 + 1}: ${rows.length} products`);
  }

  // 3. Fetch detail page HTML in parallel for og:image + og:description.
  console.log(`  scraping ${detailed.length} detail pages for images/descriptions...`);
  const meta = await mapConcurrent(detailed, 10, (row) =>
    fetchDetailMeta(row.product_id, slugify(row.product_name)),
  );

  // 4. Map to Product shape.
  const newProducts = detailed.map((row, i) => toProduct(row, meta[i]));
  console.log(`  mapped ${newProducts.length} products`);

  // 5. Merge into products.ts.
  mergeIntoProductsFile(newProducts, { replace: REPLACE });
  console.log(`✓ wrote ${path.relative(PROJECT_ROOT, PRODUCTS_FILE)}`);
}

// ─── products.ts writer ────────────────────────────────────────────────────
function mergeIntoProductsFile(newProducts, { replace }) {
  let existing = [];
  if (!replace && fs.existsSync(PRODUCTS_FILE)) {
    // Parse existing products by evaluating the array literal — we generated
    // the file, so we control its shape.
    const src = fs.readFileSync(PRODUCTS_FILE, "utf8");
    const decl = "export const products: Product[] =";
    const i = src.indexOf(decl);
    if (i !== -1) {
      // Skip past the `=` first — otherwise we'd match the `[` in `Product[]`.
      const eq = src.indexOf("=", i);
      const open = src.indexOf("[", eq);
      let depth = 0, inStr = null, end = -1;
      for (let j = open; j < src.length; j++) {
        const c = src[j];
        if (inStr) { if (c === "\\") { j++; continue; } if (c === inStr) inStr = null; continue; }
        if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
        if (c === "[") depth++;
        else if (c === "]") { depth--; if (depth === 0) { end = j; break; } }
      }
      if (end !== -1) {
        existing = new Function(`return ${src.slice(open, end + 1)};`)();
      }
    }
  }

  const all = [...existing, ...newProducts];

  // Discover categories in source order.
  const categorySet = [];
  for (const p of all) if (!categorySet.includes(p.category)) categorySet.push(p.category);

  const jsStr = (v) => (v == null ? '""' : JSON.stringify(String(v)));
  const tsProduct = (p) => {
    const lines = [
      "  {",
      `    id: ${jsStr(p.id)},`,
      p.code ? `    code: ${jsStr(p.code)},` : null,
      p.slug ? `    slug: ${jsStr(p.slug)},` : null,
      `    name: ${jsStr(p.name)},`,
      `    description: ${jsStr(p.description)},`,
      `    price: ${Number(p.price) || 0},`,
      `    image: ${jsStr(p.image)},`,
      `    category: ${jsStr(p.category)},`,
      `    colors: ${JSON.stringify(p.colors || [])},`,
      `    colorSwatches: ${JSON.stringify(p.colorSwatches || [])},`,
      `    sizes: ${JSON.stringify(p.sizes || [])},`,
      p.featured ? "    featured: true," : null,
      p.new ? "    new: true," : null,
      p.badge ? `    badge: ${jsStr(p.badge)},` : null,
      "  }",
    ].filter(Boolean);
    return lines.join("\n");
  };

  const output = `// ─────────────────────────────────────────────────────────────────────────────
// GENERATED FILE — edit scripts/fetch-from-deco.mjs / gen-products-ts.mjs and
// re-run, not this file.
//   node scripts/fetch-from-deco.mjs --count=50
// Source: DecoNetwork Product Management API + og:image/og:description
// scraped from /blank_product/ detail pages on ${BASE}.
// Total products: ${all.length}.
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
  /** Legacy LT's Business field — currently unused. */
  subcategory?: string;
  /** Color names only — keeps legacy UI code that iterates p.colors working. */
  colors: string[];
  /** Rich color data ({id, name, hex}) for swatch rendering. Hex is empty
   *  when the source API doesn't provide it (e.g. DecoNetwork). */
  colorSwatches?: ProductColor[];
  sizes: string[];
  featured?: boolean;
  new?: boolean;
  /** Marketing badge text (e.g. "VALUE PICK"). */
  badge?: string;
}

export const categories: Record<string, { name: string; subcategories: string[] }> = {
${categorySet.map((c) => `  ${JSON.stringify(c)}: { name: ${jsStr(c)}, subcategories: [] as string[] },`).join("\n")}
};

export const products: Product[] = [
${all.map(tsProduct).join(",\n")},
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

  fs.writeFileSync(PRODUCTS_FILE, output);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
