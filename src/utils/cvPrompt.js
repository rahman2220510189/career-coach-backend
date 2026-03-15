const buildCVPrompt = (cvData) => {
  // Sanitize: ensure education is always an array
  if (cvData.education && !Array.isArray(cvData.education)) {
    const edu = cvData.education;
    cvData.education = [];
    if (edu.ssc?.institution) cvData.education.push({ degree: "SSC", institution: edu.ssc.institution, board: edu.ssc.board, gpa: edu.ssc.gpa, year: edu.ssc.year });
    if (edu.hsc?.institution) cvData.education.push({ degree: "HSC", institution: edu.hsc.institution, board: edu.hsc.board, gpa: edu.hsc.gpa, year: edu.hsc.year });
    if (edu.university?.name) cvData.education.push({ degree: edu.university.degree || "BSc", institution: edu.university.name, department: edu.university.department, cgpa: edu.university.cgpa, year: edu.university.year, duration: edu.university.duration });
  }

  const hasExperience = cvData.experience?.some(e => e.company?.trim());
  const hasTechSkills = cvData.skills?.technical?.length > 0;
  const hasProjects   = cvData.projects?.some(p => p.name?.trim());
  const hasReferences = cvData.references?.some(r => r.name?.trim());
  const hasVolunteer  = cvData.volunteer?.some(v => v.organization?.trim());
  const hasAwards     = cvData.awards?.some(a => a.title?.trim());

  const educationSummary = cvData.education?.length
    ? cvData.education.map(e =>
        `${e.degree}${e.department ? ` in ${e.department}` : ""} — ${e.institution}` +
        `${e.year ? `, ${e.year}` : ""}` +
        `${e.cgpa ? `, CGPA: ${e.cgpa}` : ""}` +
        `${e.gpa ? `, GPA: ${e.gpa}` : ""}` +
        `${e.board ? `, Board: ${e.board}` : ""}`
      ).join("\n")
    : "Not provided";

  return `
You are a world-class ATS CV writer. Your CVs consistently score 92-98% on Jobscan, Lever, Greenhouse, and Workday ATS systems.

Your task: Generate a CV that scores 92%+ on modern ATS. Every word must be intentional.

${!hasExperience
  ? `FRESHER/STUDENT MODE:
- Open with a powerful objective statement using industry keywords
- Treat projects as professional experience — describe them with business impact
- Lead with strongest technical skills prominently
- Use action verbs that match job descriptions: Developed, Engineered, Designed, Built, Deployed, Optimized`
  : `PROFESSIONAL MODE:
- Every bullet must show measurable business impact
- Use STAR format: Situation → Task → Action → Result`}

=== CANDIDATE DATA ===
${JSON.stringify(cvData, null, 2)}

=== EDUCATION BREAKDOWN ===
${educationSummary}

${cvData.jobDescription ? `=== TARGET JOB DESCRIPTION ===
${cvData.jobDescription.substring(0, 3000)}

IMPORTANT — Since a job URL was provided:
- Extract the job title, required skills, and key responsibilities from above
- Mirror the EXACT keywords and phrases from the job description in the summary and bullets
- Prioritize skills that appear in the job description
- Tailor the summary to directly address what this employer is looking for
- Score the atsScore based on how well the CV matches THIS specific job
` : ""}
=== STRICT ATS RULES (follow ALL or score drops) ===
1. Summary: exactly 3 sentences — [Job title + years/level] + [Top 3-4 technical keywords from skills list] + [Specific value/impact you bring]
2. Mirror EXACT keywords from skills list — ATS matches exact strings, not synonyms
3. Every bullet: [Strong verb] + [specific task] + [quantified result] — no vague statements
4. Numbers mandatory: use %, count, time, or scale (e.g. "5+ projects", "40% faster", "3-tier architecture")
5. Projects = work experience for freshers — write with same seriousness as job bullets
6. Education: include ALL entries, never drop any degree level
7. Technical skills: copy EVERY skill exactly as provided — zero truncation
8. Degree title: write "BSc in Computer Science" NOT "BSc in Computer Science & Engineering in Computer Science & Engineering" (no duplication)
9. No photos, tables, columns, graphics — plain linear text only
10. atsScore formula: keyword_density(30) + quantification(25) + completeness(25) + formatting(20) — be honest, typical good CV = 88-94

=== OUTPUT RULES ===
- Return ONLY valid JSON — no markdown, no backticks, no extra text
- All array fields must be arrays even if empty []
- atsScore: be honest — score based on keyword density, quantification, formatting compliance
- atsTips: give 3 actionable, specific tips to improve this exact CV further

Return this exact JSON structure:
{
  "personalInfo": {
    "name": "<full name>",
    "email": "<email>",
    "phone": "<phone>",
    "location": "<city, country>",
    "linkedin": "<linkedin url or empty string>",
    "github": "<github/portfolio url or empty string>"
  },
  "summary": "<3-sentence ${!hasExperience ? "fresher/student" : "professional"} summary packed with ATS keywords from the skills list>",
  "experience": ${!hasExperience ? "[]" : `[
    {
      "company": "<company>",
      "role": "<exact job title — use industry-standard titles>",
      "duration": "<Month Year – Month Year or Present>",
      "bullets": [
        "<Action verb + task + quantified result>",
        "<Action verb + task + quantified result>",
        "<Action verb + task + quantified result>"
      ]
    }
  ]`},
  "education": [
    {
      "degree": "<exact degree e.g. SSC / HSC / BSc in CSE / MSc / PhD>",
      "institution": "<institution name>",
      "department": "<department/subject — omit for SSC/HSC>",
      "year": "<graduation year>",
      "result": "<GPA or CGPA with scale e.g. 5.00/5.00 or 3.75/4.00>",
      "board": "<board name — SSC/HSC only>"
    }
  ],
  "skills": {
    "technical": [/* COPY ALL ${cvData.skills?.technical?.length || 0} skills exactly as provided — do NOT truncate or summarize */],
    "soft": ${cvData.skills?.soft?.length ? '["<soft skill>", "<soft skill>"]' : '["Problem Solving", "Team Collaboration", "Communication", "Time Management", "Adaptability"]'}
  },
  "projects": ${!hasProjects ? "[]" : `[
    {
      "name": "<project name>",
      "description": "<Action verb — what built — tech used — measurable impact>",
      "techStack": ["<tech>", "<tech>"],
      "link": "<url or empty string>"
    }
  ]`},
  "certificates": [
    {
      "name": "<certificate name>",
      "platform": "<platform>",
      "year": "<year>"
    }
  ],
  "languages": [
    {
      "language": "<language>",
      "level": "<Native|Fluent|Advanced|Intermediate|Basic>"
    }
  ],
  "volunteer": ${!hasVolunteer ? "[]" : `[
    {
      "organization": "<organization>",
      "role": "<role>",
      "duration": "<duration>",
      "description": "<brief impact-focused description>"
    }
  ]`},
  "awards": ${!hasAwards ? "[]" : `[
    {
      "title": "<award title>",
      "issuer": "<issuer>",
      "year": "<year>"
    }
  ]`},
  "references": ${!hasReferences ? "[]" : `[
    {
      "name": "<name>",
      "designation": "<designation>",
      "organization": "<organization>",
      "email": "<email>",
      "phone": "<phone>"
    }
  ]`},
  "atsScore": <honest score 0-100 based on: keyword density 30pts + quantification 25pts + formatting 20pts + completeness 25pts>,
  "atsTips": [
    "<Specific actionable tip 1 for THIS CV>",
    "<Specific actionable tip 2 for THIS CV>",
    "<Specific actionable tip 3 for THIS CV>"
  ]
}`;
};

module.exports = { buildCVPrompt };