import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiError, BaseError } from './ApiError';
import { logger } from './logger';

//export const errorHandler: ErrorRequestHandler = (
//  err: Error | ApiError,
//  req: Request,
//  res: Response,
//  _next: NextFunction
//) => {
//  const statusCode = err instanceof ApiError ? err.statusCode : 500;
//  const message = err.message || 'Something went wrong';
//
//
//  res.status(statusCode).json({
//    success: false,
//    message,
//  });
//  return;
//};


interface ErrorResponse {
  error: string;
  message:string;
  timestamp: string;
  path: string;
  statusCode: number;
  requestId?: string;
}

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
    logger.error('Error occured',{
      error: err.constructor.name,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })

    if (err instanceof BaseError) {
      const errorResponse: ErrorResponse = {
        error: err.constructor.name,
        message: err.message,
        timestamp: err.timeStaimp.toISOString(),
        path: req.path,
        statusCode: err.statusCode,
        requestId: req.headers['x-request-id'] as string || undefined,
      }

      return res.status(err.statusCode).json(errorResponse);
    }

    const errorResponse: ErrorResponse = {
      error: 'InternalServerError',
      message: 'Somthing went wrong',
      timestamp: new Date().toISOString(),
      path: req.path,
      statusCode: 500,
      requestId: req.headers['x-request-id'] as string || undefined,
    }

    return res.status(500).json(errorResponse);
}
