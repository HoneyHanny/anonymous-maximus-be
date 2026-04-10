import { createClient } from 'redis'
import { REDIS_HOST, REDIS_PASS, REDIS_PORT, REDIS_USERNAME } from '../config'

const client = createClient({
  username: REDIS_USERNAME,
  password: REDIS_PASS,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
})

client.on('error', err => {
  console.error('Redis Client Error', err)
})

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect()
  }
}

export async function disconnectRedis() {
  if (client.isOpen) {
    await client.quit()
  } else {
    console.warn('Redis client is not connected')
  }
}

export default client
