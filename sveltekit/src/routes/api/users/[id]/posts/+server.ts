import { services } from "$lib/index.server";
import type { RequestHandler } from "./$types";
import { getPathVariables } from "../../../(utils)/RequestHandlers/getPathVariables";
import { getQueryString } from "../../../(utils)/RequestHandlers/getQueryString";
import { respondJSON } from "../../../(utils)/RequestHandlers/response";
import type { ResultWithPaging } from "$lib/utils/Paging";

export const GET: RequestHandler = async (request) => {
  const { id: userId } = getPathVariables<{ id: string }>(request);
  const { skip, take } = getQueryString<{ skip?: number; take?: number }>(
    request,
    {
      take: "number?",
      skip: "number?",
    },
  );

  const data = await services.post.fromUser(userId, { skip, take });

  return respondJSON<ResultWithPaging<tpost.PostStats>>({
    data: data,
  });
};
