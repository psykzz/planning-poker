-- Add nightly stale-session cleanup to an already-deployed database without
-- recreating existing tables.
create table if not exists public.cleanup_logs (
  id bigint generated always as identity primary key,
  cleaned_at timestamptz not null default timezone('utc', now()),
  cutoff_at timestamptz not null,
  stale_sessions integer not null,
  deleted_users integer not null,
  deleted_scores integer not null,
  deleted_options integer not null,
  deleted_rounds integer not null
);

create index if not exists cleanup_logs_cleaned_at_idx on public.cleanup_logs (cleaned_at desc);

alter table public.cleanup_logs enable row level security;

create or replace function public.cleanup_stale_sessions(p_inactive_days integer default 30)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  cutoff timestamptz := now() - make_interval(days => p_inactive_days);
  stale_session_count integer;
  deleted_user_count integer;
  deleted_score_count integer;
  deleted_option_count integer;
  deleted_round_count integer;
begin
  if p_inactive_days is null or p_inactive_days < 1 then
    raise exception 'p_inactive_days must be at least 1';
  end if;

  drop table if exists pg_temp.stale_sessions;
  create temporary table stale_sessions (
    session_name text primary key
  ) on commit drop;

  insert into stale_sessions (session_name)
  select session_name
  from public.users
  group by session_name
  having max(last_presence) < cutoff;

  get diagnostics stale_session_count = row_count;

  select count(*)
  into deleted_score_count
  from public.scores
  where exists (
    select 1
    from stale_sessions
    join public.users on users.session_name = stale_sessions.session_name
    where users.id = scores.user_id
  );

  delete from public.users
  where exists (
    select 1
    from stale_sessions
    where stale_sessions.session_name = users.session_name
  );
  get diagnostics deleted_user_count = row_count;

  delete from public.options
  where exists (
    select 1
    from stale_sessions
    where stale_sessions.session_name = options.session_name
  );
  get diagnostics deleted_option_count = row_count;

  delete from public.rounds
  where exists (
    select 1
    from stale_sessions
    where stale_sessions.session_name = rounds.session_name
  );
  get diagnostics deleted_round_count = row_count;

  insert into public.cleanup_logs (
    cutoff_at,
    stale_sessions,
    deleted_users,
    deleted_scores,
    deleted_options,
    deleted_rounds
  )
  values (
    cutoff,
    stale_session_count,
    deleted_user_count,
    deleted_score_count,
    deleted_option_count,
    deleted_round_count
  );

  raise log 'Stale session cleanup: % sessions, % users, % scores, % options, % rounds deleted',
    stale_session_count,
    deleted_user_count,
    deleted_score_count,
    deleted_option_count,
    deleted_round_count;
end;
$$;

revoke execute on function public.cleanup_stale_sessions(integer) from public, anon, authenticated;

-- Run cleanup nightly. Re-running this migration keeps a single scheduled job.
create extension if not exists pg_cron;

select cron.unschedule(jobid)
from cron.job
where jobname = 'cleanup-stale-sessions';

select cron.schedule(
  'cleanup-stale-sessions',
  '0 3 * * *',
  'select public.cleanup_stale_sessions(30);'
);
