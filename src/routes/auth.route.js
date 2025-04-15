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
  resetPassword,
  getAllUsers,
  updateUser
} from "../controllers/auth.controller.js";
import { protectedRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/profile', protectedRoute, getProfile);

router.get('/users', protectedRoute, adminRoute, getAllUsers);
router.put('/users/:id', protectedRoute, updateUser);

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail)
router.post('/refresh-token', refreshToken);
router.delete('/users/:id', protectedRoute, adminRoute, deleteUser);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/google', googleAuth);

export default router;
