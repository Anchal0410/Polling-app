"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

export default function CreatePollPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addOption = () => {
    if (options.length < MAX_OPTIONS) setOptions([...options, ""]);
  };

  const removeOption = (i: number) => {
    if (options.length > MIN_OPTIONS) setOptions(options.filter((_, idx) => idx !== i));
  };

  const updateOption = (i: number, value: string) => {
    const next = [...options];
    next[i] = value;
    setOptions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const q = question.trim();
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (!q) {
      setError("Please enter a question.");
      return;
    }
    if (opts.length < MIN_OPTIONS) {
      setError("Please add at least 2 options.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, options: opts }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create poll");
        return;
      }
      router.push(`/poll/${data.slug}?created=1`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans">
      <div className="max-w-xl mx-auto px-6 py-12">
        <Link href="/" className="text-slate-400 hover:text-white text-sm mb-8 inline-block">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mb-6">Create a poll</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="question" className="block text-slate-300 text-sm font-medium mb-2">
              Question
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What should we order for lunch?"
              className="w-full rounded-lg bg-slate-800 border border-slate-600 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              maxLength={300}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-slate-300 text-sm font-medium">Options</label>
              <span className="text-slate-500 text-sm">{options.length} / {MAX_OPTIONS}</span>
            </div>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength={200}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    disabled={options.length <= MIN_OPTIONS}
                    className="rounded-lg px-3 text-slate-400 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Remove option"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {options.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 text-sm text-amber-400 hover:text-amber-300"
              >
                + Add option
              </button>
            )}
          </div>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-amber-600 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 transition-colors"
          >
            {loading ? "Creating…" : "Create poll"}
          </button>
        </form>
      </div>
    </div>
  );
}
