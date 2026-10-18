"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/library";

/** Small pill select from Figma ("Vyberte řazení") */
export function SortSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const value = searchParams.get("sort") ?? "";

    return (
        <span className="relative block w-[172px]">
            <select
                aria-label="Řazení"
                value={value}
                onChange={(event) => {
                    const params = new URLSearchParams(searchParams);
                    if (event.target.value) params.set("sort", event.target.value);
                    else params.delete("sort");
                    router.replace(`/?${params}`, { scroll: false });
                }}
                className={`h-[30px] w-full appearance-none rounded-[32px] border border-gray-4 bg-black/50 pr-8 pl-2.5 text-xs ${value ? "text-primary-pale" : "text-gray-5"}`}
            >
                <option value="">Vyberte řazení</option>
                {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-2 flex w-[15px] -translate-y-1/2 flex-col" aria-hidden>
                <Image src="/icons/chevron-down.svg" alt="" width={15} height={7.5} className="-scale-y-100" />
                <Image src="/icons/chevron-down.svg" alt="" width={15} height={7.5} />
            </span>
        </span>
    );
}
