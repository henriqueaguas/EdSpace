import type { RequestHandler } from "./$types";
import { services } from "$lib/index.server";
import { respondJSON } from "../../(utils)/RequestHandlers/response";
import { getSessionOrThrow } from "../../(utils)/session";
import { getJsonBody } from "../../(utils)/RequestHandlers/getBody";
import type { ResultWithPaging } from "$lib/utils/Paging";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  return respondJSON<ResultWithPaging<tpost.PostStats>>({
    data: await services.me.savedPosts(session.user.id),
  });
};

export const POST: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  const { post_id: postId } = await getJsonBody<{ post_id: string }>(request);

  return respondJSON<void>({
    data: await services.me.addToSavedPosts(session.user.id, postId),
  });
};

export const DELETE: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  const { post_id: postId } = await getJsonBody<{ post_id: string }>(request);

  return respondJSON<void>({
    data: await services.me.deleteFromSavedPosts(session.user.id, postId),
  });
};
