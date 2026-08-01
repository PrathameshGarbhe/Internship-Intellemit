import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'
import { verifyAccessToken } from '../utils/tokenUtils'

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        role: string
      }
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access token required')
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyAccessToken(token)
    req.user = decoded
    next()
  } catch {
    throw new ApiError(401, 'Invalid or expired access token')
  }
}

// Role-based access control middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action')
    }
    next()
  }
}