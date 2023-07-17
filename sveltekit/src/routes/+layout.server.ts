import type { LayoutServerLoad } from "./$types";

// Passes session down to all pages
export const load: LayoutServerLoad = async (event) => {
  return {
    session: await event.locals.getSession(),
  };
};
