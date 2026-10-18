"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export const MIN_PICK = 2;
export const MAX_PICK = 8;

type NightStatus = "selecting" | "rolled" | "done" | "cancelled";

type Night = {
    id: number;
    status: NightStatus;
    winnerMovieId: number | null;
    rollCount: number;
    rolledAt: string | null;
};

type MovieNightState = {
    loaded: boolean;
    /** The most recent movie night, open or not */
    night: Night | null;
    /** Candidate movie ids of the open night, in the order they were added */
    ids: number[];
};

type MovieNight = MovieNightState & {
    isOpen: boolean;
    /** Candidates can be changed until someone rolls */
    canEdit: boolean;
    isSelected: (movieId: number) => boolean;
    isFull: boolean;
    busy: boolean;
    error: string | null;
    dismissError: () => void;
    toggle: (movieId: number) => void;
    clear: () => Promise<void>;
    roll: () => Promise<void>;
    backToSelection: () => Promise<void>;
    finish: () => Promise<void>;
};

const MovieNightContext = createContext<MovieNight | null>(null);

const OPEN_STATUSES: NightStatus[] = ["selecting", "rolled"];

/**
 * The shared movie night. Candidates live in the database; every device listens to
 * Supabase Realtime and re-reads the state, so all three of you see the same picks and roll.
 */
export function MovieNightProvider({ children }: { children: ReactNode }) {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const pathname = usePathname();
    const [state, setState] = useState<MovieNightState>({ loaded: false, night: null, ids: [] });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        const { data, error } = await supabase
            .from("pick_sessions")
            .select("id, status, winner_movie_id, roll_count, rolled_at, pick_candidates(movie_id, added_at)")
            .order("id", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            setError("Nepodařilo se načíst výběr.");
            return;
        }

        const night: Night | null = data && {
            id: data.id,
            status: data.status as NightStatus,
            winnerMovieId: data.winner_movie_id,
            rollCount: data.roll_count,
            rolledAt: data.rolled_at,
        };
        const ids =
            data && night && OPEN_STATUSES.includes(night.status)
                ? data.pick_candidates.toSorted((a, b) => a.added_at.localeCompare(b.added_at)).map((c) => c.movie_id)
                : [];
        setState({ loaded: true, night, ids });
    }, [supabase]);

    useEffect(() => {
        const channel = supabase
            .channel("movie-night")
            .on("postgres_changes", { event: "*", schema: "public", table: "pick_sessions" }, () => void refresh())
            .on("postgres_changes", { event: "*", schema: "public", table: "pick_candidates" }, () => void refresh())
            // New or seen movies change the library and the tab counts
            .on("postgres_changes", { event: "*", schema: "public", table: "movies" }, () => router.refresh())
            .subscribe((status) => {
                if (status === "SUBSCRIBED") void refresh();
            });

        // Phones drop the socket while asleep; catch up when the app comes back
        const onVisible = () => {
            if (document.visibilityState === "visible") void refresh();
        };
        document.addEventListener("visibilitychange", onVisible);

        return () => {
            document.removeEventListener("visibilitychange", onVisible);
            void supabase.removeChannel(channel);
        };
    }, [supabase, refresh, router]);

    // When someone else rolls, take everyone to the result (but not on the first load)
    const lastRoll = useRef<string | null>(null);
    useEffect(() => {
        if (!state.loaded) return;
        const roll = state.night ? `${state.night.id}:${state.night.rollCount}` : "";
        if (state.night?.status === "rolled" && lastRoll.current !== null && roll !== lastRoll.current && pathname !== "/pick") {
            router.push("/pick");
        }
        lastRoll.current = roll;
    }, [state, pathname, router]);

    const call = useCallback(
        async (fn: "clear_candidates" | "roll_pick" | "back_to_selection" | "finish_pick") => {
            setBusy(true);
            setError(null);
            const { error } = await supabase.rpc(fn);
            if (error) setError(error.message);
            await refresh();
            setBusy(false);
            return !error;
        },
        [supabase, refresh],
    );

    const toggle = useCallback(
        (movieId: number) => {
            setError(null);
            // Optimistic so taps feel instant; the database has the final say
            setState((current) => {
                if (current.ids.includes(movieId)) return { ...current, ids: current.ids.filter((id) => id !== movieId) };
                return current.ids.length < MAX_PICK ? { ...current, ids: [...current.ids, movieId] } : current;
            });
            void supabase.rpc("toggle_candidate", { p_movie_id: movieId }).then(({ error }) => {
                if (error) setError(error.message);
                void refresh();
            });
        },
        [supabase, refresh],
    );

    const value = useMemo<MovieNight>(() => {
        const isOpen = !!state.night && OPEN_STATUSES.includes(state.night.status);
        return {
            ...state,
            isOpen,
            canEdit: state.loaded && state.night?.status !== "rolled",
            isSelected: (movieId) => state.ids.includes(movieId),
            isFull: state.ids.length >= MAX_PICK,
            busy,
            error,
            dismissError: () => setError(null),
            toggle,
            clear: async () => void (await call("clear_candidates")),
            roll: async () => {
                if (await call("roll_pick")) router.push("/pick");
            },
            backToSelection: async () => void (await call("back_to_selection")),
            finish: async () => void (await call("finish_pick")),
        };
    }, [state, busy, error, toggle, call, router]);

    return <MovieNightContext value={value}>{children}</MovieNightContext>;
}

export function useMovieNight() {
    const night = use(MovieNightContext);
    if (!night) throw new Error("useMovieNight must be used within a MovieNightProvider");
    return night;
}
