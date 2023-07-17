import type { RequestHandler } from "@sveltejs/kit";
import { getSessionOrThrow } from "../../../(utils)/session";
import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import { services } from "$lib/index.server";
import { respondJSON } from "../../../(utils)/RequestHandlers/response";

export const POST: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);
  const { id: userId } = getPathVariables<{ id: string }>(request);

  return respondJSON<void>({
    data: await services.user.follow(session.user.id, userId),
  });
};
