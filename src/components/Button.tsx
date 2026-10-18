import type { ComponentProps } from "react";

const VARIANTS = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-gray-15 text-primary-pale hover:bg-gray-40",
    outline: "border-2 border-primary text-primary hover:bg-primary/10",
} as const;

type ButtonProps = ComponentProps<"button"> & {
    variant?: keyof typeof VARIANTS;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
            {...props}
        />
    );
}
