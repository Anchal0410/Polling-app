"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { PollWithOptionsAndVotes } from "@/lib/types";
import { getOrCreateFingerprint, markVotedInStorage, hasVotedInStorage } from "@/lib/fingerprint";

const POLL_INTERVAL_MS = 2000;

type Props = { initialPoll: PollWithOptionsAndVotes; slug: string; showCreatedBanner?: boolean };

export function PollView({ initialPoll, slug, showCreatedBanner }: Props) {
  const [poll, setPoll] = useState<PollWithOptionsAndVotes>(initialPoll);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [alreadyVoted, setAlreadyVoted] = useState(hasVotedInStorage(poll.id));
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchPoll = useCallback(async () => {
    try {
      const res = await fetch(`/api/polls/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setPoll(data);
      }
    } catch {
      // keep previous state
    }
  }, [slug]);

  // Real-time: poll for updates every 2s
  useEffect(() => {
    const t = setInterval(fetchPoll, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fetchPoll]);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/poll/${slug}` : "";

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleVote = async () => {
    if (!selectedOptionId || alreadyVoted) return;
    setVoteError("");
    setVoting(true);
    try {
      const fingerprint = getOrCreateFingerprint();
      const res = await fetch(`/api/polls/${slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedOptionId, voterFingerprint: fingerprint }),
      });
      const data = await res.json();
      if (res.ok) {
        setPoll(data);
        markVotedInStorage(poll.id);
        setAlreadyVoted(true);
        setSelectedOptionId(null);
      } else {
        setVoteError(data.error || "Could not submit vote.");
      }
    } catch {
      setVoteError("Something went wrong. Please try again.");
    } finally {
      setVoting(false);
    }
  };

  const maxVotes = Math.max(1, ...poll.options.map((o) => o.voteCount));

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <Link href="/" className="text-slate-400 hover:text-white text-sm mb-8 inline-block">
        ← Home
      </Link>

      {showCreatedBanner && (
        <div className="mb-6 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-200 px-4 py-3 text-sm">
          Poll created. Share the link below for others to vote.
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2">{poll.question}</h1>
      <p className="text-slate-400 text-sm mb-6">{poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}</p>

      {/* Share link */}
      <div className="mb-8 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="flex-1 min-w-0 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-slate-300"
        />
        <button
          type="button"
          onClick={copyLink}
          className="rounded-lg bg-slate-700 hover:bg-slate-600 px-4 py-2 text-sm font-medium"
        >
          {copySuccess ? "Copied!" : "Copy link"}
        </button>
      </div>

      {/* Options: vote or results */}
      {!alreadyVoted ? (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">Choose one option:</p>
          {poll.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedOptionId(opt.id)}
              className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-colors ${
                selectedOptionId === opt.id
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
              }`}
            >
              {opt.text}
            </button>
          ))}
          {voteError && <p className="text-red-400 text-sm">{voteError}</p>}
          <button
            type="button"
            onClick={handleVote}
            disabled={!selectedOptionId || voting}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 transition-colors"
          >
            {voting ? "Submitting…" : "Submit vote"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">You’ve already voted. Live results:</p>
          {poll.options.map((opt) => (
            <div key={opt.id} className="rounded-xl border border-slate-600 bg-slate-800/50 overflow-hidden">
              <div className="flex justify-between px-4 py-3">
                <span>{opt.text}</span>
                <span className="text-slate-400">{opt.voteCount} vote{opt.voteCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="h-2 bg-slate-700">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${(opt.voteCount / maxVotes) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live results when not yet voted - show bars only */}
      {!alreadyVoted && poll.totalVotes > 0 && (
        <div className="mt-10 pt-8 border-t border-slate-700">
          <p className="text-slate-400 text-sm mb-4">Live results (updates every few seconds)</p>
          {poll.options.map((opt) => (
            <div key={opt.id} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{opt.text}</span>
                <span className="text-slate-400">{opt.voteCount}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-500 rounded-full transition-all duration-500"
                  style={{ width: `${(opt.voteCount / maxVotes) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
