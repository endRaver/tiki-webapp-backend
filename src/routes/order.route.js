import express from 'express';
const router = express.Router();
import {
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUser
} from '../controllers/order.controller.js';
import { protectedRoute, adminRoute } from '../middleware/auth.middleware.js';

router.get('/', protectedRoute, getOrders);
router.get('/user/:userId', protectedRoute, getOrdersByUser);
router.get('/:id', protectedRoute, getOrderById);
router.put('/:id', protectedRoute, adminRoute, updateOrder);
router.delete('/:id', protectedRoute, adminRoute, deleteOrder);

export default router;