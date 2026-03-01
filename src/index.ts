import dotenv from 'dotenv'
import app from './app'
import { createServer } from 'http'
import { setupWebSocket } from './websocket/websocket'

dotenv.config()

const PORT = process.env.PORT || 3001

export const REDIS_HOST = process.env.REDIS_HOST
export const REDIS_PORT = parseInt(process.env.REDIS_PORT as string, 10)
export const REDIS_USERNAME = process.env.REDIS_USERNAME
export const REDIS_PASS = process.env.REDIS_PASS

console.log('REDIS_PORT: ', REDIS_PORT)

const server = createServer(app)
setupWebSocket(server)

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
