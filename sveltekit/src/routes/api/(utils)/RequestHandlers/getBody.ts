import { ErrorCategory } from "$lib/_errors/AppError";
import { LogicError } from "$lib/_errors/LogicError";
import type { RequestEvent } from "@sveltejs/kit";

export function getJsonBody<T>(
  request: RequestEvent,
): Promise<T> {
  return request.request.json() as Promise<T>;
}

export async function getFormDataBody<M>(
  request: RequestEvent,
): Promise<{ metadata: M; files: Blob[] }> {
  const formData = await request.request.formData();

  if (!formData.has("metadata")) {
    throw new LogicError(ErrorCategory.Invalid_Data, "Metadata is missing");
  }
  const metadata: M = JSON.parse(formData.get("metadata")!.toString());

  const files: Blob[] = [];
  for (const [k, v] of formData.entries()) {
    if (k.includes("file")) {
      files.push(v as Blob);
    }
  }

  return {
    metadata,
    files,
  };
}
