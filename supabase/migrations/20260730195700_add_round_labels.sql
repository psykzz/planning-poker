alter table public.rounds
add column if not exists label text default '';
