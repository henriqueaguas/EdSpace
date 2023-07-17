import type { RequestEvent } from "@sveltejs/kit";
import {
  type HttpInput,
  type HttpOutput,
  type HttpSchema,
  parseHttpInput,
} from "./parseHttpInput";

export function getQueryString<T extends HttpOutput>(
  request: RequestEvent,
  schema?: HttpSchema<T>,
) {
  return parseHttpInput<T>(
    Object.fromEntries(
      request.url.searchParams.entries(),
    ) as HttpInput,
    schema,
  );
}
