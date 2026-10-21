"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/**
 * "Tag" chips from Figma: selected genres are filled with ×, the rest are outlined links.
 * Links are built from the live URL so they keep the search text and sorting.
 */
export function GenreChips({ genres }: { genres: string[] }) {
    const searchParams = useSearchParams();
    const active = searchParams.getAll("genre");

    if (genres.length === 0) return null;

    const hrefFor = (genre: string) => {
        const params = new URLSearchParams(searchParams);
        params.delete("genre");
        (active.includes(genre) ? active.filter((g) => g !== genre) : [...active, genre]).forEach((g) => params.append("genre", g));
        const search = params.toString();
        return search ? `/?${search}` : "/";
    };

    return (
        <ul className="flex flex-wrap gap-[5px]">
            {genres.map((genre) => {
                const isActive = active.includes(genre);
                return (
                    <li key={genre}>
                        <Link
                            href={hrefFor(genre)}
                            scroll={false}
                            aria-pressed={isActive}
                            className={`flex items-center rounded-[20px] border border-primary py-[5px] text-xs transition-colors ${
                                isActive ? "bg-primary pr-1.5 pl-2.5 text-[#e0e0e0]" : "px-2.5 text-primary underline hover:bg-primary/10"
                            }`}
                        >
                            {genre}
                            {isActive && <Image src="/icons/close.svg" alt="Odebrat" width={14} height={14} />}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
