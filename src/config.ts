import dotenv from 'dotenv'

dotenv.config()

export const PORT = process.env.PORT || 3001
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

// Redis configuration
// Use split to remove the port from host if it's present in REDIS_HOST string
const fullHost = process.env.REDIS_HOST || 'localhost'
export const REDIS_HOST = fullHost.split(':')[0]
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10)
export const REDIS_USERNAME = process.env.REDIS_USERNAME || 'default'
export const REDIS_PASS = process.env.REDIS_PASS || ''
