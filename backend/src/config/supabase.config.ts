import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_KEY manquant dans .env");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const AVATAR_BUCKET = "avatars";

export default supabase;
