-- Rebuild the public schema used by the planning poker app.
-- Safe to run in the Supabase SQL editor.

create extension if not exists pgcrypto;

-- Drop dependent objects first so the script can fully recreate the schema.
drop table if exists public.scores;
drop table if exists public.options;
drop table if exists public.users;

drop function if exists public.set_updated_at();

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  session_name text not null,
  name text not null,
  last_presence timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.options (
  session_name text not null,
  key text not null,
  value text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (session_name, key)
);

create table public.scores (
  session_name text not null,
  user_id uuid not null references public.users (id) on delete cascade,
  score integer not null,
  revealed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (session_name, user_id)
);

create index users_session_name_idx on public.users (session_name);
create index users_last_presence_idx on public.users (last_presence desc);
create index scores_session_name_idx on public.scores (session_name);
create index scores_revealed_idx on public.scores (session_name, revealed);

create trigger users_set_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger options_set_updated_at
before update on public.options
for each row
execute function public.set_updated_at();

create trigger scores_set_updated_at
before update on public.scores
for each row
execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.options enable row level security;
alter table public.scores enable row level security;

create policy "users are readable by anyone"
on public.users
for select
to anon, authenticated
using (true);

create policy "users are writable by anyone"
on public.users
for insert
to anon, authenticated
with check (true);

create policy "users are updateable by anyone"
on public.users
for update
to anon, authenticated
using (true)
with check (true);

create policy "options are readable by anyone"
on public.options
for select
to anon, authenticated
using (true);

create policy "options are writable by anyone"
on public.options
for insert
to anon, authenticated
with check (true);

create policy "options are updateable by anyone"
on public.options
for update
to anon, authenticated
using (true)
with check (true);

create policy "scores are readable by anyone"
on public.scores
for select
to anon, authenticated
using (true);

create policy "scores are writable by anyone"
on public.scores
for insert
to anon, authenticated
with check (true);

create policy "scores are updateable by anyone"
on public.scores
for update
to anon, authenticated
using (true)
with check (true);

create policy "scores are deletable by anyone"
on public.scores
for delete
to anon, authenticated
using (true);

alter publication supabase_realtime add table public.options;
alter publication supabase_realtime add table public.scores;
