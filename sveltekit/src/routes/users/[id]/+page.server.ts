import { services } from "$lib/index.server";
import { getSessionOrNull } from "../../api/(utils)/session";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (request) => {
  const session = await getSessionOrNull(request);

  if (session && request.params.id === session.user.id) {
    return {
      user: await services.me.get(session?.user.id),
    }
  } else {
    return {
      user: await services.user.publicById(request.params.id, session?.user.id),
    };
  }
};
