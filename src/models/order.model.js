import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      return String(Math.floor(100000000 + Math.random() * 900000000));
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
  },
  shippingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingDate: {
    type: Date,
    required: true,
  },
  shippingDiscount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'card',],
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  stripeSessionId: {
    type: String,
    unique: true,
  },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;