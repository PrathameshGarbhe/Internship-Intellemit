import { Router } from 'express'
import { register, login, refresh, logout } from './auth.controller'
import { validateRegister, validateLogin } from './auth.validation'
import { authenticate } from '../../middleware/authenticate'

const router = Router()

// Public routes
router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.post('/refresh', refresh)

// Protected routes (must be logged in)
router.post('/logout', authenticate, logout)

export default router