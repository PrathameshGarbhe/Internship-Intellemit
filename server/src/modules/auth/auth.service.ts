import 'dotenv/config'
import { User } from '../users/user.model'
import { ApiError } from '../../utils/ApiError'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/tokenUtils'

interface RegisterInput {
  name: string
  email: string
  password: string
}

interface LoginInput {
  email: string
  password: string
}

export const registerUser = async (input: RegisterInput) => {
  const { name, email, password } = input

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists')
  }

  // Create new user (password hashing handled in model pre-save hook)
  const user = await User.create({ name, email, password })

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role })
  const refreshToken = generateRefreshToken({ userId: user._id.toString(), role: user.role })

  // Save refresh token to database
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  }
}

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password)
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  // Generate tokens
  const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role })
  const refreshToken = generateRefreshToken({ userId: user._id.toString(), role: user.role })

  // Save new refresh token
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  }
}

export const refreshAccessToken = async (token: string) => {
  // Verify the refresh token
  const decoded = verifyRefreshToken(token)

  // Find user with this refresh token
  const user = await User.findById(decoded.userId).select('+refreshToken')
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Invalid or expired refresh token')
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    userId: user._id.toString(),
    role: user.role,
  })

  return { accessToken }
}

export const logoutUser = async (userId: string) => {
  // Clear refresh token from database
  await User.findByIdAndUpdate(userId, { refreshToken: '' })
}