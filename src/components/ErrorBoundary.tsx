"use client";
import { Component, ComponentType, ReactNode } from "react";
import { ErrorComponentProps } from "@filmabend/types";

type ErrorBoundaryProps = {
    fallback: ComponentType<ErrorComponentProps>;
    children: ReactNode;
};

type ErrorBoundaryState = {
    error?: Error;
};

type ErrorWithDigest = Error & { digest?: string };
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { error: undefined };
    }

    static getDerivedStateFromError(error: ErrorWithDigest) {
        // Update state so the next render will show the fallback UI.
        return { error };
    }

    componentDidCatch(error: ErrorWithDigest, info: { componentStack: string }) {
        console.log("ErrorBoundary caught an error:", error, info.componentStack);
        console.error(error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            const FallBackComponent = this.props.fallback;

            return <FallBackComponent error={this.state.error} reset={() => {}} />;
        }

        return this.props.children;
    }
}
