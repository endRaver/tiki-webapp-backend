import express from "express";
import {
  getAllProducts,
  getProductsByCategory,
  getRecommendedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { protectedRoute, adminRoute } from "../middleware/auth.middleware.js";
import { upload } from "../lib/multer.js";
const router = express.Router();

router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/recommendations', getRecommendedProducts);
router.post('/', protectedRoute, adminRoute, upload.array('images'), createProduct);
router.put('/:id', protectedRoute, adminRoute, upload.array('images'), updateProduct);
router.delete('/:id', protectedRoute, adminRoute, deleteProduct);



export default router;
