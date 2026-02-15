import { NextRequest, NextResponse } from "next/server";
import { addVoteDb, getPollWithResultsDb } from "@/lib/db";
import { getClientIp, hashForIp } from "@/lib/hash";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });
    const poll = await getPollWithResultsDb(slug);
    if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

    const body = await request.json();
    const { optionId, voterFingerprint } = body as { optionId?: string; voterFingerprint?: string };
    if (!optionId || !voterFingerprint) {
      return NextResponse.json(
        { error: "optionId and voterFingerprint are required" },
        { status: 400 }
      );
    }
    const validOption = poll.options.some((o) => o.id === optionId);
    if (!validOption) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }

    const ip = getClientIp(request.headers);
    const ipHash = hashForIp(ip);
    const result = await addVoteDb(poll.id, optionId, voterFingerprint, ipHash);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    const updated = await getPollWithResultsDb(slug);
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 });
  }
}
