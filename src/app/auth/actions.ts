"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle() {
    const requestHeaders = await headers();
    const origin = requestHeaders.get("origin") ?? `https://${requestHeaders.get("host")}`;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${origin}/auth/callback`,
            // Let people with several Google accounts pick the right one
            queryParams: { prompt: "select_account" },
        },
    });

    if (error || !data.url) {
        redirect("/login?error=auth");
    }

    redirect(data.url);
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
