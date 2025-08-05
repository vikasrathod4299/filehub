import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError } from './ApiError';

export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Something went wrong';


  res.status(statusCode).json({
    success: false,
    message,
  });
  return;
};

