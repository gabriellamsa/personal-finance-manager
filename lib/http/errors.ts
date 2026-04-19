export type FieldErrors = Record<string, string[] | undefined>;

export class AppError extends Error {
  readonly code: string;
  readonly fieldErrors?: FieldErrors;
  readonly statusCode: number;

  constructor(options: {
    code: string;
    fieldErrors?: FieldErrors;
    message: string;
    statusCode: number;
  }) {
    super(options.message);
    this.name = "AppError";
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
    this.statusCode = options.statusCode;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication is required.") {
    super({
      code: "AUTHENTICATION_REQUIRED",
      message,
      statusCode: 401,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = "The resource already exists.") {
    super({
      code: "RESOURCE_CONFLICT",
      message,
      statusCode: 409,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super({
      code: "RESOURCE_NOT_FOUND",
      message,
      statusCode: 404,
    });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fieldErrors?: FieldErrors) {
    super({
      code: "VALIDATION_ERROR",
      fieldErrors,
      message,
      statusCode: 400,
    });
  }
}

export class TooManyRequestsError extends AppError {
  readonly retryAfterSeconds?: number;

  constructor(
    message = "Too many requests. Please try again later.",
    retryAfterSeconds?: number,
  ) {
    super({
      code: "RATE_LIMITED",
      message,
      statusCode: 429,
    });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
