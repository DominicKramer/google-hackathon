import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseAnonKey } from "../env";

export function createClient() {
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();

    console.log("createClient: SUPABASE_URL=", supabaseUrl);
    console.log("createClient: SUPABASE_ANON_KEY=", supabaseAnonKey);

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
