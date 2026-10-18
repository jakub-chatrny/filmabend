import type { NextRequest } from "next/server";
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
        const movies = await searchMovies(query);
        const { data: existing } = await supabase
            .from("movies")
            .select("tmdb_id")
            .in(
                "tmdb_id",
                movies.map((movie) => movie.tmdbId),
            );
        const inLibrary = new Set(existing?.map((row) => row.tmdb_id));

        return Response.json(movies.map((movie): MovieSearchResult => ({ ...movie, inLibrary: inLibrary.has(movie.tmdbId) })));
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Search failed" }, { status: 502 });
    }
}
