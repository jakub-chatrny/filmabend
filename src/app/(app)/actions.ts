"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Marks a movie seen outside a movie night (the card's right-click menu) */
export async function markSeen(movieId: number): Promise<{ error?: string }> {
    await getCurrentUser();
    const supabase = await createClient();

    // A seen movie can't stay among tonight's picks
    const { data: candidate } = await supabase
        .from("pick_candidates")
        .select("pick_sessions!inner(status)")
        .eq("movie_id", movieId)
        .in("pick_sessions.status", ["selecting", "rolled"])
        .maybeSingle();
    if (candidate?.pick_sessions.status === "rolled") {
        return { error: "Film je ve výběru, o kterém už padly kostky." };
    }

    const { error } = await supabase.from("movies").update({ seen_at: new Date().toISOString() }).eq("id", movieId).is("seen_at", null);
    if (error) {
        console.error(error);
        return { error: "Film se nepodařilo označit jako viděný." };
    }
    revalidatePath("/", "layout");

    // Seen first: if someone removed the candidate meanwhile, the toggle can't add a seen movie back
    if (candidate) {
        const { error: toggleError } = await supabase.rpc("toggle_candidate", { p_movie_id: movieId });
        if (toggleError) console.error(toggleError);
    }
    return {};
}

/** Puts a seen movie back among the ones we can pick from */
export async function unmarkSeen(movieId: number): Promise<{ error?: string }> {
    await getCurrentUser();

    const supabase = await createClient();
    const { error } = await supabase.from("movies").update({ seen_at: null }).eq("id", movieId);
    if (error) {
        console.error(error);
        return { error: "Film se nepodařilo vrátit." };
    }
    revalidatePath("/", "layout");
    return {};
}
