import type { RequestHandler } from "./$types";
import { services } from "$lib/index.server";
import { getPathVariables } from "../../(utils)/RequestHandlers/getPathVariables";
import { respondJSON } from "../../(utils)/RequestHandlers/response";
import { getSessionOrThrow } from "../../(utils)/session";
import { getJsonBody } from "../../(utils)/RequestHandlers/getBody";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  const { id: feedId } = getPathVariables<{ id: string }>(request);

  const [feed, topics, authors] = await Promise.all([
    services.feed.byId(feedId, session.user.id),
    services.feed.getTopics(request.params.id, session.user.id),
    services.feed.getAuthors(request.params.id, session.user.id),
  ]);

  return respondJSON<{
    feed: tfeed.Feed;
    topics: ttopic.TopicStats[];
    authors: tuser.UserPublicStats[];
  }>({
    data: { feed, topics, authors },
  });
};

export const DELETE: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  const { id: feedId } = getPathVariables<{ id: string }>(request);

  return respondJSON<void>({
    data: await services.feed.delete(feedId, session.user.id),
  });
};

export const PATCH: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  const { id: feedId } = getPathVariables<{ id: string }>(request);

  const { name, topics, authors } = await getJsonBody<
    { name?: string; topics?: string[]; authors?: string[] }
  >(request);

  return respondJSON<svct.outputs.feed.Update>({
    data: await services.feed.update(
      feedId,
      session.user.id,
      name,
      topics,
      authors,
    ),
  });
};
