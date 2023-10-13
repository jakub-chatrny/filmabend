import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserMenu } from "@filmabend/app/user/UserMenu";

const UserPage = async () => {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    const {
        data: { user },
        error: getUserError,
    } = await supabase.auth.getUser();

    return (
        <>
            <UserMenu user={user} redirectTo={process.env.NEXT_PUBLIC_LOCALHOST_AUTH_REDIRECT_URL} />
        </>
    );
};

export default UserPage;
