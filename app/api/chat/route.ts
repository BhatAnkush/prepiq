import { auth } from "@/lib/auth"
import { groq, MODEL } from "@/lib/groq"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const { sessionId, questionId, userAnswer, conversationHistory } = await req.json()

  const client = await clientPromise
  const db = client.db("interview-prep")
  const interviewSession = await db.collection("sessions").findOne({
    _id: new ObjectId(sessionId),
    userId: session.user.id,
  })

  if (!interviewSession) return new Response("Not found", { status: 404 })

  const currentQuestion = interviewSession.questions.find((q: any) => q.id === questionId)

  // Build streaming response — interviewer follows up naturally
  const stream = await groq.chat.completions.create({
    model: MODEL,
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are a senior interviewer at ${interviewSession.companyName} conducting a real interview for ${interviewSession.roleTitle}.
Be direct, professional, and curious. Ask follow-up questions if an answer is vague.
Keep responses under 3 sentences. This is a live interview, not a coaching session.
Current question being asked: "${currentQuestion?.questionText}"`,
      },
      ...conversationHistory,
      {
        role: "user",
        content: userAnswer,
      },
    ],
    temperature: 0.6,
  })

  // Save the answer to MongoDB in background (don't await)
  db.collection("sessions").updateOne(
    { _id: new ObjectId(sessionId), "questions.id": questionId },
    { $set: { "questions.$.userAnswer": userAnswer } }
  )

  // Stream tokens back to client
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ""
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}