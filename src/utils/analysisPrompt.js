const buildAnalysisPrompt = (cvText, jobDescription) => {
  return `
You are an expert career coach and HR specialist.

Analyze the following CV and Job Description carefully.
Return ONLY a valid JSON object, no extra text, no markdown.

CV:
${cvText}

Job Description:
${jobDescription}

Return this exact JSON structure:
{
  "matchScore": <number 0-100>,
  "candidateName": "<name from CV>",
  "jobTitle": "<job title from JD>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "missingSkills": [
    {
      "skill": "<skill name>",
      "importance": "high|medium|low",
      "tip": "<how to learn this skill>"
    }
  ],
  "experienceGap": "<brief analysis>",
  "summary": "<2 sentence overall assessment>",
  "interviewTopics": ["<topic 1>", "<topic 2>", "<topic 3>", "<topic 4>", "<topic 5>"]
}
`;
};

const buildInterviewPrompt = (context, question, answer) => {
  return `
You are a professional technical interviewer.

Context: ${context}

Candidate was asked: "${question}"
Candidate answered: "${answer}"

Return ONLY a valid JSON object:
{
  "score": <number 0-10>,
  "good": "<what was good about the answer>",
  "improve": "<what needs improvement>",
  "tip": "<one professional tip>",
  "nextQuestion": "<your next interview question>"
}
`;
};

module.exports = { buildAnalysisPrompt, buildInterviewPrompt };