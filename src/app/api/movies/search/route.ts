import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { searchMovies, type TmdbMovie } from "@/lib/tmdb";

export type MovieSearchResult = TmdbMovie & { inLibrary: boolean };

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: isMember } = await supabase.rpc("is_member");
    if (!isMember) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (query.length < 2) {
        return Response.json([]);
    }

    try {
        const [movies, { titleLanguage }] = await Promise.all([searchMovies(query), getCurrentUser()]);
        const { data: existing } = await supabase
            .from("movies")
            .select("tmdb_id")
            .in(
                "tmdb_id",
                movies.map((movie) => movie.tmdbId),
            );
        const inLibrary = new Set(existing?.map((row) => row.tmdb_id));

        return Response.json(
            movies.map((movie): MovieSearchResult => ({
                ...movie,
                title: titleLanguage === "en" ? movie.titleEn : movie.title,
                originalTitle: movie.originalTitle ?? movie.title,
                inLibrary: inLibrary.has(movie.tmdbId),
            })),
        );
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Search failed" }, { status: 502 });
    }
}
