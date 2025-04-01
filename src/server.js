import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import setupSwagger from "./lib/swaggerConfig.js";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import sellerRoutes from "./routes/seller.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'], credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sellers", sellerRoutes);

setupSwagger(app);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}/api-docs`);
  connectDB();
});
