import SearchResultsPage from "./results/page";
import { Headline } from "@filmabend/components";

export default async function Search() {
    return (
        <div className="flex flex-col pt-2 gap-4 w-full">
            <Headline>Vyhledání filmu</Headline>
            <SearchResultsPage />
        </div>
    );
}
