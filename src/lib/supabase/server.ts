import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "@/lib/database.types";

/** Supabase client for Server Components, Server Actions and Route Handlers. Create one per request. */
export async function createClient() {
    // Session checks compare token expiry with the current time, and the data is per user and live,
    // so keep everything that uses Supabase out of prerendering and prefetched shells.
    await connection();
    const cookieStore = await cookies();

    return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // Server Components can't set cookies; the proxy refreshes the session instead.
                }
            },
        },
    });
}
