import { Request, Response, NextFunction } from 'express';
import { TimeoutError } from './ApiError';

export const timeoutMiddleware = (timeoutMs: number, serviceName?:string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        next(new TimeoutError(`${serviceName ? serviceName : "API Gateway"}`, timeoutMs));
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
};

