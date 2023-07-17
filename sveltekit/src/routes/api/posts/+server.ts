import { getFormDataBody } from "../(utils)/RequestHandlers/getBody";
import { services } from "../../../lib/index.server";
import { getSessionOrThrow } from "../(utils)/session";
import { respondJSON } from "../(utils)/RequestHandlers/response";
import { getQueryString } from "../(utils)/RequestHandlers/getQueryString";
import type { RequestHandler } from "./$types";
import type { ResultWithPaging } from "$lib/utils/Paging";

export const POST: RequestHandler = async (request) => {
  const { user } = await getSessionOrThrow(request);
  const userId = user.id;

  const {
    metadata: { title, description, difficulty, topics },
    files: postPages,
  } = await getFormDataBody<{
    title: string;
    description?: string;
    difficulty?: tpost.Difficulty;
    topics: string[];
  }>(request);

  const newPostId = await services.post.create(
    userId,
    {
      title,
      description: description || null,
      difficulty: difficulty || null,
      topics,
    },
    postPages,
  );

  return respondJSON<string>({
    status: 201,
    headers: {
      Location: `/api/posts/${newPostId}`,
    },
    data: newPostId,
  });
};

/**
 * Search for posts
 *
 * Authentication: Not Required
 *
 * Query String
 *  - q: string (optional)
 *  - skip?: number
 *  - take?: number
 *  - hasTopics?: string[]
 *  - difficulty?: Difficulty
 *
 * Returns
 *  200
 *  ResultWithPaging<Post>
 */
export const GET: RequestHandler = async (request) => {
  const { q, skip, take, hasTopics, difficulty } = getQueryString<{
    q?: string;
    skip?: number;
    take?: number;
    hasTopics?: string[];
    difficulty?: string;
  }>(request, {
    q: "string?",
    skip: "number?",
    take: "number?",
    hasTopics: "string[]?",
    difficulty: "string?",
  });

  return respondJSON<ResultWithPaging<tpost.PostStats>>({
    data: await services.post.search({
      q: q,
      paging: { skip, take },
      filter: {
        hasTopics,
        difficulty: difficulty as tpost.Difficulty | undefined,
      },
    }),
  });
};
