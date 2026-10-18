"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, type TitleLanguage } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateTitleLanguage(language: TitleLanguage): Promise<{ error?: string }> {
    const user = await getCurrentUser();
    if (language !== "cs" && language !== "en") {
        return { error: "Neznámý jazyk." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update({ title_language: language }).eq("id", user.id);
    if (error) {
        console.error(error);
        return { error: "Nastavení se nepodařilo uložit." };
    }

    // Titles are rendered on the server, everywhere
    revalidatePath("/", "layout");
    return {};
}
