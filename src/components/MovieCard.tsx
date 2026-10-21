import Image from "next/image";
import { Poster } from "@/components/Poster";
import { UnmarkButton } from "@/components/UnmarkButton";
import { csfdUrl, formatRuntime, imdbUrl } from "@/lib/format";

export type MovieCardData = {
    title: string;
    originalTitle: string | null;
    releaseYear: number | null;
    runtimeMinutes: number | null;
    posterPath: string | null;
    imdbId: string | null;
    rating: number | null;
};

type MovieCardProps = {
    movie: MovieCardData;
    selected?: boolean;
    /** Search results show the year next to the title to tell remakes apart */
    yearInTitle?: boolean;
    badge?: string;
    /** Hover shows the selection ring; off for movies that can't be picked */
    selectable?: boolean;
    /** "Viděno před …" overlay from the Figma seen state, see seenAgo() */
    seen?: { lines: string[]; date: string };
    /** Shows a "back to unseen" button on the seen overlay */
    onUnmark?: () => void;
};

const CARD_SIZES =
    "(min-width: 3520px) 360px, (min-width: 2560px) 280px, (min-width: 1920px) 240px, (min-width: 1536px) 220px, (min-width: 640px) 187px, 50vw";

/** "Cardtall" from Figma */
export function MovieCard({ movie, selected = false, yearInTitle = false, badge, selectable = true, seen, onUnmark }: MovieCardProps) {
    const runtime = formatRuntime(movie.runtimeMinutes);
    const rating = movie.rating && `★ ${movie.rating}`;
    const details = [runtime, !yearInTitle && movie.releaseYear, rating].filter(Boolean).join(" | ");
    const searchTitle = movie.originalTitle ?? movie.title;

    return (
        <div
            className={`group relative flex aspect-187/266 w-full flex-col overflow-hidden rounded-[15px] border-2 bg-gray-15 shadow-card transition-colors ${
                selected ? "border-primary" : selectable ? "border-transparent hover:border-primary" : "border-transparent"
            }`}
        >
            <div className="relative flex-1 bg-linear-to-b from-gray-15 via-gray-15/75 to-gray-15/50">
                {movie.posterPath && <Poster path={movie.posterPath} alt="" sizes={CARD_SIZES} />}
                <div className="absolute inset-0 shadow-[inset_0_58px_58px_0_rgb(0_0_0/0.25)]" />
                {selected && <div className="absolute inset-0 bg-primary/25 backdrop-blur-[1px]" />}
                {seen && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/50 px-2 text-center [text-shadow:0_1px_3px_rgb(0_0_0/0.7)]">
                        <p className="text-sm text-primary-lightest">{seen.lines[0]}</p>
                        {seen.lines.slice(1).map((line) => (
                            <p key={line} className="text-base leading-snug font-bold text-primary-pale sm:text-lg">
                                {line}
                            </p>
                        ))}
                        <p className="mt-2 text-xs text-primary-lightest">{seen.date}</p>
                        {onUnmark && <UnmarkButton onConfirm={onUnmark} />}
                    </div>
                )}
                {badge && (
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-black/80 px-2 py-0.5 text-xs font-semibold text-primary-pale">
                        {badge}
                    </span>
                )}
                <div className="absolute top-2.5 right-2.5 size-6">
                    {selected ? (
                        <Image src="/icons/check-circle.svg" alt="Vybráno" width={26} height={26} className="-m-px max-w-none" />
                    ) : (
                        selectable && (
                            <Image
                                src="/icons/select-ring.svg"
                                alt=""
                                width={26}
                                height={26}
                                className="-m-px hidden max-w-none group-hover:block"
                            />
                        )
                    )}
                </div>
            </div>
            <div
                className={`flex min-h-28 flex-col justify-between gap-2 px-4 py-2.5 text-black sm:px-5 ${
                    selected || seen
                        ? "bg-primary-lightest"
                        : selectable
                          ? "bg-primary-pale group-hover:bg-primary-lightest"
                          : "bg-primary-pale"
                }`}
            >
                <h3 className="line-clamp-2 text-base leading-tight font-bold sm:text-xl 4xl:text-2xl">
                    {movie.title}
                    {yearInTitle && movie.releaseYear && ` (${movie.releaseYear})`}
                </h3>
                <div className="flex flex-col gap-1 text-xs 4xl:text-sm">
                    {details && (
                        <p className="truncate text-gray-40" title={rating ? "Hodnocení TMDB" : undefined}>
                            {details}
                        </p>
                    )}
                    <p>
                        <a href={csfdUrl(searchTitle)} target="_blank" rel="noreferrer" className="text-primary underline">
                            ČSFD
                        </a>
                        {" | "}
                        <a href={imdbUrl(movie.imdbId, searchTitle)} target="_blank" rel="noreferrer" className="text-primary underline">
                            IMDB
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

/** Empty slot with a clapperboard, shown before there are results */
export function PlaceholderCard({ loading = false, className = "" }: { loading?: boolean; className?: string }) {
    return (
        <div
            className={`flex aspect-187/266 w-full items-center justify-center rounded-[15px] bg-gray-15 ${loading ? "animate-pulse" : ""} ${className}`}
        >
            <Image src="/icons/clapperboard.svg" alt="" width={48} height={48} />
        </div>
    );
}

const GRIDS = {
    // 2 columns on phones, 4 on the 800px desktop column like in Figma, more on big and 4K screens
    // Off-screen cards skip layout and paint (content-visibility); the placeholder height is
    // replaced by the real one once a card has been rendered
    library:
        "grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-[18px] 2xl:grid-cols-6 2xl:gap-6 3xl:grid-cols-7 4xl:grid-cols-8 4xl:gap-7 5xl:grid-cols-9 5xl:gap-8 *:[content-visibility:auto] *:[contain-intrinsic-block-size:auto_360px]",
    // The pick screen keeps the four slots from Figma, the cards just grow
    pick: "grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-[18px] 2xl:gap-8",
} as const;

export function CardGrid({ children, variant = "library" }: { children: React.ReactNode; variant?: keyof typeof GRIDS }) {
    return <div className={`grid ${GRIDS[variant]}`}>{children}</div>;
}
