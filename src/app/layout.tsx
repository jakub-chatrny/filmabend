import type { Metadata, Viewport } from "next";
import { Cinzel, Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-open-sans" });
const cinzel = Cinzel({ subsets: ["latin", "latin-ext"], variable: "--font-cinzel" });

export const metadata: Metadata = {
    title: "Filmabend",
    description: "Výběr filmu na filmový večer",
    robots: { index: false, follow: false },
    appleWebApp: { capable: true, title: "Filmabend", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
    themeColor: "#0c0c0d",
    // Edge to edge on phones; fixed bars add the safe-area insets themselves
    viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="cs" className={`${openSans.variable} ${cinzel.variable} antialiased`}>
            <body className="font-sans">
                <div className="mx-auto flex min-h-dvh w-full max-w-200 flex-col gap-10 px-4 pt-[max(0.875rem,env(safe-area-inset-top))] pb-6">
                    {children}
                </div>
            </body>
        </html>
    );
}
