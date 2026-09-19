-- =====================================================================
-- Chiniot heritage page: stories managed by admins, and their images
-- Run once, after 20260922000000_team.sql (it reuses public.touch_updated_at).
-- =====================================================================

begin;

create table public.chiniot_stories (
  id             uuid primary key default gen_random_uuid(),
  title          text not null check (char_length(title) between 1 and 120),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  content        text not null check (char_length(content) between 1 and 20000),
  image_url      text check (image_url is null or image_url ~ '^https://'),
  -- YouTube or Vimeo page links; the app turns them into privacy-friendly embeds.
  video_url      text check (video_url is null or (video_url ~ '^https://' and char_length(video_url) <= 500)),
  display_order  integer not null default 0 check (display_order between 0 and 999),
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index chiniot_stories_order_idx on public.chiniot_stories (display_order, created_at);

create trigger chiniot_stories_touch_updated_at
  before update on public.chiniot_stories
  for each row execute function public.touch_updated_at();

alter table public.chiniot_stories enable row level security;

create policy "Published stories are publicly readable"
  on public.chiniot_stories for select to anon, authenticated
  using (is_published);

create policy "Admins can manage stories"
  on public.chiniot_stories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

grant select on public.chiniot_stories to anon, authenticated;
grant insert, update, delete on public.chiniot_stories to authenticated;
grant select, insert, update, delete on public.chiniot_stories to service_role;

-- ---------------------------------------------------------------------
-- Image storage: public to read, admins only to write.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'heritage-images',
  'heritage-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins can list heritage image files"
  on storage.objects for select to authenticated
  using (bucket_id = 'heritage-images' and (select public.is_admin()));

create policy "Admins can upload heritage image files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'heritage-images' and (select public.is_admin()));

create policy "Admins can update heritage image files"
  on storage.objects for update to authenticated
  using (bucket_id = 'heritage-images' and (select public.is_admin()))
  with check (bucket_id = 'heritage-images' and (select public.is_admin()));

create policy "Admins can delete heritage image files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'heritage-images' and (select public.is_admin()));

commit;
