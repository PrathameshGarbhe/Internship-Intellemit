import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'

// Register schema
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character'),
})

// Login schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

// Middleware to validate register input
export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = registerSchema.safeParse(req.body)
  if (!result.success) {
    const message =
  result.error.issues[0]?.message ?? 'Validation failed'
    return res.status(400).json({
      success: false,
      message,
    })
  }
  next()
}

// Middleware to validate login input
export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    const message =
  result.error.issues[0]?.message ?? 'Validation failed'
    return res.status(400).json({
      success: false,
      message,
    })
  }
  next()
}