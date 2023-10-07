import { TMDB_BASE_URL, TMDB_REQUEST_OPTIONS } from "@filmabend/utils/tmdb";

enum HTTPStatus {
    OK = 200,
    BAD_REQUEST = 400,
    INTERNAL_ERROR = 500,
}

export const GET = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    try {
        if (!searchParams.get("query")) {
            return new Response(null, { status: HTTPStatus.BAD_REQUEST, statusText: "Bad request" });
        }
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?query=${searchParams.get("query")}`, TMDB_REQUEST_OPTIONS);
        const data = await response.json();

        return new Response(JSON.stringify(data), { status: HTTPStatus.OK });
    } catch (e) {
        console.error(e);
        return new Response(null, { status: HTTPStatus.INTERNAL_ERROR, statusText: "InternalError" });
    }
};
