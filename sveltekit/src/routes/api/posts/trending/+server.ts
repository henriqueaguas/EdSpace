import type { RequestHandler } from "@sveltejs/kit";
import { getQueryString } from "../../(utils)/RequestHandlers/getQueryString";
import { respondJSON } from "../../(utils)/RequestHandlers/response";
import { services } from "$lib/index.server";

export const GET: RequestHandler = async (request) => {
  const { timing, topics } = getQueryString<{
    timing: string;
    topics?: string[];
  }>(request, {
    topics: "string[]?",
    timing: "string",
  });

  return respondJSON<tpost.PostStats[]>({
    data: await services.post.trending(
      timing as svct.inputs.post.PossibleDates,
      topics,
    ),
  });
};
