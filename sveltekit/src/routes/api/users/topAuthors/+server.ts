import { services } from "$lib/index.server";
import type { RequestHandler } from "@sveltejs/kit";
import { getQueryString } from "../../(utils)/RequestHandlers/getQueryString";
import { respondJSON } from "../../(utils)/RequestHandlers/response";
import { getSessionOrThrow } from "../../(utils)/session";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request)

  const { topics } = getQueryString<{
    topics: string[];
  }>(request, {
    topics: "string[]",
  });

  return respondJSON<tuser.UserPublicStats[]>({
    data: await services.user.getTopAuthorsForTopics(topics, session.user.id),
  });
};
