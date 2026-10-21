"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Searches the current tab by title, director or actor. The text goes into ?q= with
 * history.replaceState: the grid filters on the client right away, without a server round trip.
 */
export function LibrarySearch() {
    const [value, setValue] = useState(useSearchParams().get("q") ?? "");

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            if (value.trim()) params.set("q", value);
            else params.delete("q");
            const search = params.toString();
            window.history.replaceState(null, "", search ? `/?${search}` : "/");
        }, 150);
        return () => clearTimeout(timeout);
    }, [value]);

    return (
        <span className="relative block w-full sm:w-56">
            <Image
                src="/icons/magnify.svg"
                alt=""
                width={16}
                height={16}
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
                aria-hidden
            />
            <input
                type="search"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Hledat film, herce, režiséra…"
                aria-label="Hledat v knihovně"
                className="h-[30px] w-full rounded-[32px] border border-gray-4 bg-black/50 pr-3 pl-8 text-xs text-primary-pale placeholder:text-gray-5"
            />
        </span>
    );
}
