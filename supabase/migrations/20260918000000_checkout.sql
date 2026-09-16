-- =====================================================================
-- Phase 4 — Checkout: order numbers, duplicate-submit protection,
-- and atomic cash-on-delivery order placement.
-- Run once, after 20260917000000_storefront.sql.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Orders: customer-facing number, payment method, idempotency key
-- ---------------------------------------------------------------------
create sequence public.order_number_seq start with 10001;

alter table public.orders
  -- Human-friendly reference shown to customers, e.g. WP-10001.
  add column order_number text not null unique
    default ('WP-' || nextval('public.order_number_seq')::text),
  add column payment_method text not null default 'COD' check (payment_method in ('COD')),
  -- Random key per checkout attempt, so a double-submitted form creates only one order.
  add column idempotency_key uuid unique;

alter sequence public.order_number_seq owned by public.orders.order_number;
grant usage, select on sequence public.order_number_seq to service_role;

-- Used by the per-phone rate limit below.
create index orders_phone_created_at_idx on public.orders (phone, created_at desc);

-- ---------------------------------------------------------------------
-- place_order: everything happens in one transaction.
--   1. Returns the existing order if this checkout was already submitted.
--   2. Locks the products, then checks they exist, are in stock, and that
--      the price the customer saw is still the current price.
--   3. If anything changed, returns {ok: false, error: 'cart_changed'} and changes nothing.
--   4. Otherwise inserts the order and items (prices from the database) and deducts stock.
-- Only the server (secret key) can call it; the checkout Server Action validates input first.
-- ---------------------------------------------------------------------
create or replace function public.place_order(
  p_customer jsonb,
  p_items jsonb,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phone text := p_customer ->> 'phone';
  v_existing record;
  v_item record;
  v_issues jsonb := '[]'::jsonb;
  v_total numeric(12, 2) := 0;
  v_order_id uuid;
  v_order_number text;
begin
  if p_idempotency_key is null
     or jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'Invalid order payload' using errcode = '22023';
  end if;

  -- Max quantity 10 matches MAX_CART_QUANTITY in src/lib/catalog.ts.
  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer, expected_price numeric)
    where item.product_id is null
       or item.quantity is null
       or item.quantity not between 1 and 10
       or item.expected_price is null
  ) or (
    select count(distinct item.product_id) <> count(*)
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer, expected_price numeric)
  ) then
    raise exception 'Invalid order items' using errcode = '22023';
  end if;

  select id, order_number into v_existing
  from public.orders
  where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('ok', true, 'order_id', v_existing.id, 'order_number', v_existing.order_number);
  end if;

  if (
    select count(*)
    from public.orders
    where phone = v_phone and created_at > now() - interval '1 hour'
  ) >= 5 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited');
  end if;

  -- Lock in a consistent order so concurrent checkouts can't oversell or deadlock.
  perform 1
  from public.products
  where id in (select (element ->> 'product_id')::uuid from jsonb_array_elements(p_items) as element)
  order by id
  for update;

  for v_item in
    select
      item.product_id,
      item.quantity,
      item.expected_price,
      product.id as found_id,
      product.stock_quantity,
      product.effective_price
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer, expected_price numeric)
    left join public.products as product on product.id = item.product_id
  loop
    if v_item.found_id is null then
      v_issues := v_issues || jsonb_build_array(
        jsonb_build_object('product_id', v_item.product_id, 'type', 'unavailable')
      );
      continue;
    end if;

    if v_item.stock_quantity is not null and v_item.stock_quantity < v_item.quantity then
      v_issues := v_issues || jsonb_build_array(
        jsonb_build_object('product_id', v_item.product_id, 'type', 'insufficient_stock', 'available', v_item.stock_quantity)
      );
    end if;

    if v_item.effective_price <> v_item.expected_price then
      v_issues := v_issues || jsonb_build_array(
        jsonb_build_object('product_id', v_item.product_id, 'type', 'price_changed', 'price', v_item.effective_price)
      );
    end if;

    v_total := v_total + v_item.effective_price * v_item.quantity;
  end loop;

  if jsonb_array_length(v_issues) > 0 then
    return jsonb_build_object('ok', false, 'error', 'cart_changed', 'issues', v_issues);
  end if;

  begin
    insert into public.orders (
      customer_name, phone, email, address, latitude, longitude, total_amount, idempotency_key
    )
    values (
      p_customer ->> 'customer_name',
      v_phone,
      nullif(p_customer ->> 'email', ''),
      p_customer ->> 'address',
      (p_customer ->> 'latitude')::double precision,
      (p_customer ->> 'longitude')::double precision,
      v_total,
      p_idempotency_key
    )
    returning id, order_number into v_order_id, v_order_number;

    -- Unit prices come from the database, never from the client.
    insert into public.order_items (order_id, product_id, quantity, price)
    select v_order_id, product.id, item.quantity, product.effective_price
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer, expected_price numeric)
    join public.products as product on product.id = item.product_id;

    update public.products as product
    set stock_quantity = product.stock_quantity - item.quantity
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer, expected_price numeric)
    where product.id = item.product_id
      and product.stock_quantity is not null;
  exception
    when unique_violation then
      -- A simultaneous submission of the same checkout won the race: return its order.
      select id, order_number into v_existing
      from public.orders
      where idempotency_key = p_idempotency_key;
      if found then
        return jsonb_build_object('ok', true, 'order_id', v_existing.id, 'order_number', v_existing.order_number);
      end if;
      raise;
  end;

  return jsonb_build_object('ok', true, 'order_id', v_order_id, 'order_number', v_order_number);
end;
$$;

revoke execute on function public.place_order(jsonb, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb, uuid) to service_role;

commit;
