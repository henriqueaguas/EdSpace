import { services } from "$lib/index.server";
import type { RequestHandler } from "@sveltejs/kit";
import { respondJSON } from "../../(utils)/RequestHandlers/response";
import { getSessionOrThrow } from "../../(utils)/session";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  return respondJSON<boolean>({
    data: await services.me.hasCompletedSignUp(session.user.id),
  });
};

export const POST: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  return respondJSON<void>({
    data: await services.me.completeSignUp(session.user.id),
  });
};
