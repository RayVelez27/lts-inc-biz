// Regenerates supabase/seed.sql from the Throwback Threads products.ts file.
//
// Usage:
//   node scripts/seed-from-throwback.mjs
//
// Reads the source file path from THROWBACK_PRODUCTS_TS if set, otherwise
// falls back to the sibling download location used during initial import.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");

const DEFAULT_SOURCE =
  "C:/Users/raymo/Downloads/throwback-threads-main/throwback-threads-main/src/lib/products.ts";

const SOURCE = process.env.THROWBACK_PRODUCTS_TS || DEFAULT_SOURCE;
const OUT = path.join(PROJECT_ROOT, "supabase", "seed.sql");

const src = fs.readFileSync(SOURCE, "utf8");

// Extract the `allProducts` array literal by walking brackets. The array
// contents are plain JS — TS type annotations only appear on the `const`
// declaration, not inside the array.
const marker = "export const allProducts";
const declStart = src.indexOf(marker);
if (declStart === -1) throw new Error(`'${marker}' not found in ${SOURCE}`);

// Skip past the `=` first — otherwise we'd match the `[` in `Product[]`.
const eqIdx = src.indexOf("=", declStart);
if (eqIdx === -1) throw new Error("= sign after allProducts not found");
const openIdx = src.indexOf("[", eqIdx);
if (openIdx === -1) throw new Error("opening [ of allProducts not found");

let depth = 0;
let inStr = null;
let end = -1;
for (let i = openIdx; i < src.length; i++) {
  const c = src[i];
  if (inStr) {
    if (c === "\\") { i++; continue; }
    if (c === inStr) inStr = null;
    continue;
  }
  if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
  if (c === "[") depth++;
  else if (c === "]") {
    depth--;
    if (depth === 0) { end = i; break; }
  }
}
if (end === -1) throw new Error("closing ] of allProducts not found");

const arrayText = src.slice(openIdx, end + 1);
const products = new Function(`return ${arrayText};`)();

if (!Array.isArray(products) || products.length === 0) {
  throw new Error("allProducts evaluated to an empty or non-array value");
}

const sqlStr = (v) => {
  if (v == null) return "null";
  return `'${String(v).replace(/'/g, "''")}'`;
};

const lines = [];
lines.push("-- ============================================================================");
lines.push("-- Product catalog seed — Throwback Threads");
lines.push(`-- Generated from ${path.basename(SOURCE)} (${products.length} products).`);
lines.push("-- Re-runnable: on conflict do update.");
lines.push("-- Regenerate with: node scripts/seed-from-throwback.mjs");
lines.push("-- ============================================================================");
lines.push("");
lines.push("insert into public.products");
lines.push("  (id, code, slug, name, description, price, image, category, badge, colors)");
lines.push("values");

const rows = products.map((p) => {
  const colorsJson = JSON.stringify(p.colors ?? []);
  return [
    "  (",
    sqlStr(p.id), ", ",
    sqlStr(p.code), ", ",
    sqlStr(p.slug), ", ",
    sqlStr(p.name), ", ",
    sqlStr(p.description), ", ",
    typeof p.price === "number" ? p.price.toFixed(2) : "null", ", ",
    sqlStr(p.image), ", ",
    sqlStr(p.category), ", ",
    sqlStr(p.badge), ", ",
    sqlStr(colorsJson), "::jsonb",
    ")",
  ].join("");
});
lines.push(rows.join(",\n"));
lines.push("");
lines.push("on conflict (id) do update set");
lines.push("  code        = excluded.code,");
lines.push("  slug        = excluded.slug,");
lines.push("  name        = excluded.name,");
lines.push("  description = excluded.description,");
lines.push("  price       = excluded.price,");
lines.push("  image       = excluded.image,");
lines.push("  category    = excluded.category,");
lines.push("  badge       = excluded.badge,");
lines.push("  colors      = excluded.colors,");
lines.push("  updated_at  = now();");
lines.push("");

fs.writeFileSync(OUT, lines.join("\n"));
console.log(`Wrote ${products.length} products to ${path.relative(PROJECT_ROOT, OUT)}`);
