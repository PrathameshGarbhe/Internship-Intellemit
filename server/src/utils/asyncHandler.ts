import { Request, Response, NextFunction } from 'express'

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

// Wraps async route handlers so we don't need try/catch in every controller
export const asyncHandler = (fn: AsyncFunction) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }