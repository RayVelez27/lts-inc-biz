-- ============================================================================
-- LT's Business — initial schema
-- ============================================================================
-- Mirrors the shapes already used by the app in src/lib/*:
--   profiles    ← User interface in auth-context.tsx
--   addresses   ← Address interface in auth-context.tsx
--   products    ← Product interface in products.ts
--   orders      ← new, needed for checkout persistence
--   order_items ← new, line items from CartItem in cart-context.tsx
--   cart_items  ← logged-in cart persistence (guests keep using localStorage)
--
-- RLS is enabled on every table. Clients use the publishable key and are
-- bound by these policies. Privileged writes (admin panel, Stripe webhooks)
-- must go through the service-role client in src/lib/supabase/admin.ts.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: 1:1 with auth.users
-- ----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  first_name  text,
  last_name   text,
  company     text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer','admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth.users row is inserted.
-- Reads first_name / last_name / company from the signup metadata, which
-- the client passes in as `options.data` on supabase.auth.signUp().
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, company)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'company'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- addresses
-- ----------------------------------------------------------------------------
create table public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('shipping','billing')),
  first_name  text,
  last_name   text,
  company     text,
  address1    text not null,
  address2    text,
  city        text not null,
  state       text not null,
  zip         text not null,
  country     text not null default 'US',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses(user_id);

alter table public.addresses enable row level security;

create policy "addresses: read own"
  on public.addresses for select
  using (auth.uid() = user_id);

create policy "addresses: insert own"
  on public.addresses for insert
  with check (auth.uid() = user_id);

create policy "addresses: update own"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "addresses: delete own"
  on public.addresses for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- products
-- Note: `is_new` instead of `new` (reserved word). App layer can alias back.
-- Keeping `id` as text so existing string IDs ('polo-1' etc.) port over
-- unchanged — no rewrites required in products.ts, cart items, URLs.
-- ----------------------------------------------------------------------------
create table public.products (
  id           text primary key,
  name         text not null,
  description  text,
  price        numeric(10,2) not null check (price >= 0),
  image        text,
  category     text not null,
  subcategory  text not null,
  colors       text[] not null default '{}',
  sizes        text[] not null default '{}',
  featured     boolean not null default false,
  is_new       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index products_category_idx on public.products(category);
create index products_featured_idx on public.products(featured) where featured;
create index products_is_new_idx on public.products(is_new) where is_new;

alter table public.products enable row level security;

-- Catalog is public — anyone, even unauthenticated, can read.
create policy "products: public read"
  on public.products for select
  using (true);

-- Writes only via service-role client (admin panel). No insert/update/delete
-- policy is defined for the anon/authenticated roles, so RLS blocks them.

-- ----------------------------------------------------------------------------
-- orders + order_items
-- ----------------------------------------------------------------------------
create table public.orders (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references public.profiles(id) on delete set null,
  status                 text not null default 'pending'
                         check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  subtotal               numeric(10,2) not null,
  volume_discount        numeric(10,2) not null default 0,
  shipping               numeric(10,2) not null default 0,
  tax                    numeric(10,2) not null default 0,
  total                  numeric(10,2) not null,
  stripe_payment_intent  text unique,
  shipping_address       jsonb,
  billing_address        jsonb,
  notes                  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

alter table public.orders enable row level security;

create policy "orders: read own"
  on public.orders for select
  using (auth.uid() = user_id);

-- Orders are created server-side (Stripe webhook / checkout route handler)
-- using the service-role client. No insert/update policies for end users.

create table public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  product_id     text references public.products(id) on delete set null,
  name           text not null,
  size           text,
  color          text,
  quantity       integer not null check (quantity > 0),
  unit_price     numeric(10,2) not null,
  customization  jsonb,
  created_at     timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items(order_id);

alter table public.order_items enable row level security;

create policy "order_items: read own"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- cart_items: persistent cart for logged-in users
-- Guests continue using localStorage via cart-context.tsx.
-- On login, the client should merge localStorage cart → cart_items.
-- ----------------------------------------------------------------------------
create table public.cart_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  product_id     text not null references public.products(id) on delete cascade,
  size           text not null default '',
  color          text not null default '',
  quantity       integer not null check (quantity > 0),
  customization  jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- One row per (user, product, variant, customization-free) combo.
  -- Customized items get their own rows because customization jsonb isn't
  -- in the unique key — that's intentional.
  unique (user_id, product_id, size, color)
);

create index cart_items_user_id_idx on public.cart_items(user_id);

alter table public.cart_items enable row level security;

create policy "cart_items: read own"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "cart_items: insert own"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "cart_items: update own"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cart_items: delete own"
  on public.cart_items for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- updated_at maintenance
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at   before update on public.profiles   for each row execute function public.set_updated_at();
create trigger products_set_updated_at   before update on public.products   for each row execute function public.set_updated_at();
create trigger orders_set_updated_at     before update on public.orders     for each row execute function public.set_updated_at();
create trigger cart_items_set_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
