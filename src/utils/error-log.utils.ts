import { ErrorCode } from "../enum";


export default class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public cause: Error | undefined;
  public errorCode: ErrorCode | undefined;

  constructor(statusCode: number, message: string, cause?: any, isOperational = true, errorCode?: ErrorCode) {
    super(message);

    this.statusCode = statusCode;
    this.cause = cause as Error;
    this.isOperational = isOperational;
    this.errorCode = errorCode;

    Error.captureStackTrace(this, this.constructor);
  }
}