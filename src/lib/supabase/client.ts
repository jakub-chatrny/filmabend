import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

let client: SupabaseClient<Database> | undefined;

/**
 * Supabase client for Client Components (live updates, RPC calls). Created on first use,
 * so call it from effects and event handlers, not while rendering (that also runs at build time).
 */
export function getClient() {
    client ??= createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    return client;
}
