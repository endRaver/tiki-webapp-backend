import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { createCheckoutSession, checkoutSuccess, createCashOrder } from "../controllers/payment.controller.js";

const router = express.Router();

router.post('/create-checkout-session', protectedRoute, createCheckoutSession);
router.post('/checkout-success', protectedRoute, checkoutSuccess);
router.post('/create-cash-order', protectedRoute, createCashOrder);

export default router;