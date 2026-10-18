-- English titles next to the Czech ones (filled from TMDB), and a per-user choice of which to show.
alter table public.movies add column title_en text;

alter table public.profiles
    add column title_language text not null default 'en' check (title_language in ('cs', 'en'));
