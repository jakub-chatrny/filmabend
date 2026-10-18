-- Free Supabase projects pause after a week without activity. A daily Vercel cron
-- calls this through /api/keep-alive. It touches the database and returns nothing private.
create function public.keep_alive()
returns timestamptz
language sql
stable
set search_path = ''
as $$
    select now();
$$;

revoke execute on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon, authenticated;
