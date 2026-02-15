import Link from "next/link";

export default function PollNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans flex flex-col items-center justify-center px-6">
      <h1 className="text-xl font-bold mb-2">Poll not found</h1>
      <p className="text-slate-400 mb-6">This link may be wrong or the poll was removed.</p>
      <Link href="/" className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 py-3">
        Go home
      </Link>
    </div>
  );
}
