"use server";

import { nanoid } from "nanoid";
import type { Poll, PollOption, Vote, PollWithOptionsAndVotes } from "./types";
import * as mem from "./store";
import { supabase } from "./supabase";

const useSupabase = () => !!supabase;

export async function createPollDb(
  question: string,
  optionTexts: string[]
): Promise<{ poll: Poll; options: PollOption[]; slug: string }> {
  if (useSupabase() && supabase) {
    const id = nanoid();
    const slug = nanoid(10);
    const { error: pollError } = await supabase.from("polls").insert({
      id,
      slug,
      question,
    });
    if (pollError) throw new Error(pollError.message);
    const opts: PollOption[] = optionTexts.map((text, i) => ({
      id: nanoid(),
      pollId: id,
      text,
      sortOrder: i,
    }));
    const { error: optError } = await supabase.from("options").insert(
      opts.map((o) => ({ id: o.id, poll_id: o.pollId, text: o.text, sort_order: o.sortOrder }))
    );
    if (optError) throw new Error(optError.message);
    return {
      poll: { id, slug, question, createdAt: new Date().toISOString() },
      options: opts,
      slug,
    };
  }
  const { poll, options: opts } = mem.createPoll(question, optionTexts);
  return { poll, options: opts, slug: poll.slug };
}

export async function getPollWithResultsDb(
  slug: string
): Promise<PollWithOptionsAndVotes | null> {
  if (useSupabase() && supabase) {
    const { data: pollRow, error: pe } = await supabase
      .from("polls")
      .select("*")
      .eq("slug", slug)
      .single();
    if (pe || !pollRow) return null;
    const { data: optionRows, error: oe } = await supabase
      .from("options")
      .select("*")
      .eq("poll_id", pollRow.id)
      .order("sort_order");
    if (oe) return null;
    const { data: voteRows } = await supabase.from("votes").select("option_id").eq("poll_id", pollRow.id);
    const countByOption = new Map<string, number>();
    (voteRows ?? []).forEach((v: { option_id: string }) => {
      countByOption.set(v.option_id, (countByOption.get(v.option_id) ?? 0) + 1);
    });
    const optionsWithVotes = (optionRows ?? []).map((o: { id: string; poll_id: string; text: string; sort_order: number }) => ({
      id: o.id,
      pollId: o.poll_id,
      text: o.text,
      sortOrder: o.sort_order,
      voteCount: countByOption.get(o.id) ?? 0,
    }));
    return {
      id: pollRow.id,
      slug: pollRow.slug,
      question: pollRow.question,
      createdAt: pollRow.created_at,
      options: optionsWithVotes,
      totalVotes: (voteRows ?? []).length,
    };
  }
  return mem.getPollWithResults(slug);
}

export async function addVoteDb(
  pollId: string,
  optionId: string,
  voterFingerprint: string,
  ipHash: string
): Promise<{ success: boolean; error?: string }> {
  if (useSupabase() && supabase) {
    const { data: existing } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .or(`voter_fingerprint.eq.${voterFingerprint},ip_hash.eq.${ipHash}`)
      .limit(1);
    if (existing && existing.length > 0) {
      return { success: false, error: "You have already voted in this poll." };
    }
    const { error } = await supabase.from("votes").insert({
      id: nanoid(),
      option_id: optionId,
      poll_id: pollId,
      voter_fingerprint: voterFingerprint,
      ip_hash: ipHash,
    });
    if (error) {
      if (error.code === "23505") return { success: false, error: "You have already voted in this poll." };
      return { success: false, error: error.message };
    }
    return { success: true };
  }
  return mem.addVote(pollId, optionId, voterFingerprint, ipHash);
}

export async function hasVotedByFingerprintDb(
  pollId: string,
  voterFingerprint: string
): Promise<boolean> {
  if (useSupabase() && supabase) {
    const { data } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("voter_fingerprint", voterFingerprint)
      .limit(1);
    return !!(data && data.length > 0);
  }
  return mem.hasVotedByFingerprint(pollId, voterFingerprint);
}
