// Generates a simple browser fingerprint for "one vote per browser" fairness.
// Not cryptographically secure; resets if user clears storage. Used together with IP limiting.
const STORAGE_KEY_PREFIX = "poll_fp_";

export function getOrCreateFingerprint(): string {
  if (typeof window === "undefined") return "";
  const key = `${STORAGE_KEY_PREFIX}device`;
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      Math.random().toString(36).slice(2),
    ].join("|");
    localStorage.setItem(key, fp);
  }
  return fp;
}

export function getVotedKey(pollId: string): string {
  return `${STORAGE_KEY_PREFIX}voted_${pollId}`;
}

export function markVotedInStorage(pollId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getVotedKey(pollId), "1");
}

export function hasVotedInStorage(pollId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getVotedKey(pollId)) === "1";
}
