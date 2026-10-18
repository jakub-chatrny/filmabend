import { Suspense } from "react";
import { LibraryTabs, LibraryTabsSkeleton } from "@/components/LibraryTabs";
import { SelectionProvider } from "@/components/Selection";
import { UserMenu, UserMenuSkeleton } from "@/components/UserMenu";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/categories";
import { SEEN_TAB, tabCounts } from "@/lib/library";
import { getMovies } from "@/lib/movies";

export default function AppLayout({ children }: LayoutProps<"/">) {
    return (
        <SelectionProvider>
            <header className="flex items-center justify-between gap-4">
                <Suspense fallback={<LibraryTabsSkeleton />}>
                    <HeaderTabs />
                </Suspense>
                <Suspense fallback={<UserMenuSkeleton />}>
                    <CurrentUserMenu />
                </Suspense>
            </header>
            {children}
        </SelectionProvider>
    );
}

async function HeaderTabs() {
    const [movies, categories] = await Promise.all([getMovies(), getCategories()]);
    const counts = tabCounts(movies, categories);

    return (
        <LibraryTabs
            tabs={[
                { label: "Vše", count: counts.all },
                ...categories.map((category) => ({ id: category.id, label: category.label, count: counts.categories[category.id] })),
                { id: SEEN_TAB, label: "Viděno", count: counts.seen },
            ]}
        />
    );
}

async function CurrentUserMenu() {
    const user = await getCurrentUser();
    return <UserMenu name={user.name} avatarUrl={user.avatarUrl} />;
}
