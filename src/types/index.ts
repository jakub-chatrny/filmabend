import Error from "@filmabend/app/global-error";

export * from "./tmdb";
export * from "./database";
export type ErrorComponentProps = { error: Error & { digest?: string }; reset: () => void };
