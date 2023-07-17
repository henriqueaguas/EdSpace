import { error, type RequestEvent } from "@sveltejs/kit";

export async function getSessionOrNull(
  request: RequestEvent,
): Promise<App.Session | null> {
  return request.locals.getSession();
}

export async function getSessionOrThrow(
  request: RequestEvent,
): Promise<App.Session> {
  const session = await request.locals.getSession();

  if (!session) {
    throw error(401, {
      name: "Unauthenticated",
      message: "Please authenticate first",
    });
  }

  return session;
}
