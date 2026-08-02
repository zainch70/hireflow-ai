# HireFlow AI

AI-powered careers and recruitment portal. Candidates browse and apply to jobs; HR manages openings, applications, and AI-assisted screening.

> **Status:** Project foundation only. Auth, careers UI, dashboard, schemas, and AI flows are not implemented yet.

## Tech stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS, shadcn/ui, Lucide, Sonner, next-themes
- **Data:** Supabase (Auth, Storage, PostgreSQL), Drizzle ORM
- **Forms:** React Hook Form, Zod
- **AI:** Vercel AI SDK + Google Gemini
- **Other:** TanStack Table, Recharts, pdf-parse
- **Tooling:** ESLint, Prettier, EditorConfig

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in values from your [Supabase](https://supabase.com/dashboard) project and [Google AI Studio](https://aistudio.google.com/apikey):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin key (never expose to the browser) |
| `DATABASE_URL` | Postgres connection string for Drizzle |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key |
| `NEXT_PUBLIC_APP_URL` | App URL (default `http://localhost:3000`) |

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema to the database |
| `npm run db:studio` | Open Drizzle Studio |

## Architecture

Feature-based layout with clear separation of concerns:

```
app/           # Routes & layouts (public + dashboard groups)
components/    # Shared UI (shadcn in ui/)
features/      # Domain modules (jobs, applications, etc.)
services/      # Business orchestration
db/            # Drizzle client, schema, migrations
lib/           # Infrastructure (supabase, ai, auth, errors, uploads)
schemas/       # Zod validation
actions/       # Server Actions
providers/     # Theme, Supabase, toasts
constants/     # Routes, roles, statuses
types/         # Shared TypeScript types
hooks/         # Shared React hooks
```

**Guidelines**

- Prefer Server Components; use Server Actions where mutations fit
- Keep AI logic in `lib/ai`
- Keep database access in `db/` / services — not in UI
- Colocate feature UI, actions, and hooks under `features/<name>`
- File names: kebab-case; Next.js `page` / `layout` files use default exports

## Current foundation

Already configured:

- Next.js App Router + TypeScript + Tailwind + shadcn/ui
- Supabase clients (browser, server, middleware, admin)
- Drizzle setup (no schemas yet)
- Providers (theme, Supabase, toasts)
- Auth helpers, middleware stub for `/hr/*`
- Public and dashboard layout groups
- Error / API response helpers
- Upload validation stubs (PDF)
- Gemini client factory (no prompts)
- Routes, roles, and status constants

## Planned next phases

1. Drizzle schemas + migrations
2. Authentication (pages + HR route protection)
3. Public careers pages
4. HR dashboard shell
5. Job CRUD → applications → PDF upload → AI screening

## License

Private — all rights reserved.
