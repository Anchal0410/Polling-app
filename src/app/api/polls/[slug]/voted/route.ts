import { NextRequest, NextResponse } from "next/server";
import { getPollWithResultsDb, hasVotedByFingerprintDb } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const fingerprint = request.nextUrl.searchParams.get("fingerprint");
    if (!slug || !fingerprint) {
      return NextResponse.json({ voted: false });
    }
    const poll = await getPollWithResultsDb(slug);
    if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    const voted = await hasVotedByFingerprintDb(poll.id, fingerprint);
    return NextResponse.json({ voted });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ voted: false });
  }
}
