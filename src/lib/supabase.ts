import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Supabase JS client needs the API URL (https://xxx.supabase.co), not the Postgres connection string.
const isValidSupabaseUrl = url && (url.startsWith("https://") || url.startsWith("http://"));

function createSupabaseClient(): SupabaseClient | null {
  if (!url || !anonKey || !isValidSupabaseUrl) return null;
  try {
    return createClient(url, anonKey);
  } catch {
    return null;
  }
}

export const supabase = createSupabaseClient();

export const useSupabase = (): boolean => !!supabase;
