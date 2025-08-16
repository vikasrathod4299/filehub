import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "./logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = uuidv4();
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);

  const startTime = Date.now();

  // Log request
  logger.info("Incoming request", {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Log response
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.info("Request completed", {
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
