import client, { connectRedis, disconnectRedis } from './redisClient'

import type { Guid } from '../helpers/helper'
import type { Room } from '../models/room'
import { deleteMessagesByRoom } from './messageDb'

const ROOM_PREFIX = 'room:'
const ROOM_LIST_KEY = 'rooms:list'
const ROOM_CODES_KEY = 'rooms:codes' // Set of active codes

export async function addRoom(room: Room): Promise<void> {
  await connectRedis()
  await client.hSet(ROOM_PREFIX + room.id, room as any)
  await client.rPush(ROOM_LIST_KEY, room.id)
  await client.sAdd(ROOM_CODES_KEY, room.code)
}

export async function getRooms(): Promise<Room[]> {
  await connectRedis()
  const ids = await client.lRange(ROOM_LIST_KEY, 0, -1)
  const rooms: Room[] = []
  for (const id of ids) {
    const data = await client.hGetAll(ROOM_PREFIX + id)
    if (data.id && data.code) {
      rooms.push({ id: data.id as Guid, code: data.code })
    }
  }
  return rooms
}

export async function getRoom(id: Guid): Promise<Room | null> {
  await connectRedis()
  const data = await client.hGetAll(ROOM_PREFIX + id)
  if (data.id && data.code) {
    return { id: data.id as Guid, code: data.code }
  }
  return null
}

export async function deleteRoom(id: Guid): Promise<boolean> {
  await connectRedis()
  // Remove room and code
  const room = await getRoom(id)
  const removed = await client.del(ROOM_PREFIX + id)
  await client.lRem(ROOM_LIST_KEY, 0, id)
  if (room) {
    await client.sRem(ROOM_CODES_KEY, room.code)
  }
  await deleteMessagesByRoom(id)
  return removed > 0
}

export async function getActiveCodes(): Promise<Set<string>> {
  await connectRedis()
  const codes = await client.sMembers(ROOM_CODES_KEY)
  return new Set(codes)
}
