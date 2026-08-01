import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { ApiResponse } from '../../utils/ApiResponse'
import { ApiError } from '../../utils/ApiError'
import * as authService from './auth.service'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (
    process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  ) as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body

  const result = await authService.registerUser({ name, email, password })

  // Send refresh token as httpOnly cookie
  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS)

  res.status(201).json(
    new ApiResponse('Account created successfully', {
      user: result.user,
      accessToken: result.accessToken,
    })
  )
})

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  const result = await authService.loginUser({ email, password })

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS)

  res.status(200).json(
    new ApiResponse('Login successful', {
      user: result.user,
      accessToken: result.accessToken,
    })
  )
})

// POST /api/auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken
  if (!token) {
    throw new ApiError(401, 'Refresh token not found')
  }

  const result = await authService.refreshAccessToken(token)

  res.status(200).json(
    new ApiResponse('Token refreshed', { accessToken: result.accessToken })
  )
})

// POST /api/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId
  if (userId) {
    await authService.logoutUser(userId)
  }

  // Clear the cookie
  res.clearCookie('refreshToken', COOKIE_OPTIONS)

  res.status(200).json(new ApiResponse('Logged out successfully'))
})