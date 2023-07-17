import type { RequestEvent } from "@sveltejs/kit";
import {
  type HttpInput,
  type HttpOutput,
  type HttpSchema,
  parseHttpInput,
} from "./parseHttpInput";

export function getPathVariables<T extends HttpOutput>(
  request: RequestEvent,
  schema?: HttpSchema<T>,
) {
  const pathVariables = request.params as HttpInput;
  return parseHttpInput<T>(pathVariables, schema);
}
