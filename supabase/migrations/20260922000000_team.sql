-- =====================================================================
-- Team & artisans page: team members managed by admins, and their photos
-- Run once, after 20260921000000_contact.sql.
-- =====================================================================

begin;

create table public.team_members (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 1 and 80),
  role           text not null check (char_length(role) between 1 and 80),
  bio            text check (bio is null or char_length(bio) <= 600),
  image_url      text check (image_url is null or image_url ~ '^https://'),
  phone          text check (phone is null or char_length(phone) between 7 and 20),
  is_whatsapp    boolean not null default false,
  email          text check (email is null or char_length(email) between 3 and 254),
  display_order  integer not null default 0 check (display_order between 0 and 999),
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index team_members_order_idx on public.team_members (display_order, created_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger team_members_touch_updated_at
  before update on public.team_members
  for each row execute function public.touch_updated_at();

alter table public.team_members enable row level security;

create policy "Published team members are publicly readable"
  on public.team_members for select to anon, authenticated
  using (is_published);

create policy "Admins can manage team members"
  on public.team_members for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

grant select on public.team_members to anon, authenticated;
grant insert, update, delete on public.team_members to authenticated;
grant select, insert, update, delete on public.team_members to service_role;

-- ---------------------------------------------------------------------
-- Photo storage: public to read (the files are shown on the store), admins only to write.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-photos',
  'team-photos',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can list team photo files"
  on storage.objects for select to authenticated
  using (bucket_id = 'team-photos' and (select public.is_admin()));

create policy "Admins can upload team photo files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'team-photos' and (select public.is_admin()));

create policy "Admins can update team photo files"
  on storage.objects for update to authenticated
  using (bucket_id = 'team-photos' and (select public.is_admin()))
  with check (bucket_id = 'team-photos' and (select public.is_admin()));

create policy "Admins can delete team photo files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'team-photos' and (select public.is_admin()));

commit;
