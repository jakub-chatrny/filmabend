"use client";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { FC, useCallback, useEffect, useState } from "react";
import { SupabaseClient, User } from "@supabase/supabase-js";
import Loading from "@filmabend/app/user/loading";
import { Database } from "@filmabend/types";
import { UserMenu } from "@filmabend/components";
import { getLocalStorageItem, setLocalStorageItem } from "@filmabend/utils/localStorage";

type UserMenuProps = {
    user?: User | null;
    redirectTo?: string;
};

/**
 * It takes some time to retrieve session access token, so until user is ready just try get session
 * There is issue with remounting after google redirect, so we use local storage to keep information about isAuthenticating.
 * Also there is 5s expiration to avoid infinite looping of getSession.
 *
 * for more info see https://github.com/supabase/supabase/issues/14750
 */
const useIsAuthenticating = (supabase: SupabaseClient<Database>, user: User | null | undefined) => {
    const router = useRouter();
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(Boolean(getLocalStorageItem("isAuthenticating")));

    useEffect(() => {
        const isExpired =
            getLocalStorageItem("authenticatingExpiration") === null
                ? false
                : new Date(getLocalStorageItem("authenticatingExpiration")!) > new Date();

        if (!user && isAuthenticating && isExpired) {
            throw new Error("Authentication session has expired try it again.");
        }

        if (!user) {
            setTimeout(
                () =>
                    supabase.auth.getSession().then(({ data: { session } }) => {
                        if (session?.access_token !== undefined) {
                            router.refresh();
                        }
                    }),
                150,
            );
        } else {
            setIsAuthenticating(false);
            setLocalStorageItem("isAuthenticating", String(false));
        }
    }, [user]);

    const setLocalStorageIsAuthenticating = useCallback(
        (newValue: boolean) => {
            setLocalStorageItem("isAuthenticating", String(newValue));
            const expirationData = new Date(new Date().getTime() + 5000);
            setLocalStorageItem("authenticatingExpiration", String(newValue ? expirationData.getTime() : null));
        },
        [setIsAuthenticating],
    );

    const updateAuthentication = useCallback(
        (newValue: boolean) => {
            setIsAuthenticating(newValue);
            setLocalStorageIsAuthenticating(newValue);
        },
        [setIsAuthenticating],
    );

    return {
        isAuthenticating,
        setIsAuthenticating: updateAuthentication,
    };
};

export const Login: FC<UserMenuProps> = ({ user, redirectTo }) => {
    const router = useRouter();
    const supabase = createClientComponentClient<Database>();

    const { isAuthenticating, setIsAuthenticating } = useIsAuthenticating(supabase, user);
    const handleSignIn = () => {
        supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } }).then(() => {
            setIsAuthenticating(true);
        });
    };

    const handleSignOut = () => {
        setIsAuthenticating(true);
        supabase.auth.signOut().then(() => {
            router.refresh();
            setIsAuthenticating(false);
        });
    };

    const userName = user?.identities?.[0]?.identity_data?.name.split(" ")[0] ?? undefined;
    const userAvatarUrl = user?.identities?.[0]?.identity_data?.avatar_url;

    return (
        <div>
            {isAuthenticating ? (
                <Loading />
            ) : user ? (
                <UserMenu userAvatarUrl={userAvatarUrl} userName={userName} handleSignOut={handleSignOut} />
            ) : (
                <button
                    className="text-lg h-[52px] min-w-[143px] border-2 border-primary-pale p-1.5 px-7 rounded-full justify-center items-center bg-black bg-opacity-80"
                    onClick={handleSignIn}
                >
                    {" "}
                    Přihlásit
                </button>
            )}
        </div>
    );
};
