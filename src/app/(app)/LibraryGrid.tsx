"use client";

import Link from "next/link";
import { Button, buttonClasses } from "@/components/Button";
import { CardGrid, MovieCard } from "@/components/MovieCard";
import { MAX_PICK, MIN_PICK, useMovieNight } from "@/components/MovieNight";
import type { LibraryMovie } from "@/lib/movies";

type LibraryGridProps = {
    movies: LibraryMovie[];
    /** Seen movies can't be picked again */
    selectable: boolean;
};

export function LibraryGrid({ movies, selectable }: LibraryGridProps) {
    const { isSelected, isFull, toggle, canEdit } = useMovieNight();

    if (!selectable || !canEdit) {
        return (
            <CardGrid>
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} selectable={false} selected={selectable && isSelected(movie.id)} />
                ))}
            </CardGrid>
        );
    }

    return (
        <CardGrid>
            {movies.map((movie) => {
                const selected = isSelected(movie.id);
                const blocked = isFull && !selected;
                return (
                    <label
                        key={movie.id}
                        className={blocked ? "cursor-not-allowed" : "cursor-pointer"}
                        title={blocked ? `Vybrat jde nejvýš ${MAX_PICK} filmů` : undefined}
                    >
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={selected}
                            disabled={blocked}
                            onChange={() => toggle(movie.id)}
                        />
                        <MovieCard movie={movie} selected={selected} selectable={!blocked} />
                    </label>
                );
            })}
        </CardGrid>
    );
}

/** Bottom bar from Figma ("Zrušit výběr" / "Zvol film z výběru (n)"); shared by everyone */
export function SelectionBar() {
    const { ids, isFull, night, busy, error, clear, roll } = useMovieNight();

    if (night?.status === "rolled") {
        return (
            <Bar message="Kostky už padly.">
                <Link href="/pick" className={buttonClasses({ variant: "outline", size: "sm" })}>
                    Zobrazit výsledek
                </Link>
            </Bar>
        );
    }

    if (ids.length === 0 && !error) return null;

    const hint = ids.length < MIN_PICK ? `Vyberte aspoň ${MIN_PICK} filmy` : isFull ? `Maximum je ${MAX_PICK} filmů` : null;

    return (
        <Bar message={error ?? hint} isError={!!error}>
            {ids.length > 0 && (
                <>
                    <Button variant="secondary" size="sm" onClick={clear} disabled={busy}>
                        Zrušit výběr
                    </Button>
                    <Button variant="outline" size="sm" disabled={busy || ids.length < MIN_PICK} onClick={roll}>
                        Zvol film z výběru ({ids.length})
                    </Button>
                </>
            )}
        </Bar>
    );
}

function Bar({ message, isError = false, children }: { message: string | null; isError?: boolean; children: React.ReactNode }) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-primary-pale px-4 py-2">
            <div className="mx-auto flex min-h-[30px] max-w-200 flex-wrap items-center justify-end gap-x-2.5 gap-y-1">
                <p
                    className={`w-full text-xs empty:hidden sm:mr-auto sm:w-auto ${isError ? "text-danger" : "text-gray-40"}`}
                    aria-live="polite"
                >
                    {message}
                </p>
                {children}
            </div>
        </div>
    );
}
