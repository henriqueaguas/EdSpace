import { getSessionOrThrow } from "../../../(utils)/session";
import type { RequestHandler } from "@sveltejs/kit";
import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import { respondJSON } from "../../../(utils)/RequestHandlers/response";
import { services } from "../../../../../lib/index.server";

export const POST: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);
  const { id: topicId } = getPathVariables<{ id: string }>(request);

  return respondJSON<void>({
    data: await services.topic.unfollow(topicId, session.user.id),
  });
};
