import { services } from "$lib/index.server";
import type { RequestHandler } from "@sveltejs/kit";
import { getSessionOrNull } from "../../../(utils)/session";
import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import { respondJSON } from "../../../(utils)/RequestHandlers/response";
import { getQueryString } from "../../../(utils)/RequestHandlers/getQueryString";
import type { ResultWithPaging } from "$lib/utils/Paging";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrNull(request);

  const { id: userId } = getPathVariables<{ id: string }>(request);

  const { skip, take } = getQueryString<{ skip?: number; take?: number }>(
    request,
    {
      skip: "number?",
      take: "number?",
    },
  );

  return respondJSON<ResultWithPaging<tuser.UserPublicStatsMy>>({
    data: await services.user.followers(
      userId,
      { skip, take },
      session?.user.id,
    ),
  });
};
