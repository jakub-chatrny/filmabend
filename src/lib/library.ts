import type { Category } from "@/lib/categories";
import { seenAgo } from "@/lib/format";
import type { LibraryMovie } from "@/lib/movies";

export const SEEN_TAB = "seen";

export const SORT_OPTIONS = [
    { value: "added", label: "Naposledy přidané" },
    { value: "title", label: "Název" },
    { value: "year", label: "Rok vydání" },
    { value: "rating", label: "Hodnocení" },
    { value: "runtime", label: "Délka" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export type LibraryQuery = {
    /** Category id, SEEN_TAB, or undefined for all unseen movies */
    tab?: string;
    genres: string[];
    sort?: SortOption;
};

type SearchParams = Record<string, string | string[] | undefined>;

export function parseLibraryQuery(params: SearchParams, categories: Category[]): LibraryQuery {
    const tab = typeof params.tab === "string" ? params.tab : undefined;
    const sort = SORT_OPTIONS.find((option) => option.value === params.sort)?.value;
    return {
        tab: tab === SEEN_TAB || categories.some((c) => c.id === tab) ? tab : undefined,
        genres: [params.genre ?? []].flat(),
        sort,
    };
}

/** Movies in a tab: seen ones live only under "Viděno", the rest are what we can still pick from. */
export function moviesInTab(movies: LibraryMovie[], tab?: string) {
    if (tab === SEEN_TAB) return movies.filter((movie) => movie.seenAt);
    return movies.filter((movie) => !movie.seenAt && (!tab || movie.categoryId === tab));
}

export function tabCounts(movies: LibraryMovie[], categories: Category[]) {
    return {
        all: moviesInTab(movies).length,
        seen: moviesInTab(movies, SEEN_TAB).length,
        categories: Object.fromEntries(categories.map((c) => [c.id, moviesInTab(movies, c.id).length])),
    };
}

/** Genres present in the tab, most common first */
export function genresOf(movies: LibraryMovie[]) {
    const counts = new Map<string, number>();
    movies.forEach((movie) => movie.genres.forEach((genre) => counts.set(genre, (counts.get(genre) ?? 0) + 1)));
    return [...counts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b, "cs")).map(([genre]) => genre);
}

/** A movie matches when it has any of the selected genres */
export function filterByGenres(movies: LibraryMovie[], genres: string[]) {
    return genres.length ? movies.filter((movie) => movie.genres.some((genre) => genres.includes(genre))) : movies;
}

const NULLS_LAST = Number.NEGATIVE_INFINITY;

export function sortMovies(movies: LibraryMovie[], sort: SortOption | undefined, tab?: string) {
    const sorted = [...movies];
    switch (sort) {
        case "title":
            return sorted.sort((a, b) => a.title.localeCompare(b.title, "cs"));
        case "year":
            return sorted.sort((a, b) => (b.releaseYear ?? NULLS_LAST) - (a.releaseYear ?? NULLS_LAST));
        case "rating":
            return sorted.sort((a, b) => (b.rating ?? NULLS_LAST) - (a.rating ?? NULLS_LAST));
        case "runtime":
            return sorted.sort((a, b) => (a.runtimeMinutes ?? Infinity) - (b.runtimeMinutes ?? Infinity));
        default:
            // Movies arrive newest first; the seen tab shows the latest movie night first
            return tab === SEEN_TAB ? sorted.sort((a, b) => (b.seenAt ?? "").localeCompare(a.seenAt ?? "")) : sorted;
    }
}

/** Builds a library URL, keeping the current query except for the given changes */
export function libraryHref(query: LibraryQuery, changes: Partial<LibraryQuery>) {
    const next = { ...query, ...changes };
    const params = new URLSearchParams();
    if (next.tab) params.set("tab", next.tab);
    next.genres.forEach((genre) => params.append("genre", genre));
    if (next.sort) params.set("sort", next.sort);
    const search = params.toString();
    return search ? `/?${search}` : "/";
}

/**
 * "Viděno před …" texts for seen movies, computed once on the server (after the request-time reads)
 * and passed to the client, so both render the same text.
 */
export function seenTexts(movies: LibraryMovie[]) {
    const now = Date.now();
    return Object.fromEntries(movies.filter((movie) => movie.seenAt).map((movie) => [movie.id, seenAgo(movie.seenAt!, now)]));
}
