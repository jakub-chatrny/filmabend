"use client";

import React, { FC, useEffect, useState } from "react";
import { TMDBSearchResults } from "@filmabend/types";
import { TextInput, Tile } from "@filmabend/components";
import Loading from "./loading";

type SearchResultsProps = {};

const SearchResultsPage: FC<SearchResultsProps> = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("terminator");
    const [searchTimeout, setSearchTimeout] = useState<any | null>(null);
    const [searchResults, setSearchResults] = useState<TMDBSearchResults | null>(null);

    const fetchMovies = async () =>
        fetch(`/api/movie/search?query=${searchQuery}`)
            .then((response) => response.json())
            .then((searchResults) => {
                if (searchResults.results !== undefined) setSearchResults(searchResults);
                setIsSubmitting(false);
            });

    const handleSearchChange = (newSearchQuery: string) => {
        clearTimeout(searchTimeout);
        setSearchQuery(newSearchQuery);

        // debounce method
        setSearchTimeout(
            setTimeout(() => {
                fetchMovies();
            }, 500),
        );
    };

    useEffect(() => {
        fetchMovies();
        // throw new Error("test");
    }, []);

    return (
        <>
            <TextInput label="Název filmu" placeholder="Zadejte název filmu..." value={searchQuery} onChange={handleSearchChange} />

            <div className="grid lg:grid-cols-5  md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-1 place-items-center gap-[17px]">
                {searchResults?.results.map(({ id, title, release_date, poster_path }) => (
                    <Tile key={id} title={title} releaseDate={release_date} posterUrl={poster_path} />
                ))}
                {isSubmitting && <Loading />}
            </div>
        </>
    );
};

export default SearchResultsPage;
