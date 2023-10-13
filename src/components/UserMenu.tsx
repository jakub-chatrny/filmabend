"use client";
import { FC, useState } from "react";
import { usePopper } from "react-popper";
import { computeStyles, preventOverflow } from "@popperjs/core";

type UserMenuProps = {
    userAvatarUrl: string;
    userName: string;
    handleSignOut: () => void;
};

export const UserMenu: FC<UserMenuProps> = ({ userAvatarUrl, userName, handleSignOut }) => {
    const [opened, setOpened] = useState(false);
    // This is the Popper way
    const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: "auto",
        modifiers: [preventOverflow, computeStyles],
    });

    return (
        <div className="relative">
            <div className={`bg-primary-pale rounded-3xl ${opened && "rounded-br-none rounded-bl-none"}`}>
                <button ref={setReferenceElement} className="flex gap-5" onClick={() => setOpened((x) => !x)}>
                    <div className="flex border-2 border-primary-pale rounded-full p-1.5 pr-2 gap-2.5 justify-center items-center text-lg bg-black bg-opacity-80">
                        <img className="rounded-full h-9" src={userAvatarUrl} alt="avatar" />
                        <span>{userName}</span>
                        <img className="h-6" src="/chevron-right.svg" alt="expand" />
                    </div>
                </button>
            </div>
            {opened && (
                <div
                    ref={setPopperElement}
                    {...attributes.popper}
                    style={styles}
                    className="absolute w-full bg-primary-pale text-primary flex items-center underline rounded-br-3xl rounded-bl-3xl justify-center p-2 "
                >
                    <button className="text-lg" onClick={handleSignOut}>
                        Odhlásit
                    </button>
                </div>
            )}
        </div>
    );
};
