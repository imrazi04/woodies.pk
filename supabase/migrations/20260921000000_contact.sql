-- =====================================================================
-- Contact page: support contacts managed by admins, and messages from the contact form
-- Run once, after 20260920000000_rate_limits.sql.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Contact persons / departments shown on the public contact page.
-- ---------------------------------------------------------------------
create table public.contact_persons (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 80),
  department    text not null check (char_length(department) between 1 and 80),
  phone         text check (phone is null or char_length(phone) between 7 and 20),
  is_whatsapp   boolean not null default false,
  email         text check (email is null or char_length(email) between 3 and 254),
  hours         text check (hours is null or char_length(hours) <= 80),
  sort_order    integer not null default 0 check (sort_order between 0 and 999),
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  -- Every contact needs a way to reach them.
  constraint contact_persons_reachable check (phone is not null or email is not null)
);

create index contact_persons_order_idx on public.contact_persons (sort_order, created_at);

alter table public.contact_persons enable row level security;

create policy "Published contacts are publicly readable"
  on public.contact_persons for select to anon, authenticated
  using (is_published);

create policy "Admins can manage contacts"
  on public.contact_persons for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

grant select on public.contact_persons to anon, authenticated;
grant insert, update, delete on public.contact_persons to authenticated;

-- ---------------------------------------------------------------------
-- Messages from the contact form. Inserted only by the server (secret key)
-- after validation and rate limiting; readable only by admins.
-- ---------------------------------------------------------------------
create table public.contact_messages (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 100),
  email           text not null check (char_length(email) between 3 and 254),
  phone           text check (phone is null or char_length(phone) <= 20),
  message         text not null check (char_length(message) between 10 and 3000),
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index contact_messages_unread_idx on public.contact_messages (is_read) where not is_read;

alter table public.contact_messages enable row level security;

create policy "Admins can manage contact messages"
  on public.contact_messages for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

revoke all on public.contact_messages from anon;
grant select, update, delete on public.contact_messages to authenticated;
grant select, insert, update, delete on public.contact_persons, public.contact_messages to service_role;

commit;
