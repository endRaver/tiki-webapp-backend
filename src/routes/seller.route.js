import express from "express";
import { getAllSellers, getSellerById } from "../controllers/seller.controller.js";
import { protectedRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, getAllSellers);
router.get("/:id", protectedRoute, adminRoute, getSellerById);

export default router;