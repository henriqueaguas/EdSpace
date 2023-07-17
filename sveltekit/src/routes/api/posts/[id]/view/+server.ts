import type { RequestHandler } from "@sveltejs/kit";
import { getSessionOrThrow } from "../../../(utils)/session";
import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import { services } from "../../../../../lib/index.server";
import { respondJSON } from "../../../(utils)/RequestHandlers/response";

export const POST: RequestHandler = async (request) => {
  const {
    user: { id: userId },
  } = await getSessionOrThrow(request);

  const { id: postId } = getPathVariables<{ id: string }>(request);

  return respondJSON<void>({
    status: 204,
    data: await services.post.view(postId, userId),
  });
};
