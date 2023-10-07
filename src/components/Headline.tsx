import { Cinzel } from "next/font/google";
import { FC, ReactNode } from "react";

const cinzel = Cinzel({ subsets: ["latin-ext"] });

type HeadlineProps = {
    children: ReactNode;
};
export const Headline: FC<HeadlineProps> = ({ children }) => (
    <h2 className={`${cinzel.className} text-4xl font-bold text-left`}>{children}</h2>
);
