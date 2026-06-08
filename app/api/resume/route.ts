export const runtime = "nodejs";

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { extractText } from "unpdf";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const { text } = await extractText(new Uint8Array(arrayBuffer), {
      mergePages: true,
    });
    const cleaned = (text as string).replace(/\n{3,}/g, "\n\n").trim();

    return NextResponse.json({ text: cleaned });
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json(
      { error: "Failed to parse PDF. The file may be corrupted or encrypted." },
      { status: 500 },
    );
  }
}
