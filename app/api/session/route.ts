import { auth } from "@/lib/auth"
import { groq, MODEL } from "@/lib/groq"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { jdText, resumeText, analysis } = await req.json()

  // Generate 8 tailored questions
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{
      role: "user",
      content: `You are an expert interviewer at ${analysis.companyName} hiring for ${analysis.roleTitle}.

The candidate's resume shows strengths in: ${analysis.candidateStrengths.join(", ")}
The candidate has gaps in: ${analysis.candidateGaps.join(", ")}
Company tech stack from JD: ${analysis.techStack.join(", ")}
Interview signals required: ${analysis.interviewSignals.join(", ")}

Generate exactly 8 interview questions. Rules:
- 3 questions targeting their GAPS (expose what they don't know, but fairly)
- 3 questions on their STRENGTHS (let them shine, but go deep)
- 2 behavioral questions using the company's values/culture from the JD
- Make questions SPECIFIC to the company's stack — name the actual technologies
- Vary difficulty: 2 easy, 4 medium, 2 hard

Return ONLY valid JSON array:
[
  {
    "id": "q1",
    "questionText": "string",
    "category": "technical|behavioral|system-design|culture-fit",
    "difficulty": "easy|medium|hard",
    "targetSkill": "string"
  }
]`
    }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  })

  const parsed = JSON.parse(completion.choices[0].message.content!)
  const questions = parsed.questions || parsed

  const client = await clientPromise
  const db = client.db("interview-prep")

  const newSession = {
    userId: session.user.id,
    createdAt: new Date(),
    status: "active",
    companyName: analysis.companyName,
    roleTitle: analysis.roleTitle,
    jdText,
    resumeText,
    analysis,
    questions,
    currentQuestionIndex: 0,
    durationSeconds: 0,
  }

  const result = await db.collection("sessions").insertOne(newSession)
  return NextResponse.json({ sessionId: result.insertedId.toString(), questions })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("id")

  const client = await clientPromise
  const db = client.db("interview-prep")

  if (sessionId) {
    const interviewSession = await db.collection("sessions").findOne({
      _id: new ObjectId(sessionId),
      userId: session.user.id,
    })
    return NextResponse.json(interviewSession)
  }

  // Return all sessions for user
  const sessions = await db.collection("sessions")
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray()
  return NextResponse.json(sessions)
}