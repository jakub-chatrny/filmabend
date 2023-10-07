import { TileSkeleton } from "@filmabend/components";

export const createInterval = (max: number, min = 0): Array<number> => new Array(max - min).fill(0).map((_, i) => i + min);

const Loading = () => (
    <>
        {createInterval(20).map((index) => (
            <TileSkeleton key={index} />
        ))}
    </>
);

export default Loading;
