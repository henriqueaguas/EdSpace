import { error } from "@sveltejs/kit";

export type HttpInput = { [key: string]: string };

export type HttpSchema<T extends object> = {
  [k in keyof T]: T[k] extends string ? "string"
    : T[k] extends undefined | string ? "string?"
    : T[k] extends string[] ? "string[]"
    : T[k] extends number ? "number"
    : T[k] extends number[] ? "number[]"
    : T[k] extends boolean ? "boolean"
    : T[k] extends boolean[] ? "boolean[]"
    : T[k] extends undefined | string[] ? "string[]?"
    : T[k] extends undefined | number ? "number?"
    : T[k] extends undefined | number[] ? "number[]?"
    : T[k] extends undefined | boolean ? "boolean?"
    : T[k] extends undefined | boolean[] ? "boolean[]?"
    : undefined;
};

export type HttpOutput = {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
};

/**
 * Used to parse query string and path variables for example , since they all come as string
 */
export function parseHttpInput<T extends HttpOutput>(
  obj: HttpInput,
  objSchema?: HttpSchema<T>,
): T {
  const parsed: T = obj as unknown as T;
  if (!objSchema) {
    return parsed;
  }
  Object.entries(objSchema).forEach(([k, expectedType]) => {
    const actualValue: string | undefined = obj[k]?.trim();

    if (actualValue === undefined) {
      if (!expectedType.includes("?")) {
        throw error(400, {
          name: "Invalid Input",
          message: `${k} needs to be passed in`,
        });
      }
      (parsed as any)[k] = undefined;
      return;
    }

    if (expectedType == "number" || expectedType == "number?") {
      (parsed as any)[k] = Number.parseInt(actualValue);
      return;
    } else if (expectedType == "boolean" || expectedType == "boolean?") {
      (parsed as any)[k] = actualValue === "true";
      return;
    } else if (expectedType == "number[]" || expectedType == "number[]") {
      (parsed as any)[k] = actualValue.split(",").map((n) =>
        Number.parseInt(n.trim())
      );
      return;
    } else if (expectedType == "boolean[]" || expectedType == "boolean[]?") {
      (parsed as any)[k] = actualValue.split(",").map((s) =>
        s.trim() === "true"
      );
      return;
    } else if (expectedType == "string[]" || expectedType == "string[]?") {
      (parsed as any)[k] = actualValue.split(",").map((s) => s.trim());
      return;
    } else {
      (parsed as any)[k] = actualValue;
    }
  });

  return parsed;
}
