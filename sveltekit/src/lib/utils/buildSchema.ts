import { ParseObjectError } from "../_errors/ParseObjectError";
import type { z, ZodError } from "zod";

export function buildSchema<T>(
  schemaName: string,
  schema: z.ZodType<T>,
): Schema<T> {
  return {
    schema,
    name: schemaName,
    parse: async (obj) => {
      try {
        const parsed = await schema.parseAsync(obj);
        return parsed;
      } catch (e) {
        throw new ParseObjectError(schemaName, e as ZodError);
      }
    },
    parseSync: (obj) => {
      try {
        return schema.parse(obj);
      } catch (e) {
        throw new ParseObjectError(schemaName, e as ZodError);
      }
    },
  };
}

export type Schema<T> = {
  schema: z.ZodType<T>;
  name: string;
  parse: (
    obj: T extends object ? {
        [K in keyof T]: any;
      }
      : T,
  ) => Promise<T>;
  parseSync: (
    obj: T extends object ? {
        [K in keyof T]: any;
      }
      : T,
  ) => T;
};
