-- ============================================================================
-- 0002 — Evolve products table to match the Throwback Threads catalog shape.
-- ============================================================================
-- Changes:
--   * New columns: code, slug, badge
--   * colors: text[] → jsonb (stores [{id, name, hex}, ...] or plain strings)
--   * subcategory: drop NOT NULL (Throwback products have no subcategory)
--   * Clear placeholder catalog from 0001 so the new seed starts clean
-- ============================================================================

begin;

-- Clear placeholder LT's Business catalog from seed.sql in 0001.
-- Cascades into cart_items (ON DELETE CASCADE) and nulls product_id in
-- order_items (ON DELETE SET NULL). No real orders exist yet.
delete from public.products;

alter table public.products
  add column if not exists code  text,
  add column if not exists slug  text,
  add column if not exists badge text;

-- Unique on slug, but allow many NULLs (admin-created rows may lack one).
create unique index if not exists products_slug_key
  on public.products(slug)
  where slug is not null;

create index if not exists products_code_idx on public.products(code);

-- Throwback catalog has no subcategory.
alter table public.products alter column subcategory drop not null;

-- colors: text[] → jsonb. Table is empty (we just deleted), so the USING
-- conversion is only there to satisfy the type change machinery.
alter table public.products
  alter column colors drop default,
  alter column colors type jsonb using to_jsonb(colors),
  alter column colors set default '[]'::jsonb,
  alter column colors set not null;

commit;
