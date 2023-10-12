import { Cinzel } from "next/font/google";
import { FC, ReactNode } from "react";

type HeadlineProps = {
    children: ReactNode;
};
export const Headline: FC<HeadlineProps> = ({ children }) => (
    <h2 className={`font-display uppercase text-4xl font-bold text-left`}>{children}</h2>
);
