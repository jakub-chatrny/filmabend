"use client";

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";

export const MIN_PICK = 2;
export const MAX_PICK = 8;

type Selection = {
    /** Movie ids in the order they were picked */
    ids: number[];
    isSelected: (id: number) => boolean;
    isFull: boolean;
    toggle: (id: number) => void;
    clear: () => void;
};

const SelectionContext = createContext<Selection | null>(null);

/**
 * Movies picked for tonight. Lives in the app layout so it survives switching tabs.
 * For now it's per device; the shared movie night will move it into the database.
 */
export function SelectionProvider({ children }: { children: ReactNode }) {
    const [ids, setIds] = useState<number[]>([]);

    const toggle = useCallback((id: number) => {
        setIds((current) => {
            if (current.includes(id)) return current.filter((other) => other !== id);
            return current.length < MAX_PICK ? [...current, id] : current;
        });
    }, []);

    const clear = useCallback(() => setIds([]), []);

    const value = useMemo(
        () => ({ ids, isSelected: (id: number) => ids.includes(id), isFull: ids.length >= MAX_PICK, toggle, clear }),
        [ids, toggle, clear],
    );

    return <SelectionContext value={value}>{children}</SelectionContext>;
}

export function useSelection() {
    const selection = use(SelectionContext);
    if (!selection) throw new Error("useSelection must be used within a SelectionProvider");
    return selection;
}
