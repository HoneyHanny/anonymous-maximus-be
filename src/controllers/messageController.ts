import { Request, Response } from 'express'
import { randomUUID } from 'crypto'
import { Guid, isGuid } from '../helpers/helper'
import * as messageDb from '../db/messageDb'
import type { Message } from '../models/message'

class MessageController {
  async createMessage(req: Request, res: Response) {
    const roomId = req.params.id || req.body.roomId
    const { sender, content } = req.body
    if (!roomId || !sender || !content) {
      return res.status(400).json({ error: 'roomId, sender, and content are required' })
    }
    if (typeof content !== 'string' || content.length > 5000) {
      return res.status(400).json({ error: 'Message content must be a string and under 5000 characters' })
    }
    if (!isGuid(roomId)) {
      return res.status(400).json({ error: 'Invalid roomId format' })
    }
    const message: Message = {
      id: randomUUID(),
      roomId,
      sender,
      content,
      timestamp: new Date(),
    }
    await messageDb.addMessage(message)
    return res.status(201).json(message)
  }

  async getMessages(req: Request, res: Response) {
    const roomId = req.params.id
    if (!roomId) {
      return res.status(400).json({ error: 'Room id is required' })
    }
    if (!isGuid(roomId as string)) {
      return res.status(400).json({ error: 'Invalid roomId format' })
    }
    const messages = await messageDb.getMessages(roomId as Guid)
    return res.json(messages)
  }

  async getMessage(req: Request, res: Response) {
    const roomId = req.params.roomId || req.params.id
    const messageId = req.params.messageId
    if (!roomId || !messageId) {
      return res.status(400).json({ error: 'Room id and Message id are required' })
    }
    if (!isGuid(roomId as string)) {
      return res.status(400).json({ error: 'Invalid roomId format' })
    }
    const message = await messageDb.getMessage(roomId as Guid, messageId as string)
    if (!message) {
      return res.status(404).json({ error: 'Message not found' })
    }
    return res.json(message)
  }
}

export default new MessageController()
