import type { RequestHandler } from "@sveltejs/kit";
import { getQueryString } from "../(utils)/RequestHandlers/getQueryString";
import { respondJSON } from "../(utils)/RequestHandlers/response";
import { services } from "../../../lib/index.server";
import { getSessionOrNull } from "../(utils)/session";
import type { ResultWithPaging } from "$lib/utils/Paging";

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrNull(request);

  const { q, skip, take } = getQueryString<{
    q?: string;
    skip?: number;
    take?: number;
  }>(request, {
    "q": "string?",
    skip: "number?",
    take: "number?",
  });

  return respondJSON<ResultWithPaging<ttopic.TopicStatsMy>>({
    data: await services.topic.search({
      q: q,
      paging: { skip, take },
      myUserId: session?.user.id,
    }),
  });
};
