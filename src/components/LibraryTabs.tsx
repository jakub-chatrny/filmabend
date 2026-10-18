"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export type LibraryTab = {
    /** undefined = "Vše" */
    id?: string;
    label: string;
    count: number;
};

/** "HeaderLinks" from Figma; scrolls sideways on phones */
export function LibraryTabs({ tabs }: { tabs: LibraryTab[] }) {
    const pathname = usePathname();
    const activeTab = useSearchParams().get("tab") ?? undefined;

    return (
        <nav className="min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto mask-[linear-gradient(to_right,black_85%,transparent)] sm:mask-none">
            <ul className="flex gap-[25px] text-sm font-semibold whitespace-nowrap">
                {tabs.map((tab) => {
                    const active = pathname === "/" && activeTab === tab.id;
                    return (
                        <li key={tab.id ?? "all"}>
                            <Link
                                href={tab.id ? `/?tab=${tab.id}` : "/"}
                                aria-current={active ? "page" : undefined}
                                className={`block border-b-2 py-1.5 transition-colors ${
                                    active ? "border-primary-lighter text-primary-lighter" : "border-transparent hover:text-primary-lighter"
                                }`}
                            >
                                {tab.label} ({tab.count})
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export function LibraryTabsSkeleton() {
    return <div className="h-8 flex-1 animate-pulse rounded bg-gray-15/60" />;
}
