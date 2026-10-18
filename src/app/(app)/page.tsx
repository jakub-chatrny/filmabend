import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { buttonClasses } from "@/components/Button";
import { CardGrid, PlaceholderCard } from "@/components/MovieCard";
import { getCategories } from "@/lib/categories";
import {
    filterByGenres,
    genresOf,
    libraryHref,
    moviesInTab,
    parseLibraryQuery,
    SEEN_TAB,
    sortMovies,
    type LibraryQuery,
} from "@/lib/library";
import { getMovies } from "@/lib/movies";
import { LibraryGrid, SelectionBar } from "./LibraryGrid";
import { SortSelect } from "./SortSelect";

export default function LibraryPage({ searchParams }: PageProps<"/">) {
    return (
        <main className="flex flex-col gap-[27px] pb-16">
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
    const category = categories.find((c) => c.id === query.tab);
    const title = isSeenTab ? "Viděno" : (category?.label ?? "Všechny filmy");

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <GenreChips query={query} genres={genresOf(inTab)} />
                <div className="ml-auto flex items-center gap-2.5">
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
                    <LibraryGrid movies={shown} selectable={!isSeenTab} />
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

/** "Tag" chips from Figma: selected genres are filled with ×, the rest are outlined links */
function GenreChips({ query, genres }: { query: LibraryQuery; genres: string[] }) {
    if (genres.length === 0) return null;

    return (
        <ul className="flex flex-wrap gap-[5px]">
            {genres.map((genre) => {
                const active = query.genres.includes(genre);
                return (
                    <li key={genre}>
                        <Link
                            href={libraryHref(query, {
                                genres: active ? query.genres.filter((g) => g !== genre) : [...query.genres, genre],
                            })}
                            scroll={false}
                            aria-pressed={active}
                            className={`flex items-center rounded-[20px] border border-primary py-[5px] text-xs transition-colors ${
                                active ? "bg-primary pr-1.5 pl-2.5 text-[#e0e0e0]" : "px-2.5 text-primary underline hover:bg-primary/10"
                            }`}
                        >
                            {genre}
                            {active && <Image src="/icons/close.svg" alt="Odebrat" width={14} height={14} />}
                        </Link>
                    </li>
                );
            })}
        </ul>
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
