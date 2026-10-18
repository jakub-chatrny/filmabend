export function formatRuntime(minutes: number | null) {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours ? `${hours}h ${rest}m` : `${rest}m`;
}

export function csfdUrl(title: string) {
    return `https://www.csfd.cz/hledat/?q=${encodeURIComponent(title)}`;
}

export function imdbUrl(imdbId: string | null, title: string) {
    return imdbId ? `https://www.imdb.com/title/${imdbId}/` : `https://www.imdb.com/find/?q=${encodeURIComponent(title)}`;
}
