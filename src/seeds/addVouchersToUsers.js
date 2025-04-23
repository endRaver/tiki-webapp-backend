import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import Coupon from '../models/coupon.model.js';

dotenv.config();

const generateVoucherCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const createVouchersForUser = async (userId) => {
  const couponData = [
    // Percentage discounts
    {
      code: generateVoucherCode(),
      discount: 10,
      maxDiscount: 50000,
      discountType: "percentage",
      discountFor: "product",
      minOrderAmount: 100000,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isActive: true,
      userId: userId
    },
    {
      code: generateVoucherCode(),
      discount: 20,
      maxDiscount: 100000,
      discountType: "percentage",
      discountFor: "product",
      minOrderAmount: 150000,
      expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      isActive: true,
      userId: userId
    },
    {
      code: generateVoucherCode(),
      discount: 15,
      maxDiscount: 75000,
      discountType: "percentage",
      discountFor: "product",
      minOrderAmount: 200000,
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      isActive: true,
      userId: userId
    },

    // Fixed amount discounts
    {
      code: generateVoucherCode(),
      discount: 30000,
      maxDiscount: 30000,
      discountType: "amount",
      discountFor: "shipping",
      minOrderAmount: 100000,
      expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      isActive: true,
      userId: userId
    },
    {
      code: generateVoucherCode(),
      discount: 50000,
      maxDiscount: 50000,
      discountType: "amount",
      discountFor: "shipping",
      minOrderAmount: 100000,
      expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      isActive: true,
      userId: userId
    },
    {
      code: generateVoucherCode(),
      discount: 30000,
      maxDiscount: 30000,
      discountType: "amount",
      discountFor: "shipping",
      minOrderAmount: 100000,
      expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      isActive: true,
      userId: userId
    },
    {
      code: generateVoucherCode(),
      discount: 10000,
      maxDiscount: 10000,
      discountType: "amount",
      discountFor: "shipping",
      minOrderAmount: 100000,
      expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      isActive: true,
      userId: userId
    },
    {
      code: generateVoucherCode(),
      discount: 50000,
      maxDiscount: 50000,
      discountType: "amount",
      discountFor: "product",
      minOrderAmount: 199000,
      expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      isActive: true,
      userId: userId
    },
    {
      code: generateVoucherCode(),
      discount: 100000,
      maxDiscount: 100000,
      discountType: "amount",
      discountFor: "product",
      minOrderAmount: 200000,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: true,
      userId: userId
    },

    // Expired coupons
    {
      code: generateVoucherCode(),
      discount: 10,
      maxDiscount: 50000,
      discountType: "percentage",
      discountFor: "product",
      minOrderAmount: 100000,
      expirationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isActive: false,
      userId: userId
    },
    {
      code: generateVoucherCode(),
      discount: 20000,
      maxDiscount: 20000,
      discountType: "amount",
      discountFor: "product",
      minOrderAmount: 500000,
      expirationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      isActive: false,
      userId: userId
    }
  ];

  return await Coupon.insertMany(couponData);
};

const addVouchersToAllUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Add vouchers for each user
    for (const user of users) {
      const vouchers = await createVouchersForUser(user._id);
      console.log(`Added ${vouchers.length} vouchers for user ${user.email}`);
    }

    console.log('Successfully added vouchers for all users');

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error adding vouchers:', error);
    process.exit(1);
  }
};

// Run the script
addVouchersToAllUsers(); 