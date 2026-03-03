import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import roomRoutes from './routes/roomRoutes'
import messageRoutes from './routes/messageRoutes'
import { logMiddleware } from './middlewares/log'

const app = express()

// Security Middlewares
app.use(helmet())
const origins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')
app.use(
  cors({
    origin: origins,
  })
)
app.use(express.json({ limit: '10kb' })) // Limit body size
app.use(logMiddleware)

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', apiLimiter)

// Stricter limiter for room creation
const createRoomLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 room creations per hour
  message: 'Too many rooms created from this IP, please try again after an hour',
})
app.use('/api/rooms', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/') {
    createRoomLimiter(req, res, next)
  } else {
    next()
  }
})

// Routes
app.use('/api', roomRoutes)
app.use('/api/', messageRoutes)

app.get('/', (_req, res) => {
  res.json({ message: 'API is running 🚀' })
})

import redisClient from './db/redisClient'

app.get('/health', async (_req, res) => {
  let redisStatus = 'unknown'
  try {
    // Try a simple Redis command to check connection
    await redisClient.ping()
    redisStatus = 'connected'
  } catch (err) {
    redisStatus = 'disconnected'
  }
  res.json({
    status: 'OK',
    redis: redisStatus,
  })
})

export default app
