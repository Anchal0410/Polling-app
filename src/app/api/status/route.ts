import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Call this on your deployed app to verify Supabase is active (e.g. GET https://your-app.vercel.app/api/status).
// If you see "storage": "memory", env vars are missing or wrong on Vercel — polls won't persist.
export async function GET() {
  const usingSupabase = !!supabase;
  return NextResponse.json({
    storage: usingSupabase ? "supabase" : "memory",
    message: usingSupabase
      ? "Using Supabase; polls persist across requests."
      : "Using in-memory storage. Set NEXT_PUBLIC_SUPABASE_URL (https://xxx.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel, then redeploy.",
  });
}
