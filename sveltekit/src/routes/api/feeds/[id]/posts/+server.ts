import { services } from "$lib/index.server";
import type { RequestHandler } from "@sveltejs/kit";
import { getSessionOrThrow } from "../../../(utils)/session";
import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import { respondJSON } from "../../../(utils)/RequestHandlers/response";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  const { id: feedId } = getPathVariables<{ id: string }>(request);

  return respondJSON<tpost.PostStats[] | null>({
    data: await services.feed.getPostsById(feedId, session.user.id),
  });
};
