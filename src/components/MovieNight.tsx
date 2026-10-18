"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { getClient } from "@/lib/supabase/client";

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

type StoreState = MovieNightState & {
    busy: boolean;
    error: string | null;
};

type MovieNight = StoreState & {
    isOpen: boolean;
    /** Candidates can be changed until someone rolls */
    canEdit: boolean;
    isSelected: (movieId: number) => boolean;
    isFull: boolean;
} & Actions;

type Actions = {
    dismissError: () => void;
    toggle: (movieId: number) => void;
    clear: () => Promise<void>;
    roll: () => Promise<void>;
    backToSelection: () => Promise<void>;
    finish: () => Promise<void>;
};

const OPEN_STATUSES: NightStatus[] = ["selecting", "rolled"];

/** What the server renders: nothing loaded yet. Hydration uses this too, so server and client HTML match. */
const SERVER_STATE: StoreState = { loaded: false, night: null, ids: [], busy: false, error: null };
const getServerState = () => SERVER_STATE;

/**
 * A tiny external store read with useSyncExternalStore. The provider sits in the layout and
 * loads before the page streams in; with plain React state, the page would hydrate with
 * already-loaded data that the server never rendered.
 */
function createStore() {
    let state = SERVER_STATE;
    const listeners = new Set<() => void>();
    return {
        get: () => state,
        update(patch: Partial<StoreState> | ((current: StoreState) => Partial<StoreState>)) {
            state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
            listeners.forEach((listener) => listener());
        },
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => void listeners.delete(listener);
        },
    };
}

type Store = ReturnType<typeof createStore>;

const MovieNightContext = createContext<{ store: Store; actions: Actions } | null>(null);

const rollKey = (state: StoreState) => (state.night ? `${state.night.id}:${state.night.rollCount}` : "");

/**
 * The shared movie night. Candidates live in the database; every device listens to
 * Supabase Realtime and re-reads the state, so all three of you see the same picks and roll.
 */
export function MovieNightProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [store] = useState(createStore);

    const refresh = useCallback(async () => {
        const { data, error } = await getClient()
            .from("pick_sessions")
            .select("id, status, winner_movie_id, roll_count, rolled_at, pick_candidates(movie_id, added_at)")
            .order("id", { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error) {
            store.update({ error: "Nepodařilo se načíst výběr." });
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
        store.update({ loaded: true, night, ids });
    }, [store]);

    useEffect(() => {
        const supabase = getClient();
        // Load right away instead of waiting for the subscription
        const initialLoad = setTimeout(() => void refresh(), 0);
        // Unique name: the client is shared, and a channel that's still closing can't be reused
        const channel = supabase
            .channel(`movie-night-${crypto.randomUUID()}`)
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
            clearTimeout(initialLoad);
            document.removeEventListener("visibilitychange", onVisible);
            void supabase.removeChannel(channel);
        };
    }, [refresh, router]);

    // When someone else rolls, take everyone to the result (but not on the first load)
    const onPickPage = useRef(false);
    useEffect(() => {
        onPickPage.current = pathname === "/pick";
    }, [pathname]);
    useEffect(() => {
        let lastRoll = store.get().loaded ? rollKey(store.get()) : null;
        return store.subscribe(() => {
            const state = store.get();
            if (!state.loaded) return;
            const roll = rollKey(state);
            if (state.night?.status === "rolled" && lastRoll !== null && roll !== lastRoll && !onPickPage.current) {
                router.push("/pick");
            }
            lastRoll = roll;
        });
    }, [store, router]);

    const actions = useMemo<Actions>(() => {
        const call = async (fn: "clear_candidates" | "roll_pick" | "back_to_selection" | "finish_pick") => {
            store.update({ busy: true, error: null });
            const { error } = await getClient().rpc(fn);
            if (error) store.update({ error: error.message });
            await refresh();
            store.update({ busy: false });
            return !error;
        };

        return {
            dismissError: () => store.update({ error: null }),
            toggle: (movieId) => {
                // Optimistic so taps feel instant; the database has the final say
                store.update((current) => ({
                    error: null,
                    ids: current.ids.includes(movieId)
                        ? current.ids.filter((id) => id !== movieId)
                        : current.ids.length < MAX_PICK
                          ? [...current.ids, movieId]
                          : current.ids,
                }));
                void getClient()
                    .rpc("toggle_candidate", { p_movie_id: movieId })
                    .then(({ error }) => {
                        if (error) store.update({ error: error.message });
                        void refresh();
                    });
            },
            clear: async () => void (await call("clear_candidates")),
            roll: async () => {
                if (await call("roll_pick")) router.push("/pick");
            },
            backToSelection: async () => void (await call("back_to_selection")),
            finish: async () => void (await call("finish_pick")),
        };
    }, [store, refresh, router]);

    const value = useMemo(() => ({ store, actions }), [store, actions]);
    return <MovieNightContext value={value}>{children}</MovieNightContext>;
}

export function useMovieNight(): MovieNight {
    const context = use(MovieNightContext);
    if (!context) throw new Error("useMovieNight must be used within a MovieNightProvider");
    const state = useSyncExternalStore(context.store.subscribe, context.store.get, getServerState);

    return useMemo(
        () => ({
            ...state,
            ...context.actions,
            isOpen: !!state.night && OPEN_STATUSES.includes(state.night.status),
            canEdit: state.loaded && state.night?.status !== "rolled",
            isSelected: (movieId: number) => state.ids.includes(movieId),
            isFull: state.ids.length >= MAX_PICK,
        }),
        [state, context.actions],
    );
}
