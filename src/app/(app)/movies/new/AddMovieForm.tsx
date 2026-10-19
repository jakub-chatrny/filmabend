"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import type { MovieSearchResult } from "@/app/api/movies/search/route";
import { Button, buttonClasses } from "@/components/Button";
import { Field, SearchInput, Select } from "@/components/Field";
import { CardGrid, MovieCard, PlaceholderCard } from "@/components/MovieCard";
import type { Category } from "@/lib/categories";
import { PAGE_WIDTH } from "@/lib/layout";
import { addMovie } from "./actions";

const PLACEHOLDER_COUNT = 8;
const MIN_QUERY_LENGTH = 2;

type AddMovieFormProps = {
    categories: Category[];
    defaultCategoryId?: string;
};

export function AddMovieForm({ categories, defaultCategoryId = "" }: AddMovieFormProps) {
    const [state, formAction, pending] = useActionState(addMovie, {});
    const [categoryId, setCategoryId] = useState(defaultCategoryId);
    const [query, setQuery] = useState("");
    const [search, setSearch] = useState<{ query: string; results: MovieSearchResult[] | null; failed: boolean }>({
        query: "",
        results: null,
        failed: false,
    });
    const [selected, setSelected] = useState<MovieSearchResult | null>(null);

    const trimmedQuery = query.trim();
    const hasQuery = trimmedQuery.length >= MIN_QUERY_LENGTH;
    const loading = hasQuery && search.query !== trimmedQuery;

    // Debounced search; aborting stale requests so an old response never overwrites a newer one
    useEffect(() => {
        if (trimmedQuery.length < MIN_QUERY_LENGTH) return;

        const controller = new AbortController();
        const timeout = setTimeout(async () => {
            try {
                const response = await fetch(`/api/movies/search?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal });
                if (!response.ok) throw new Error(`Search failed with ${response.status}`);
                setSearch({ query: trimmedQuery, results: await response.json(), failed: false });
            } catch {
                if (!controller.signal.aborted) setSearch({ query: trimmedQuery, results: null, failed: true });
            }
        }, 300);

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [trimmedQuery]);

    const results = hasQuery && !loading ? (search.results ?? []) : [];
    // Keep the picked movie visible even after the search text changes
    const shown = selected && !results.some((movie) => movie.tmdbId === selected.tmdbId) ? [selected, ...results] : results;

    return (
        <form action={formAction} className="flex flex-col gap-2.5">
            <Field label="Uživatelská kategorie" required>
                <Select name="categoryId" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                    <option value="" disabled>
                        Vyberte uživatelskou kategorii...
                    </option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.label}
                        </option>
                    ))}
                </Select>
            </Field>

            <div className="mt-5">
                <Field label="Název filmu" required>
                    <SearchInput
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Zadejte název filmu..."
                        autoComplete="off"
                        autoFocus
                    />
                </Field>
            </div>

            <input type="hidden" name="tmdbId" value={selected?.tmdbId ?? ""} />

            <section className="mt-7 flex flex-col gap-2.5" aria-live="polite" aria-busy={loading}>
                <h2 className="text-xs font-bold">Vyberte z výsledků:</h2>
                {hasQuery && !loading && search.failed && <p className="text-primary-light">Vyhledávání se nezdařilo, zkuste to znovu.</p>}
                {hasQuery && !loading && !search.failed && shown.length === 0 && (
                    <p className="text-primary-lightest">Nic jsme nenašli. Zkuste jiný název, třeba originální.</p>
                )}
                <CardGrid>
                    {shown.length > 0
                        ? shown.map((movie) => (
                              <label key={movie.tmdbId} className={movie.inLibrary ? "cursor-not-allowed opacity-60" : "cursor-pointer"}>
                                  <input
                                      type="radio"
                                      className="sr-only"
                                      checked={selected?.tmdbId === movie.tmdbId}
                                      disabled={movie.inLibrary}
                                      onChange={() => setSelected(movie)}
                                  />
                                  <MovieCard
                                      movie={movie}
                                      selected={selected?.tmdbId === movie.tmdbId}
                                      yearInTitle
                                      badge={movie.inLibrary ? "V knihovně" : undefined}
                                  />
                              </label>
                          ))
                        : Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
                              <PlaceholderCard key={index} loading={loading} className={index >= 4 ? "hidden sm:flex" : ""} />
                          ))}
                </CardGrid>
            </section>

            <div className="fixed inset-x-0 bottom-0 z-10 bg-primary-pale px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                <div className={`mx-auto flex ${PAGE_WIDTH} items-center justify-end gap-2.5`}>
                    {state.error && <p className="mr-auto text-sm text-danger">{state.error}</p>}
                    <Link href="/" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                        Zrušit
                    </Link>
                    <Button type="submit" size="sm" disabled={!categoryId || !selected || pending}>
                        {pending ? "Přidávám…" : "Přidat film"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
