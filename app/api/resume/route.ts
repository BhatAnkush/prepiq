import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
const pdfParse = require("pdf-parse")

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("resume") as File
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const data = await pdfParse(buffer)
  const text = data.text
    .replace(/\n{3,}/g, "\n\n")   // collapse excessive newlines
    .trim()

  return NextResponse.json({ text, pages: data.numpages })
}