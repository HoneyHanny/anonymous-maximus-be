import { Request, Response } from 'express'
import type { Guid } from '../helpers/helper'
import { isGuid } from '../helpers/helper'
import { randomUUID, randomInt } from 'crypto'

import { Room } from '../helpers/types'
import { addRoom, getRooms, getRoom, deleteRoom, getActiveCodes } from '../db/roomDb'

class RoomController {
  constructor() {
    this.createRoom = this.createRoom.bind(this)
    this.getRooms = this.getRooms.bind(this)
    this.getRoom = this.getRoom.bind(this)
    this.deleteRoom = this.deleteRoom.bind(this)
    this.connectRoom = this.connectRoom.bind(this)
    this.verifyCode = this.verifyCode.bind(this)
  }

  async createRoom(_req: Request, res: Response) {
    const id = randomUUID() as Guid
    // Generate a unique code (e.g., 6-digit alphanumeric)
    const CODE_LENGTH = 6
    const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    let attempts = 0
    const maxAttempts = 100
    const activeCodes = await getActiveCodes()
    do {
      code = Array.from({ length: CODE_LENGTH }, () => CODE_CHARS[randomInt(0, CODE_CHARS.length)]).join('')
      attempts++
    } while (activeCodes.has(code) && attempts < maxAttempts)
    if (activeCodes.has(code)) {
      return res.status(500).json({ error: 'Could not generate unique room code' })
    }
    const room: Room = { id, code }
    try {
      await addRoom(room)
      res.status(201).json(room)
    } catch (err) {
      res.status(500).json({ error: 'Redis error', details: String(err) })
    }
  }

  async getRooms(_req: Request, res: Response) {
    try {
      const rooms = await getRooms()
      res.json(rooms)
    } catch (err) {
      res.status(500).json({ error: 'Redis error', details: String(err) })
    }
  }

  async getRoom(req: Request, res: Response) {
    const { id } = req.params
    if (!isGuid(id as string)) {
      return res.status(400).json({ error: 'Invalid room id format' })
    }
    try {
      const room = await getRoom(id as Guid)
      if (!room) {
        return res.status(404).json({ error: 'Room not found' })
      }
      res.json(room)
    } catch (err) {
      res.status(500).json({ error: 'Redis error', details: String(err) })
    }
  }

  async deleteRoom(req: Request, res: Response) {
    const { id } = req.params
    if (!isGuid(id as string)) {
      return res.status(400).json({ error: 'Invalid room id format' })
    }
    try {
      const removed = await deleteRoom(id as Guid)
      if (!removed) {
        return res.status(404).json({ error: 'Room not found' })
      }
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: 'Redis error', details: String(err) })
    }
  }

  async getRoomByCode(req: Request, res: Response) {
    const { code } = req.params
    if (!code) {
      return res.status(400).json({ error: 'Room code is required' })
    }
    try {
      // get all rooms and find by code (for small scale)
      const rooms = await getRooms()
      const room = rooms.find(r => r.code === code)
      if (!room) {
        return res.status(404).json({ error: 'Room not found' })
      }
      res.json(room)
    } catch (err) {
      res.status(500).json({ error: 'Redis error', details: String(err) })
    }
  }

  async connectRoom(req: Request, res: Response) {
    const { code } = req.params
    if (!code) {
      return res.status(400).json({ error: 'Room code is required' })
    }
    try {
      const rooms = await getRooms()
      const room = rooms.find(r => r.code === code)
      if (!room) {
        return res.status(404).json({ error: 'Room not found' })
      }
      res.json(room)
    } catch (err) {
      res.status(500).json({ error: 'Redis error', details: String(err) })
    }
  }

  async verifyCode(req: Request, res: Response) {
    const { id } = req.params
    const { code } = req.body
    if (!id || !code) {
      return res.status(400).json({ error: 'Room ID and code are required' })
    }
    try {
      const room = await getRoom(id as Guid)
      if (!room) {
        return res.status(404).json({ error: 'Room not found' })
      }
      if (room.code !== code) {
        return res.status(401).json({ error: 'Invalid room code' })
      }
      res.json({ valid: true, room })
    } catch (err) {
      res.status(500).json({ error: 'Redis error', details: String(err) })
    }
  }
}

export const roomController = new RoomController()
