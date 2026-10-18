"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getMovie } from "@/lib/tmdb";

export type AddMovieState = { error?: string };

export async function addMovie(_previous: AddMovieState, formData: FormData): Promise<AddMovieState> {
    const user = await getCurrentUser();

    const tmdbId = Number(formData.get("tmdbId"));
    const categoryId = String(formData.get("categoryId") ?? "");
    if (!Number.isInteger(tmdbId) || tmdbId <= 0 || !categoryId) {
        return { error: "Vyberte kategorii a film." };
    }

    let movie;
    try {
        movie = await getMovie(tmdbId);
    } catch (error) {
        console.error(error);
        return { error: "Nepodařilo se načíst film z TMDB, zkuste to znovu." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("movies").insert({
        tmdb_id: movie.tmdbId,
        imdb_id: movie.imdbId,
        title: movie.title,
        title_en: movie.titleEn,
        original_title: movie.originalTitle,
        release_year: movie.releaseYear,
        runtime_minutes: movie.runtimeMinutes,
        poster_path: movie.posterPath,
        genres: movie.genres,
        tmdb_rating: movie.rating,
        category_id: categoryId,
        added_by: user.id,
    });

    if (error?.code === "23505") {
        return { error: "Tento film už v knihovně je." };
    }
    if (error) {
        console.error(error);
        return { error: "Film se nepodařilo uložit." };
    }

    // The header counts live in the shared layout, which a plain redirect would keep as it was
    revalidatePath("/", "layout");
    redirect("/");
}
