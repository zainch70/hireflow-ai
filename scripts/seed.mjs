#!/usr/bin/env node

/**
 * Seeds demo jobs, skills, applications, notes, history, and AI analyses.
 * Safe to re-run: removes previous rows tagged with seed slugs / seed emails.
 *
 * Usage: npm run db:seed
 */

import { config } from "dotenv";
import postgres from "postgres";
import { randomUUID } from "node:crypto";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✖ DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const sql = postgres(url, {
  prepare: false,
  ssl: "require",
  max: 1,
  connect_timeout: 20,
});

const SEED_SLUGS = [
  "seed-fullstack-engineer",
  "seed-frontend-engineer",
  "seed-ai-engineer",
  "seed-product-designer-draft",
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("→ Connecting…");
  await sql`select 1`;

  const [hr] = await sql`
    select id, email, full_name
    from profiles
    where role in ('hr', 'admin') and is_active = true
    order by created_at asc
    limit 1
  `;

  if (!hr) {
    console.error(
      "✖ No HR/admin profile found. Create an HR user first (see README), then re-run.",
    );
    process.exit(1);
  }

  console.log(`→ Using HR: ${hr.full_name} <${hr.email}>`);

  console.log("→ Clearing previous seed data…");
  await sql`
    delete from applications
    where email like 'seed.%@hireflow.demo'
       or job_id in (select id from jobs where slug = any(${SEED_SLUGS}))
  `;
  await sql`delete from jobs where slug = any(${SEED_SLUGS})`;
  // Keep shared skill catalog — upsert below (avoid FK conflicts with non-seed apps).

  console.log("→ Inserting skills…");
  const skillRows = [
    ["TypeScript", "typescript", "languages"],
    ["Next.js", "nextjs", "software"],
    ["React", "react", "technical"],
    ["Node.js", "nodejs", "software"],
    ["PostgreSQL", "postgresql", "software"],
    ["Python", "python", "languages"],
    ["FastAPI", "fastapi", "software"],
    ["RAG", "rag", "ai_tools"],
    ["LLM Prompting", "llm-prompting", "ai_tools"],
    ["Figma", "figma", "software"],
    ["Tailwind CSS", "tailwind-css", "technical"],
    ["SQL", "sql", "languages"],
  ];

  const skillsBySlug = {};
  for (const [name, slug, category] of skillRows) {
    const existing = await sql`
      select id, slug from skills where slug = ${slug} or name = ${name} limit 1
    `;
    if (existing[0]) {
      await sql`
        update skills set category = ${category}, name = ${name}, slug = ${slug}
        where id = ${existing[0].id}
      `;
      skillsBySlug[slug] = existing[0].id;
      continue;
    }

    const [row] = await sql`
      insert into skills (id, name, slug, category)
      values (${randomUUID()}, ${name}, ${slug}, ${category})
      returning id, slug
    `;
    skillsBySlug[row.slug] = row.id;
  }

  console.log("→ Inserting jobs…");
  const jobs = [
    {
      id: randomUUID(),
      slug: "seed-fullstack-engineer",
      title: "Full-Stack Engineer",
      department: "Engineering",
      location: "Karachi / Hybrid",
      employmentType: "full_time",
      workplaceType: "hybrid",
      experience: "2+ years",
      status: "published",
      description:
        "Build product features across our Next.js frontend and Node/Postgres backend. You will own slices of hiring and careers workflows end to end.",
      requirements:
        "Strong TypeScript, React/Next.js, SQL, and APIs. Comfortable with Git, code review, and shipping to production.",
      salaryMin: 180000,
      salaryMax: 320000,
      openings: 2,
      featured: true,
    },
    {
      id: randomUUID(),
      slug: "seed-frontend-engineer",
      title: "Frontend Engineer",
      department: "Engineering",
      location: "Remote (Pakistan)",
      employmentType: "full_time",
      workplaceType: "remote",
      experience: "1–3 years",
      status: "published",
      description:
        "Craft polished, accessible UI for candidates and HR. Work closely with design and product on Careers and dashboard experiences.",
      requirements:
        "React, TypeScript, Tailwind, and an eye for detail. Experience with forms and data tables is a plus.",
      salaryMin: 150000,
      salaryMax: 260000,
      openings: 1,
      featured: false,
    },
    {
      id: randomUUID(),
      slug: "seed-ai-engineer",
      title: "AI Engineer",
      department: "AI / Platform",
      location: "Lahore / On-site",
      employmentType: "full_time",
      workplaceType: "onsite",
      experience: "1+ years",
      status: "published",
      description:
        "Improve our Gemini shortlisting pipeline: prompts, evaluation, OCR fallbacks, and structured outputs for recruiters.",
      requirements:
        "Python or TypeScript, LLM APIs, prompt design, RAG basics. Prefer production experience with AI features.",
      salaryMin: 200000,
      salaryMax: 350000,
      openings: 1,
      featured: true,
    },
    {
      id: randomUUID(),
      slug: "seed-product-designer-draft",
      title: "Product Designer",
      department: "Design",
      location: "Karachi",
      employmentType: "contract",
      workplaceType: "hybrid",
      experience: "3+ years",
      status: "draft",
      description:
        "Design hiring workflows that feel calm and clear for candidates and HR.",
      requirements: "Figma expertise and portfolio of B2B product work.",
      salaryMin: null,
      salaryMax: null,
      openings: 1,
      featured: false,
    },
  ];

  for (const job of jobs) {
    await sql`
      insert into jobs (
        id, created_by_id, title, slug, department, location,
        employment_type, workplace_type, description, requirements, experience,
        salary_min, salary_max, salary_currency, status, is_featured, openings,
        published_at
      ) values (
        ${job.id}, ${hr.id}, ${job.title}, ${job.slug}, ${job.department}, ${job.location},
        ${job.employmentType}, ${job.workplaceType}, ${job.description}, ${job.requirements}, ${job.experience},
        ${job.salaryMin}, ${job.salaryMax}, 'PKR', ${job.status}, ${job.featured}, ${job.openings},
        ${job.status === "published" ? daysAgo(14) : null}
      )
    `;
  }

  const bySlug = Object.fromEntries(jobs.map((j) => [j.slug, j]));

  console.log("→ Inserting shortlisting criteria…");
  const criteria = [
    {
      jobId: bySlug["seed-fullstack-engineer"].id,
      type: "experience_years",
      label: "Minimum experience",
      valueNumber: 2,
      isRequired: true,
      weight: 8,
    },
    {
      jobId: bySlug["seed-fullstack-engineer"].id,
      type: "skill",
      label: "TypeScript",
      valueText: "TypeScript",
      isRequired: true,
      weight: 9,
    },
    {
      jobId: bySlug["seed-fullstack-engineer"].id,
      type: "skill",
      label: "Next.js",
      valueText: "Next.js",
      isRequired: true,
      weight: 8,
    },
    {
      jobId: bySlug["seed-ai-engineer"].id,
      type: "education_level",
      label: "Preferred education",
      educationLevel: "bachelor",
      isRequired: false,
      weight: 5,
    },
    {
      jobId: bySlug["seed-ai-engineer"].id,
      type: "custom",
      label: "Production AI preference",
      description:
        "Prefer candidates with production project experience using LLMs, RAG, or AI agents.",
      isRequired: false,
      weight: 7,
    },
    {
      jobId: bySlug["seed-ai-engineer"].id,
      type: "keyword",
      label: "On-site availability",
      valueText: "willing on-site Lahore",
      isRequired: true,
      weight: 6,
    },
  ];

  for (const [i, c] of criteria.entries()) {
    await sql`
      insert into job_shortlisting_criteria (
        id, job_id, type, label, description, value_text, value_number,
        education_level, weight, is_required, sort_order
      ) values (
        ${randomUUID()}, ${c.jobId}, ${c.type}, ${c.label},
        ${c.description ?? null}, ${c.valueText ?? null}, ${c.valueNumber ?? null},
        ${c.educationLevel ?? null}, ${c.weight}, ${c.isRequired}, ${i}
      )
    `;
  }

  console.log("→ Inserting applications…");
  const applicants = [
    {
      jobSlug: "seed-fullstack-engineer",
      fullName: "Ayesha Khan",
      email: "seed.ayesha@hireflow.demo",
      phone: "+92 300 1112233",
      location: "Karachi",
      title: "Software Engineer",
      company: "Nexlify",
      years: 3,
      status: "submitted",
      days: 1,
      skills: ["typescript", "react", "nextjs", "postgresql"],
      score: null,
      recommendation: null,
    },
    {
      jobSlug: "seed-fullstack-engineer",
      fullName: "Bilal Ahmed",
      email: "seed.bilal@hireflow.demo",
      phone: "+92 321 4445566",
      location: "Lahore",
      title: "Full-Stack Developer",
      company: "Cloudspan",
      years: 4,
      status: "under_review",
      days: 3,
      skills: ["typescript", "nodejs", "react", "sql"],
      score: 78,
      recommendation: "good_match",
      assign: true,
    },
    {
      jobSlug: "seed-fullstack-engineer",
      fullName: "Sara Malik",
      email: "seed.sara@hireflow.demo",
      phone: "+92 333 7778899",
      location: "Islamabad",
      title: "Junior Developer",
      company: null,
      years: 1,
      status: "rejected",
      days: 8,
      skills: ["react", "tailwind-css"],
      score: 42,
      recommendation: "poor_match",
    },
    {
      jobSlug: "seed-frontend-engineer",
      fullName: "Hassan Raza",
      email: "seed.hassan@hireflow.demo",
      phone: "+92 301 2223344",
      location: "Karachi",
      title: "UI Engineer",
      company: "PixelForge",
      years: 2,
      status: "shortlisted",
      days: 5,
      skills: ["react", "typescript", "tailwind-css", "figma"],
      score: 88,
      recommendation: "strong_match",
      assign: true,
    },
    {
      jobSlug: "seed-frontend-engineer",
      fullName: "Fatima Noor",
      email: "seed.fatima@hireflow.demo",
      phone: "+92 345 5556677",
      location: "Remote",
      title: "Frontend Developer",
      company: "Studio North",
      years: 2,
      status: "interview",
      days: 6,
      skills: ["react", "nextjs", "typescript"],
      score: 81,
      recommendation: "good_match",
    },
    {
      jobSlug: "seed-ai-engineer",
      fullName: "Omar Siddiqui",
      email: "seed.omar@hireflow.demo",
      phone: "+92 312 8889900",
      location: "Lahore",
      title: "ML Engineer",
      company: "InsightLabs",
      years: 2,
      status: "under_review",
      days: 2,
      skills: ["python", "rag", "llm-prompting", "fastapi"],
      score: 91,
      recommendation: "strong_match",
      assign: true,
    },
    {
      jobSlug: "seed-ai-engineer",
      fullName: "Zara Iqbal",
      email: "seed.zara@hireflow.demo",
      phone: "+92 315 1212121",
      location: "Lahore",
      title: "Backend Developer",
      company: "DataNest",
      years: 3,
      status: "on_hold",
      days: 4,
      skills: ["python", "sql", "fastapi"],
      score: 64,
      recommendation: "partial_match",
    },
    {
      jobSlug: "seed-ai-engineer",
      fullName: "Usman Ali",
      email: "seed.usman@hireflow.demo",
      phone: "+92 300 9998877",
      location: "Faisalabad",
      title: "Software Engineer",
      company: "AppCraft",
      years: 5,
      status: "hired",
      days: 20,
      skills: ["python", "typescript", "rag", "postgresql"],
      score: 86,
      recommendation: "strong_match",
    },
  ];

  for (const person of applicants) {
    const job = bySlug[person.jobSlug];
    const appId = randomUUID();
    const createdAt = daysAgo(person.days);

    await sql`
      insert into applications (
        id, job_id, full_name, email, phone, current_location,
        current_title, current_company, years_of_experience,
        expected_salary, notice_period, employment_status,
        interest_reason, why_consider, willing_onsite, available_join_date,
        work_experience, status, source, assigned_to_id,
        resume_file_name, resume_text, created_at, updated_at
      ) values (
        ${appId}, ${job.id}, ${person.fullName}, ${person.email}, ${person.phone}, ${person.location},
        ${person.title}, ${person.company}, ${person.years},
        ${"PKR 180,000 – 250,000"}, ${"30 days"}, ${"employed"},
        ${"I care about product quality and want to work on hiring tooling that teams actually use."},
        ${"I ship reliably, communicate clearly, and leave codebases better than I found them."},
        ${person.location.includes("Lahore") || person.location.includes("Karachi")},
        ${"2026-09-01"},
        ${`${person.years}+ years building web apps. Recent work includes APIs, dashboards, and production deploys.`},
        ${person.status}, ${"careers_portal"}, ${person.assign ? hr.id : null},
        ${`${person.fullName.replace(/\s+/g, "_")}_CV.pdf`},
        ${`RESUME TEXT (seed)\n${person.fullName}\n${person.title}\nSkills: ${person.skills.join(", ")}\nExperience with modern web and product delivery.`},
        ${createdAt}, ${createdAt}
      )
    `;

    await sql`
      insert into application_education (
        id, application_id, institution, degree, field_of_study,
        education_level, start_date, end_date, is_current, grade, sort_order
      ) values (
        ${randomUUID()}, ${appId}, ${"NUST"}, ${"BS"}, ${"Computer Science"},
        ${"bachelor"}, ${"2018-09-01"}, ${"2022-06-30"}, false, ${"3.4"}, 0
      )
    `;

    for (const slug of person.skills) {
      const skillId = skillsBySlug[slug];
      if (!skillId) continue;
      await sql`
        insert into application_skills (id, application_id, skill_id, proficiency)
        values (${randomUUID()}, ${appId}, ${skillId}, ${"Advanced"})
        on conflict (application_id, skill_id) do nothing
      `;
    }

    await sql`
      insert into application_status_history (
        id, application_id, from_status, to_status, changed_by_id, note, created_at
      ) values (
        ${randomUUID()}, ${appId}, null, ${"submitted"}, null,
        ${"Application submitted via careers portal"}, ${createdAt}
      )
    `;

    if (person.status !== "submitted") {
      await sql`
        insert into application_status_history (
          id, application_id, from_status, to_status, changed_by_id, note, created_at
        ) values (
          ${randomUUID()}, ${appId}, ${"submitted"}, ${person.status}, ${hr.id},
          ${"Seed pipeline update"}, ${daysAgo(Math.max(0, person.days - 1))}
        )
      `;
    }

    if (person.assign || person.status === "under_review") {
      await sql`
        insert into application_notes (id, application_id, author_id, body, created_at)
        values (
          ${randomUUID()}, ${appId}, ${hr.id},
          ${"Seed note: solid baseline — schedule a technical screen if AI score stays strong."},
          ${daysAgo(Math.max(0, person.days - 1))}
        )
      `;
    }

    if (person.score != null && person.recommendation) {
      const raw = {
        matchScore: person.score,
        recommendation: person.recommendation,
        matchingSkills: person.skills.slice(0, 3).map((s) =>
          s.replace(/-/g, " "),
        ),
        missingSkills:
          person.score < 70 ? ["production ownership", "system design"] : ["graphQL"],
        strengths: [
          "Relevant stack experience evidenced in the application",
          "Clear communication in motivation answers",
        ],
        concerns:
          person.score < 70
            ? ["Limited depth vs role seniority"]
            : ["Confirm notice period in interview"],
        summary: `${person.fullName} looks like a ${person.recommendation.replaceAll("_", " ")} for ${job.title}. Seed analysis for demo dashboards and filters.`,
      };

      await sql`
        insert into ai_analyses (
          id, application_id, status, model, prompt_version,
          overall_score, summary, strengths, weaknesses, criteria_matches,
          raw_response, created_at, updated_at
        ) values (
          ${randomUUID()}, ${appId}, ${"completed"}, ${"gemini-2.5-flash-lite"}, ${"shortlist-v3"},
          ${String(person.score)}, ${raw.summary}, ${sql.json(raw.strengths)}, ${sql.json(raw.concerns)},
          ${sql.json(
            raw.matchingSkills.map((label) => ({
              label,
              matched: true,
              score: 80,
            })),
          )},
          ${sql.json(raw)}, ${daysAgo(Math.max(0, person.days - 1))}, ${daysAgo(Math.max(0, person.days - 1))}
        )
      `;
    }
  }

  const counts = await sql`
    select
      (select count(*)::int from jobs where slug = any(${SEED_SLUGS})) as jobs,
      (select count(*)::int from applications where email like 'seed.%@hireflow.demo') as applications,
      (select count(*)::int from ai_analyses) as ai_analyses
  `;

  console.log("✓ Seed complete:", counts[0]);
  console.log(`
Try:
  Careers → published seed jobs
  /hr → KPIs, applications-by-job, recent lists
  /hr/applications → filters + seeded candidates
`);
}

try {
  await main();
} catch (error) {
  console.error("✖ Seed failed:", error);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 }).catch(() => undefined);
}
