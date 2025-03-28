import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { config } from "dotenv";

import products from "./fakeData.js";

console.log(products);

config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing Products
    await Product.deleteMany({});

    // Insert new Products
    await Product.insertMany(products);

    console.log("Products seeded successfully!");
  } catch (error) {
    console.error("Error seeding songs:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedProducts();
