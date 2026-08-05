alter table public.posts
  add column if not exists title_i18n jsonb not null default '{}'::jsonb,
  add column if not exists content_i18n jsonb not null default '{}'::jsonb;

alter table public.exclusive_contents
  add column if not exists title_i18n jsonb not null default '{}'::jsonb,
  add column if not exists excerpt_i18n jsonb not null default '{}'::jsonb,
  add column if not exists content_i18n jsonb not null default '{}'::jsonb,
  add column if not exists category_i18n jsonb not null default '{}'::jsonb;

update public.posts
set title_i18n = jsonb_build_object('pt', title),
    content_i18n = jsonb_build_object('pt', content)
where title_i18n = '{}'::jsonb or content_i18n = '{}'::jsonb;

update public.exclusive_contents
set title_i18n = jsonb_build_object('pt', title),
    excerpt_i18n = jsonb_build_object('pt', excerpt),
    content_i18n = jsonb_build_object('pt', content_html),
    category_i18n = jsonb_build_object('pt', category)
where title_i18n = '{}'::jsonb
   or excerpt_i18n = '{}'::jsonb
   or content_i18n = '{}'::jsonb
   or category_i18n = '{}'::jsonb;
