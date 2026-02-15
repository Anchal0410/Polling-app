import { createHash } from "crypto";

export function hashForIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
