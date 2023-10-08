import { FC, MouseEventHandler, ReactNode } from "react";

type ButtonProps = {
    children: ReactNode;
    onClick: MouseEventHandler<HTMLButtonElement>;
};
export const Button: FC<ButtonProps> = ({ children, onClick }) => (
    <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-5 rounded-3xl" onClick={onClick}>
        {children}
    </button>
);
