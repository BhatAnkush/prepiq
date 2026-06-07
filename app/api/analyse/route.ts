import { auth } from "@/lib/auth"
import { groq, MODEL } from "@/lib/groq"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { jdText, resumeText } = await req.json()

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{
      role: "user",
      content: `You are an expert technical recruiter. Analyse this job description and candidate resume.

JOB DESCRIPTION:
${jdText}

CANDIDATE RESUME:
${resumeText}

Return ONLY valid JSON with this exact shape:
{
  "companyName": "string",
  "roleTitle": "string",
  "techStack": ["string"],
  "requiredSkills": ["string"],
  "seniorityLevel": "junior|mid|senior|lead",
  "interviewSignals": ["string"],
  "candidateGaps": ["string"],
  "candidateStrengths": ["string"]
}

interviewSignals should include things like "system design", "behavioral", "DSA", "product sense" based on the JD.
candidateGaps = skills in JD not evident in resume.
candidateStrengths = skills in both JD and resume.
Return ONLY JSON, no markdown, no explanation.`
    }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  })

  const analysis = JSON.parse(completion.choices[0].message.content!)
  return NextResponse.json(analysis)
}