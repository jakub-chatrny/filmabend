import "server-only";
import { cache } from "react";
import type { MovieCardData } from "@/components/MovieCard";
import { getCurrentUser } from "@/lib/auth";
import { normalizeForSearch } from "@/lib/search";
import { createClient } from "@/lib/supabase/server";

export type LibraryMovie = MovieCardData & {
    id: number;
    categoryId: string;
    genres: string[];
    seenAt: string | null;
    /** Titles in all languages, directors and actors, normalized for the library search */
    searchText: string;
};

/**
 * The whole library, with titles in the signed-in user's language. Deduplicated per request
 * so the header counts and the page share one query.
 */
export const getMovies = cache(async (): Promise<LibraryMovie[]> => {
    const [{ titleLanguage }, supabase] = await Promise.all([getCurrentUser(), createClient()]);
    const { data, error } = await supabase.from("movies").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    return data.map((row) => ({
        id: row.id,
        title: titleLanguage === "en" ? (row.title_en ?? row.title) : row.title,
        // Always the original title, so ČSFD/IMDb searches don't depend on the display language
        originalTitle: row.original_title ?? row.title,
        releaseYear: row.release_year,
        runtimeMinutes: row.runtime_minutes,
        posterPath: row.poster_path,
        imdbId: row.imdb_id,
        rating: row.tmdb_rating,
        categoryId: row.category_id,
        genres: row.genres,
        seenAt: row.seen_at,
        searchText: normalizeForSearch(
            [row.title, row.title_en, row.original_title, ...row.directors, ...row.actors].filter(Boolean).join(" | "),
        ),
    }));
});
