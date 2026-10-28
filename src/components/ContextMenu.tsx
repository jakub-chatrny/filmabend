"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type ContextMenuItem = {
    label: string;
    onSelect: () => void;
};

type ContextMenuProps = {
    /** Where the right click happened (viewport coordinates) */
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
};

const EDGE = 8;

/** Right-click menu in the style of the user menu; closes on click outside, Escape, scroll or resize */
export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ left: x, top: y });

    // Keep it on screen when the click was close to the right or bottom edge
    useLayoutEffect(() => {
        const menu = ref.current;
        if (!menu) return;
        const { width, height } = menu.getBoundingClientRect();
        setPosition({
            left: Math.max(EDGE, Math.min(x, window.innerWidth - width - EDGE)),
            top: Math.max(EDGE, Math.min(y, window.innerHeight - height - EDGE)),
        });
        menu.querySelector("button")?.focus();
    }, [x, y]);

    useEffect(() => {
        const closeOutside = (event: MouseEvent) => {
            if (!ref.current?.contains(event.target as Node)) onClose();
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("mousedown", closeOutside);
        document.addEventListener("keydown", closeOnEscape);
        window.addEventListener("scroll", onClose, { passive: true });
        window.addEventListener("resize", onClose);
        window.addEventListener("blur", onClose);
        return () => {
            document.removeEventListener("mousedown", closeOutside);
            document.removeEventListener("keydown", closeOnEscape);
            window.removeEventListener("scroll", onClose);
            window.removeEventListener("resize", onClose);
            window.removeEventListener("blur", onClose);
        };
    }, [onClose]);

    return (
        <div
            ref={ref}
            role="menu"
            style={position}
            onContextMenu={(event) => event.preventDefault()}
            className="fixed z-30 min-w-44 overflow-hidden rounded-2xl bg-primary-pale py-1 text-sm text-black shadow-lg"
        >
            {items.map((item) => (
                <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                        onClose();
                        item.onSelect();
                    }}
                    className="block w-full px-4 py-2 text-left whitespace-nowrap hover:bg-primary-lightest focus-visible:bg-primary-lightest focus-visible:outline-none"
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
