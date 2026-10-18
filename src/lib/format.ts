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

const TIME_ZONE = "Europe/Prague";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Calendar date in Prague, so "today" and the shown date don't depend on the server or phone time zone */
function pragueDate(date: Date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "numeric",
        day: "numeric",
    }).formatToParts(date);
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    return { year: get("year"), month: get("month"), day: get("day") };
}

// "před" takes the instrumental: před 1 rokem, 2 roky, 5 lety …
const UNITS = [
    { days: 365, one: "rokem", few: "roky", many: "lety" },
    { days: 30, one: "měsícem", few: "měsíci", many: "měsíci" },
    { days: 7, one: "týdnem", few: "týdny", many: "týdny" },
    { days: 1, one: "dnem", few: "dny", many: "dny" },
];

/**
 * "Viděno před / 1 rokem / 2 týdny / 3 dny" + "23. 2. 2012" for the seen cards.
 * Shows at most three units, largest first.
 */
export function seenAgo(seenAt: string, now: number) {
    const seen = pragueDate(new Date(seenAt));
    const today = pragueDate(new Date(now));
    let days = Math.round((Date.UTC(today.year, today.month - 1, today.day) - Date.UTC(seen.year, seen.month - 1, seen.day)) / DAY_MS);
    const date = `${seen.day}. ${seen.month}. ${seen.year}`;

    if (days <= 0) return { lines: ["Viděno", "dnes"], date };
    if (days === 1) return { lines: ["Viděno", "včera"], date };

    const lines: string[] = [];
    for (const unit of UNITS) {
        const count = Math.floor(days / unit.days);
        days -= count * unit.days;
        if (count > 0 && lines.length < 3) {
            lines.push(`${count} ${count === 1 ? unit.one : count < 5 ? unit.few : unit.many}`);
        }
    }
    return { lines: ["Viděno před", ...lines], date };
}
