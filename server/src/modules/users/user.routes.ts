import { Router } from 'express'
import { getProfile, updateProfile } from './user.controller'
import { authenticate } from '../../middleware/authenticate'

const router = Router()

router.use(authenticate)

router.get('/me', getProfile)
router.patch('/me', updateProfile)

export default router