import type { Metadata, Viewport } from "next";
import { Cinzel, Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-open-sans" });
const cinzel = Cinzel({ subsets: ["latin", "latin-ext"], variable: "--font-cinzel" });

export const metadata: Metadata = {
    title: "Filmabend",
    description: "Výběr filmu na filmový večer",
    robots: { index: false, follow: false },
};

export const viewport: Viewport = {
    themeColor: "#0c0c0d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="cs" className={`${openSans.variable} ${cinzel.variable} antialiased`}>
            <body className="font-sans">
                <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-8">{children}</div>
            </body>
        </html>
    );
}
