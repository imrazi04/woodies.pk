-- =====================================================================
-- Phase 3 — Storefront: featured products, stock, and price sorting
-- Run once, after 20260916000000_admin_access.sql.
-- =====================================================================

begin;

alter table public.products
  add column is_featured boolean not null default false,
  -- NULL means stock isn't tracked for this product (always available).
  add column stock_quantity integer check (stock_quantity >= 0),
  -- The price customers actually pay; lets the catalog sort by price correctly.
  add column effective_price numeric(12, 2) generated always as (
    case when is_on_sale and sale_price is not null then sale_price else price end
  ) stored;

comment on column public.products.stock_quantity is
  'Units available. NULL means stock is not tracked (always available).';

create index products_featured_idx        on public.products (created_at desc) where is_featured;
create index products_effective_price_idx on public.products (effective_price);

commit;
