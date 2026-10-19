import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

const PUBLIC_PATHS = ["/login", "/auth", "/api/keep-alive"];

// Same lifetime @supabase/ssr uses for its cookies
const AUTH_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;
const TOUCHED_COOKIE = "filmabend-session-refreshed";

/**
 * Refreshes the Supabase session cookie on every request and sends signed-out
 * visitors to /login. This is only an optimistic check; pages still verify the
 * user through getCurrentUser().
 */
export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet, headers) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
                },
            },
        },
    );

    // Don't put code between createServerClient and getClaims: getClaims refreshes an expired session.
    const { data } = await supabase.auth.getClaims();

    const { pathname } = request.nextUrl;
    const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

    if (!data?.claims && !isPublic) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.search = "";
        const redirect = NextResponse.redirect(url);
        response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
        return redirect;
    }

    if (data?.claims && !request.cookies.has(TOUCHED_COOKIE)) {
        keepAuthCookiesAlive(request, response);
    }

    return response;
}

/**
 * The browser client refreshes the session every hour and writes the cookies from JavaScript,
 * which Safari limits to 7 days. Once a day, re-send the auth cookies from the server so an
 * active session keeps its long lifetime.
 */
function keepAuthCookiesAlive(request: NextRequest, response: NextResponse) {
    request.cookies
        .getAll()
        .filter(({ name }) => name.startsWith("sb-") && name.includes("-auth-token") && !name.includes("code-verifier"))
        // Cookies the refresh above already set carry the new values
        .filter(({ name }) => !response.cookies.get(name))
        .forEach(({ name, value }) => response.cookies.set(name, value, { path: "/", sameSite: "lax", maxAge: AUTH_COOKIE_MAX_AGE }));

    response.cookies.set(TOUCHED_COOKIE, "1", { path: "/", sameSite: "lax", maxAge: 24 * 60 * 60 });
}
