import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../models/coupon.model.js';

dotenv.config();

const userIds = [
  "67f76b3f1179efdf09cad12c", // Replace with actual user IDs from your database
  "67f76b3f1179efdf09cad12c",
  "67f76b3f1179efdf09cad12c"
];

const couponData = [
  // Percentage discounts
  {
    code: "WELCOME10",
    discount: 10,
    maxDiscount: 50000,
    discountType: "percentage",
    discountFor: "product",
    minOrderAmount: 100000,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true,
    userId: userIds[0]
  },
  {
    code: "SUMMER20",
    discount: 20,
    maxDiscount: 100000,
    discountType: "percentage",
    discountFor: "product",
    minOrderAmount: 150000,
    expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    isActive: true,
    userId: userIds[1]
  },
  {
    code: "VIP15",
    discount: 15,
    maxDiscount: 75000,
    discountType: "percentage",
    discountFor: "product",
    minOrderAmount: 200000,
    expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    isActive: true,
    userId: userIds[2]
  },

  // Fixed amount discounts
  {
    code: "FREESHIP",
    discount: 30000,
    maxDiscount: 30000,
    discountType: "amount",
    discountFor: "shipping",
    minOrderAmount: 100000,
    expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    isActive: true,
    userId: userIds[0]
  },
  {
    code: "SHIPPING",
    discount: 50000,
    maxDiscount: 50000,
    discountType: "amount",
    discountFor: "shipping",
    minOrderAmount: 100000,
    expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    isActive: true,
    userId: userIds[0]
  },
  {
    code: "FREESHOP",
    discount: 30000,
    maxDiscount: 30000,
    discountType: "amount",
    discountFor: "shipping",
    minOrderAmount: 100000,
    expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    isActive: true,
    userId: userIds[0]
  },
  {
    code: "SAVE10K",
    discount: 10000,
    maxDiscount: 10000,
    discountType: "amount",
    discountFor: "shipping",
    minOrderAmount: 100000,
    expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    isActive: true,
    userId: userIds[0]
  },
  {
    code: "SAVE50K",
    discount: 50000,
    maxDiscount: 50000,
    discountType: "amount",
    discountFor: "product",
    minOrderAmount: 199000,
    expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    isActive: true,
    userId: userIds[1]
  },
  {
    code: "BIG100K",
    discount: 100000,
    maxDiscount: 100000,
    discountType: "amount",
    discountFor: "product",
    minOrderAmount: 200000,
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    isActive: true,
    userId: userIds[2]
  },

  // Expired coupons
  {
    code: "EXPIRED10",
    discount: 10,
    maxDiscount: 50000,
    discountType: "percentage",
    discountFor: "product",
    minOrderAmount: 100000,
    expirationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isActive: false,
    userId: userIds[0]
  },
  {
    code: "OLD20K",
    discount: 20000,
    maxDiscount: 20000,
    discountType: "amount",
    discountFor: "product",
    minOrderAmount: 500000,
    expirationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    isActive: false,
    userId: userIds[1]
  }
];

const seedCoupons = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Drop existing indexes
    await Coupon.collection.dropIndexes();
    console.log('Dropped existing indexes');

    // Clear existing coupons
    await Coupon.deleteMany({});
    console.log('Cleared existing coupons');

    // Insert new coupons
    const coupons = await Coupon.insertMany(couponData);
    console.log(`Successfully seeded ${coupons.length} coupons`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding coupons:', error);
    process.exit(1);
  }
};

// Run the seed function
seedCoupons(); 