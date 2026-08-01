import { Router } from 'express'
import {
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeetingStatus,
  deleteMeeting,
  joinMeeting,
} from './meeting.controller'
import { authenticate } from '../../middleware/authenticate'

const router = Router()

router.use(authenticate)

router.get('/', getAllMeetings)
router.get('/:meetingId', getMeetingById)
router.post('/', createMeeting)
router.patch('/:meetingId/status', updateMeetingStatus)
router.patch('/:meetingId/join', joinMeeting)
router.delete('/:meetingId', deleteMeeting)

export default router