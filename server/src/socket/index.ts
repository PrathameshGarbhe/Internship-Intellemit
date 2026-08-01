import { Server, Socket } from 'socket.io'

interface Participant {
  socketId: string
  name: string
  isHost: boolean
}

const rooms = new Map<string, Participant[]>()

export const initSocket = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`)

    socket.on('join-room', ({ roomId, name, isHost }: { roomId: string; name: string; isHost: boolean }) => {
      socket.join(roomId)

      const participant: Participant = { socketId: socket.id, name, isHost }

      if (!rooms.has(roomId)) {
        rooms.set(roomId, [])
      }
      rooms.get(roomId)!.push(participant)

      // Send updated participants list to everyone in room
      io.to(roomId).emit('participants-updated', rooms.get(roomId))

      console.log(`${name} joined room ${roomId}`)
    })

    socket.on('send-message', ({ roomId, message, senderName }: { roomId: string; message: string; senderName: string }) => {
      io.to(roomId).emit('receive-message', {
        id: Date.now(),
        message,
        senderName,
        timestamp: new Date().toLocaleTimeString(),
      })
    })

    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId)

      if (rooms.has(roomId)) {
        const updated = rooms.get(roomId)!.filter(p => p.socketId !== socket.id)
        rooms.set(roomId, updated)
        io.to(roomId).emit('participants-updated', updated)
      }

      console.log(`Socket ${socket.id} left room ${roomId}`)
    })

    socket.on('disconnect', () => {
      // Remove from all rooms
      rooms.forEach((participants, roomId) => {
        const updated = participants.filter(p => p.socketId !== socket.id)
        if (updated.length !== participants.length) {
          rooms.set(roomId, updated)
          io.to(roomId).emit('participants-updated', updated)
        }
      })
      console.log(`🔌 Socket disconnected: ${socket.id}`)
    })
  })
}