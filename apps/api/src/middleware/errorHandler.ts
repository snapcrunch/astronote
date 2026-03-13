import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(err);

  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : "Internal server error";
  const stack =
    process.env.NODE_ENV !== "production" && err instanceof Error ? err.stack : undefined;

  res.status(500).json({ error: message, ...(stack ? { stack } : {}) });
}
