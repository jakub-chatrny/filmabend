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
                className="flex items-center gap-[5px] rounded-[20px] border-2 border-primary-pale bg-black/20 p-[5px] text-sm font-semibold transition-colors hover:border-primary"
            >
                {avatarUrl ? (
                    <Image src={avatarUrl} alt="" width={23} height={23} className="rounded-full" />
                ) : (
                    <span className="flex size-[23px] items-center justify-center rounded-full bg-primary text-xs font-bold">
                        {firstName[0]}
                    </span>
                )}
                <span>{firstName}</span>
                <Image
                    src="/icons/chevron-right.svg"
                    alt=""
                    width={18}
                    height={18}
                    className={`transition-transform ${open ? "-rotate-90" : "rotate-90"}`}
                />
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
    return <div className="h-[37px] w-24 animate-pulse rounded-[20px] bg-gray-15" />;
}
