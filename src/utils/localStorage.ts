export const getLocalStorageItem = (key: string) => {
    if (typeof window === "undefined") {
        return null; // Return null when running on the server
    }
    return localStorage.getItem(key);
};
export const setLocalStorageItem = (key: string, value: string) => {
    return typeof window !== undefined && localStorage && localStorage.setItem(key, value);
};
