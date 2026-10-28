"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type LibraryLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onNavigate"> & { href: string };

/**
 * Link to another tab, genre or sorting of the library. On the library itself it only changes
 * the URL: the page already has every movie and filters them on the client, so switching is
 * instant instead of a server round trip. From other pages it navigates normally.
 */
export function LibraryLink({ href, scroll = true, ...props }: LibraryLinkProps) {
    const onLibrary = usePathname() === "/";

    return (
        <Link
            {...props}
            href={href}
            scroll={scroll}
            prefetch={onLibrary ? false : props.prefetch}
            onNavigate={(event) => {
                if (!onLibrary) return;
                event.preventDefault();
                window.history.pushState(null, "", href);
                if (scroll) window.scrollTo({ top: 0 });
            }}
        />
    );
}
