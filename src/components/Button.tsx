import type { ComponentProps } from "react";

const VARIANTS = {
    primary:
        "border border-primary bg-primary text-primary-pale hover:bg-primary-dark disabled:border-primary-lighter disabled:bg-primary-lighter disabled:text-primary-lightest",
    secondary: "border border-gray-15 bg-gray-15 text-white hover:border-gray-40 hover:bg-gray-40 disabled:opacity-50",
    outline: "border border-primary text-primary hover:bg-primary/10 disabled:opacity-50",
} as const;

const SIZES = {
    // Figma buttons: 12px bold, 7px × 14px padding; a bit bigger on phones for thumbs
    sm: "px-4 py-2 text-sm font-bold sm:px-3.5 sm:py-[7px] sm:text-xs",
    md: "px-5 py-2.5 font-semibold",
} as const;

type ButtonStyle = {
    variant?: keyof typeof VARIANTS;
    size?: keyof typeof SIZES;
};

/** Button classes, also for links that look like buttons. */
export function buttonClasses({ variant = "primary", size = "md" }: ButtonStyle = {}) {
    return `inline-flex items-center justify-center gap-1.5 rounded-full whitespace-nowrap transition-colors disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]}`;
}

type ButtonProps = ComponentProps<"button"> & ButtonStyle;

export function Button({ variant, size, className = "", ...props }: ButtonProps) {
    return <button className={`${buttonClasses({ variant, size })} ${className}`} {...props} />;
}
