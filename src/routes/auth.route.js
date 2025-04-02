import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
  getProfile,
  googleAuth,
  verifyEmail,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/profile', protectedRoute, getProfile);

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail)
router.post('/refresh-token', refreshToken);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


router.post('/google', googleAuth);

export default router;
