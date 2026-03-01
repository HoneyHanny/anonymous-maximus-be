import { Router } from 'express'
import messageController from '../controllers/messageController'

const router = Router()

router.post('/rooms/:id/messages', messageController.createMessage)
router.get('/rooms/:id/messages', messageController.getMessages)
router.get('/rooms/:roomId/messages/:messageId', messageController.getMessage)

export default router
