import { notFound } from "next/navigation";
import { getPollWithResultsDb } from "@/lib/db";
import { PollView } from "./PollView";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ created?: string }> };

export default async function PollPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { created } = await searchParams;
  const poll = await getPollWithResultsDb(slug);
  if (!poll) notFound();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
      <PollView initialPoll={poll} slug={slug} showCreatedBanner={created === "1"} />
    </div>
  );
}
