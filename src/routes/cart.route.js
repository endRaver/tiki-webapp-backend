import express from 'express';
import { addToCart, removeAllFromCart, updateQuantity, getCartProducts, deleteAllCart } from '../controllers/cart.controller.js';
import { protectedRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protectedRoute, getCartProducts);
router.post('/', protectedRoute, addToCart);
router.put('/:id', protectedRoute, updateQuantity);
router.delete('/', protectedRoute, removeAllFromCart);
router.delete('/delete-all', protectedRoute, deleteAllCart);


export default router;
