-- Access is limited to an allowlist of email addresses.
-- The addresses themselves are not in the repo; insert them in the SQL editor:
--   insert into public.allowed_emails (email) values ('someone@gmail.com');

create table public.allowed_emails (
    email text primary key check (email = lower(email)),
    created_at timestamptz not null default now()
);

-- RLS on with no policies: only the service role / SQL editor can read or change the list.
alter table public.allowed_emails enable row level security;

-- True when the signed-in user's email is on the allowlist. Used by every RLS policy.
create function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.allowed_emails
        where email = lower(auth.jwt() ->> 'email')
    );
$$;

revoke execute on function public.is_member() from public, anon;
grant execute on function public.is_member() to authenticated;

-- Profiles, filled from the Google identity on first sign-in.
create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text not null,
    avatar_url text,
    created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Members can see all profiles"
    on public.profiles for select
    to authenticated
    using ((select public.is_member()));

create policy "Members can update their own profile"
    on public.profiles for update
    to authenticated
    using (id = (select auth.uid()) and (select public.is_member()))
    with check (id = (select auth.uid()));

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, display_name, avatar_url)
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'name',
            split_part(new.email, '@', 1)
        ),
        coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Optional "Before User Created" auth hook: rejects sign-ups from emails that
-- are not on the allowlist, so strangers never get an auth.users row.
-- Enable it in the dashboard: Authentication → Hooks → Before User Created →
-- Postgres function → public.hook_before_user_created.
create function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
    if exists (
        select 1 from public.allowed_emails
        where email = lower(event -> 'user' ->> 'email')
    ) then
        return '{}'::jsonb;
    end if;

    return jsonb_build_object(
        'error', jsonb_build_object('http_code', 403, 'message', 'Tento účet nemá přístup.')
    );
end;
$$;

revoke execute on function public.hook_before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
