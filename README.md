# HireFlow AI

AI-powered careers and recruitment portal. Candidates browse and apply to jobs; HR manages openings, applications, and AI-assisted screening.

> **Status:** Foundation + database schema are in place. Auth UI, careers pages, dashboard, and AI flows are not built yet.

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

Open `.env.local` and fill in the values below.

#### App

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

#### Supabase API keys

1. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **Project Settings → API Keys** (not General)
3. Copy:

| Variable | Supabase UI label | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL under **General** or **Data API** | e.g. `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Publishable** key (`sb_publishable_...`) | Safe for the browser (with RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** key (`sb_secret_...`) | Server only — never commit or expose to the client |

Older dashboards may label these as `anon` / `service_role`. Same mapping applies.

#### Database URL (`DATABASE_URL`) — important

The **direct** host (`db.<project-ref>.supabase.co`) often fails DNS from some networks. Prefer the **Session pooler** URI.

1. Go to **Project Settings → Database**  
   (or click **Connect** in the project header)
2. Open **Connection string**
3. Choose:
   - **Type:** URI
   - **Mode:** **Session pooler** (not Direct)
4. Copy the URI. It looks like:

```text
postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres
```

5. Replace `[YOUR-PASSWORD]` with your database password  
   (set at project creation — not your Supabase login password)
6. Append `?sslmode=require`
7. Paste into `.env.local`:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:YOUR_PASSWORD@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
```

**Tips**

- Forgot the DB password? **Database** settings → **Reset database password**
- If the password contains special characters (`@`, `#`, `%`, `/`, etc.), URL-encode them
- `npm run db:migrate` checks connectivity first and prints a clear error if `DATABASE_URL` is wrong

#### Gemini

| Variable | Purpose |
| --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Required by Vercel AI SDK (`@ai-sdk/google`) |
| `GEMINI_API_KEYS` | Optional comma-separated key pool for later rotation |

Create a key at [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Apply database migrations

After `DATABASE_URL` is set:

```bash
npm run db:migrate
```

You should see `Database reachable` then `migrations applied successfully`.

Schema changes workflow (never use push):

```bash
# 1. Edit files under db/schema/
# 2. Generate SQL (do not hand-edit migration .sql files)
npm run db:generate
# 3. Apply
npm run db:migrate
```

> **Do not use `drizzle-kit push`.** It is blocked in this repo (`npm run db:push` and `npx drizzle-kit push`).

### 4. Run the app

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
| `npm run db:generate` | Generate Drizzle migrations from `db/schema` |
| `npm run db:migrate` | Verify DB connection, then apply migrations |
| `npm run db:push` | **Blocked** — exits with an error (do not use) |
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
- Never hand-edit `db/migrations/*.sql` — change `db/schema`, then `db:generate`

## Current foundation

Already configured:

- Next.js App Router + TypeScript + Tailwind + shadcn/ui
- Supabase clients (browser, server, middleware, admin)
- Drizzle schema (profiles, jobs, applications, skills, criteria, AI analyses, etc.)
- Providers (theme, Supabase, toasts)
- Auth helpers, middleware stub for `/hr/*`
- Public and dashboard layout groups
- Error / API response helpers
- Upload validation stubs (PDF)
- Gemini client factory (no prompts)
- Routes, roles, and status constants

## Planned next phases

1. Authentication (pages + HR route protection)
2. Public careers pages
3. HR dashboard shell
4. Job CRUD → applications → PDF upload → AI screening

## License

Private — all rights reserved.
