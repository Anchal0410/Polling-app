import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
      <div className="max-w-2xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold tracking-tight text-center mb-2">
          Real-Time Polls
        </h1>
        <p className="text-slate-300 text-center mb-10">
          Create a poll, share the link, and watch results update live.
        </p>
        <Link
          href="/create"
          className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-4 transition-colors"
        >
          Create a poll
        </Link>
        <p className="text-slate-400 text-sm mt-8">
          No account needed. Share the link with anyone to collect votes.
        </p>
      </div>
    </div>
  );
}
