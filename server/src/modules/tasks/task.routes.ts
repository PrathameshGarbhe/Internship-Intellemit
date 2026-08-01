import { Router } from 'express'
import {
  getAllTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
  getTasksByMeeting,
} from './task.controller'
import { authenticate } from '../../middleware/authenticate'

const router = Router()

router.use(authenticate)

router.get('/', getAllTasks)
router.post('/', createTask)
router.patch('/:taskId/status', updateTaskStatus)
router.delete('/:taskId', deleteTask)
router.get('/meeting/:meetingId', getTasksByMeeting)

export default router