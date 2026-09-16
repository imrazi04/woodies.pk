-- =====================================================================
-- Phase 1 — Initial schema: catalog, orders, reviews
-- Run once in Supabase Dashboard → SQL Editor (or `supabase db push`).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.order_status as enum ('Pending', 'Processing', 'Dispatched', 'Delivered');

-- ---------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(trim(name)) > 0),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(trim(title)) > 0),
  description  text,
  price        numeric(12, 2) not null check (price >= 0),
  sale_price   numeric(12, 2) check (sale_price >= 0),
  -- Deleting a category keeps its products (uncategorized).
  category_id  uuid references public.categories (id) on delete set null,
  is_on_sale   boolean not null default false,
  created_at   timestamptz not null default now(),

  constraint products_sale_price_below_price
    check (sale_price is null or sale_price < price),
  constraint products_on_sale_requires_sale_price
    check (not is_on_sale or sale_price is not null)
);

create index products_category_id_idx on public.products (category_id);
create index products_created_at_idx  on public.products (created_at desc);
create index products_on_sale_idx     on public.products (created_at desc) where is_on_sale;

-- ---------------------------------------------------------------------
-- product_images
-- ---------------------------------------------------------------------
create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  image_url   text not null check (char_length(trim(image_url)) > 0),
  is_primary  boolean not null default false
);

create index product_images_product_id_idx on public.product_images (product_id);
-- At most one primary image per product.
create unique index product_images_one_primary_per_product
  on public.product_images (product_id) where is_primary;

-- ---------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------
create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null check (char_length(trim(customer_name)) > 0),
  phone          text not null check (char_length(trim(phone)) > 0),
  email          text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  address        text not null check (char_length(trim(address)) > 0),
  latitude       double precision check (latitude between -90 and 90),
  longitude      double precision check (longitude between -180 and 180),
  total_amount   numeric(12, 2) not null check (total_amount >= 0),
  status         public.order_status not null default 'Pending',
  created_at     timestamptz not null default now(),

  -- Coordinates are either both set (map pin) or both empty.
  constraint orders_coordinates_pair
    check ((latitude is null) = (longitude is null))
);

create index orders_status_idx     on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);

-- ---------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------
create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  -- Deleting a product must not erase order history; the line item keeps quantity and price.
  product_id  uuid references public.products (id) on delete set null,
  quantity    integer not null check (quantity > 0),
  -- Unit price at the time of purchase (not a live reference to products.price).
  price       numeric(12, 2) not null check (price >= 0)
);

create index order_items_order_id_idx   on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

-- ---------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete cascade,
  customer_name  text not null check (char_length(trim(customer_name)) > 0),
  rating         smallint not null check (rating between 1 and 5),
  comment        text,
  image_url      text,
  is_visible     boolean not null default true,
  created_at     timestamptz not null default now()
);

create index reviews_product_id_idx on public.reviews (product_id);
create index reviews_visible_by_product_idx
  on public.reviews (product_id, created_at desc) where is_visible;

-- ---------------------------------------------------------------------
-- Row Level Security
--
-- Public (publishable key): read-only access to the catalog and visible reviews.
-- All writes — placing orders, submitting reviews, admin CRUD — go through
-- server code using the secret key, which bypasses RLS. That lets the server
-- recompute prices/totals and validate input instead of trusting the browser.
-- Orders and order_items have no public policies, so customer data is never
-- readable with the publishable key.
-- ---------------------------------------------------------------------
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.reviews        enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select to anon, authenticated using (true);

create policy "Products are publicly readable"
  on public.products for select to anon, authenticated using (true);

create policy "Product images are publicly readable"
  on public.product_images for select to anon, authenticated using (true);

create policy "Visible reviews are publicly readable"
  on public.reviews for select to anon, authenticated using (is_visible);

-- Explicit grants, so the Data API works regardless of the project's default privileges.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.categories, public.products, public.product_images, public.reviews
  to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;

commit;
