import { services } from "$lib/index.server";
import { getPathVariables } from "../../(utils)/RequestHandlers/getPathVariables";
import type { RequestHandler } from "@sveltejs/kit";
import { respondJSON } from "../../(utils)/RequestHandlers/response";
import { getSessionOrNull } from "../../(utils)/session";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrNull(request);

  const { id: userId } = getPathVariables<{ id: string }>(request);

  return respondJSON<tuser.UserPublicStatsMy>({
    data: await services.user.publicById(userId, session?.user.id),
  });
};
