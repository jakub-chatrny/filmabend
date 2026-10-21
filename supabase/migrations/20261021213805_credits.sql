-- Directors and main cast from TMDB, so the library search can find movies by people.
alter table public.movies
    add column directors text[] not null default '{}',
    add column actors text[] not null default '{}';
