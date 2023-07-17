import type { RequestHandler } from "@sveltejs/kit";
import { getSessionOrThrow } from "../../../(utils)/session";
import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import { respondJSON } from "../../../(utils)/RequestHandlers/response";
import { services } from "../../../../../lib/index.server";

export const POST: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);
  const { id: topicId } = getPathVariables<{ id: string }>(request);

  return respondJSON<void>({
    data: await services.topic.follow(topicId, session.user.id),
  });
};
