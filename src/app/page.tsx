import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Search from "./search/page";

export default async function Home() {
    return (
        <div className="relative flex place-items-center">
            <Search />
        </div>
    );
}
