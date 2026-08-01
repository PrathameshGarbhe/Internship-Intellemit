import http from 'http'
import { Server } from 'socket.io'
import app from './app'
import { connectDB } from './config/db'
import { initSocket } from './socket'
import 'dotenv/config'

const PORT = process.env.PORT || 5000
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// Create HTTP server from Express app
const httpServer = http.createServer(app)

// Attach Socket.io to the same HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Initialize socket events
initSocket(io)

// Start server
const start = async () => {
  try {
    await connectDB()
    httpServer.listen(PORT, () => {
      console.log(`🚀 IntellMeet server running on port ${PORT}`)
      console.log(`📡 Socket.io ready`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

start()