-- Editorial channels for YESOD HUB and member-only content
alter table public.posts
  add column if not exists external_video_url text,
  add column if not exists media_url text,
  add column if not exists media_type text check (media_type in ('image', 'video')),
  add column if not exists published boolean not null default true;

drop policy if exists "posts public read" on public.posts;
create policy "published posts public read" on public.posts for select to anon, authenticated
using (published = true or public.has_role((select auth.uid()), 'admin'::public.app_role));

drop policy if exists "admins update posts" on public.posts;
create policy "admins update posts" on public.posts for update to authenticated
using (public.has_role((select auth.uid()), 'admin'::public.app_role))
with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

create table if not exists public.exclusive_contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text not null default '',
  content_html text not null default '',
  category text not null default 'Material',
  cover_image_url text,
  media_url text,
  media_type text check (media_type in ('image', 'video')),
  external_video_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  author_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.exclusive_contents to authenticated;
alter table public.exclusive_contents enable row level security;

create policy "members read published exclusive content" on public.exclusive_contents for select to authenticated
using (published = true or public.has_role((select auth.uid()), 'admin'::public.app_role));
create policy "admins insert exclusive content" on public.exclusive_contents for insert to authenticated
with check (public.has_role((select auth.uid()), 'admin'::public.app_role) and author_id = (select auth.uid()));
create policy "admins update exclusive content" on public.exclusive_contents for update to authenticated
using (public.has_role((select auth.uid()), 'admin'::public.app_role))
with check (public.has_role((select auth.uid()), 'admin'::public.app_role));
create policy "admins delete exclusive content" on public.exclusive_contents for delete to authenticated
using (public.has_role((select auth.uid()), 'admin'::public.app_role));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values
('hub-media','hub-media',true,104857600,array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm','video/quicktime']),
('exclusive-media','exclusive-media',false,104857600,array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "hub media readable" on storage.objects for select to public using (bucket_id='hub-media');
create policy "hub media admin insert" on storage.objects for insert to authenticated with check (bucket_id='hub-media' and public.has_role((select auth.uid()),'admin'::public.app_role));
create policy "hub media admin update" on storage.objects for update to authenticated using (bucket_id='hub-media' and public.has_role((select auth.uid()),'admin'::public.app_role)) with check (bucket_id='hub-media' and public.has_role((select auth.uid()),'admin'::public.app_role));
create policy "hub media admin delete" on storage.objects for delete to authenticated using (bucket_id='hub-media' and public.has_role((select auth.uid()),'admin'::public.app_role));
create policy "exclusive media members read" on storage.objects for select to authenticated using (bucket_id='exclusive-media');
create policy "exclusive media admin insert" on storage.objects for insert to authenticated with check (bucket_id='exclusive-media' and public.has_role((select auth.uid()),'admin'::public.app_role));
create policy "exclusive media admin update" on storage.objects for update to authenticated using (bucket_id='exclusive-media' and public.has_role((select auth.uid()),'admin'::public.app_role)) with check (bucket_id='exclusive-media' and public.has_role((select auth.uid()),'admin'::public.app_role));
create policy "exclusive media admin delete" on storage.objects for delete to authenticated using (bucket_id='exclusive-media' and public.has_role((select auth.uid()),'admin'::public.app_role));

create index if not exists exclusive_contents_published_sort_idx on public.exclusive_contents (published,sort_order,created_at desc);