import { services } from "$lib/index.server";
import type { RequestHandler } from "@sveltejs/kit";
import { getJsonBody } from "../../../(utils)/RequestHandlers/getBody";
import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import { respondNoBody } from "../../../(utils)/RequestHandlers/response";
import { getSessionOrThrow } from "../../../(utils)/session";

export const POST: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  const { id: feedId } = getPathVariables<{ id: string }>(request);

  const { otherFeedId } = await getJsonBody<{ otherFeedId: string }>(request);

  await services.feed.swapPosition(feedId, otherFeedId, session.user.id);

  return respondNoBody();
};
