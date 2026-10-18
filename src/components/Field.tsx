import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";

const CONTROL = "h-[42px] w-full rounded-lg border border-gray-4 bg-primary-pale pl-3.5 text-base text-black placeholder:text-placeholder";

type FieldProps = {
    label: string;
    required?: boolean;
    children: ReactNode;
};

/** Label + control, 430px wide like the Figma form fields */
export function Field({ label, required = false, children }: FieldProps) {
    return (
        <label className="flex w-full max-w-[430px] flex-col gap-1">
            <span className="font-semibold">
                {label}
                {required && <span className="text-danger"> *</span>}
            </span>
            {children}
        </label>
    );
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
    return (
        <span className="relative block">
            <select className={`${CONTROL} appearance-none pr-10 invalid:text-placeholder ${className}`} {...props} />
            <span className="pointer-events-none absolute top-1/2 right-[11px] flex size-5 -translate-y-1/2 flex-col" aria-hidden>
                <Image src="/icons/chevron-down.svg" alt="" width={20} height={10} className="-scale-y-100" />
                <Image src="/icons/chevron-down.svg" alt="" width={20} height={10} />
            </span>
        </span>
    );
}

export function SearchInput({ className = "", ...props }: ComponentProps<"input">) {
    return (
        <span className="relative block">
            <input type="search" className={`${CONTROL} pr-11 ${className}`} {...props} />
            <Image
                src="/icons/magnify.svg"
                alt=""
                width={24}
                height={24}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                aria-hidden
            />
        </span>
    );
}
