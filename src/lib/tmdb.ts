import "server-only";
import { cacheLife } from "next/cache";

const TMDB_API_URL = "https://api.themoviedb.org/3";
const LANGUAGE = "cs-CZ";

type TmdbSearchResponse = {
    results: {
        id: number;
        title: string;
        original_title: string;
        release_date: string;
        poster_path: string | null;
        vote_average: number;
    }[];
};

type TmdbMovieDetails = {
    id: number;
    imdb_id: string | null;
    title: string;
    original_title: string;
    release_date: string;
    runtime: number | null;
    poster_path: string | null;
    vote_average: number;
    genres: { id: number; name: string }[];
    credits?: {
        cast: { name: string; order: number }[];
        crew: { name: string; job: string }[];
    };
};

/** Movie details in the shape we store in the `movies` table. */
export type TmdbMovie = {
    tmdbId: number;
    imdbId: string | null;
    /** Czech title (falls back to the original when TMDB has no translation) */
    title: string;
    /** English title (falls back to the original) */
    titleEn: string;
    originalTitle: string | null;
    releaseYear: number | null;
    runtimeMinutes: number | null;
    posterPath: string | null;
    genres: string[];
    rating: number | null;
    directors: string[];
    /** Main cast, top billing first */
    actors: string[];
};

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_API_URL}${path}`);
    url.search = new URLSearchParams({ language: LANGUAGE, ...params }).toString();

    const response = await fetch(url, {
        headers: { accept: "application/json", Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}` },
    });
    if (!response.ok) {
        throw new Error(`TMDB ${path} failed with ${response.status}`);
    }
    return response.json();
}

function toMovie(details: TmdbMovieDetails, titleEn: string): TmdbMovie {
    const year = Number.parseInt(details.release_date?.slice(0, 4), 10);
    return {
        tmdbId: details.id,
        imdbId: details.imdb_id || null,
        title: details.title,
        titleEn: titleEn || details.original_title,
        originalTitle: details.original_title !== details.title ? details.original_title : null,
        releaseYear: Number.isNaN(year) ? null : year,
        runtimeMinutes: details.runtime || null,
        posterPath: details.poster_path,
        genres: details.genres.map((genre) => genre.name),
        rating: details.vote_average ? Math.round(details.vote_average * 10) / 10 : null,
        directors: [...new Set(details.credits?.crew.filter((person) => person.job === "Director").map((person) => person.name))],
        actors: (details.credits?.cast ?? [])
            .toSorted((a, b) => a.order - b.order)
            .slice(0, 10)
            .map((person) => person.name),
    };
}

export async function getMovie(tmdbId: number): Promise<TmdbMovie> {
    "use cache";
    cacheLife("days");

    const [details, english] = await Promise.all([
        tmdbFetch<TmdbMovieDetails>(`/movie/${tmdbId}`, { append_to_response: "credits" }),
        tmdbFetch<Pick<TmdbMovieDetails, "title">>(`/movie/${tmdbId}`, { language: "en-US" }),
    ]);
    return toMovie(details, english.title);
}

/** Top search results with full details, so cards can show runtime and IMDb links. */
export async function searchMovies(query: string, limit = 12): Promise<TmdbMovie[]> {
    "use cache";
    cacheLife("hours");

    const { results } = await tmdbFetch<TmdbSearchResponse>("/search/movie", { query, include_adult: "false" });
    return Promise.all(results.slice(0, limit).map((result) => getMovie(result.id)));
}
