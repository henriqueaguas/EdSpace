import type { RequestHandler } from "./$types";
import { services } from "$lib/index.server";
import { getQueryString } from "../../(utils)/RequestHandlers/getQueryString";
import { respondJSON } from "../../(utils)/RequestHandlers/response";
import { getSessionOrNull } from "../../(utils)/session";
import type { ResultWithPaging } from "$lib/utils/Paging";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrNull(request);

  const { topicId, skip, take } = getQueryString<{
    topicId?: string;
    skip?: number;
    take?: number;
  }>(request, {
    topicId: "string?",
    skip: "number?",
    take: "number?",
  });

  return respondJSON<ResultWithPaging<tuser.UserPublicStatsMy>>({
    data: await services.user.ranking({
      topicId: topicId,
      unparsedPaging: { skip, take },
      myUserId: session?.user.id,
    }),
  });
};
