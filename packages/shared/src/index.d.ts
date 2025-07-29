import {Request, Response, NextFunction} from 'express';
type errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => void;
type ApiError = {
    statusCode: number;
    message: string;
    errors?: string[];
};