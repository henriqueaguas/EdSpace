import type { ZodError } from "zod";
import { AppError, ErrorCategory } from "./AppError";

const category = ErrorCategory.Invalid_Data;

export type FieldErrors = { [key: string]: string };

export class ParseObjectError extends AppError {
  fieldErrors: FieldErrors;

  constructor(schemaName: string, zodError: ZodError<any>) {
    const fieldErrors = zodError.flatten().fieldErrors;
    const formErrors = zodError.flatten().formErrors;
    const normalizedFieldErrors = Object.entries(fieldErrors)
      .reduce(
        (acc, [key, value]) => {
          if (typeof key === "string" && value !== undefined) {
            acc[key] = value[0];
          }
          return acc;
        },
        {} as { [key: string]: string },
      );

    super(
      category,
      `Invalid ${schemaName}`,
      Object.keys(fieldErrors).length > 0
        ? Object.entries(normalizedFieldErrors)
          .map(([k, v]) => `${v}`)
          .join("; ")
        : formErrors.join("; "),
    );

    this.fieldErrors = normalizedFieldErrors;
  }
}
