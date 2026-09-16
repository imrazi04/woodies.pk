-- =====================================================================
-- Phase 2 — Admin access: admin role, admin RLS policies, product image storage
-- Run once, after 20260915000000_initial_schema.sql.
--
-- Admins are Supabase Auth users whose app_metadata.role is 'admin'.
-- app_metadata can only be changed with SQL or the secret key — never by the user.
-- To make a user an admin, run this, then have them sign in again so the role is in their token:
--
--   update auth.users
--   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'
--   where email = 'you@example.com';
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Role helper
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- Table policies: admins get full access. Public read policies from the
-- initial migration still apply; policies are OR-ed together.
-- `(select public.is_admin())` is evaluated once per statement, not per row.
-- ---------------------------------------------------------------------
create policy "Admins can manage categories"
  on public.categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins can manage products"
  on public.products for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins can manage product images"
  on public.product_images for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins can manage orders"
  on public.orders for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins can manage order items"
  on public.order_items for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Admins can manage reviews"
  on public.reviews for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- RLS decides which rows; these grants only allow the statements to be attempted.
grant select, insert, update, delete on
  public.categories, public.products, public.product_images,
  public.orders, public.order_items, public.reviews
  to authenticated;

-- ---------------------------------------------------------------------
-- Atomically switch a product's primary image
-- (the partial unique index allows only one primary per product).
-- ---------------------------------------------------------------------
create or replace function public.set_primary_product_image(p_image_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_product_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select product_id into v_product_id
  from public.product_images
  where id = p_image_id;

  if v_product_id is null then
    raise exception 'Image not found' using errcode = 'P0002';
  end if;

  update public.product_images
  set is_primary = false
  where product_id = v_product_id and is_primary and id <> p_image_id;

  update public.product_images
  set is_primary = true
  where id = p_image_id;
end;
$$;

revoke execute on function public.set_primary_product_image(uuid) from public, anon;
grant execute on function public.set_primary_product_image(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- Storage: public bucket for product photos.
-- Public buckets serve files by URL without a policy; only admins can list or change files.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can read product image files"
  on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins can upload product image files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins can update product image files"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "Admins can delete product image files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

commit;
