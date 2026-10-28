"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buttonClasses } from "@/components/Button";
import { LibraryLink } from "@/components/LibraryLink";
import type { Category } from "@/lib/categories";
import { filterByGenres, genresOf, libraryHref, moviesInTab, parseLibraryQuery, SEEN_TAB, sortMovies, type SeenInfo } from "@/lib/library";
import type { LibraryMovie } from "@/lib/movies";
import { GenreChips } from "./GenreChips";
import { LibraryGrid } from "./LibraryGrid";
import { LibrarySearch } from "./LibrarySearch";
import { SortSelect } from "./SortSelect";

type LibraryProps = {
    /** The whole library; tabs, genres and sorting are applied here, so switching them needs no server round trip */
    movies: LibraryMovie[];
    categories: Category[];
    /** "Viděno před …" texts for every seen movie */
    seen: SeenInfo;
};

export function Library({ movies, categories, seen }: LibraryProps) {
    const searchParams = useSearchParams();
    const query = parseLibraryQuery(
        { tab: searchParams.get("tab") ?? undefined, genre: searchParams.getAll("genre"), sort: searchParams.get("sort") ?? undefined },
        categories,
    );

    const inTab = moviesInTab(movies, query.tab);
    const shown = sortMovies(filterByGenres(inTab, query.genres), query.sort, query.tab);
    const isSeenTab = query.tab === SEEN_TAB;
    const category = categories.find((c) => c.id === query.tab);
    const title = isSeenTab ? "Viděno" : (category?.label ?? "Všechny filmy");

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <GenreChips genres={genresOf(inTab)} />
                <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2.5 sm:w-auto sm:flex-nowrap">
                    {/* Remounts per tab, so switching tabs starts with an empty search */}
                    <LibrarySearch key={query.tab ?? "all"} />
                    <SortSelect />
                    <Link href={category ? `/movies/new?category=${category.id}` : "/movies/new"} className={buttonClasses({ size: "sm" })}>
                        <Image src="/icons/plus.svg" alt="" width={12} height={12} />
                        Přidat film
                    </Link>
                </div>
            </div>

            <section className="flex flex-col gap-[15px]">
                <h1 className="font-display text-2xl font-bold">
                    {title} ({shown.length})
                </h1>
                {shown.length > 0 ? (
                    // Keyed by tab so the seen tab's "Načíst další" starts over
                    <LibraryGrid key={query.tab ?? "all"} movies={shown} selectable={!isSeenTab} seen={isSeenTab ? seen : undefined} />
                ) : inTab.length > 0 ? (
                    <p className="text-primary-lightest">
                        Žádný film neodpovídá vybraným žánrům.{" "}
                        <LibraryLink href={libraryHref(query, { genres: [] })} scroll={false} className="text-primary underline">
                            Zrušit filtr
                        </LibraryLink>
                    </p>
                ) : (
                    <p className="text-primary-lightest">
                        {isSeenTab ? "Zatím jste nic neviděli." : "Tady zatím nic není. Přidejte první film."}
                    </p>
                )}
            </section>
        </>
    );
}
