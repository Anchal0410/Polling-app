import { NextRequest, NextResponse } from "next/server";
import { getPollWithResultsDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });
    const poll = await getPollWithResultsDb(slug);
    if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    return NextResponse.json(poll);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load poll" }, { status: 500 });
  }
}
