import type { RequestHandler } from "@sveltejs/kit";
import { getPathVariables } from "../../(utils)/RequestHandlers/getPathVariables";
import { respondJSON } from "../../(utils)/RequestHandlers/response";
import { services } from "../../../../lib/index.server";
import { getSessionOrNull } from "../../(utils)/session";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrNull(request);

  const { id: topicId } = getPathVariables<{ id: string }>(request);

  return respondJSON<ttopic.TopicStatsMy>({
    data: await services.topic.byId(topicId, session?.user.id),
  });
};
