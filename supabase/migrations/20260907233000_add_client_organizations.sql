-- Client organization access model for YESOD HUB.
-- Structural only: organizations are data, never hard-coded tenants.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists organization_members_org_email_uidx
  on public.organization_members (organization_id, lower(email));
create index if not exists organization_members_user_idx
  on public.organization_members (user_id) where user_id is not null;

alter table public.exclusive_contents
  add column if not exists access_scope text not null default 'global'
  check (access_scope in ('global', 'organization'));

create table if not exists public.organization_contents (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  content_id uuid not null references public.exclusive_contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, content_id)
);

create index if not exists organization_contents_content_idx
  on public.organization_contents (content_id);

create trigger organizations_updated_at
before update on public.organizations
for each row execute function public.update_updated_at_column();

create trigger organization_members_updated_at
before update on public.organization_members
for each row execute function public.update_updated_at_column();

create or replace function public.link_organization_member_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  new.email := lower(trim(new.email));
  if new.email = '' then
    raise exception 'Email is required';
  end if;

  select u.id into new.user_id
  from auth.users u
  where lower(u.email) = new.email
  limit 1;

  return new;
end;
$$;

create trigger organization_members_link_user
before insert or update of email on public.organization_members
for each row execute function public.link_organization_member_user();

create or replace function public.is_active_organization_member(_organization_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = _organization_id
      and om.user_id = _user_id
      and om.active = true
  )
$$;

create or replace function public.can_access_exclusive_content(_content_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.exclusive_contents ec
    where ec.id = _content_id
      and ec.published = true
      and (
        ec.access_scope = 'global'
        or exists (
          select 1
          from public.organization_contents oc
          join public.organization_members om
            on om.organization_id = oc.organization_id
          join public.organizations o
            on o.id = oc.organization_id
          where oc.content_id = ec.id
            and om.user_id = _user_id
            and om.active = true
            and o.active = true
        )
      )
  )
$$;

grant execute on function public.is_active_organization_member(uuid, uuid) to authenticated;
grant execute on function public.can_access_exclusive_content(uuid, uuid) to authenticated;

grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, insert, update, delete on public.organization_contents to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_contents enable row level security;

create policy "admins manage organizations" on public.organizations
for all to authenticated
using (public.has_role((select auth.uid()), 'admin'::public.app_role))
with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

create policy "members read own organizations" on public.organizations
for select to authenticated
using (
  active = true
  and public.is_active_organization_member(id, (select auth.uid()))
);

create policy "admins manage organization members" on public.organization_members
for all to authenticated
using (public.has_role((select auth.uid()), 'admin'::public.app_role))
with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

create policy "members read own memberships" on public.organization_members
for select to authenticated
using (user_id = (select auth.uid()));

create policy "admins manage organization contents" on public.organization_contents
for all to authenticated
using (public.has_role((select auth.uid()), 'admin'::public.app_role))
with check (public.has_role((select auth.uid()), 'admin'::public.app_role));

create policy "members read organization content links" on public.organization_contents
for select to authenticated
using (public.is_active_organization_member(organization_id, (select auth.uid())));

drop policy if exists "members read published exclusive content" on public.exclusive_contents;
create policy "authorized members read exclusive content" on public.exclusive_contents
for select to authenticated
using (
  public.has_role((select auth.uid()), 'admin'::public.app_role)
  or public.can_access_exclusive_content(id, (select auth.uid()))
);

-- Restrict private media to content the current user is authorized to read.
drop policy if exists "exclusive media members read" on storage.objects;
create policy "exclusive media authorized read" on storage.objects
for select to authenticated
using (
  bucket_id = 'exclusive-media'
  and (
    public.has_role((select auth.uid()), 'admin'::public.app_role)
    or exists (
      select 1
      from public.exclusive_contents ec
      where (ec.cover_image_url = storage.objects.name or ec.media_url = storage.objects.name)
        and public.can_access_exclusive_content(ec.id, (select auth.uid()))
    )
  )
);

-- Attach pre-authorized e-mails to newly created accounts automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'company')
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'member')
  on conflict do nothing;

  update public.organization_members
  set user_id = new.id,
      updated_at = now()
  where user_id is null
    and lower(email) = lower(new.email);

  return new;
end;
$$;
