/** Lowercase without diacritics, so "zivoty" finds "Životy těch druhých" */
export function normalizeForSearch(text: string) {
    return text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
}

/** Every word of the query has to appear somewhere in the movie's search text */
export function matchesSearch(searchText: string, query: string) {
    const words = normalizeForSearch(query).split(/\s+/).filter(Boolean);
    return words.every((word) => searchText.includes(word));
}
