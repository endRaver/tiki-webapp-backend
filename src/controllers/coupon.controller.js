import Coupon from "../models/coupon.model.js"

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.find({ userId: req.user._id, isActive: true });
    res.json(coupon || null)
  } catch (error) {
    console.log("Error in getCoupon controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const validateCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({ message: 'Coupon expired' });
    }

    res.json({
      message: 'Coupon is valid',
      code: coupon.code,
      discount: coupon.discount,
      discountType: coupon.discountType,
      discountFor: coupon.discountFor,
      maxDiscount: coupon.maxDiscount,
      expirationDate: coupon.expirationDate,
    });
  } catch (error) {
    console.log("Error in validateCoupon controller", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
