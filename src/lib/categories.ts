import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Category = { id: string; label: string };

export const getCategories = cache(async (): Promise<Category[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("id, label").order("position");
    if (error) throw error;
    return data;
});
