"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, buttonClasses } from "@/components/Button";
import { CardGrid, MovieCard, PlaceholderCard } from "@/components/MovieCard";
import { MAX_PICK, MIN_PICK, useMovieNight } from "@/components/MovieNight";
import { csfdUrl, imdbUrl } from "@/lib/format";
import type { LibraryMovie } from "@/lib/movies";

/** Rolls older than this are shown as a result right away instead of animating again */
const REPLAY_WINDOW_MS = 15_000;

/** "Stránka Výběr filmu" from Figma */
export function PickScreen({ movies }: { movies: LibraryMovie[] }) {
    const router = useRouter();
    const night = useMovieNight();
    const byId = new Map(movies.map((movie) => [movie.id, movie]));

    const candidates = night.ids.map((id) => byId.get(id)).filter((movie): movie is LibraryMovie => !!movie);
    const status = night.night?.status;
    const winnerIndex = status === "rolled" ? candidates.findIndex((movie) => movie.id === night.night?.winnerMovieId) : -1;
    const rollKey = status === "rolled" && night.night ? `${night.night.id}:${night.night.rollCount}` : null;
    const { highlight, rolling } = useRollAnimation(rollKey, winnerIndex, candidates.length, night.night?.rolledAt ?? null);

    const close = async () => {
        if (status === "rolled") await night.backToSelection();
        router.push("/");
    };

    if (!night.loaded) {
        return <p className="text-primary-lightest">Načítám…</p>;
    }

    if (status === "done") {
        const seen = movies.find((movie) => movie.id === night.night?.winnerMovieId);
        return (
            <section className="flex flex-col items-center gap-6 py-10 text-center">
                <p className="font-display text-2xl font-bold text-primary">
                    {seen ? (
                        <>
                            {seen.title} <span className="text-primary-pale">je mezi viděnými</span>
                        </>
                    ) : (
                        "Film je mezi viděnými"
                    )}
                </p>
                <Link href="/?tab=seen" className={buttonClasses()}>
                    Zpět do knihovny
                </Link>
            </section>
        );
    }

    if (!night.isOpen || candidates.length === 0) {
        return (
            <section className="flex flex-col items-center gap-6 py-10 text-center">
                <p className="text-primary-lightest">Zatím nejsou vybrané žádné filmy.</p>
                <Link href="/" className={buttonClasses()}>
                    Vybrat filmy
                </Link>
            </section>
        );
    }

    const winner = winnerIndex >= 0 ? candidates[winnerIndex] : null;
    const showResult = status === "rolled" && !rolling && winner;
    // Fill the last row of four with empty slots like in Figma (rows of two on phones)
    const slots = Math.ceil(candidates.length / 4) * 4;
    const mobileSlots = Math.ceil(candidates.length / 2) * 2;

    return (
        <section className="mx-auto flex w-full max-w-352 flex-col gap-[15px]">
            <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-bold">Výběr filmu</h1>
                <button type="button" onClick={close} disabled={night.busy} aria-label="Zavřít" className="-mr-2.5">
                    <Image src="/icons/plus-large.svg" alt="" width={48} height={48} className="rotate-45" />
                </button>
            </div>

            <CardGrid variant="pick">
                {candidates.map((movie, index) => {
                    const lit = status !== "rolled" || (rolling ? highlight === index : index === winnerIndex);
                    return (
                        <div key={movie.id} className="flex flex-col items-center gap-[19px]">
                            <div className="relative w-full rounded-[15px] bg-primary">
                                <div
                                    className={`rounded-[15px] transition-opacity duration-150 ${lit ? "" : "opacity-30"} ${
                                        showResult && index === winnerIndex ? "ring-2 ring-primary" : ""
                                    }`}
                                >
                                    <MovieCard movie={movie} selectable={false} />
                                </div>
                                {!lit && (
                                    <span className="pointer-events-none absolute inset-x-0 top-[12%] text-center font-display text-[96px] leading-none font-bold text-primary-lightest sm:text-[124px]">
                                        {index + 1}
                                    </span>
                                )}
                            </div>
                            <Image
                                src="/icons/d20.svg"
                                alt=""
                                width={32}
                                height={37}
                                className={rolling ? "motion-safe:animate-roll" : ""}
                            />
                        </div>
                    );
                })}
                {Array.from({ length: slots - candidates.length }, (_, index) => (
                    <PlaceholderCard key={`empty-${index}`} className={candidates.length + index >= mobileSlots ? "hidden sm:flex" : ""} />
                ))}
            </CardGrid>

            <div className="flex min-h-[142px] flex-col items-center justify-center gap-[25px] text-center">
                {night.error && <p className="text-danger">{night.error}</p>}

                {status === "selecting" && (
                    <>
                        <p className="text-sm text-primary-lightest">
                            {candidates.length < MIN_PICK
                                ? `Vyberte aspoň ${MIN_PICK} filmy.`
                                : `${candidates.length} z ${MAX_PICK} filmů. Kdokoli může hodit kostkou.`}
                        </p>
                        <Button onClick={night.roll} disabled={night.busy || candidates.length < MIN_PICK}>
                            Hodit kostkou
                        </Button>
                    </>
                )}

                {rolling && <p className="font-display text-2xl font-bold text-primary">Kostky padají…</p>}

                {showResult && (
                    <>
                        <div className="flex flex-col items-center gap-3">
                            <p className="font-display text-2xl font-bold text-primary">
                                Dnes uvidíte <span className="text-primary-pale">{winner.title}</span>
                            </p>
                            <p className="font-display text-sm font-bold">
                                <a
                                    href={titulkyUrl(winner.originalTitle ?? winner.title)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline"
                                >
                                    Titulky
                                </a>
                                {" | "}
                                <a
                                    href={csfdUrl(winner.originalTitle ?? winner.title)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline"
                                >
                                    ČSFD
                                </a>
                                {" | "}
                                <a
                                    href={imdbUrl(winner.imdbId, winner.originalTitle ?? winner.title)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline"
                                >
                                    IMDB
                                </a>
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2.5">
                            <Button variant="secondary" onClick={night.roll} disabled={night.busy}>
                                Hodit znovu
                            </Button>
                            <Button onClick={night.finish} disabled={night.busy}>
                                Označit film jako viděný
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

function titulkyUrl(title: string) {
    return `https://www.titulky.com/?Fulltext=${encodeURIComponent(title)}`;
}

/**
 * Spins a highlight across the cards and slows down until it lands on the winner.
 * The winner comes from the database, so every device lands on the same card.
 */
function useRollAnimation(rollKey: string | null, winnerIndex: number, count: number, rolledAt: string | null) {
    const [highlight, setHighlight] = useState<number | null>(null);
    const [finishedKey, setFinishedKey] = useState<string | null>(null);

    useEffect(() => {
        if (!rollKey || winnerIndex < 0 || count === 0 || rollKey === finishedKey) return;

        const timers: ReturnType<typeof setTimeout>[] = [];
        const isOld = !rolledAt || Date.now() - new Date(rolledAt).getTime() > REPLAY_WINDOW_MS;
        if (isOld) {
            timers.push(setTimeout(() => setFinishedKey(rollKey), 0));
            return () => timers.forEach(clearTimeout);
        }

        // About three laps, ending exactly on the winner
        const steps = count * 3 + winnerIndex;
        let elapsed = 0;
        for (let step = 0; step <= steps; step++) {
            const progress = step / steps;
            elapsed += 60 + 280 * progress * progress;
            timers.push(setTimeout(() => setHighlight(step % count), elapsed));
        }
        timers.push(
            setTimeout(() => {
                setFinishedKey(rollKey);
                setHighlight(null);
            }, elapsed + 500),
        );

        return () => timers.forEach(clearTimeout);
    }, [rollKey, winnerIndex, count, rolledAt, finishedKey]);

    const rolling = !!rollKey && winnerIndex >= 0 && rollKey !== finishedKey;
    return { highlight: rolling ? highlight : null, rolling };
}
