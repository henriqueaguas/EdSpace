import { services } from "$lib/index.server";
import { getSessionOrNull } from "../../api/(utils)/session";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (request) => {
  const session = await getSessionOrNull(request);

  const post = await services.post.byId(
    request.params.id,
    {
      pages: true,
    },
    session?.user.id,
  );

  const followsAuthor = session?.user !== undefined
    ? await services.user.isFollowedByUser(
      post.metadata.author.id,
      session?.user.id,
    )
    : undefined;

  return { post, followsAuthor };
};
