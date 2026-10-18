import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/Button";
import { createClient } from "@/lib/supabase/server";
import { signInWithGoogle, signOut } from "@/app/auth/actions";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
            <div className="flex flex-col gap-3">
                <h1 className="font-display text-5xl font-bold uppercase">Filmabend</h1>
                <p className="text-primary-lightest">Výběr filmu na filmový večer</p>
            </div>
            <Suspense fallback={<SignInForm />}>
                <LoginState searchParams={searchParams} />
            </Suspense>
        </main>
    );
}

async function LoginState({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
    const { error } = await searchParams;
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    if (error === "not-invited") {
        return (
            <div className="flex flex-col items-center gap-4">
                <p className="max-w-sm">{data?.claims.email ? `Účet ${data.claims.email}` : "Tento účet"} nemá do Filmabendu přístup.</p>
                {data?.claims ? (
                    <form action={signOut}>
                        <Button type="submit" variant="outline">
                            Přihlásit jiným účtem
                        </Button>
                    </form>
                ) : (
                    <SignInForm label="Přihlásit jiným účtem" />
                )}
            </div>
        );
    }

    if (data?.claims) {
        redirect("/");
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {error && <p className="text-primary-light">Přihlášení se nezdařilo, zkuste to znovu.</p>}
            <SignInForm />
        </div>
    );
}

function SignInForm({ label = "Přihlásit se přes Google" }: { label?: string }) {
    return (
        <form action={signInWithGoogle}>
            <Button type="submit">{label}</Button>
        </form>
    );
}
