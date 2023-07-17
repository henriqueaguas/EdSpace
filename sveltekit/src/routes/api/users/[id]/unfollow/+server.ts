import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import type { RequestHandler } from "@sveltejs/kit";
import { getSessionOrThrow } from "../../../(utils)/session";
import { services } from "$lib/index.server";
import { respondJSON } from "../../../(utils)/RequestHandlers/response";

export const POST: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);
  const { id: userId } = getPathVariables<{ id: string }>(request);

  return respondJSON<void>({
    data: await services.user.unfollow(session.user.id, userId),
  });
};
