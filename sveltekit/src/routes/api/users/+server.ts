import type { RequestHandler } from "./$types";
import { services } from "$lib/index.server";
import { getQueryString } from "../(utils)/RequestHandlers/getQueryString";
import { getJsonBody } from "../(utils)/RequestHandlers/getBody";
import { respondJSON } from "../(utils)/RequestHandlers/response";
import { getSessionOrNull } from "../(utils)/session";
import type { ResultWithPaging } from "$lib/utils/Paging";

export const POST: RequestHandler = async (request) => {
  const { name, email } = await getJsonBody<{
    name: string;
    email: string;
  }>(
    request,
  );

  const newUserId = await services.user.create({ name, email });

  return respondJSON<string>({
    status: 201,
    headers: {
      Location: `/api/users/${newUserId}`,
    },
    data: newUserId,
  });
};

export const GET: RequestHandler = async (request) => {
  const session = await getSessionOrNull(request);

  const { q, skip, take } = getQueryString<{
    q: string;
    skip?: number;
    take?: number;
    topics?: string[];
  }>(request, {
    q: "string",
    skip: "number?",
    take: "number?",
    topics: "string[]?",
  });

  return respondJSON<ResultWithPaging<tuser.UserPublicStatsMy>>({
    data: await services.user.search({
      q: q,
      unparsedPaging: { skip, take },
      myUserId: session?.user.id,
    }),
  });
};
