import type { MetadataRoute } from "next";

/** Lets us add Filmabend to the phone's home screen and open it like an app */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Filmabend",
        short_name: "Filmabend",
        description: "Výběr filmu na filmový večer",
        lang: "cs",
        start_url: "/",
        display: "standalone",
        background_color: "#0c0c0d",
        theme_color: "#0c0c0d",
        icons: [
            { src: "/icons/app/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/app/icon-512.png", sizes: "512x512", type: "image/png" },
            { src: "/icons/app/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
    };
}
