import { Meeting } from './meeting.model'

export const getAllMeetings = async () => {
  return await Meeting.find()
    .populate('host', 'name email avatar')
    .populate('participants', 'name email avatar')
    .sort({ scheduledAt: -1 })
}

export const getMeetingById = async (meetingId: string) => {
  return await Meeting.findById(meetingId)
    .populate('host', 'name email avatar')
    .populate('participants', 'name email avatar')
}

export const createMeeting = async (data: {
  title: string
  host: string
  scheduledAt: Date
}) => {
  const meeting = new Meeting({
    title: data.title,
    host: data.host,
    scheduledAt: data.scheduledAt,
    participants: [data.host],
  })
  return await meeting.save()
}

export const updateMeetingStatus = async (
  meetingId: string,
  status: 'scheduled' | 'active' | 'ended'
) => {
  return await Meeting.findByIdAndUpdate(
    meetingId,
    { status },
    { new: true, runValidators: true }
  )
}

export const deleteMeeting = async (meetingId: string) => {
  return await Meeting.findByIdAndDelete(meetingId)
}

export const joinMeeting = async (meetingId: string, userId: string) => {
  return await Meeting.findByIdAndUpdate(
    meetingId,
    { $addToSet: { participants: userId } },
    { new: true }
  ).populate('host', 'name email avatar')
}