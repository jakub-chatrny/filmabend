"use client";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FC, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Loading from "@filmabend/app/user/loading";
import { UserMenu } from "@filmabend/components";

type UserMenuProps = {
    user?: User | null;
    redirectTo?: string;
};

export const Login: FC<UserMenuProps> = ({ user, redirectTo }) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClientComponentClient();
    const handleSignIn = () => {
        supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } }).then(() => {
            setIsLoading(true);
            router.refresh();
        });
    };

    const handleSignOut = () => {
        setIsLoading(true);
        supabase.auth.signOut().then(() => {
            router.refresh();
            setIsLoading(false);
        });
    };

    useEffect(() => {
        // TODO add some timeout mechanism
        // It takes some time to retrieve session access token, so until user is ready just try get session
        // https://github.com/supabase/supabase/issues/14750
        if (!user) {
            setTimeout(
                () =>
                    supabase.auth.getSession().then(({ data: { session } }) => {
                        if (session?.access_token !== undefined) {
                            router.refresh();
                        }
                    }),
                100,
            );
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const userName = user?.identities?.[0]?.identity_data?.name.split(" ")[0] ?? undefined;
    const userAvatarUrl = user?.identities?.[0]?.identity_data?.avatar_url;

    return (
        <div>
            {isLoading ? (
                <Loading />
            ) : user ? (
                <UserMenu userAvatarUrl={userAvatarUrl} userName={userName} handleSignOut={handleSignOut} />
            ) : (
                <button
                    className="text-lg h-[52px] min-w-[143px] border-2 border-primary-pale p-1.5 px-7 rounded-full justify-center items-center text-lg bg-black bg-opacity-80"
                    onClick={handleSignIn}
                >
                    {" "}
                    Přihlásit
                </button>
            )}
        </div>
    );
};
