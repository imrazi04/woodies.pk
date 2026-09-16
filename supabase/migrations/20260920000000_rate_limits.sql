-- =====================================================================
-- Security hardening — server-side rate limiting
-- Run once, after 20260919000000_reviews_dashboard.sql.
--
-- Counters are keyed by a hashed visitor identity (an HMAC of the IP address),
-- so no raw IP addresses are stored. Only the server (secret key) can touch them.
-- =====================================================================

begin;

create table public.rate_limits (
  bucket        text not null,
  identity      text not null,
  window_start  timestamptz not null,
  request_count integer not null default 0,
  primary key (bucket, identity, window_start)
);

create index rate_limits_window_start_idx on public.rate_limits (window_start);

-- No policies and no grants: unreachable from the publishable key, and from signed-in users.
alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from anon, authenticated;

/**
 * Counts one request against `bucket` + `identity` for the current window.
 * Returns false once the caller has gone over `p_limit` requests in `p_window_seconds`.
 */
create or replace function public.consume_rate_limit(
  p_bucket text,
  p_identity text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 or p_bucket is null or p_identity is null then
    raise exception 'Invalid rate limit request' using errcode = '22023';
  end if;

  -- Fixed windows: every caller in the same window shares one counter row.
  v_window := to_timestamp(floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds);

  insert into public.rate_limits as limits (bucket, identity, window_start, request_count)
  values (left(p_bucket, 64), left(p_identity, 128), v_window, 1)
  on conflict (bucket, identity, window_start)
  do update set request_count = limits.request_count + 1
  returning limits.request_count into v_count;

  -- Occasional cleanup keeps the table small without a scheduled job.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < clock_timestamp() - interval '1 day';
  end if;

  return v_count <= p_limit;
end;
$$;

revoke execute on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;

commit;
