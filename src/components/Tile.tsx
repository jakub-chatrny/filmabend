import React from "react";
import Image from "next/image";
import { Link } from "./Link";

type TileProps = {
    title: string;
    releaseDate: string;
    posterUrl: string;
};
export const Tile = ({ title, releaseDate, posterUrl }: TileProps) => {
    return (
        <div className="group flex flex-col rounded-2xl overflow-hidden relative h-[320px] w-full min-w-[187px] bg-gray-15 drop-shadow border-2 border-black hover:border-primary hover:cursor-pointer">
            {posterUrl && (
                <Image
                    src={`https://image.tmdb.org/t/p/w300${posterUrl}`}
                    alt={title}
                    style={{ width: "auto" }}
                    width={300}
                    height={240}
                    priority={false}
                />
            )}
            <div className="absolute flex flex-col h-full w-full">
                <div className="flex flex-auto flex-row-reverse p-2 group-hover:bg-primary-25">
                    <div className="border-2 border-transparent group-hover:border-primary rounded-full w-5 h-5" />
                </div>
                <div className="flex flex-col bg-primary-pale text-black pt-3 pb-3 pl-5 pr-5 min-h-[112px] w-full group-hover:bg-primary-lightest">
                    <h4 className="text-l flex-auto font-bold">{title}</h4>
                    <div className="flex flex-col gap-1 text-xs">
                        <div className="text-gray-40">2h 12m{releaseDate && ` | ${releaseDate.split("-")[0]}`}</div>
                        <div>
                            <Link href="https://www.csfd.cz">ČSFD</Link> 84% | <Link href="https://www.imdb.cz">IMDB</Link> 7.9/10
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
