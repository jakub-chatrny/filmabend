import "server-only";
import { cacheLife } from "next/cache";

const TMDB_API_URL = "https://api.themoviedb.org/3";
const LANGUAGE = "cs-CZ";

type TmdbSearchResult = {
    id: number;
    title: string;
    original_title: string;
    release_date: string;
    poster_path: string | null;
    vote_average: number;
};

type TmdbSearchResponse = { results: TmdbSearchResult[] };

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

/** What a search result card needs; credits are only loaded when a movie is added */
export type TmdbMovieSummary = Omit<TmdbMovie, "directors" | "actors">;

/** TMDB throttles bursts (one search loads a dozen movies); wait and try again a couple of times */
const RETRY_DELAYS_MS = [400, 1200];

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${TMDB_API_URL}${path}`);
    url.search = new URLSearchParams({ language: LANGUAGE, ...params }).toString();

    for (let attempt = 0; ; attempt++) {
        const response = await fetch(url, {
            headers: { accept: "application/json", Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}` },
        });
        if (response.ok) {
            return response.json();
        }
        const retryable = response.status === 429 || response.status >= 500;
        if (!retryable || attempt >= RETRY_DELAYS_MS.length) {
            throw new Error(`TMDB ${path} failed with ${response.status}`);
        }
        const retryAfterMs = Number(response.headers.get("retry-after")) * 1000;
        await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfterMs || RETRY_DELAYS_MS[attempt], 3000)));
    }
}

function toSummary(details: TmdbSearchResult & Partial<TmdbMovieDetails>, titleEn: string | undefined): TmdbMovieSummary {
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
        genres: details.genres?.map((genre) => genre.name) ?? [],
        rating: details.vote_average ? Math.round(details.vote_average * 10) / 10 : null,
    };
}

function toMovie(details: TmdbMovieDetails, titleEn: string): TmdbMovie {
    return {
        ...toSummary(details, titleEn),
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

type TmdbTranslations = {
    translations: { translations: { iso_639_1: string; iso_3166_1: string; data: { title: string } }[] };
};

/** Details without credits, for search result cards; the English title comes from the translations */
async function getMovieSummary(tmdbId: number): Promise<TmdbMovieSummary> {
    "use cache";
    cacheLife("days");

    const details = await tmdbFetch<TmdbMovieDetails & TmdbTranslations>(`/movie/${tmdbId}`, { append_to_response: "translations" });
    const english = details.translations.translations
        .filter((translation) => translation.iso_639_1 === "en" && translation.data.title)
        .toSorted((a, b) => Number(b.iso_3166_1 === "US") - Number(a.iso_3166_1 === "US"))[0];
    return toSummary(details, english?.data.title);
}

/**
 * Top search results with runtime and IMDb ids, so cards can show them. A movie whose
 * details fail to load still shows up, just without runtime, instead of failing the whole search.
 */
export async function searchMovies(query: string, limit = 12): Promise<TmdbMovieSummary[]> {
    "use cache";

    const { results } = await tmdbFetch<TmdbSearchResponse>("/search/movie", { query, include_adult: "false" });
    const top = results.slice(0, limit);
    const summaries = await Promise.allSettled(top.map((result) => getMovieSummary(result.id)));

    // Don't keep a partial answer around for hours
    if (summaries.every((summary) => summary.status === "fulfilled")) {
        cacheLife("hours");
    } else {
        cacheLife("seconds");
    }

    return top.map((result, index) => {
        const summary = summaries[index];
        if (summary.status === "fulfilled") return summary.value;
        console.error(summary.reason);
        return toSummary(result, undefined);
    });
}
