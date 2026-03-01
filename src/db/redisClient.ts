import { createClient } from 'redis'
import { REDIS_HOST, REDIS_PASS, REDIS_PORT, REDIS_USERNAME } from '..'

const client = createClient({
  username: 'default',
  password: 'IORPwStAqEPLZG8KWCSmYOrlyM1iUK8M',
  socket: {
    host: 'redis-15491.c323.us-east-1-2.ec2.cloud.redislabs.com',
    port: 15491,
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
