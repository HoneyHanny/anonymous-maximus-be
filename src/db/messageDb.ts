import client, { connectRedis, disconnectRedis } from './redisClient'
import type { Guid } from '../helpers/helper'
import type { Message } from '../models/message'

const MESSAGE_PREFIX = 'message:'
const ROOM_MESSAGES_PREFIX = 'room:messages:'

export async function addMessage(message: Message): Promise<void> {
  await connectRedis()
  await client.hSet(MESSAGE_PREFIX + message.id, {
    ...message,
    timestamp: message.timestamp.toISOString(),
  })
  await client.rPush(ROOM_MESSAGES_PREFIX + message.roomId, message.id)
  await disconnectRedis()
}

export async function getMessages(roomId: Guid): Promise<Message[]> {
  await connectRedis()
  const ids = await client.lRange(ROOM_MESSAGES_PREFIX + roomId, 0, -1)
  const messages: Message[] = []
  for (const id of ids) {
    const data = await client.hGetAll(MESSAGE_PREFIX + id)
    if (data.id && data.roomId && data.sender && data.content && data.timestamp) {
      messages.push({
        id: data.id,
        roomId: data.roomId,
        sender: data.sender,
        content: data.content,
        timestamp: new Date(data.timestamp),
      })
    }
  }
  return messages
}

export async function getMessage(roomId: Guid, messageId: string): Promise<Message | null> {
  await connectRedis()
  const data = await client.hGetAll(MESSAGE_PREFIX + messageId)
  if (data.id && data.roomId === roomId && data.sender && data.content && data.timestamp) {
    return {
      id: data.id,
      roomId: data.roomId,
      sender: data.sender,
      content: data.content,
      timestamp: new Date(data.timestamp),
    }
  }
  return null
}

export async function deleteMessagesByRoom(roomId: Guid): Promise<void> {
  await connectRedis()
  const ids = await client.lRange(ROOM_MESSAGES_PREFIX + roomId, 0, -1)
  for (const id of ids) {
    await client.del(MESSAGE_PREFIX + id)
  }
  await client.del(ROOM_MESSAGES_PREFIX + roomId)
}
