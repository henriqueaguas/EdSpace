import { services } from "$lib/index.server";
import type { RequestHandler } from "@sveltejs/kit";
import { respondJSON } from "../../../(utils)/RequestHandlers/response";
import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import type { ResultWithPaging } from "$lib/utils/Paging";

export const GET: RequestHandler = async (request) => {
  const { id } = getPathVariables<{ id: string }>(request);

  return respondJSON<ResultWithPaging<ttopic.TopicStatsMy>>({
    data: await services.topic.followedByUser(id),
  });
};
