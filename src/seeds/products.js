import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Seller from "../models/seller.model.js";
import { config } from "dotenv";

import products from "./fakeData.js";
import sellers from "./fakeSeller.js";
import prices from "./fakeSellerPrice.js";

config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing data
    await Product.deleteMany({});
    await Seller.deleteMany({});

    // Create sellers
    const createdSellers = await Seller.insertMany(sellers);

    // Then, create products with seller references
    const productsWithSellers = products.map((product, index) => ({
      ...product,
      current_seller: {
        seller: createdSellers[index]._id,
        price: prices[index],
      },
    }));

    // Insert products
    await Product.insertMany(productsWithSellers);

    console.log("Products and sellers seeded successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedProducts();
