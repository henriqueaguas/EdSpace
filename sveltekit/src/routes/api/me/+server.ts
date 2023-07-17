import type { RequestHandler } from "./$types";
import { services } from "$lib/index.server";
import { getFormDataBody } from "../(utils)/RequestHandlers/getBody";
import { respondNoBody, respondJSON } from "../(utils)/RequestHandlers/response";
import { getSessionOrThrow } from "../(utils)/session";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  return respondJSON<tuser.UserPrivateStats>({
    data: await services.me.get(session.user.id),
  });
};

export const DELETE: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  return respondJSON<string>({
    data: await services.me.delete(session.user.id),
  });
};

export const PATCH: RequestHandler = async (request) => {
  const session = await getSessionOrThrow(request);

  const { metadata: { name }, files } = await getFormDataBody<{ name?: string }>(request);

  const image: Blob | undefined = files[0]

  await services.me.update(session.user.id, image, name)

  return respondNoBody();
};
