const buildCVPrompt = (cvData) => {
  // Sanitize: ensure education is always an array
  if (cvData.education && !Array.isArray(cvData.education)) {
    // Legacy object format fallback
    const edu = cvData.education;
    cvData.education = [];
    if (edu.ssc?.institution) cvData.education.push({ degree: "SSC", institution: edu.ssc.institution, board: edu.ssc.board, gpa: edu.ssc.gpa, year: edu.ssc.year });
    if (edu.hsc?.institution) cvData.education.push({ degree: "HSC", institution: edu.hsc.institution, board: edu.hsc.board, gpa: edu.hsc.gpa, year: edu.hsc.year });
    if (edu.university?.name) cvData.education.push({ degree: edu.university.degree || "BSc", institution: edu.university.name, department: edu.university.department, cgpa: edu.university.cgpa, year: edu.university.year, duration: edu.university.duration });
  }
  const hasExperience = cvData.experience?.some(e => e.company?.trim());

  // Build education context string for the prompt
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
You are an expert ATS-friendly CV writer.
Create a professional, ATS-optimized CV based on the following information.

${!hasExperience ? "IMPORTANT: This is a fresher/student CV with NO work experience. Write a strong student summary focusing on education, projects, skills and potential. Do NOT include experience section." : ""}

Candidate Information:
${JSON.stringify(cvData, null, 2)}

Education Overview:
${educationSummary}

Rules:
- Use simple, clean formatting
- Use strong action verbs
- Include relevant keywords for ATS
- Keep descriptions concise and impactful
- Quantify achievements where possible
- If no work experience, emphasize projects and education strongly
- Include ALL education entries provided — from SSC up to PhD/Masters if present
- GitHub/portfolio link should appear in personalInfo if provided

Return ONLY a valid JSON object, no markdown, no extra text:
{
  "personalInfo": {
    "name": "<full name>",
    "email": "<email>",
    "phone": "<phone>",
    "linkedin": "<linkedin url>",
    "github": "<github or portfolio url if provided>",
    "location": "<city, country>"
  },
  "summary": "<2-3 sentence ${!hasExperience ? "fresher/student" : "professional"} summary optimized for ATS>",
  "experience": ${!hasExperience ? "[]" : `[
    {
      "company": "<company name>",
      "role": "<job title>",
      "duration": "<start - end>",
      "bullets": ["<achievement 1>", "<achievement 2>", "<achievement 3>"]
    }
  ]`},
  "education": [
    {
      "degree": "<degree e.g. SSC / HSC / BSc / MSc / PhD>",
      "institution": "<institution name>",
      "department": "<department or subject if applicable>",
      "year": "<graduation year>",
      "result": "<cgpa or gpa with scale e.g. 3.75/4.00 or 5.00/5.00>",
      "board": "<board name for SSC/HSC only, omit for university>"
    }
  ],
  "skills": {
    "technical": ["<skill 1>", "<skill 2>"],
    "soft": ["<skill 1>", "<skill 2>"]
  },
  "projects": [
    {
      "name": "<project name>",
      "description": "<1-2 sentence description>",
      "techStack": ["<tech 1>", "<tech 2>"],
      "link": "<project link if available>"
    }
  ],
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
      "level": "<level>"
    }
  ],
  "volunteer": [
    {
      "organization": "<organization>",
      "role": "<role>",
      "duration": "<duration>",
      "description": "<description>"
    }
  ],
  "awards": [
    {
      "title": "<award title>",
      "issuer": "<issuer>",
      "year": "<year>"
    }
  ],
  "references": [
    {
      "name": "<name>",
      "designation": "<designation>",
      "organization": "<organization>",
      "email": "<email>",
      "phone": "<phone>"
    }
  ],
  "atsScore": <number 0-100>,
  "atsTips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;
};

module.exports = { buildCVPrompt };