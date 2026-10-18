import Link from "next/link";
import { Suspense } from "react";
import { UserMenu, UserMenuSkeleton } from "@/components/UserMenu";
import { getCurrentUser } from "@/lib/auth";

export default function AppLayout({ children }: LayoutProps<"/">) {
    return (
        <>
            <header className="flex items-center justify-between gap-4">
                <Link href="/" className="font-display text-2xl font-bold uppercase">
                    Filmabend
                </Link>
                <Suspense fallback={<UserMenuSkeleton />}>
                    <CurrentUserMenu />
                </Suspense>
            </header>
            {children}
        </>
    );
}

async function CurrentUserMenu() {
    const user = await getCurrentUser();
    return <UserMenu name={user.name} avatarUrl={user.avatarUrl} />;
}
