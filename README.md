# HireFlow AI

## Project overview

**HireFlow AI** is a web app for hiring.

It has two sides:

1. **Public careers site** — anyone can browse open jobs and apply.
2. **HR dashboard** — only signed-in HR / admin users can manage jobs, review candidates, run AI screening, and see hiring stats.

### What candidates can do

- Visit the **Careers** page and see only **published** jobs
- Open a job to read title, department, location, employment type, experience, description, qualifications, and required skills
- Click **Apply**, fill a detailed form, and upload a **PDF resume**
- Get a confirmation after a successful submit

### What HR can do

- Sign in at `/login` (no public “sign up as HR”)
- See an **Overview** with hiring numbers (new applications, interviews, hired, and more)
- Create, edit, publish, unpublish, close, or delete **job openings**
- Set **shortlisting criteria** on a job (used by the AI)
- Browse **applications** with filters (name, email, job, status, AI score, experience, dates, location, skill, qualification, graduation year, archived)
- Open a candidate profile: contact info, education, skills by category, experience, motivation answers, and CV download
- Change pipeline **status**, leave **notes**, **assign** the application to a teammate
- **Archive** or permanently **delete** an application
- Run **AI shortlisting**, then Accept or Reject with one click
- View **Statistics** charts (applications by status, over time, AI recommendations, jobs published)

### Simple end-to-end path

```
Publish a job → Candidate applies with PDF
             → HR reviews the application
             → HR runs AI shortlisting
             → HR Accept / Reject or moves status in the pipeline
```

### Deployed demo

