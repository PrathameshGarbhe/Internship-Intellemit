import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { ApiResponse } from '../../utils/ApiResponse'
import { User } from './user.model'

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.userId)
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' })
    return
  }
  res.status(200).json(new ApiResponse('Profile fetched', {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  }))
})

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, avatar } = req.body
  const user = await User.findByIdAndUpdate(
    (req as any).user.userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' })
    return
  }
  res.status(200).json(new ApiResponse('Profile updated', {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  }))
})