import { services } from "$lib/index.server";
import { getPathVariables } from "../../(utils)/RequestHandlers/getPathVariables";
import { getQueryString } from "../../(utils)/RequestHandlers/getQueryString";
import type { RequestHandler } from "../$types";
import { getSessionOrThrow } from "../../(utils)/session";
import { respondJSON } from "../../(utils)/RequestHandlers/response";

export const GET: RequestHandler = async (request) => {
  const { id: postId } = getPathVariables<{ id: string }>(request);
  const { pages } = getQueryString<{
    pages?: boolean;
  }>(request, {
    pages: "boolean?",
  });

  return respondJSON<svct.outputs.post.ById<"no-pages">>({
    data: await services.post.byId(postId, {
      pages,
    }),
  });
};

export const DELETE: RequestHandler = async (request) => {
  const {
    user: { id: userId },
  } = await getSessionOrThrow(request);

  const { id: postId } = getPathVariables<{ id: string }>(request);

  return respondJSON<string>({
    data: await services.post.delete(postId, userId),
  });
};
