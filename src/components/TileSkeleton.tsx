import React from "react";

export const TileSkeleton = () => {
    return (
        <div role="status" className="max-w-sm animate-pulse w-full">
            <div className="flex flex-col rounded-2xl overflow-hidden relative h-[320px] w-full min-w-[187px] bg-gray-200 dark:bg-gray-700 "></div>
        </div>
    );
};
