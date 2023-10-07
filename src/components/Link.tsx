import { FC, ReactNode } from "react";

type LinkProps = {
    href: string | undefined;
    children: ReactNode;
};

export const Link: FC<LinkProps> = ({ href, children }) =>
    href !== undefined ? (
        <a href={href} className="text-primary underline">
            {children}
        </a>
    ) : (
        <span>{children}</span>
    );
