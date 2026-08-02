import { AI_SHORTLIST_PROMPT_VERSION } from "@/lib/ai/shortlist-schema";

export type ShortlistPromptInput = {
  job: {
    title: string;
    department: string | null;
    location: string | null;
    employmentType: string;
    experience: string | null;
    description: string;
    requirements: string | null;
  };
  candidate: {
    fullName: string;
    email: string;
    currentTitle: string | null;
    yearsOfExperience: number | null;
    workExperience: string | null;
    coverLetter: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    education: Array<{
      institution: string;
      degree: string | null;
      fieldOfStudy: string | null;
      educationLevel: string | null;
      grade: string | null;
    }>;
    skills: Array<{ name: string; proficiency: string | null }>;
  };
  resumeText: string | null;
};

const MAX_RESUME_CHARS = 40_000;

function clip(value: string | null | undefined, max: number) {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max)}\n…[truncated]`;
}

export function buildShortlistSystemPrompt() {
  return `You are a senior technical recruiter screening one candidate for one role in HireFlow AI.

## Grounding (anti-hallucination — non-negotiable)
- Use ONLY the job posting, application form fields, and extracted CV text below. Those are the sole evidence.
- Never invent employers, titles, dates, degrees, certifications, tools, soft skills, metrics, or outcomes that are not explicitly supported.
- If evidence is missing, thin, contradictory, or OCR-garbled, treat it as unknown — do not fill gaps with assumptions.
- Prefer phrases like "not evidenced", "unclear from materials", or "limited detail" over guessing.
- A skill listed only as a keyword with no role context counts as weak evidence; do not treat buzzword lists as proven proficiency.
- Do not use outside knowledge about the candidate, company, or market to invent fit. You may use general domain knowledge only to interpret what the role requires.

## Recruiter judgment (not keyword matching)
Evaluate like a hiring recruiter, not a resume keyword scanner:
1. Separate must-haves from nice-to-haves using the job description and requirements. Weight must-haves far more heavily.
2. Match on demonstrated capability: relevant roles, scope, seniority, domain, and outcomes — not exact string matches.
3. Credit transferable experience when the evidence shows comparable responsibility (e.g. similar stack, adjacent domain, same problem class). Explain the transfer briefly in strengths when you do.
4. Penalize shallow keyword dumps, title inflation without substance, and vague claims with no supporting context.
5. Weigh conflicts carefully: if the form and CV disagree, note the conflict in concerns and trust the more specific, recent, role-grounded evidence.
6. Experience years are a signal, not a hard pass/fail unless the posting clearly requires a hard minimum.
7. Education matters only when the role implies it (e.g. regulated fields, degree requirements). Otherwise treat it as supporting context.
8. If CV text is empty or thin, rely on the application form and explicitly note limited resume evidence in concerns.

## Scoring rubric (0–100)
- 85–100 strong_match: Clear evidence for nearly all must-haves; seniority/scope aligned; low risk to interview.
- 70–84 good_match: Most must-haves evidenced; gaps are coachable or nice-to-have; worth interviewing.
- 45–69 partial_match: Some relevant signal but important must-haves missing, thin, or mismatched seniority.
- 0–44 poor_match: Little credible evidence for core requirements, or clear misalignment.

Map recommendation to that band. Do not inflate scores for enthusiasm, cover-letter tone, or keyword overlap alone.

## Output quality
- matchingSkills: only capabilities clearly supported by evidence AND relevant to this job (normalize names; no duplicates).
- missingSkills: important job requirements not evidenced — especially must-haves. Do not invent niche tools the posting never asked for.
- strengths / concerns: specific, evidence-tied bullets recruiters can act on (what was shown, what was not). Avoid generic praise.
- summary: 3–6 sentences for HR — overall fit, key evidence, main gaps, and interview recommendation.
- Be fair and concise. Return structured data matching the schema only.

Prompt version: ${AI_SHORTLIST_PROMPT_VERSION}`;
}

export function buildShortlistUserPrompt(input: ShortlistPromptInput) {
  const education =
    input.candidate.education.length === 0
      ? "None provided"
      : input.candidate.education
          .map((entry, index) => {
            const parts = [
              entry.institution,
              entry.degree,
              entry.fieldOfStudy,
              entry.educationLevel,
              entry.grade ? `Grade: ${entry.grade}` : null,
            ].filter(Boolean);
            return `${index + 1}. ${parts.join(" · ")}`;
          })
          .join("\n");

  const skills =
    input.candidate.skills.length === 0
      ? "None provided"
      : input.candidate.skills
          .map((skill) =>
            skill.proficiency
              ? `${skill.name} (${skill.proficiency})`
              : skill.name,
          )
          .join(", ");

  const resume =
    clip(input.resumeText, MAX_RESUME_CHARS) ||
    "(No extracted CV text available)";

  return `Screen this candidate as a recruiter. Ground every claim in the materials below. Do not invent missing facts.

## Job
Title: ${input.job.title}
Department: ${input.job.department ?? "—"}
Location: ${input.job.location ?? "—"}
Employment type: ${input.job.employmentType}
Experience requirement: ${input.job.experience ?? "—"}

### Description
${clip(input.job.description, 8_000) || "—"}

### Requirements
${clip(input.job.requirements, 8_000) || "—"}

## Candidate application
Name: ${input.candidate.fullName}
Email: ${input.candidate.email}
Current title: ${input.candidate.currentTitle ?? "—"}
Years of experience: ${input.candidate.yearsOfExperience ?? "—"}
LinkedIn: ${input.candidate.linkedinUrl ?? "—"}
Portfolio: ${input.candidate.portfolioUrl ?? "—"}

### Work experience (form)
${clip(input.candidate.workExperience, 8_000) || "—"}

### Cover letter / notes
${clip(input.candidate.coverLetter, 4_000) || "—"}

### Education
${education}

### Skills (form)
${skills}

## Extracted CV text
${resume}

## Your task
1. Identify must-have vs nice-to-have requirements from the job.
2. Judge fit from demonstrated experience and evidence — not keyword overlap alone.
3. Score 0–100 using the rubric; set recommendation to the matching band.
4. List matchingSkills and missingSkills for THIS role only, with evidence-backed entries.
5. Write strengths, concerns, and an HR summary that a recruiter would trust.`;
}
