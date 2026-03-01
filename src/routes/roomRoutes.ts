import { Router } from 'express'
import { roomController } from '../controllers/roomController'

const router = Router()

router.post('/rooms', roomController.createRoom)
router.get('/rooms', roomController.getRooms)
router.get('/rooms/code/:code', roomController.getRoomByCode)
router.post('/rooms/:id/verify-code', roomController.verifyCode)
router.get('/rooms/:id', roomController.getRoom)
router.delete('/rooms/:id', roomController.deleteRoom)

export default router
