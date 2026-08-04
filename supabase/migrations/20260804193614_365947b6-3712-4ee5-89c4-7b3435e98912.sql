create type public.app_role as enum ('admin', 'member');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles select" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, company)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'company')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'member') on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.update_updated_at_column();

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'Equipe YESOD',
  title text not null,
  category text not null default 'Novidades',
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "posts public read" on public.posts for select using (true);
create policy "admins insert posts" on public.posts for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update posts" on public.posts for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins delete posts" on public.posts for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger posts_updated_at before update on public.posts
for each row execute function public.update_updated_at_column();

create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
grant select on public.post_likes to anon;
grant select, insert, delete on public.post_likes to authenticated;
grant all on public.post_likes to service_role;
alter table public.post_likes enable row level security;
create policy "likes public read" on public.post_likes for select using (true);
create policy "own like insert" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "own like delete" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null default 'Membro',
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.post_comments to anon;
grant select, insert, update, delete on public.post_comments to authenticated;
grant all on public.post_comments to service_role;
alter table public.post_comments enable row level security;
create policy "comments public read" on public.post_comments for select using (true);
create policy "own comment insert" on public.post_comments for insert to authenticated with check (auth.uid() = user_id);
create policy "own comment update" on public.post_comments for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own comment delete" on public.post_comments for delete to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create trigger post_comments_updated_at before update on public.post_comments
for each row execute function public.update_updated_at_column();