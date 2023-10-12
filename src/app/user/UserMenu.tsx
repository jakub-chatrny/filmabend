"use client";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FC } from "react";
import { User } from "@supabase/supabase-js";

type UserMenuProps = {
    user?: User | null;
};
export const UserMenu: FC<UserMenuProps> = ({ user }) => {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const handleSignIn = () => {
        supabase.auth.signInWithOAuth({ provider: "google" }).then(() => {
            router.refresh();
        });
    };
    const handleSignOut = () => {
        supabase.auth.signOut().then(() => {
            router.refresh();
        });
    };

    // console.log(user);
    const userName = user?.identities?.[0]?.identity_data?.name.split(" ")[0] ?? undefined;
    const userAvatarUrl = user?.identities?.[0]?.identity_data?.avatar_url;

    return (
        <div>
            {user ? (
                <div className="flex gap-5">
                    <div
                        className="flex border-2 border-primary-pale rounded-full p-1.5 pr-2 gap-2.5 justify-center items-center text-lg"
                        key={user.id}
                    >
                        <img className="rounded-full h-9" src={userAvatarUrl} alt="avatar" />

                        <span>{userName}</span>
                        <img className="h-6" src="/chevron-right.svg" alt="expand" />
                    </div>
                    <button className="text-lg" onClick={handleSignOut}>
                        Odhlásit
                    </button>
                </div>
            ) : (
                <button className="text-lg" onClick={handleSignIn}>
                    Přihlásit
                </button>
            )}
        </div>
    );
};
