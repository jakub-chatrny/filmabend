"use client";
import { FC } from "react";
import { ErrorComponentProps } from "@filmabend/types";

const GlobalError: FC<ErrorComponentProps> = ({ error, reset }) => (
    <div>
        <h2>Something went wrong!</h2>
        <h3>{error.digest}</h3>
        <button
            onClick={
                // Attempt to recover by trying to re-render the segment
                () => reset()
            }
        >
            Try again
        </button>
    </div>
);

export default GlobalError;
