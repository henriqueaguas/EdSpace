import { json, text } from "@sveltejs/kit";
import type { HttpResponseHeaders } from "../HttpHeaders";

export function respondJSON<T>({
  data,
  status = 200,
  headers,
}: {
  data: T;
  status?: number;
  headers?: HttpResponseHeaders;
}) {
  return json(convertBigIntsToNumbers(data), {
    status: status || 200,
    headers: headers as HeadersInit | undefined,
  });
}

export function respondNoBody(
  args: {
    status?: number;
    headers?: HttpResponseHeaders;
  } = {},
) {
  return new Response(undefined, {
    status: args.status || 204,
    headers: args.headers as HeadersInit | undefined,
  });
}

export function respondText({
  content,
  status = 200,
  headers,
}: {
  content: string;
  status?: number;
  headers?: HttpResponseHeaders;
}) {
  return text(content, {
    status: status,
    headers: headers as HeadersInit | undefined,
  });
}

// Sveltekit json() function cannot serialize bigint
function convertBigIntsToNumbers(obj: any) {
  if (typeof obj === "bigint") {
    return Number(obj);
  } else if (typeof obj === "object" && obj !== null) {
    for (let key in obj) {
      obj[key] = convertBigIntsToNumbers(obj[key]);
    }
  }
  return obj;
}
