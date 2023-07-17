import { AppError, ErrorCategory } from "./AppError";

const category = ErrorCategory.External;

export class ExternalError extends AppError {
  constructor(name: string, message: string) {
    super(category, name, message);
  }
}

export const DatabaseConnectionError = new ExternalError(
  "Database Connection",
  "Server cannot connect with the database. Please try again later...",
);

export const BlobStorageError = (message: string) =>
  new ExternalError(
    "BLOB Storage",
    message,
  );
