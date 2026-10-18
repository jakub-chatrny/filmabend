"use client";

import { useState } from "react";

/**
 * Two-step "back to unseen" button on seen cards. An in-card confirmation instead of
 * window.confirm(), which phones, home-screen apps and in-app browsers often block.
 */
export function UnmarkButton({ onConfirm }: { onConfirm: () => void }) {
    const [asking, setAsking] = useState(false);

    if (!asking) {
        return (
            <button
                type="button"
                onClick={() => setAsking(true)}
                className="mt-1 rounded-full px-2 py-1 text-xs text-primary-pale underline hover:bg-black/20"
            >
                Vrátit mezi neviděné
            </button>
        );
    }

    return (
        <div className="mt-1 flex items-center gap-1 text-xs text-primary-pale">
            <span>Opravdu?</span>
            <button
                type="button"
                onClick={() => {
                    setAsking(false);
                    onConfirm();
                }}
                className="rounded-full bg-primary-pale px-2.5 py-1 font-bold text-primary"
            >
                Ano
            </button>
            <button type="button" onClick={() => setAsking(false)} className="rounded-full px-2 py-1 underline hover:bg-black/20">
                Ne
            </button>
        </div>
    );
}
