-- =====================================================================
-- Phase 5 — Customer reviews (photos, verified buyers), rating summaries,
-- and admin dashboard statistics.
-- Run once, after 20260918000000_checkout.sql.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Reviews: up to 4 photos, verified-purchase link, private rate-limit key
-- ---------------------------------------------------------------------
alter table public.reviews
  add column image_urls text[] not null default '{}'
    constraint reviews_max_four_photos check (cardinality(image_urls) <= 4),
  add column is_verified boolean not null default false,
  add column order_id uuid references public.orders (id) on delete set null,
  -- Keyed hash of the submitter's IP address, used only for rate limiting.
  add column submitter_hash text,
  add constraint reviews_comment_length check (comment is null or char_length(comment) <= 2000);

update public.reviews set image_urls = array[image_url] where image_url is not null;
alter table public.reviews drop column image_url;

-- A buyer can review each product once per order.
create unique index reviews_order_product_unique
  on public.reviews (order_id, product_id) where order_id is not null;
create index reviews_submitter_created_at_idx on public.reviews (submitter_hash, created_at desc);

-- Column-level read access: the public never sees order_id or submitter_hash.
-- (Queries must name columns; `select *` on reviews is refused for anon/authenticated.)
revoke select on public.reviews from anon, authenticated;
grant select (id, product_id, customer_name, rating, comment, image_urls, is_visible, is_verified, created_at)
  on public.reviews to anon;
grant select (id, product_id, customer_name, rating, comment, image_urls, is_visible, is_verified, order_id, created_at)
  on public.reviews to authenticated;

-- ---------------------------------------------------------------------
-- Rating summaries per product (visible reviews only).
-- security_invoker: the caller's RLS applies, so hidden reviews never count.
-- ---------------------------------------------------------------------
create view public.product_rating_summaries
with (security_invoker = true) as
select
  product_id,
  count(*)::integer as review_count,
  round(avg(rating)::numeric, 2)::float8 as average_rating,
  (count(*) filter (where rating = 1))::integer as one_star,
  (count(*) filter (where rating = 2))::integer as two_star,
  (count(*) filter (where rating = 3))::integer as three_star,
  (count(*) filter (where rating = 4))::integer as four_star,
  (count(*) filter (where rating = 5))::integer as five_star
from public.reviews
where is_visible
group by product_id;

grant select on public.product_rating_summaries to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- Storage: customer review photos.
-- Uploads happen server-side with the secret key after validation; admins can remove files.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-images',
  'review-images',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can read review image files"
  on storage.objects for select to authenticated
  using (bucket_id = 'review-images' and (select public.is_admin()));

create policy "Admins can delete review image files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'review-images' and (select public.is_admin()));

-- ---------------------------------------------------------------------
-- Admin dashboard statistics in one round trip.
-- Days are bucketed in the store's time zone.
-- ---------------------------------------------------------------------
create or replace function public.admin_dashboard_stats(
  p_days integer default 14,
  p_timezone text default 'Asia/Karachi'
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_today date;
  v_start_day date;
  v_start timestamptz;
  v_previous_start timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_days not between 1 and 90 then
    raise exception 'p_days must be between 1 and 90' using errcode = '22023';
  end if;

  v_today := (now() at time zone p_timezone)::date;
  v_start_day := v_today - (p_days - 1);
  v_start := v_start_day::timestamp at time zone p_timezone;
  v_previous_start := (v_start_day - p_days)::timestamp at time zone p_timezone;

  return jsonb_build_object(
    'sales_period', coalesce((select sum(total_amount) from public.orders where created_at >= v_start), 0),
    'sales_previous', coalesce((
      select sum(total_amount) from public.orders
      where created_at >= v_previous_start and created_at < v_start
    ), 0),
    'orders_period', (select count(*) from public.orders where created_at >= v_start),
    'orders_previous', (
      select count(*) from public.orders
      where created_at >= v_previous_start and created_at < v_start
    ),
    'status_counts', coalesce((
      select jsonb_object_agg(counts.status, counts.total)
      from (select status::text as status, count(*) as total from public.orders group by status) as counts
    ), '{}'::jsonb),
    -- 5 matches LOW_STOCK_THRESHOLD in src/lib/catalog.ts.
    'low_stock', (select count(*) from public.products where stock_quantity between 1 and 5),
    'sold_out', (select count(*) from public.products where stock_quantity = 0),
    'visible_reviews', (select count(*) from public.reviews where is_visible),
    'hidden_reviews', (select count(*) from public.reviews where not is_visible),
    'average_rating', (select round(avg(rating)::numeric, 2)::float8 from public.reviews where is_visible),
    'daily', (
      select jsonb_agg(
        jsonb_build_object(
          'date', day.day_date,
          'sales', coalesce(totals.sales, 0),
          'orders', coalesce(totals.orders, 0)
        )
        order by day.day_date
      )
      from (
        select generate_series(v_start_day, v_today, interval '1 day')::date as day_date
      ) as day
      left join (
        select (created_at at time zone p_timezone)::date as day_date, sum(total_amount) as sales, count(*) as orders
        from public.orders
        where created_at >= v_start
        group by 1
      ) as totals on totals.day_date = day.day_date
    )
  );
end;
$$;

revoke execute on function public.admin_dashboard_stats(integer, text) from public, anon;
grant execute on function public.admin_dashboard_stats(integer, text) to authenticated;

commit;
