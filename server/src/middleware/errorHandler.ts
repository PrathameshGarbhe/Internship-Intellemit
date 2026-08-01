import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'This email is already registered.',
    })
  }

  // Mongoose invalid ObjectId (e.g. malformed :meetingId / :taskId param)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    })
  }

  // Mongoose schema validation error
  if (err.name === 'ValidationError') {
    const firstMessage = Object.values((err as any).errors || {})[0] as any
    return res.status(400).json({
      success: false,
      message: firstMessage?.message || 'Validation failed',
    })
  }

  // Malformed / expired JWT that slipped past authenticate()
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }

  // Errors that carry their own statusCode (e.g. CORS rejection in app.ts)
  const statusCode = (err as any).statusCode
  if (typeof statusCode === 'number') {
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Request failed',
    })
  }

  console.error('Unexpected error:', err)
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}