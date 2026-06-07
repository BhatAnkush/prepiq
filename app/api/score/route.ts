import { auth } from "@/lib/auth"
import { groq, MODEL } from "@/lib/groq"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { sessionId, questionId, userAnswer, questionText, roleTitle, techStack } = await req.json()

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{
      role: "user",
      content: `You are a senior hiring manager for a ${roleTitle} role.
Tech stack context: ${techStack?.join(", ")}

Question asked: "${questionText}"

Candidate's answer: "${userAnswer}"

Score this answer and provide a model answer. Return ONLY JSON:
{
  "score": 7,
  "scoreRationale": "string — 1-2 sentences why this score",
  "strengths": ["string"],
  "improvements": ["string"],
  "modelAnswer": "string — what a 9/10 answer would look like, 3-4 sentences"
}

Score 1-10 where:
1-3: Off-target or very vague
4-6: Adequate but lacks specifics or depth
7-8: Good with concrete examples
9-10: Excellent, specific, structured (STAR), technically precise`
    }],
    response_format: { type: "json_object" },
    temperature: 0.3,
  })

  const result = JSON.parse(completion.choices[0].message.content!)

  // Save score to MongoDB
  const client = await clientPromise
  const db = client.db("interview-prep")
  await db.collection("sessions").updateOne(
    { _id: new ObjectId(sessionId), "questions.id": questionId },
    {
      $set: {
        "questions.$.score": result.score,
        "questions.$.feedback": result.scoreRationale,
        "questions.$.modelAnswer": result.modelAnswer,
      }
    }
  )

  return NextResponse.json(result)
}