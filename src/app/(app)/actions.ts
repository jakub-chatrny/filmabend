"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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
