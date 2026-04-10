import { PORT } from './config'
import app from './app'
import { createServer } from 'http'
import { setupWebSocket } from './websocket/websocket'

const server = createServer(app)
setupWebSocket(server)

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
