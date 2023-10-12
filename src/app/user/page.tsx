import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { UserMenu } from "@filmabend/app/user/UserMenu";

const UserPage = async () => {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    const {
        data: { user },
        error: getUserError,
    } = await supabase.auth.getUser(session?.access_token);

    return (
        <>
            <UserMenu user={user} />
        </>
    );
};

export default UserPage;
