import type { RequestHandler } from "@sveltejs/kit";
import { getSessionOrThrow } from "../../../(utils)/session";
import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import { services } from "../../../../../lib/index.server";
import { getJsonBody } from "../../../(utils)/RequestHandlers/getBody";
import { respondJSON } from "../../../(utils)/RequestHandlers/response";

export const POST: RequestHandler = async (request) => {
  const {
    user: { id: userId },
  } = await getSessionOrThrow(request);

  const { id: postId } = getPathVariables<{ id: string }>(request);
  const { rating } = await getJsonBody<{ rating: number }>(
    request,
  );

  return respondJSON<void>({
    status: 204,
    data: await services.post.rate(postId, userId, rating),
  });
};
