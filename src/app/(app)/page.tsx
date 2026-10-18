import Link from "next/link";
import { Suspense } from "react";
import { buttonClasses } from "@/components/Button";
import { CardGrid, MovieCard, PlaceholderCard } from "@/components/MovieCard";
import { getMovies } from "@/lib/movies";

export default function Home() {
    return (
        <main className="flex flex-col gap-[15px]">
            <div className="flex items-center justify-between gap-4">
                <h1 className="font-display text-2xl font-bold">Všechny filmy</h1>
                <Link href="/movies/new" className={buttonClasses({ size: "sm" })}>
                    + Přidat film
                </Link>
            </div>
            <Suspense
                fallback={
                    <CardGrid>
                        {Array.from({ length: 4 }, (_, index) => (
                            <PlaceholderCard key={index} loading />
                        ))}
                    </CardGrid>
                }
            >
                <Library />
            </Suspense>
        </main>
    );
}

async function Library() {
    const movies = await getMovies();

    if (movies.length === 0) {
        return <p className="text-primary-lightest">Knihovna je zatím prázdná. Přidejte první film.</p>;
    }

    return (
        <CardGrid>
            {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
            ))}
        </CardGrid>
    );
}
