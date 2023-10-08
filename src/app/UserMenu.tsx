import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const UserMenu = async () => {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    const { data: users } = await supabase.from("user").select();
    //const { user, logout } = useAuth();
    return (
        <div>{users?.map((user) => <div key={user.id}>{user.name}</div>)}</div>
        // <Menu>
        //     <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        //         {user?.email}
        //     </MenuButton>
        //     <MenuList>
        //         <MenuItem onClick={logout}>Logout</MenuItem>
        //     </MenuList>
        // </Menu>
    );
};
