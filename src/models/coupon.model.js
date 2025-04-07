import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  discount: {
    type: Number,
    min: 0,
    default: 0,
  },
  maxDiscount: {
    type: Number,
    min: 0,
    default: 0,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'amount'],
    required: [true, 'Discount type is required'],
  },
  discountFor: {
    type: String,
    enum: ['shipping', 'product'],
    required: [true, 'Discount must be applied to either shipping or product'],
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
  validate: {
    validator: function (doc) {
      return !(doc.discountType === 'percentage' && doc.discount > 100);
    },
    message: 'Discount percentage must be less than or equal to 100'
  }
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;