import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    images: {
        remotePatterns: [
            // TMDB posters
            new URL("https://image.tmdb.org/t/p/**"),
            // Google avatars
            new URL("https://lh3.googleusercontent.com/**"),
        ],
    },
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};

export default nextConfig;
