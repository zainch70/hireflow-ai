# HireFlow AI

AI-powered careers and recruitment portal. Candidates browse and apply to jobs; HR manages openings, applications, and AI-assisted screening.

> **Status:** Foundation, database schema, **HR authentication**, **HR Dashboard**, **Candidate management**, **AI shortlisting** (Gemini structured JSON), **Job Opening Management**, **public Careers**, **Candidate Applications**, **secure PDF resume upload**, and **PDF text extraction** are in place.

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
| `GEMINI_API_KEYS` | Optional comma-separated key pool for rotation / quota fallback |

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
| [http://localhost:3000/hr](http://localhost:3000/hr) | HR overview (KPIs + recent activity) |
| [http://localhost:3000/hr/jobs](http://localhost:3000/hr/jobs) | Jobs table (search / filter / sort / pagination) |
| [http://localhost:3000/hr/applications](http://localhost:3000/hr/applications) | Applications table + signed resume links |
| [http://localhost:3000/hr/applications/[id]](http://localhost:3000/hr/applications) | Candidate review (status, history, notes) |
| [http://localhost:3000/hr/statistics](http://localhost:3000/hr/statistics) | Pipeline charts (Recharts) |

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

## HR Dashboard (for team members)

### What exists

- Top-nav dashboard shell: Overview · Jobs · Applications · Statistics (active link highlight)
- **Overview** — job/application KPIs + recent lists
- **Jobs / Applications** — TanStack Table with search, status filters, sorting, pagination (responsive cards on mobile)
- **Statistics** — Recharts: jobs/applications by status, submissions over time, top jobs by volume
- Aggregations via `services/dashboard` (SQL `count` / `groupBy`) — no AI

### Key files

```
app/(dashboard)/hr/              # Overview, jobs, applications, statistics pages
features/auth/dashboard-nav.tsx  # Active nav links
features/jobs/                   # Jobs TanStack table + CRUD actions
features/applications/           # Applications table, review UI, resume download
features/dashboard/              # Recharts chart components
components/data-table/           # Shared TanStack toolbar / pagination / headers
services/dashboard/              # getHrDashboardStats
```

## Candidate management (for team members)

### What exists

- Application detail at `/hr/applications/[id]`
- HR status actions: Review, Hold, Reject, Interview, Select, Offer, Hire (guarded transitions)
- Status history in `application_status_history`
- Internal notes on `application_notes` (optional note on status change)
- Server Actions: `updateApplicationStatusAction`, `addApplicationNoteAction`
- List/overview candidate names link to the review page

### Status mapping

| Action | DB value |
| --- | --- |
| Review | `under_review` |
| Hold | `on_hold` |
| Select | `shortlisted` |
| Interview / Offer / Hire / Reject | matching enum values |

### Schema / migrate

After pulling schema changes (`on_hold` + `application_status_history`):

```bash
npm run db:generate
npm run db:migrate
```

### Key files

```
app/(dashboard)/hr/applications/[applicationId]/
features/applications/components/application-status-*.tsx
features/applications/components/application-notes-panel.tsx
features/applications/actions/management.actions.ts
services/applications/transitions.ts
db/schema/application-status-history.ts
```

## AI shortlisting (for team members)

### What exists

- HR runs / reruns Gemini shortlisting on `/hr/applications/[id]`
- Inputs: job requirements + description, application form, extracted `resume_text`
- Structured JSON via Vercel AI SDK `generateObject` + Zod
- Stored in `ai_analyses` (score, summary, strengths, concerns, skill matches, raw JSON)
- UI: match score, recommendation, matching/missing skills, strengths, concerns, summary

### Output fields

| Field | Meaning |
| --- | --- |
| `matchScore` | 0–100 fit score |
| `recommendation` | `strong_match` / `good_match` / `partial_match` / `poor_match` |
| `matchingSkills` / `missingSkills` | Skill overlap vs gaps |
| `strengths` / `concerns` | Bullet insights |
| `summary` | Short HR narrative |

### Requirements

- `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`
- Optional `GEMINI_API_KEYS` (comma-separated) for key rotation when free-tier quota is hit
- Model fallbacks: `gemini-2.5-flash-lite` → `2.5-flash` → `2.0-flash-lite` → `2.0-flash` → latest aliases

### Key files

```
lib/ai/shortlist-schema.ts
lib/ai/shortlist-prompt.ts
services/ai/index.ts
features/applications/actions/ai.actions.ts
features/applications/components/ai-shortlist-panel.tsx
db/schema/ai-analyses.ts
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

- Public apply form: personal, professional, education (multi), skills, experience, resume PDF, additional notes
- Zod + React Hook Form + Server Action
- Persists to `applications`, `application_education`, `application_skills` (skills catalog upsert)
- Duplicate apply blocked per job + email
- Secure resume upload to private Supabase Storage bucket `resumes` (PDF only, max 5 MB)
- Path stored in `resume_path` / `resume_file_name` — never a public URL
- Resume text extracted with **pdf-parse** (OCR fallback via Gemini for scanned PDFs) and saved to `resume_text`
- HR opens resumes via short-lived signed URLs (`/hr/applications`)

### Storage setup (required once)

1. Supabase Dashboard → **Storage** → **New bucket**
2. Name: `resumes`
3. **Private** (do not enable public access)
4. Leave policies empty for now — uploads/signed URLs use the service-role server client

### How to test

1. Create the private `resumes` bucket (above)
2. Publish a job in HR
3. Open `/careers/[slug]` → **Apply for this role** → attach a PDF ≤ 5 MB
4. Submit → success page
5. Confirm row in Supabase `applications` (+ education/skills) and object in Storage
6. Confirm `resume_text` is populated on the application row
7. Sign in as HR → `/hr/applications` → **View PDF** (signed link)

### PDF extraction architecture

```
Candidate uploads PDF
        ↓
validateResumeFile (type/size/magic bytes)     ← lib/uploads
        ↓
extractPdfText                                 ← lib/pdf
  1) pdf-parse embedded text
  2) if sparse/empty → render pages + Gemini OCR
        ↓
Insert application + education + skills        ← services/applications
        ↓
Upload PDF to private Storage bucket           ← services/storage
        ↓
Update resume_path + resume_file_name + resume_text
```

- **Binary PDF** stays in Storage (private)
- **Extracted text** lives in Postgres (`resume_text`) for later AI screening
- **Next.js:** `serverExternalPackages` + `import "pdf-parse/worker"` so pdfjs runs in Node
- Password-protected PDFs are rejected with a clear error
- Scanned/image-only PDFs use Gemini vision OCR (needs `GOOGLE_GENERATIVE_AI_API_KEY`)

### Key files

```
features/applications/   # Form, resume download, server actions
services/applications/   # Submit + HR list + signed URL orchestration
services/storage/        # Private bucket upload / signed URLs
lib/uploads/             # PDF meta + magic-byte validation
lib/pdf/                 # pdf-parse + OCR fallback
lib/ai/ocr-resume.ts     # Gemini vision OCR for scanned pages
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
- HR Dashboard (Overview, Jobs, Applications, Statistics)
- Candidate management (status transitions, history, notes)
- AI shortlisting (Gemini structured JSON → `ai_analyses`)
- Job Opening Management (CRUD + publish / unpublish / close)
- Public Careers pages (published list, detail, search/filter)
- Candidate applications (form + private PDF resume upload + text extraction)
- HR applications list with TanStack Table + signed resume links
- Providers (theme, Supabase, toasts)
- Error / API response helpers
- Upload validation (PDF type/size/magic bytes)
- PDF text extraction via pdf-parse + Gemini OCR fallback (`resume_text`)
- Gemini client factory + resume OCR prompt (`lib/ai/ocr-resume.ts`)
- Shared DataTable primitives + Recharts stats
- Routes, roles, and status constants

## Pending work

### Phase 11 — Search & Filters ✅

HR `/hr/applications` uses **server-side** filters via URL search params + Drizzle:

- Name, email (`ilike`), job, status
- AI score min/max (latest completed `ai_analyses.overall_score`)
- Experience min/max, submitted date range
- Paginated results (default 20/page)

Indexes: `applications(created_at)`, `applications(years_of_experience)`, `ai_analyses(application_id, created_at)`. Apply with `npm run db:migrate` (migration `0005_low_guardsmen`).

### Phase 12 — Analytics ✅

HR `/hr/statistics` Recharts (responsive 2-col grid):

- Applications by status
- Applications over time (30d)
- AI recommendations (latest completed shortlist band per application)
- Jobs published (30d via `published_at`)

Metric strip: Applications, AI screened, Published jobs, Shortlisted. Extra charts removed.

### Phase 13 — Security Review

Review the project for security.

Check:

- Authentication
- Authorization
- Supabase RLS
- Storage Security
- Input Validation
- API Security
- Environment Variables
- Rate Limiting suggestions

Deliverable: list of improvements (do not silently change production behavior without a checklist).

### Phase 14 — Refactoring

Refactor the project.

Goals:

- Reduce duplication
- Improve naming
- Improve folder structure
- Improve readability
- Apply SOLID where practical

**No feature changes.**

### Phase 15 — Deployment

Prepare production deployment.

Configure:

- Vercel
- Supabase
- Environment Variables
- Production Build
- Deployment Checklist
- Known Issues
- Optimization Suggestions

### Phase 16 — README

Write a professional README.

Include:

- Project Overview
- Architecture
- Tech Stack
- Folder Structure
- Database
- Authentication
- AI Workflow
- How to Run
- Environment Variables
- Deployment
- Future Improvements
- Known Limitations

> **Also still pending (earlier product work):** richer AI criteria / auto-status updates from recommendations (optional).

## License

Private — all rights reserved.
