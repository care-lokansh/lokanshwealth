import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True once both Supabase env vars are present. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Shared Supabase client. Returns null until the project URL and anon key are
 * set (via the ENV tab), so the app keeps working in preview without them.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

/** Storage bucket that holds uploaded loan documents (PAN / Aadhaar). */
export const DOCUMENTS_BUCKET = "loan-documents";
