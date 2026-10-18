-- Static categories, visible to everyone. Changed only by migrations.
create table public.categories (
    id text primary key check (id ~ '^[a-z0-9-]+$'),
    label text not null,
    position smallint not null unique
);

alter table public.categories enable row level security;

create policy "Members can see categories"
    on public.categories for select
    to authenticated
    using ((select public.is_member()));

insert into public.categories (id, label, position) values
    ('spolecne', 'Společné filmy', 1),
    ('akcni', 'Akční filmy', 2),
    ('horory', 'Horory', 3);

-- The shared movie library. Details are copied from TMDB when a movie is added.
create table public.movies (
    id bigint generated always as identity primary key,
    tmdb_id integer not null unique,
    imdb_id text,
    title text not null,
    original_title text,
    release_year smallint,
    runtime_minutes smallint,
    poster_path text,
    genres text[] not null default '{}',
    tmdb_rating numeric(3, 1),
    category_id text not null references public.categories (id),
    added_by uuid references public.profiles (id) on delete set null default auth.uid(),
    created_at timestamptz not null default now(),
    seen_at timestamptz
);

create index movies_category_id_idx on public.movies (category_id);
create index movies_genres_idx on public.movies using gin (genres);

alter table public.movies enable row level security;

create policy "Members can see movies"
    on public.movies for select
    to authenticated
    using ((select public.is_member()));

create policy "Members can add movies"
    on public.movies for insert
    to authenticated
    with check ((select public.is_member()) and added_by = (select auth.uid()));

create policy "Members can update movies"
    on public.movies for update
    to authenticated
    using ((select public.is_member()))
    with check ((select public.is_member()));

create policy "Members can delete movies"
    on public.movies for delete
    to authenticated
    using ((select public.is_member()));
