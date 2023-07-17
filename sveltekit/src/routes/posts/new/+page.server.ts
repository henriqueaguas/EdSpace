import { redirect } from "@sveltejs/kit";
import { getSessionOrNull } from "../../api/(utils)/session";
import type { PageServerLoad } from "../[id]/$types";

export const load: PageServerLoad = async (request) => {
  const session = await getSessionOrNull(request);
  if (!session) {
    throw redirect(301, "/auth?callback=/posts/new");
  }
};
