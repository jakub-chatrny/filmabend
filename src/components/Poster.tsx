"use client";

import Image, { type ImageLoader } from "next/image";

const TMDB_WIDTHS = [92, 154, 185, 342, 500, 780];

// TMDB serves pre-sized posters, so skip Next's image optimizer (and its Vercel quota)
const tmdbLoader: ImageLoader = ({ src, width }) => {
    const size = TMDB_WIDTHS.find((w) => w >= width);
    return `https://image.tmdb.org/t/p/${size ? `w${size}` : "original"}${src}`;
};

type PosterProps = {
    path: string;
    alt: string;
    sizes: string;
    className?: string;
};

export function Poster({ path, alt, sizes, className = "" }: PosterProps) {
    return <Image loader={tmdbLoader} src={path} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} />;
}
