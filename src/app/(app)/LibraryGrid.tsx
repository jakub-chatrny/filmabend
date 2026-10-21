"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, buttonClasses } from "@/components/Button";
import { CardGrid, MovieCard } from "@/components/MovieCard";
import { MAX_PICK, MIN_PICK, useMovieNight } from "@/components/MovieNight";
import { PAGE_WIDTH } from "@/lib/layout";
import type { LibraryMovie } from "@/lib/movies";
import { matchesSearch } from "@/lib/search";
import { unmarkSeen } from "./actions";

type SeenInfo = Record<number, { lines: string[]; date: string }>;

/** Viděno grows every week; show it in pages */
const SEEN_PAGE_SIZE = 60;

type LibraryGridProps = {
    movies: LibraryMovie[];
    /** Seen movies can't be picked again */
    selectable: boolean;
    /** "Viděno před …" texts, computed on the server so they match after hydration */
    seen?: SeenInfo;
};

export function LibraryGrid({ movies, selectable, seen }: LibraryGridProps) {
    const query = useSearchParams().get("q")?.trim() ?? "";
    const found = query ? movies.filter((movie) => matchesSearch(movie.searchText, query)) : movies;

    return (
        <>
            {query && (
                <p className="text-sm text-primary-lightest" aria-live="polite">
                    {found.length > 0 ? `Nalezeno ${found.length} z ${movies.length}` : `Pro „${query}“ jsme nic nenašli.`}
                </p>
            )}
            {seen ? <SeenGrid key={query} movies={found} seen={seen} /> : <PickableGrid movies={found} selectable={selectable} />}
        </>
    );
}

function PickableGrid({ movies, selectable }: { movies: LibraryMovie[]; selectable: boolean }) {
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

function SeenGrid({ movies, seen }: { movies: LibraryMovie[]; seen: SeenInfo }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState(SEEN_PAGE_SIZE);

    const unmark = (movie: LibraryMovie) => {
        if (pending) return;
        startTransition(async () => {
            const result = await unmarkSeen(movie.id);
            setError(result.error ?? null);
            router.refresh();
        });
    };

    const remaining = movies.length - limit;

    return (
        <>
            {error && <p className="text-danger">{error}</p>}
            <CardGrid>
                {movies.slice(0, limit).map((movie) => (
                    <MovieCard key={movie.id} movie={movie} selectable={false} seen={seen[movie.id]} onUnmark={() => unmark(movie)} />
                ))}
            </CardGrid>
            {remaining > 0 && (
                <Button variant="outline" className="self-center" onClick={() => setLimit((value) => value + SEEN_PAGE_SIZE)}>
                    Načíst další ({remaining})
                </Button>
            )}
        </>
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
        <div className="fixed inset-x-0 bottom-0 z-10 bg-primary-pale px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <div className={`mx-auto flex min-h-[30px] ${PAGE_WIDTH} flex-wrap items-center justify-end gap-x-2.5 gap-y-1`}>
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
