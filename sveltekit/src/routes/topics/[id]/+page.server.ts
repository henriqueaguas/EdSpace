import { services } from "$lib/index.server";
import type { ServerLoad } from "@sveltejs/kit";
import { getSessionOrNull } from "../../api/(utils)/session";

export const load: ServerLoad = async (request) => {
  const session = await getSessionOrNull(request);
  const topic = await services.topic.byId(request.params.id!, session?.user.id);

  return {
    topic,
  };
};
