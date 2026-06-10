import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const AVATAR_BUCKET = "avatars";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_KEY manquant");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    return (getSupabase() as any)[prop];
  },
});

export default supabase;
