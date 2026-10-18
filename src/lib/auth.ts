import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
    id: string;
    name: string;
    avatarUrl: string | null;
};

/**
 * The signed-in member, or a redirect to /login. Reads the request cookies, so
 * call it from a component inside a <Suspense> boundary.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims.sub;

    if (!userId) {
        redirect("/login");
    }

    const { data: profile } = await supabase.from("profiles").select("id, display_name, avatar_url").eq("id", userId).maybeSingle();

    // RLS hides profiles from anyone not on the allowlist
    if (!profile) {
        redirect("/login?error=not-invited");
    }

    return { id: profile.id, name: profile.display_name, avatarUrl: profile.avatar_url };
});
