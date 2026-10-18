import "server-only";
import { cache } from "react";
import type { MovieCardData } from "@/components/MovieCard";
import { createClient } from "@/lib/supabase/server";

export type LibraryMovie = MovieCardData & {
    id: number;
    categoryId: string;
    genres: string[];
    seenAt: string | null;
};

/** The whole library; deduplicated per request so the header counts and the page share one query. */
export const getMovies = cache(async (): Promise<LibraryMovie[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("movies").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    return data.map((row) => ({
        id: row.id,
        title: row.title,
        originalTitle: row.original_title,
        releaseYear: row.release_year,
        runtimeMinutes: row.runtime_minutes,
        posterPath: row.poster_path,
        imdbId: row.imdb_id,
        rating: row.tmdb_rating,
        categoryId: row.category_id,
        genres: row.genres,
        seenAt: row.seen_at,
    }));
});
