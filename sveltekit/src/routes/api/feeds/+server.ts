import { services } from "$lib/index.server";
import type { RequestHandler } from "@sveltejs/kit";
import { respondJSON } from "../(utils)/RequestHandlers/response";
import { getSessionOrThrow } from "../(utils)/session";
import { getJsonBody } from "../(utils)/RequestHandlers/getBody";

export const POST: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  const { name, topics, authors } = await getJsonBody<
    { name: string; topics?: string[]; authors?: string[] }
  >(request);

  return respondJSON<tfeed.Feed>({
    data: await services.feed.create(
      session.user.id,
      name,
      topics,
      authors,
    ),
  });
};

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  return respondJSON<tfeed.Feed[]>({
    data: await services.feed.getUserFeeds(
      session.user.id,
    ),
  });
};
