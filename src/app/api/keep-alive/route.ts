import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Called daily by the Vercel cron in vercel.json so the free Supabase project doesn't pause.
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when that env variable is set.
 */
export async function GET(request: Request) {
    // Never prerender: the whole point is to hit the database at request time
    await connection();
    const secret = process.env.CRON_SECRET;
    if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
        auth: { persistSession: false },
    });
    const { data, error } = await supabase.rpc("keep_alive");
    if (error) {
        console.error(error);
        return Response.json({ ok: false }, { status: 500 });
    }
    return Response.json({ ok: true, at: data });
}
