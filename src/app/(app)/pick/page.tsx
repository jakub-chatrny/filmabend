import { Suspense } from "react";
import { getMovies } from "@/lib/movies";
import { PickScreen } from "./PickScreen";

export default function PickPage() {
    return (
        <main className="flex flex-col pb-6">
            <Suspense fallback={<p className="text-primary-lightest">Načítám…</p>}>
                <Pick />
            </Suspense>
        </main>
    );
}

async function Pick() {
    const movies = await getMovies();
    return <PickScreen movies={movies} />;
}
