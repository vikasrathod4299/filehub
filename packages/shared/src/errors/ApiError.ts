export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

export class BaseError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly timeStaimp: Date

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timeStaimp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

}

export class ServiceUnavailableError extends BaseError {
  constructor(serviceName:string) {
    super(`${serviceName} is currently unavailable`,503);
  }
}

export class TimeoutError extends BaseError {
  constructor(serviceName:string, timeout:number = 5000) {
    super(`${serviceName} request timed out after ${timeout}ms`,504);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class RateLimitError extends BaseError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
  }
}
