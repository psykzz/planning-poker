-- Add scores_hash to an already-deployed rounds table so duplicate-round
-- inserts are rejected at the database level instead of a pre-flight query.
alter table public.rounds
add column if not exists scores_hash text;

alter table public.rounds
drop constraint if exists rounds_session_name_scores_hash_key;

alter table public.rounds
add constraint rounds_session_name_scores_hash_key unique (session_name, scores_hash);
