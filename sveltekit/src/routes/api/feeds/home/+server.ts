import { services } from "$lib/index.server";
import type { RequestHandler } from "@sveltejs/kit";
import { getSessionOrThrow } from "../../(utils)/session";
import { getQueryString } from "../../(utils)/RequestHandlers/getQueryString";
import { respondJSON } from "../../(utils)/RequestHandlers/response";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  const { topics, authors } = getQueryString<
    { topics?: string[]; authors?: string[] }
  >(request, {
    topics: "string[]?",
    authors: "string[]?",
  });

  return respondJSON<tpost.PostStats[]>({
    data: await services.feed.getRecommendedForUser(
      session.user.id,
      topics,
      authors,
    ),
  });
};
