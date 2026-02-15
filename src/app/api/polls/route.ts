import { NextRequest, NextResponse } from "next/server";
import { createPollDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, options: optionTexts } = body as { question?: string; options?: string[] };
    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }
    const opts = Array.isArray(optionTexts)
      ? optionTexts.filter((o): o is string => typeof o === "string" && o.trim().length > 0)
      : [];
    if (opts.length < 2) {
      return NextResponse.json(
        { error: "At least 2 options are required" },
        { status: 400 }
      );
    }
    const { poll, slug } = await createPollDb(question.trim(), opts);
    return NextResponse.json({ poll, slug });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 });
  }
}
