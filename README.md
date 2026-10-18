# Filmabend

Private app for picking a movie for movie night with friends: collect movies into categories, pick 2–8 candidates together (live, from each person's own device) and let the dice decide.

- [Figma](https://www.figma.com/design/U7hznEXgHzMwsh3fRT7pVw/Filmabend)
- [Trello (old roadmap)](https://trello.com/b/CjipW3O3/filmabend)

## Stack

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4 — design tokens live in `src/app/globals.css` (`@theme`)
- [Supabase](https://supabase.com/) — Postgres, Google login, Realtime; schema in `supabase/migrations`
- [TMDB API](https://developer.themoviedb.org/) — movie search and details
- Hosted on [Vercel](https://vercel.com/)

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

There is no local Supabase stack (it needs Docker); migrations are applied to the hosted project.

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npm run db:push    # apply supabase/migrations to the linked project
npm run db:types   # regenerate src/lib/database.types.ts
```

### Who can sign in

Login is Google only, and only emails in `public.allowed_emails` get in. The list is kept out of the repo; add people in the Supabase SQL editor:

```sql
insert into public.allowed_emails (email) values ('someone@gmail.com');
```

Optionally enable the **Before User Created** hook (Authentication → Hooks → Postgres function `public.hook_before_user_created`) so accounts that aren't on the list are rejected before Supabase creates them.

### Keeping the free project awake

Free Supabase projects pause after about a week without activity. `vercel.json` schedules a daily cron (06:00 UTC) that calls `/api/keep-alive`, which runs `public.keep_alive()`. Vercel runs crons only for the production deployment. Set `CRON_SECRET` in Vercel so only the cron can call the route.

## Deployment

Vercel builds every push; `main` is production. Needed env variables: see `.env.example`. Supabase → Authentication → URL Configuration must list the production URL and `https://filmabend-37ht-*-jakubchatrnys-projects.vercel.app/**` for previews. Node 24 is pinned in `package.json` (`engines`).

On phones, "Add to Home Screen" opens Filmabend full screen like an app.

## Scripts

| Script                            | What it does               |
| --------------------------------- | -------------------------- |
| `npm run dev`                     | Dev server                 |
| `npm run build`                   | Production build           |
| `npm run lint`                    | ESLint                     |
| `npm run typecheck`               | TypeScript check           |
| `npm run format` / `format:check` | Prettier                   |
| `npm run db:push` / `db:types`    | Supabase migrations, types |

Dependency versions are pinned exactly (`.npmrc`), and Dependabot opens weekly update PRs.
