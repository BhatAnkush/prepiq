export function buildAnalysisPrompt(jdText: string, resumeText: string): string {
  return `You are an expert technical recruiter. Analyse this job description and resume.

JOB DESCRIPTION:
${jdText}

RESUME:
${resumeText}

Return ONLY valid JSON...`
}

export function buildQuestionPrompt(analysis: any): string {
  return `You are an expert interviewer at ${analysis.companyName}...`
}

export function buildScoringPrompt(
  questionText: string,
  userAnswer: string,
  roleTitle: string,
  techStack: string[]
): string {
  return `You are a senior hiring manager for a ${roleTitle} role...`
}

export function buildInterviewerSystemPrompt(session: any): string {
  return `You are a senior interviewer at ${session.companyName} conducting a real interview for ${session.roleTitle}.
Be direct, professional, and curious.`
}