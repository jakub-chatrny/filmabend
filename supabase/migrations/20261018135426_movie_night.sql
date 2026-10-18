-- A movie night: everyone adds candidates live from their own device, then the
-- database rolls the winner so every screen shows the same result.

create table public.pick_sessions (
    id bigint generated always as identity primary key,
    status text not null default 'selecting' check (status in ('selecting', 'rolled', 'done', 'cancelled')),
    winner_movie_id bigint references public.movies (id) on delete set null,
    roll_count integer not null default 0,
    created_by uuid references public.profiles (id) on delete set null default auth.uid(),
    created_at timestamptz not null default now(),
    rolled_at timestamptz,
    finished_at timestamptz
);

-- Only one movie night can be open at a time
create unique index pick_sessions_one_open on public.pick_sessions ((true)) where status in ('selecting', 'rolled');

create table public.pick_candidates (
    session_id bigint not null references public.pick_sessions (id) on delete cascade,
    movie_id bigint not null references public.movies (id) on delete cascade,
    added_by uuid references public.profiles (id) on delete set null default auth.uid(),
    added_at timestamptz not null default now(),
    primary key (session_id, movie_id)
);

create index pick_candidates_movie_id_idx on public.pick_candidates (movie_id);

-- Read-only for members; every change goes through the functions below
alter table public.pick_sessions enable row level security;
alter table public.pick_candidates enable row level security;

create policy "Members can see movie nights"
    on public.pick_sessions for select
    to authenticated
    using ((select public.is_member()));

create policy "Members can see candidates"
    on public.pick_candidates for select
    to authenticated
    using ((select public.is_member()));

-- Shared guard: members only, and one change at a time so concurrent taps can't race
create function public.lock_movie_night()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not public.is_member() then
        raise exception 'Nemáte přístup.' using errcode = '42501';
    end if;
    perform pg_advisory_xact_lock(hashtext('movie_night'));
end;
$$;

create function public.toggle_candidate(p_movie_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    night public.pick_sessions;
    candidate_count integer;
begin
    perform public.lock_movie_night();

    select * into night from public.pick_sessions where status in ('selecting', 'rolled');
    if found and night.status = 'rolled' then
        raise exception 'Už se losovalo. Nejdřív se vraťte k výběru.';
    end if;
    if not found then
        insert into public.pick_sessions (created_by) values (auth.uid()) returning * into night;
    end if;

    delete from public.pick_candidates where session_id = night.id and movie_id = p_movie_id;
    if found then
        return;
    end if;

    if not exists (select 1 from public.movies where id = p_movie_id and seen_at is null) then
        raise exception 'Tenhle film vybrat nejde.';
    end if;

    select count(*) into candidate_count from public.pick_candidates where session_id = night.id;
    if candidate_count >= 8 then
        raise exception 'Vybrat jde nejvýš 8 filmů.';
    end if;

    insert into public.pick_candidates (session_id, movie_id, added_by) values (night.id, p_movie_id, auth.uid());
end;
$$;

create function public.clear_candidates()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    perform public.lock_movie_night();
    update public.pick_sessions set status = 'cancelled', finished_at = now() where status in ('selecting', 'rolled');
end;
$$;

-- Rolls (or re-rolls) the winner among the candidates
create function public.roll_pick()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
    night public.pick_sessions;
    candidate_count integer;
    winner bigint;
begin
    perform public.lock_movie_night();

    select * into night from public.pick_sessions where status in ('selecting', 'rolled');
    if not found then
        raise exception 'Nejsou vybrané žádné filmy.';
    end if;

    select count(*) into candidate_count from public.pick_candidates where session_id = night.id;
    if candidate_count < 2 then
        raise exception 'Vyberte aspoň 2 filmy.';
    end if;

    select movie_id into winner from public.pick_candidates where session_id = night.id order by random() limit 1;

    update public.pick_sessions
    set status = 'rolled', winner_movie_id = winner, roll_count = roll_count + 1, rolled_at = now()
    where id = night.id;

    return winner;
end;
$$;

-- Closes the result and goes back to adding/removing candidates
create function public.back_to_selection()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    perform public.lock_movie_night();
    update public.pick_sessions set status = 'selecting', winner_movie_id = null where status = 'rolled';
end;
$$;

-- Marks the winner as seen and closes the movie night
create function public.finish_pick()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    night public.pick_sessions;
begin
    perform public.lock_movie_night();

    select * into night from public.pick_sessions where status = 'rolled';
    if not found or night.winner_movie_id is null then
        raise exception 'Zatím není co označit.';
    end if;

    update public.movies set seen_at = now() where id = night.winner_movie_id;
    update public.pick_sessions set status = 'done', finished_at = now() where id = night.id;
end;
$$;

revoke execute on function public.lock_movie_night() from public, anon, authenticated;
revoke execute on function public.toggle_candidate(bigint) from public, anon;
revoke execute on function public.clear_candidates() from public, anon;
revoke execute on function public.roll_pick() from public, anon;
revoke execute on function public.back_to_selection() from public, anon;
revoke execute on function public.finish_pick() from public, anon;
grant execute on function public.toggle_candidate(bigint) to authenticated;
grant execute on function public.clear_candidates() to authenticated;
grant execute on function public.roll_pick() to authenticated;
grant execute on function public.back_to_selection() to authenticated;
grant execute on function public.finish_pick() to authenticated;

-- Live updates for every open screen
alter publication supabase_realtime add table public.pick_sessions, public.pick_candidates, public.movies;
