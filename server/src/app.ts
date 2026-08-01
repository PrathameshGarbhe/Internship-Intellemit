import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import { errorHandler } from './middleware/errorHandler'
import { sanitizeBody } from './middleware/sanitize'
import authRoutes from './modules/auth/auth.routes'
import googleRoutes from './modules/auth/google.routes'
import passport from './config/passport'
import taskRoutes from './modules/tasks/task.routes'
import userRoutes from './modules/users/user.routes'
import meetingRoutes from './modules/meetings/meeting.routes'
const app = express()

// Security headers
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
})
app.use('/api', limiter)

// CORS
// CLIENT_URL can be a single origin or a comma-separated list
// (e.g. your production Vercel domain + a preview deployment URL).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin header), e.g. curl / server-to-server
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    const corsError = new Error('Not allowed by CORS') as Error & { statusCode?: number }
    corsError.statusCode = 403
    return callback(corsError)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Strip NoSQL injection operators ($gt, $ne, etc.) from request bodies
app.use(sanitizeBody)

// Passport
app.use(passport.initialize())

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'OK', app: 'IntellMeet API', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/auth', googleRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/users', userRoutes)
app.use('/api/meetings', meetingRoutes)

// Global error handler
app.use(errorHandler)

export default app