import { nanoid } from "nanoid";
import type { Poll, PollOption, Vote, PollWithOptionsAndVotes } from "./types";

// In-memory store for development / when Supabase is not configured.
// Attached to globalThis so API routes and Server Components share the same data in Next.js.
// On serverless (e.g. Vercel), this does NOT persist across invocations.
declare global {
  // eslint-disable-next-line no-var
  var __poll_store: {
    polls: Map<string, Poll>;
    options: Map<string, PollOption>;
    votes: Map<string, Vote>;
    slugToPollId: Map<string, string>;
  } | undefined;
}

function getStore() {
  if (typeof globalThis.__poll_store === "undefined") {
    globalThis.__poll_store = {
      polls: new Map(),
      options: new Map(),
      votes: new Map(),
      slugToPollId: new Map(),
    };
  }
  return globalThis.__poll_store;
}

const polls = () => getStore().polls;
const options = () => getStore().options;
const votes = () => getStore().votes;
const slugToPollId = () => getStore().slugToPollId;

function getOptionIdsByPollId(pollId: string): string[] {
  return Array.from(options().values())
    .filter((o) => o.pollId === pollId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((o) => o.id);
}

export function createPoll(question: string, optionTexts: string[]): { poll: Poll; options: PollOption[] } {
  const id = nanoid();
  const slug = nanoid(10);
  const poll: Poll = { id, slug, question, createdAt: new Date().toISOString() };
  polls().set(id, poll);
  slugToPollId().set(slug, id);

  const opts: PollOption[] = optionTexts.map((text, i) => {
    const opt: PollOption = { id: nanoid(), pollId: id, text, sortOrder: i };
    options().set(opt.id, opt);
    return opt;
  });
  return { poll, options: opts };
}

export function getPollBySlug(slug: string): Poll | null {
  const id = slugToPollId().get(slug);
  return id ? polls().get(id) ?? null : null;
}

export function getPollWithResults(slug: string): PollWithOptionsAndVotes | null {
  const poll = getPollBySlug(slug);
  if (!poll) return null;

  const optionIds = getOptionIdsByPollId(poll.id);
  const voteCountByOption = new Map<string, number>();
  let totalVotes = 0;
  for (const v of votes().values()) {
    if (v.pollId === poll.id) {
      totalVotes++;
      voteCountByOption.set(v.optionId, (voteCountByOption.get(v.optionId) ?? 0) + 1);
    }
  }

  const optionsWithVotes = optionIds
    .map((oid) => options().get(oid))
    .filter(Boolean) as PollOption[];
  const result: PollWithOptionsAndVotes = {
    ...poll,
    options: optionsWithVotes.map((o) => ({
      ...o,
      voteCount: voteCountByOption.get(o.id) ?? 0,
    })),
    totalVotes,
  };
  return result;
}

export function addVote(
  pollId: string,
  optionId: string,
  voterFingerprint: string,
  ipHash: string
): { success: boolean; error?: string } {
  const poll = polls().get(pollId);
  if (!poll) return { success: false, error: "Poll not found" };
  const opt = options().get(optionId);
  if (!opt || opt.pollId !== pollId) return { success: false, error: "Invalid option" };

  // Fairness 1: one vote per fingerprint (browser) per poll
  const existingByFingerprint = Array.from(votes().values()).some(
    (v) => v.pollId === pollId && v.voterFingerprint === voterFingerprint
  );
  if (existingByFingerprint) return { success: false, error: "You have already voted in this poll" };

  // Fairness 2: one vote per IP per poll
  const existingByIp = Array.from(votes().values()).some(
    (v) => v.pollId === pollId && v.ipHash === ipHash
  );
  if (existingByIp) return { success: false, error: "Only one vote per device/network is allowed" };

  const vote: Vote = {
    id: nanoid(),
    optionId,
    pollId,
    voterFingerprint,
    ipHash,
    createdAt: new Date().toISOString(),
  };
  votes().set(vote.id, vote);
  return { success: true };
}

export function hasVotedByFingerprint(pollId: string, voterFingerprint: string): boolean {
  return Array.from(votes().values()).some(
    (v) => v.pollId === pollId && v.voterFingerprint === voterFingerprint
  );
}
