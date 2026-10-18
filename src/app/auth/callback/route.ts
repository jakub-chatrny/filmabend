import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Google → Supabase → here with a one-time code that we swap for a session cookie. */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = request.nextUrl;
    const code = searchParams.get("code");

    if (!code) {
        // Supabase sends ?error=… here when sign-in fails, e.g. the allowlist hook rejected the account
        return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    const { data: isMember } = await supabase.rpc("is_member");
    if (!isMember) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=not-invited`);
    }

    return NextResponse.redirect(`${origin}/`);
}
