"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { CardGrid, MovieCard } from "@/components/MovieCard";
import { MAX_PICK, MIN_PICK, useSelection } from "@/components/Selection";
import type { LibraryMovie } from "@/lib/movies";

type LibraryGridProps = {
    movies: LibraryMovie[];
    /** Seen movies can't be picked again */
    selectable: boolean;
};

export function LibraryGrid({ movies, selectable }: LibraryGridProps) {
    const { isSelected, isFull, toggle } = useSelection();

    if (!selectable) {
        return (
            <CardGrid>
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} selectable={false} />
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

/** Bottom bar from Figma ("Zrušit výběr" / "Zvol film z výběru (n)") */
export function SelectionBar() {
    const { ids, isFull, clear } = useSelection();
    const [notice, setNotice] = useState(false);

    if (ids.length === 0) return null;

    const hint = ids.length < MIN_PICK ? `Vyberte aspoň ${MIN_PICK} filmy` : isFull ? `Maximum je ${MAX_PICK} filmů` : null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-primary-pale px-4 py-2">
            <div className="mx-auto flex max-w-200 flex-wrap items-center justify-end gap-x-2.5 gap-y-1">
                <p className="w-full text-xs text-gray-40 empty:hidden sm:mr-auto sm:w-auto" aria-live="polite">
                    {notice ? "Losování přidáme v dalším kroku." : hint}
                </p>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                        setNotice(false);
                        clear();
                    }}
                >
                    Zrušit výběr
                </Button>
                <Button variant="outline" size="sm" disabled={ids.length < MIN_PICK} onClick={() => setNotice(true)}>
                    Zvol film z výběru ({ids.length})
                </Button>
            </div>
        </div>
    );
}
