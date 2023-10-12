import "./globals.css";
import type { Metadata } from "next";
import { Cinzel, Open_Sans } from "next/font/google";
import { TMDB_BASE_URL, TMDB_REQUEST_OPTIONS } from "@filmabend/utils/tmdb";
import { ErrorBoundary, Link } from "@filmabend/components";
import GlobalError from "./global-error";
import User from "./user/page";

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
const cinzel = Cinzel({ subsets: ["latin-ext"], variable: "--font-cinzel" });

export const metadata: Metadata = {
    title: "Filmabend",
    description: "Generated by create next app",
    verification: {
        google: "KVp1uwO2G-LjtKMy7n6jUOWJ2txP1h1P5RVxpEU2GgY",
    },
};

const tmdbAuth = async () => {
    if (process.env.TMDB_API_KEY === undefined) throw new Error("TMDB_API_KEY is not defined");

    return fetch(`${TMDB_BASE_URL}/authentication`, TMDB_REQUEST_OPTIONS)
        .then((response) => response.json())
        .catch((error) => console.log(error));
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    await tmdbAuth();
    return (
        <html lang="en">
            <body className={`${cinzel.variable} ${openSans.className} ${openSans.variable}`}>
                <div className="flex min-h-screen flex-col items-center justify-between p-8 gap-8">
                    <div className="flex flex-col items-center gap-4 w-full max-w-7xl">
                        <header className="z-10 w-full items-center justify-between font-mono text-sm flex flex-row ">
                            <ul className="flex gap-4 text-lg">
                                <li>Vše (523)</li>
                                <li>Společné filmy (123)</li>
                                <li>Akční Filmy (27)</li>
                                <li>Horory (5)</li>
                                <li>Viděno (223)</li>
                            </ul>
                            <User />
                            {/*<Button onClick={null}>+ Přidat film</Button>*/}
                        </header>

                        <main className="max-w-7xl w-full">
                            <ErrorBoundary fallback={GlobalError}>{children}</ErrorBoundary>
                        </main>
                    </div>
                    <footer className="mb-32 grid text-center lg:max-w-7xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
                        <ul className="flex gap-4">
                            <li>
                                <Link href={process.env.GITHUB_URL}>Github</Link>
                            </li>
                            <li>
                                <Link href={process.env.FIGMA_URL}>Figma</Link>
                            </li>
                            <li>
                                <Link href={process.env.TRELLO_URL}>Trello</Link>
                            </li>
                        </ul>
                    </footer>
                </div>
            </body>
        </html>
    );
}
