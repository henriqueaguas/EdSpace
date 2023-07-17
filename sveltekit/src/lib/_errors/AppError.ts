export enum ErrorCategory {
  Forbidden,
  Not_Found,
  Invalid_Data,
  Conflict,
  External,
  Unexpected,
}

export class AppError extends Error {
  category: ErrorCategory;

  constructor(category: ErrorCategory, name: string, message: string) {
    super(message);
    this.category = category;
    this.name = name;
  }

  equals(other: AppError): boolean {
    const inCommon = other.category === this.category &&
      other.name === this.name &&
      other.message === this.message;

    if (!inCommon) return false;

    // We are not doing "other instanceof ParseObjectError" due to cyclic import problems. Could not figure out why yet
    if (!("fieldErrors" in other)) {
      return true;
    }

    if (!("fieldErrors" in this)) {
      // other is ParseObjectError
      return false;
    }

    return other.fieldErrors === this.fieldErrors;
  }
}

export const UnexpectedError = (message: string) =>
  new AppError(ErrorCategory.Unexpected, "Unexpected error", message);
