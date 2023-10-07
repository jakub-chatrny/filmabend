import Error from "@filmabend/app/global-error";

export * from "./tmdb";

export type ErrorComponentProps = { error: Error & { digest?: string }; reset: () => void };
