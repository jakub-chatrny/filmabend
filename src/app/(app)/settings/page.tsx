import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { SettingsForm } from "./SettingsForm";

export default function SettingsPage() {
    return (
        <main className="flex flex-col gap-[15px] pb-24">
            <h1 className="font-display text-2xl font-bold">Nastavení</h1>
            <Suspense>
                <Settings />
            </Suspense>
        </main>
    );
}

async function Settings() {
    const user = await getCurrentUser();
    return <SettingsForm titleLanguage={user.titleLanguage} />;
}
