import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { config } from "dotenv";

config();

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get real users and products from the database
    const products = await Product.find();
    const users = await User.find({ role: 'customer' });

    if (users.length === 0 || products.length === 0) {
      console.error('No users or products found in the database');
      return;
    }

    console.log(`Found ${users.length} users and ${products.length} products`);

    // Generate dates from 1 month ago to now
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const now = new Date();

    // Calculate number of days in the period
    const daysDiff = Math.ceil((now - oneMonthAgo) / (1000 * 60 * 60 * 24));

    // Calculate orders per day (minimum 3)
    const ordersPerDay = Math.max(3, Math.ceil(100 / daysDiff));
    const totalOrders = ordersPerDay * daysDiff;

    const orders = [];
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const paymentMethods = ['cash', 'card'];

    // Create orders for each day
    for (let day = 0; day < daysDiff; day++) {
      const currentDate = new Date(oneMonthAgo);
      currentDate.setDate(currentDate.getDate() + day);

      // Create orders for the current day
      for (let i = 0; i < ordersPerDay; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomPaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
        const shippingPrice = Math.floor(Math.random() * 31 + 20) * 1000; // 20k - 50k
        const totalAmount = (randomProduct.current_seller.price * quantity) + shippingPrice;

        // Generate random time within the current day
        const orderDate = new Date(currentDate);
        orderDate.setHours(Math.floor(Math.random() * 24));
        orderDate.setMinutes(Math.floor(Math.random() * 60));
        orderDate.setSeconds(Math.floor(Math.random() * 60));

        const order = {
          orderNumber: String(Math.floor(100000000 + Math.random() * 900000000)),
          user: randomUser._id,
          products: [
            {
              product: randomProduct._id,
              quantity: quantity,
              price: randomProduct.current_seller.price
            }
          ],
          status: randomStatus,
          shippingPrice: shippingPrice,
          shippingDate: orderDate,
          shippingDiscount: 0,
          paymentMethod: randomPaymentMethod,
          totalAmount: totalAmount,
          stripeSessionId: Math.random().toString(36).substring(2, 15),
          createdAt: orderDate,
          updatedAt: orderDate
        };

        orders.push(order);
      }
    }

    await Order.insertMany(orders);
    console.log(`Seeded ${totalOrders} orders successfully, with ${ordersPerDay} orders per day`);

    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding orders:', error);
    // Ensure connection is closed even if there's an error
    await mongoose.connection.close();
  }
};

// Run the seed function
generateOrders();
