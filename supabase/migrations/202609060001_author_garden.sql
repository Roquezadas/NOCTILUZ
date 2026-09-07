begin;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create policy "Read own author membership" on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create table public.poems (
  id text primary key default gen_random_uuid()::text check (length(id) between 1 and 100),
  slug text unique check (slug is null or (length(slug) <= 160 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')),
  title text not null default '' check (length(title) <= 240),
  excerpt text not null default '' check (length(excerpt) <= 500),
  content text not null default '' check (length(content) <= 100000),
  place text not null default 'jardim' check (place in ('jardim','ruinas','ceu','quarto','abismo','cartas')),
  tags text[] not null default '{}',
  poem_date date not null default current_date,
  featured boolean not null default false,
  featured_order integer not null default 0 check (featured_order between 0 and 9999),
  mood text not null default '' check (length(mood) <= 80),
  accent text not null default 'pink' check (accent in ('violet','pink','cyan','gold','stone','green')),
  series text check (length(series) <= 120),
  language text not null default 'pt-BR' check (length(btrim(language)) between 1 and 20),
  demo boolean not null default false,
  phrase text check (length(phrase) <= 500),
  status text not null default 'draft' check (status in ('draft','published')),
  publish_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(btrim(title)) > 0 or length(btrim(content)) > 0),
  check (status <> 'published' or (slug is not null and length(btrim(title)) > 0 and length(btrim(content)) > 0 and publish_at is not null)),
  check (status <> 'draft' or publish_at is null),
  check (series is distinct from 'Em português se diz' or length(btrim(coalesce(phrase,''))) > 0)
);

create function public.validate_poem_write() returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'UPDATE' and (new.id <> old.id or new.created_at <> old.created_at) then
    raise exception 'Poem identity and creation date are immutable' using errcode = '23514';
  end if;
  if cardinality(new.tags) > 20 or exists (
    select 1 from unnest(new.tags) tag where tag is null or length(tag) > 40 or tag !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ) or cardinality(new.tags) <> (select count(distinct tag) from unnest(new.tags) tag) then
    raise exception 'Invalid poem tags' using errcode = '23514';
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function public.validate_poem_write() from public;
create trigger validate_poem_write before insert or update on public.poems
  for each row execute function public.validate_poem_write();

create index poems_publication_idx on public.poems (status, publish_at);
create index poems_place_idx on public.poems (place, poem_date desc);
create index poems_featured_idx on public.poems (featured, featured_order, poem_date desc);
create index poems_tags_idx on public.poems using gin(tags);

alter table public.poems enable row level security;
revoke all on public.poems from anon, authenticated;
grant select on public.poems to anon;
grant select, insert, update, delete on public.poems to authenticated;
create policy "Read released poems" on public.poems for select to anon, authenticated
  using (status = 'published' and publish_at <= now());
create policy "Authors manage poems" on public.poems for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

commit;
