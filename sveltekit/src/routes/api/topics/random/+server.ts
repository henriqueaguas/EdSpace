import { services } from "$lib/index.server";
import type { RequestHandler } from "@sveltejs/kit";
import { respondJSON } from "../../(utils)/RequestHandlers/response";
import { getSessionOrThrow } from "../../(utils)/session";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request)

  return respondJSON<ttopic.TopicStats[]>({
    data: await services.topic.get10Random(session?.user.id),
  });
};
