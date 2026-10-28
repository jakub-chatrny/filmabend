import { Suspense } from "react";
import { CardGrid, PlaceholderCard } from "@/components/MovieCard";
import { getCategories } from "@/lib/categories";
import { seenTexts } from "@/lib/library";
import { getMovies } from "@/lib/movies";
import { Library } from "./Library";
import { SelectionBar } from "./LibraryGrid";

export default function LibraryPage() {
    return (
        <main className="flex flex-col gap-[27px] pb-24">
            <Suspense fallback={<LibrarySkeleton />}>
                <LibraryData />
            </Suspense>
            <SelectionBar />
        </main>
    );
}

/** Loads the whole library once; the tab, genres and sorting in the URL are applied on the client */
async function LibraryData() {
    const [movies, categories] = await Promise.all([getMovies(), getCategories()]);
    return <Library movies={movies} categories={categories} seen={seenTexts(movies)} />;
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
