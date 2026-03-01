import { Server } from 'socket.io'
import { deleteRoom } from '../db/roomDb'
import { addMessage } from '../db/messageDb'
import type { Guid } from '../helpers/helper'
import { randomUUID } from 'crypto'

export function setupWebSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', socket => {
    const roomId = socket.handshake.auth.roomId as string
    if (roomId) {
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room ${roomId} via auth`)
    }

    console.log('New client connected:', socket.id)

    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room ${roomId}`)
    })

    socket.on('leaveRoom', (roomId: string) => {
      socket.leave(roomId)
      console.log(`Socket ${socket.id} left room ${roomId}`)

      const room = io.sockets.adapter.rooms.get(roomId)
      if (!room || room.size === 0) {
        console.log(`Room ${roomId} is empty, deleting...`)
        deleteRoom(roomId as Guid).catch(err => console.error(`Error deleting room ${roomId}:`, err))
      }
    })

    socket.on('sendMessage', (data: { roomId: string; content: string; sender: string }) => {
      if (typeof data.content !== 'string' || data.content.length > 5000) {
        console.error(`Invalid message content from ${socket.id}`)
        return
      }

      const message = {
        id: randomUUID(),
        roomId: data.roomId as Guid,
        sender: data.sender || 'Anonymous',
        content: data.content,
        timestamp: new Date(),
      }

      addMessage(message).catch(err => console.error('Error saving message:', err))

      io.to(data.roomId).emit('receiveMessage', {
        content: message.content,
        sender: message.sender,
        senderSocketId: socket.id, // Include this so the sender can identify their own message
        timestamp: message.timestamp.toISOString(),
      })
      console.log(`Message from ${message.sender} to room ${data.roomId}: ${message.content}`)
    })

    socket.on('disconnecting', () => {
      console.log(`Socket ${socket.id} disconnecting. Current rooms:`, Array.from(socket.rooms))
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          const room = io.sockets.adapter.rooms.get(roomId)
          if (room) {
            console.log(`Room ${roomId} size: ${room.size}`)
            if (room.size === 1) {
              console.log(`Room ${roomId} will be empty, deleting from Redis...`)
              deleteRoom(roomId as Guid)
                .then(success => console.log(`Deletion of room ${roomId} in Redis: ${success}`))
                .catch(err => console.error(`Error deleting room ${roomId} from Redis:`, err))
            }
          }
        }
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}
