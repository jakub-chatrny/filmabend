import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Category = { id: string; label: string };

export async function getCategories(): Promise<Category[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("id, label").order("position");
    if (error) throw error;
    return data;
}
