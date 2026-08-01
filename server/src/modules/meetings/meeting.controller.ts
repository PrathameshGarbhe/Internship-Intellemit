import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { ApiResponse } from '../../utils/ApiResponse'
import { ApiError } from '../../utils/ApiError'
import * as meetingService from './meeting.service'

const getParam = (value: string | string[]): string =>
  Array.isArray(value) ? value[0] : value

// A meeting's `host` field is either a raw ObjectId or a populated user doc
// (when fetched via meetingService.getMeetingById), so normalize before comparing.
const getHostId = (host: any): string =>
  host && typeof host === 'object' && host._id ? host._id.toString() : host?.toString()

const assertIsHostOrAdmin = (meetingHost: any, req: Request) => {
  const currentUser = (req as any).user
  const isHost = getHostId(meetingHost) === currentUser.userId
  const isAdmin = currentUser.role === 'admin'
  if (!isHost && !isAdmin) {
    throw new ApiError(403, 'Only the meeting host can perform this action')
  }
}

export const getAllMeetings = asyncHandler(async (_req: Request, res: Response) => {
  const meetings = await meetingService.getAllMeetings()
  res.status(200).json(new ApiResponse('Meetings fetched', meetings))
})

export const getMeetingById = asyncHandler(async (req: Request, res: Response) => {
  const meetingId = getParam(req.params.meetingId)
  const meeting = await meetingService.getMeetingById(meetingId)
  if (!meeting) {
    res.status(404).json({ success: false, message: 'Meeting not found' })
    return
  }
  res.status(200).json(new ApiResponse('Meeting fetched', meeting))
})

export const createMeeting = asyncHandler(async (req: Request, res: Response) => {
  const { title, scheduledAt } = req.body
  const host = (req as any).user.userId
  if (!title || !scheduledAt) {
    res.status(400).json({ success: false, message: 'Title and scheduledAt are required' })
    return
  }
  const meeting = await meetingService.createMeeting({ title, host, scheduledAt })
  res.status(201).json(new ApiResponse('Meeting created', meeting))
})

export const updateMeetingStatus = asyncHandler(async (req: Request, res: Response) => {
  const meetingId = getParam(req.params.meetingId)
  const { status } = req.body
  if (!['scheduled', 'active', 'ended'].includes(status)) {
    res.status(400).json({ success: false, message: 'Status must be scheduled, active, or ended' })
    return
  }

  const existing = await meetingService.getMeetingById(meetingId)
  if (!existing) {
    res.status(404).json({ success: false, message: 'Meeting not found' })
    return
  }
  assertIsHostOrAdmin(existing.host, req)

  const meeting = await meetingService.updateMeetingStatus(meetingId, status)
  res.status(200).json(new ApiResponse('Meeting status updated', meeting))
})

export const deleteMeeting = asyncHandler(async (req: Request, res: Response) => {
  const meetingId = getParam(req.params.meetingId)

  const existing = await meetingService.getMeetingById(meetingId)
  if (!existing) {
    res.status(404).json({ success: false, message: 'Meeting not found' })
    return
  }
  assertIsHostOrAdmin(existing.host, req)

  await meetingService.deleteMeeting(meetingId)
  res.status(200).json(new ApiResponse('Meeting deleted'))
})

export const joinMeeting = asyncHandler(async (req: Request, res: Response) => {
  const meetingId = getParam(req.params.meetingId)
  const userId = (req as any).user.userId
  const meeting = await meetingService.joinMeeting(meetingId, userId)
  if (!meeting) {
    res.status(404).json({ success: false, message: 'Meeting not found' })
    return
  }
  res.status(200).json(new ApiResponse('Joined meeting', meeting))
})