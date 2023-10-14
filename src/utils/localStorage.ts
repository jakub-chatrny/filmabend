export const getLocalStorageItem = (key: string) => {
    return typeof window === undefined ? null : localStorage.getItem(key);
};

export const setLocalStorageItem = (key: string, value: string) => {
    return typeof window !== undefined && localStorage && localStorage.setItem(key, value);
};
