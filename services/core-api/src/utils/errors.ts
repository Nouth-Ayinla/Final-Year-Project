export interface ErrorDetail {
  field: string;
  issue: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details: ErrorDetail[];

  constructor(
    statusCode: number,
    errorCode: string,
    message: string,
    details: ErrorDetail[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
