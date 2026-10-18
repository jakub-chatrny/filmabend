"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/auth/actions";

type UserMenuProps = {
    name: string;
    avatarUrl: string | null;
};

export function UserMenu({ name, avatarUrl }: UserMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const firstName = name.split(" ")[0];

    useEffect(() => {
        if (!open) return;

        const close = (event: MouseEvent | KeyboardEvent) => {
            if (event instanceof KeyboardEvent ? event.key === "Escape" : !ref.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", close);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("keydown", close);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((value) => !value)}
                className="flex h-10 items-center gap-2 rounded-full border-2 border-primary-pale bg-black/80 py-1 pr-2 pl-1 transition-colors hover:border-primary"
            >
                {avatarUrl ? (
                    <Image src={avatarUrl} alt="" width={28} height={28} className="rounded-full" />
                ) : (
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold">
                        {firstName[0]}
                    </span>
                )}
                <span>{firstName}</span>
                <svg viewBox="0 0 24 24" aria-hidden className={`size-5 transition-transform ${open ? "-rotate-90" : "rotate-90"}`}>
                    <path fill="currentColor" d="M12.6 12 8 7.4 9.4 6l6 6-6 6L8 16.6z" />
                </svg>
            </button>
            {open && (
                <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 min-w-full overflow-hidden rounded-2xl bg-primary-pale text-black shadow-lg"
                >
                    <form action={signOut}>
                        <button
                            type="submit"
                            role="menuitem"
                            className="w-full px-4 py-2 text-left whitespace-nowrap hover:bg-primary-lightest"
                        >
                            Odhlásit
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export function UserMenuSkeleton() {
    return <div className="h-10 w-28 animate-pulse rounded-full bg-gray-15" />;
}
