# HireFlow AI

AI-powered careers and recruitment portal. Candidates browse and apply to jobs; HR manages openings, applications, and AI-assisted screening.

> **Status:** Foundation, database schema, **HR authentication**, **Job Opening Management**, **public Careers**, and **Candidate Applications** (no CV upload yet) are in place. AI flows are not built yet.

## Tech stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS, shadcn/ui, Lucide, Sonner, next-themes
- **Data:** Supabase (Auth, Storage, PostgreSQL), Drizzle ORM
- **Forms:** React Hook Form, Zod, Server Actions
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
> Never hand-edit files under `db/migrations/**/*.sql`.

### 4. Create an HR user (required for login)

HR accounts are **not** created from the app (security). Provision them in Supabase:

1. **Authentication → Users → Add user**
   - Email + password (min 8 characters)
   - Enable auto-confirm if available so you can sign in immediately
2. Copy the user’s **UUID**
3. **Table Editor → `profiles` → Insert row**

| Column | Value |
| --- | --- |
| `id` | Auth user UUID |
| `email` | Same email |
| `full_name` | Display name |
| `role` | `hr` or `admin` |
| `is_active` | `true` |

Roles: `candidate` | `hr` | `admin`. Only `hr` and `admin` can access `/hr`.

### 5. Run the app

```bash
npm run dev
```

| URL | Purpose |
| --- | --- |
| [http://localhost:3000](http://localhost:3000) | Public home |
| [http://localhost:3000/careers](http://localhost:3000/careers) | Public careers (published jobs) |
| [http://localhost:3000/login](http://localhost:3000/login) | HR sign in |
| [http://localhost:3000/hr](http://localhost:3000/hr) | HR overview |
| [http://localhost:3000/hr/jobs](http://localhost:3000/hr/jobs) | Manage job openings |

## Authentication (for team members)

### What exists

- HR login at `/login`
- Session cookies via Supabase Auth SSR
- Middleware blocks unauthenticated `/hr/*` access
- Dashboard layout verifies `hr` / `admin` role + `is_active`
- Logout from the HR header
- No public HR registration (by design)

### How to test

1. Create an HR user + profile (step 4 above)
2. Sign in at `/login` → should redirect to `/hr`
3. Open `/hr` in a private window while logged out → redirect to `/login`
4. Click **Sign out** → session cleared, `/hr` blocked again
5. Try a user with `role = candidate` → login rejected (no HR access)

### Key files

```
features/auth/           # Login/logout UI + server actions
lib/auth/                # Session, profile, role helpers
app/(public)/login/      # Login page + loading/error
app/(dashboard)/         # Protected layout + loading/error
middleware.ts            # Session refresh + /hr guard
```

## Job Opening Management (for team members)

### What exists

- Create / edit / delete jobs from `/hr/jobs`
- Publish → **Published**, Unpublish → **Draft**, Close → **Closed**
- Fields: title, department, employment type, experience, location, description, requirements, optional salary
- Server Actions + Zod validation + toast feedback
- Published jobs appear on the public **Careers** pages

### How to test

1. Sign in as HR → open **Jobs**
2. Create a job → starts as **Draft**
3. Use the ⋯ menu to Publish / Unpublish / Close / Delete
4. Confirm status badges update on `/hr/jobs` and counts on `/hr`
5. Open `/careers` (logged out) → only **Published** jobs show

### Key files

```
features/jobs/           # Form, table, actions, status UI
services/jobs/           # CRUD + status transitions + public queries
schemas/jobs.ts          # Zod job form schema
app/(dashboard)/hr/jobs/ # List / create / edit pages
```

## Public Careers (for team members)

### What exists

- `/careers` lists **published** jobs only (search + filters)
- `/careers/[slug]` job detail with SEO metadata + JobPosting JSON-LD
- Apply CTA → `/careers/[slug]/apply` application form

### Key files

```
features/careers/        # Cards, filters, public shell, apply CTA
app/(public)/careers/    # List + detail + apply routes
```

## Candidate Applications (for team members)

### What exists

- Public apply form: personal, professional, education (multi), skills, experience, additional notes
- Zod + React Hook Form + Server Action
- Persists to `applications`, `application_education`, `application_skills` (skills catalog upsert)
- Duplicate apply blocked per job + email
- **No CV upload yet**

### How to test

1. Publish a job in HR
2. Open `/careers/[slug]` → **Apply for this role**
3. Submit the form → success page
4. Confirm row in Supabase `applications` (+ education/skills)

### Key files

```
features/applications/   # Form + server action
services/applications/   # Submit transaction
schemas/applications.ts  # Zod schema
```

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
features/      # Domain modules (auth, jobs, careers, applications)
services/      # Business orchestration
db/            # Drizzle client, schema, migrations
lib/           # Infrastructure (supabase, ai, auth, errors, uploads)
schemas/       # Zod validation
providers/     # Theme, Supabase, toasts
constants/     # Routes, roles, statuses
types/         # Shared TypeScript types
```

### Next.js conventions (follow these)

- **Server Components by default**; Client Components only for interactivity
- **Server Actions** for mutations (`features/*/actions`)
- Use **`loading.tsx` / `error.tsx` / `Suspense`** for streaming and failure UI
- Prefer **`getUser()`** (validated) over trusting client session alone
- Deduplicate server reads with React **`cache()`** where helpful
- Keep AI in `lib/ai`, DB access in `db/` / services — not in UI components
- Colocate feature UI + actions under `features/<name>`
- File names: kebab-case; Next.js `page` / `layout` / `loading` / `error` use default exports

## Current foundation

Already configured:

- Next.js App Router + TypeScript + Tailwind + shadcn/ui
- Supabase clients (browser, server, middleware, admin)
- Drizzle schema + applied migrations
- HR authentication (login, logout, middleware, role checks)
- Job Opening Management (CRUD + publish / unpublish / close)
- Public Careers pages (published list, detail, search/filter)
- Candidate applications (form + DB persist; no CV upload)
- Providers (theme, Supabase, toasts)
- Error / API response helpers
- Upload validation stubs (PDF)
- Gemini client factory (no prompts)
- Routes, roles, and status constants

## Planned next phases

1. CV / resume upload on applications
2. HR applications inbox + review
3. AI screening / shortlisting
4. RLS policies on Supabase tables

## License

Private — all rights reserved.
