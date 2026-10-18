import { Suspense } from "react";
import { getCategories } from "@/lib/categories";
import { AddMovieForm } from "./AddMovieForm";

export default function NewMoviePage({ searchParams }: PageProps<"/movies/new">) {
    return (
        <main className="flex flex-col gap-[15px] pb-20">
            <h1 className="font-display text-2xl font-bold">Nový film</h1>
            <Suspense>
                <NewMovieForm searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function NewMovieForm({ searchParams }: Pick<PageProps<"/movies/new">, "searchParams">) {
    const [{ category }, categories] = await Promise.all([searchParams, getCategories()]);
    const defaultCategoryId = categories.some((c) => c.id === category) ? (category as string) : undefined;

    return <AddMovieForm categories={categories} defaultCategoryId={defaultCategoryId} />;
}
