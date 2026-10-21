import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { buttonClasses } from "@/components/Button";
import { CardGrid, PlaceholderCard } from "@/components/MovieCard";
import { getCategories } from "@/lib/categories";
import { filterByGenres, genresOf, libraryHref, moviesInTab, parseLibraryQuery, seenTexts, SEEN_TAB, sortMovies } from "@/lib/library";
import { getMovies } from "@/lib/movies";
import { GenreChips } from "./GenreChips";
import { LibraryGrid, SelectionBar } from "./LibraryGrid";
import { LibrarySearch } from "./LibrarySearch";
import { SortSelect } from "./SortSelect";

export default function LibraryPage({ searchParams }: PageProps<"/">) {
    return (
        <main className="flex flex-col gap-[27px] pb-24">
            <Suspense fallback={<LibrarySkeleton />}>
                <Library searchParams={searchParams} />
            </Suspense>
            <SelectionBar />
        </main>
    );
}

async function Library({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
    const [params, movies, categories] = await Promise.all([searchParams, getMovies(), getCategories()]);
    const query = parseLibraryQuery(params, categories);

    const inTab = moviesInTab(movies, query.tab);
    const shown = sortMovies(filterByGenres(inTab, query.genres), query.sort, query.tab);
    const isSeenTab = query.tab === SEEN_TAB;
    const seen = isSeenTab ? seenTexts(shown) : undefined;
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
                    <LibraryGrid movies={shown} selectable={!isSeenTab} seen={seen} />
                ) : inTab.length > 0 ? (
                    <p className="text-primary-lightest">
                        Žádný film neodpovídá vybraným žánrům.{" "}
                        <Link href={libraryHref(query, { genres: [] })} className="text-primary underline">
                            Zrušit filtr
                        </Link>
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

function LibrarySkeleton() {
    return (
        <>
            <div className="h-[30px]" />
            <section className="flex flex-col gap-[15px]">
                <div className="h-8 w-56 animate-pulse rounded bg-gray-15" />
                <CardGrid>
                    {Array.from({ length: 4 }, (_, index) => (
                        <PlaceholderCard key={index} loading />
                    ))}
                </CardGrid>
            </section>
        </>
    );
}