Live site: [https://hireflow-ai-v1.vercel.app/](https://hireflow-ai-v1.vercel.app/)

| Page | Link |
| --- | --- |
| Home | [https://hireflow-ai-v1.vercel.app/](https://hireflow-ai-v1.vercel.app/) |
| Careers | [https://hireflow-ai-v1.vercel.app/careers](https://hireflow-ai-v1.vercel.app/careers) |
| HR login | [https://hireflow-ai-v1.vercel.app/login](https://hireflow-ai-v1.vercel.app/login) |
| HR dashboard | [https://hireflow-ai-v1.vercel.app/hr](https://hireflow-ai-v1.vercel.app/hr) |

Public careers and apply work without login. Use a provisioned HR user to open `/hr`.

## Technology stack

Here is what the project is built with, in plain terms:

| Area | Tools | Why we use it |
| --- | --- | --- |
| App framework | **Next.js 15** (App Router), **React 19**, **TypeScript** | Modern React web app with server rendering and typed code |
| Look & feel | **Tailwind CSS**, **shadcn/ui**, **Lucide** icons, **Sonner** toasts, **next-themes** | Fast UI building, light/dark theme, clear feedback messages |
| Login & files | **Supabase Auth** + **Supabase Storage** | Secure login cookies; private resume file storage |
| Database | **PostgreSQL** (on Supabase) + **Drizzle ORM** | Reliable data storage with typed queries and SQL migrations |
| Forms | **React Hook Form**, **Zod**, **Server Actions** | Form UI in the browser; rules and saves happen on the server |
| AI | **Vercel AI SDK** + **Google Gemini** | Structured shortlisting scores and resume OCR when needed |
| Tables & charts | **TanStack Table**, **Recharts** | HR job/application tables and dashboard charts |
| PDF reading | **pdf-parse** (+ Gemini vision if the PDF is image-only) | Pull text from resumes for AI screening |
| Code quality | **ESLint**, **Prettier**, **EditorConfig** | Consistent formatting and linting |

## System architecture

The code is split into folders so each part has one job. That makes it easier to find and change features.

### Folder map

```
app/           Pages and layouts (public site, login, HR dashboard)
components/    Shared UI pieces (buttons, cards, tables)
features/      Screens + Server Actions for each feature (auth, jobs, apply, AI panel)
services/      Business rules and database / storage / AI calls
db/            Database schema and migration files
lib/           Shared helpers (auth, AI client, cache, rate limits, PDF, errors)
schemas/       Zod validation rules (forms and URL filters)
constants/     Fixed values (routes, roles, statuses, skill categories)
```

### How a typical action works

Example: HR changes an application status.

1. The button in the UI (`features/…`) calls a **Server Action** (code that runs only on the server).
2. The action checks that the user is logged in as HR.
3. It validates the input with **Zod** (rejects bad data early).
4. A function in `services/…` applies the business rule (allowed status change, write history note, update the row).
5. Cache tags are cleared so the applications list and overview refresh with new data.

Public “Apply” works the same way, but instead of HR auth it uses a **rate limit** so one IP cannot spam applications.

### Main URL areas

| Area | Who uses it | What you see |
| --- | --- | --- |
| `/` and `/careers` | Everyone | Marketing / careers pages |
| `/login` | HR | Sign-in form |
| `/hr`, `/hr/jobs`, `/hr/applications`, `/hr/statistics` | HR / admin only | Protected dashboard |

Middleware refreshes the auth session and blocks `/hr/*` if there is no login. The dashboard layout also checks that the user’s role is `hr` or `admin` and that the account is active.

### Caching (why lists feel fast)

- Important HR and careers reads are cached for a short time.
- When something changes (new apply, status update, AI run), the app **revalidates** the right tags/paths so the next visit shows fresh data.
- Dates are stored as text (ISO strings) when cached, so the UI does not break after soft navigation.

## Database structure

All tables are defined in TypeScript under `db/schema/`.  
When the schema changes, we generate a SQL migration and apply it. We do **not** push the schema directly to the database, and we do **not** hand-edit migration SQL files.

```bash
# After editing db/schema/*
npm run db:generate   # creates a new SQL file
npm run db:migrate    # applies it to the database
```

### Tables (what each one stores)

| Table | What it is (simple explanation) |
| --- | --- |
| `profiles` | User profile linked to Supabase Auth. Holds name, email, role (`candidate`, `hr`, or `admin`), and active flag. |
| `jobs` | Job openings. Status: draft, published, closed, or archived. Includes description, requirements, location, and more. |
| `job_shortlisting_criteria` | Extra rules HR sets per job (skills, experience, keywords, etc.). These are sent to the AI. |
| `skills` | Shared list of skill names. Each skill has a category (technical, languages, AI tools, soft skills, other). |
| `applications` | One row per application: candidate contact snapshot, resume path/text, status, who it is assigned to, archive time. |
| `application_education` | Education history for an application (school, degree, dates, grade). Multiple rows allowed. |
| `application_skills` | Links an application to skills, with optional proficiency. |
| `application_notes` | Internal notes written by HR (candidates do not see these). |
| `application_status_history` | Log of every status change (from → to, who changed it, optional note). |
| `ai_analyses` | Results of each AI shortlist run (score, recommendation, strengths, concerns, raw JSON, model name). |
| `rate_limit_buckets` | Counters used to limit how often someone can apply or run AI. |

### Hiring status flow

Statuses move in a controlled pipeline (HR cannot jump randomly):

| Status in DB | Meaning on screen |
| --- | --- |
| `submitted` | New application |
| `under_review` | HR is reviewing |
| `on_hold` | Paused |
| `shortlisted` | Selected / shortlisted |
| `interview` | Interview stage |
| `offered` | Offer sent |
| `hired` | Hired |
| `rejected` | Rejected |
| `withdrawn` | Candidate withdrew (not set by normal HR buttons) |

Allowed moves are defined in `services/applications/transitions.ts`.

### Resume files

- Files live in a **private** Supabase Storage bucket named `resumes`.
- The database only stores the **path** and file name — not a public link.
- When HR clicks download, the server creates a **short-lived signed URL** so the file opens safely for a limited time.

## How to run the project

Follow these steps in order the first time.

### Step 1 — Install packages

```bash
npm install
```

### Step 2 — Create your env file

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values below.

#### App URL

| Variable | What to put |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local work |

#### Supabase keys

In the [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Project Settings → API Keys** (and General for the URL):

| Variable | Where to find it | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Looks like `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable / anon key | Safe for the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret / service_role key | **Server only** — never commit or put in client code |

#### Database URL

Use the **Session pooler** connection string (not the “Direct” host). Direct `db.*.supabase.co` often fails from some networks.

1. Supabase → **Project Settings → Database** (or **Connect**)
2. Connection string → URI → **Session pooler**
3. Replace the password placeholder with your database password
4. Add `?sslmode=require` at the end

Example shape:

```env
DATABASE_URL=postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require
```

If the password has special characters (`@`, `#`, `%`, `/`), URL-encode them.

#### Gemini (AI)

| Variable | What it is |
| --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Required. Create at [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_API_KEYS` | Optional. Extra keys, comma-separated, if free-tier quota runs out |

### Step 3 — Apply database migrations

```bash
npm run db:migrate
```

You should see that the database is reachable and migrations applied successfully.

### Step 4 — Create the resumes bucket (one time)

1. Supabase → **Storage** → **New bucket**
2. Name: `resumes`
3. Keep it **Private** (do not make it public)

### Step 5 — Create an HR login

The app does **not** let people register themselves as HR. Create the user in Supabase:

1. **Authentication → Users → Add user**  
   - Email + password (at least 8 characters)  
   - Turn on auto-confirm if you want to sign in right away  
2. Copy the user’s **UUID**
3. **Table Editor → `profiles` → Insert**:

| Column | Value |
| --- | --- |
| `id` | Same UUID as the Auth user |
| `email` | Same email |
| `full_name` | Any display name |
| `role` | `hr` or `admin` |
| `is_active` | `true` |

Only `hr` and `admin` can open `/hr`. A `candidate` role is blocked from the dashboard.

### Step 6 — Start the app

```bash
npm run dev
```

Then open:

| Link | Purpose |
| --- | --- |
| [http://localhost:3000](http://localhost:3000) | Home |
| [http://localhost:3000/careers](http://localhost:3000/careers) | Careers list |
| [http://localhost:3000/login](http://localhost:3000/login) | HR login |
| [http://localhost:3000/hr](http://localhost:3000/hr) | HR overview |
| [http://localhost:3000/hr/jobs](http://localhost:3000/hr/jobs) | Manage jobs |
| [http://localhost:3000/hr/applications](http://localhost:3000/hr/applications) | Review applications |
| [http://localhost:3000/hr/statistics](http://localhost:3000/hr/statistics) | Charts |

### Other useful commands

| Command | What it does |
| --- | --- |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run typecheck` | Check TypeScript |
| `npm run lint` | Run ESLint |
| `npm run db:studio` | Open Drizzle Studio to browse tables |

### Quick local test checklist

1. Create + publish a job as HR  
2. Log out and apply from `/careers` with a PDF  
3. Log in as HR, open the application, download the CV  
4. Run AI shortlisting and check the score panel  
5. Change status or Accept / Reject  

## How AI shortlisting works

AI shortlisting helps HR decide if a candidate is a good fit for a job. It does **not** replace HR judgment — it gives a structured second opinion.

### What happens when HR clicks “Run AI shortlisting”

1. The server checks that the user is HR and has not hit the AI rate limit.
2. It loads everything needed for a fair review:
   - Job title, description, requirements
   - HR shortlisting criteria for that job (if any)
   - The candidate’s form answers
   - Text extracted from the resume (`resume_text`)
3. It builds a clear “recruiter” prompt (version `shortlist-v3`) that tells the model:
   - Only use facts from the materials
   - Do not invent experience or skills that are not there
4. Google Gemini returns a **structured result** (JSON), checked by Zod so the shape is always valid.
5. The result is saved in `ai_analyses` and shown on the page.

### What HR sees in the UI

| Field | Meaning |
| --- | --- |
| Match score | Number from 0–100 for overall fit |
| Recommendation | Strong / good / partial / poor match |
| Matching skills | Skills that line up with the job |
| Missing skills | Important gaps |
| Strengths | Short positive points |
| Concerns | Risks or weak spots |
| Summary | Short paragraph for HR |

### Accept and Reject

After a successful AI run (and if the current status allows it):

- **Accept shortlist** → moves the candidate to **Selected** (`shortlisted`) and writes a note  
- **Reject candidate** → moves to **Rejected** and writes a note  

HR can still use the normal status buttons for finer control.

### How resume text is prepared (when someone applies)

```
Candidate uploads PDF
        ↓
Check file type, size (max 5 MB), and PDF signature
        ↓
Try to read text with pdf-parse
        ↓
If almost no text (scanned PDF) → Gemini vision OCR
        ↓
Save application + education + skills in the database
        ↓
Upload the PDF to the private "resumes" bucket
        ↓
Store resume_path + resume_text on the application
```

So the AI later reads **text**, while the original PDF stays private in Storage.

## API or model used

### Application “API”

This project does **not** expose a public REST API like `/api/applications` for the hiring workflow.

Instead it uses:

- **Next.js Server Actions** for create / update / delete style work (apply, status change, AI run, etc.)
- **Server Components** and cached loaders for reading lists and detail pages

That keeps secrets and business rules on the server.

### AI model and SDK

| Item | Detail |
| --- | --- |
| Provider | **Google Gemini** |
| SDK | **Vercel AI SDK** (`ai` package) with `@ai-sdk/google` |
| Main env var | `GOOGLE_GENERATIVE_AI_API_KEY` |
| Extra keys (optional) | `GEMINI_API_KEYS` (comma-separated) |

If one model or key hits quota errors, the app tries the next combination automatically.

**Model try order** (see `lib/ai/client.ts`):

1. `gemini-2.5-flash-lite`  
2. `gemini-2.5-flash`  
3. `gemini-2.0-flash-lite`  
4. `gemini-2.0-flash`  
5. `gemini-flash-lite-latest` / `gemini-flash-latest`  

Shortlisting uses structured generation (`generateObject` with fallback helper).  
Resume OCR for scanned PDFs uses the same Gemini setup.

### Other external services

- **Supabase Auth** — login sessions  
- **Supabase Postgres** — all application data  
- **Supabase Storage** — private resume files and signed download links  

## Security decisions

These choices are intentional — they protect candidate data and keep HR access limited.

### Access control

- There is **no public “Register as HR”** page. HR users are created in Supabase by an admin.
- New auth users that get a profile automatically are always role **`candidate`**. The app **does not** trust Auth `user_metadata.role` to grant HR powers.
- `/hr` routes need a valid session. The dashboard also checks role (`hr` / `admin`) and `is_active`.
- Candidate accounts cannot open the HR dashboard even if they know the URL.

### Data and uploads

- Resume files are in a **private** bucket. There is no public file URL in the database.
- HR downloads use **time-limited signed URLs** created on the server.
- The **service role key** stays on the server only.
- Uploads must be PDF, max **5 MB**, and pass magic-byte checks. Password-locked PDFs are rejected.

### Business rules on the server

- Status changes must follow the allowed pipeline (no random jumps).
- Forms and filters are validated with **Zod** before anything is saved.
- **Rate limits** reduce abuse:
  - Apply: about **5 applications per hour per IP**
  - AI shortlisting: about **20 runs per hour per HR user**

### Database changes

- Schema updates go through **generated migrations** only.
- `drizzle-kit push` is blocked in this repo to avoid accidental unsafe syncs.

### Honest production note

Row Level Security (RLS) on Postgres is **not** turned on yet. Today the app relies on Server Actions and the service role. Before a wide public launch, you should lock down Supabase Data API access and/or add RLS policies for HR vs candidate data.

## Known limitations

This section is the **source of truth** for gaps vs a full production hiring product (and vs any PDF wording that differs slightly). Incomplete features are listed here on purpose.

### Intentional product choices (not bugs)

- **No separate “AI Shortlisted” application status.** AI results live in `ai_analyses`. Overview **AI shortlisted** means “candidates with a completed AI run.” HR decision statuses stay manual (**Selected** / Rejected / Interview / …). The AI never auto-hires or auto-rejects.
- **Backend is Server Actions**, not a public REST API. Mutations run on the server with Zod validation; this is the app’s API layer.
- **Skills use one list with categories** (technical, software & platforms, programming languages, AI-related, soft skills, other) instead of five totally separate form sections. Same data, simpler UI.
- **Graduation year** is collected on the form and stored via education `end_date` (year, or exact date if provided). The HR graduation-year filter reads that year.

### Still incomplete / not built

- **PostgreSQL RLS** is not enabled. Access control relies on Server Actions + service role. Harden Data API / RLS before a wide public launch.
- **No candidate self-service portal** to track or withdraw applications after submit (candidates only use the public apply flow).
- **No email or Slack notifications** when status changes or when an application is assigned.
- **AI Accept / Reject** buttons only show when the current status may move to Selected or Rejected.
- **Rate limits** are fixed hourly windows in Postgres (apply: 5/IP; AI: 20/HR user), not adaptive or Redis-based.
- Skill catalog is **global by name/slug**; category may update when another application reuses the same skill name.
- Multi-select filters by skill category on the HR list are not built yet (text skill search exists).

### Demo / ops

- Production still needs: private `resumes` bucket checked, Auth signup policy reviewed, env vars set on the host.

## Future improvements

- Enable **PostgreSQL RLS** and lock down direct table access
- Candidate **application tracker** and withdraw flow
- **Email / Slack** alerts for assignees and status changes
- Optional **auto-suggest status** from strong AI matches (still HR-confirmed)
- HR multi-select filters by **skill category**
- Stronger distributed rate limiting and load testing

## License

Private — all rights reserved.
