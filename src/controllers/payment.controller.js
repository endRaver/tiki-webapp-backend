import Coupon from "../models/coupon.model.js";
import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCodes, shippingPrice } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid or empty products array" });
    }

    let shippingCoupon = null;

    for (const couponCode of couponCodes) {
      shippingCoupon = await Coupon.findOne({
        code: couponCode,
        discountFor: "shipping",
        isActive: true
      });
    }

    // Parse shipping cost to number
    const parsedShippingPrice = Number(shippingPrice) || 0;

    let totalAmount = 0;
    let totalDiscount = 0;

    // Calculate total amount for all products
    const lineItems = products.map(product => {
      const amount = Math.round(Number(product.current_seller.price));
      if (isNaN(amount)) {
        throw new Error(`Invalid price for product: ${product.name}`);
      }
      totalAmount += amount * (product.quantity || 1);

      return {
        price_data: {
          currency: 'vnd',
          product_data: {
            name: product.name,
            images: product.images && product.images.length > 0 ? [product.images[0].thumbnail_url] : [],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      }
    });

    // Process all coupons and calculate combined discount
    if (Array.isArray(couponCodes) && couponCodes.length > 0) {
      for (const couponCode of couponCodes) {
        const coupon = await Coupon.findOne({
          code: couponCode,
          userId: req.user._id,
          isActive: true
        });

        if (coupon) {
          // Calculate discount amount
          if (coupon.discountType === 'percentage') {
            const discountAmount = Math.round(totalAmount * (coupon.discount / 100));
            totalDiscount += discountAmount > coupon.maxDiscount ? coupon.maxDiscount : discountAmount;
          } else {
            totalDiscount += coupon.discount;
          }
        }
      }
    }

    // Create a single combined coupon if there's a discount
    let stripeCouponId = null;
    if (totalDiscount > 0) {
      stripeCouponId = await createStripeCoupon(totalDiscount);
    }

    // Add shipping as a separate line item if shipping cost exists
    if (parsedShippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'vnd',
          product_data: {
            name: 'Shipping Fee',
            description: 'Shipping and handling',
          },
          unit_amount: parsedShippingPrice,
        },
        quantity: 1,
      });
    }

    // Ensure totalAmount is valid after discounts
    const finalAmount = totalAmount - totalDiscount + parsedShippingPrice;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount after discounts" });
    }

    // Create checkout session with at most one coupon
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      currency: 'vnd',
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCodes: JSON.stringify(couponCodes || []),
        products: JSON.stringify(
          products.map((product) => ({
            id: product._id,
            name: product.name,
            quantity: product.quantity,
            price: product.current_seller.price,
          }))
        ),
        totalDiscount: totalDiscount.toString(),
        shippingPrice: parsedShippingPrice.toString(),
        shippingDate: products[0].shippingDate.toString(),
        shippingDiscount: shippingCoupon ? shippingCoupon.discount.toString() : '0',
      }
    });

    // Send response with session ID and amounts
    res.status(200).json({
      id: session.id,
      totalAmount: finalAmount,
      originalAmount: totalAmount,
      discount: totalDiscount,
      shippingPrice: parsedShippingPrice,
      url: session.url
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}

// Create Stripe coupon
async function createStripeCoupon(discount) {
  try {
    // Validate inputs
    if (!discount || isNaN(discount)) {
      throw new Error('Invalid discount value');
    }

    // Convert discount to appropriate format for Stripe
    let couponData = {
      duration: 'once',
      currency: 'vnd',
    };
    // For fixed amount discounts (discountType === 'fixed' or 'amount')
    const amountOff = Math.round(discount);
    if (amountOff < 1) {
      throw new Error('Amount discount must be greater than 0');
    }
    couponData.amount_off = amountOff;

    const coupon = await stripe.coupons.create(couponData);
    return coupon.id;
  } catch (error) {
    console.error('Error creating Stripe coupon:', error);
    throw error;
  }
}

// Create new coupon
async function createNewCoupon(userId) {
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discount: 10,
    discountType: 'percentage',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),  // 30 days from now
    userId: userId,
  });

  await newCoupon.save();
  return newCoupon;
}

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Check if order already exists for this session
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Order already processed",
        orderId: existingOrder._id,
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Deactivate used coupons
      const couponCodes = JSON.parse(session.metadata.couponCodes || '[]');
      if (couponCodes.length > 0) {
        await Coupon.updateMany(
          {
            code: { $in: couponCodes },
            userId: session.metadata.userId,
            isActive: true
          },
          {
            isActive: false,
          }
        );
      }

      const user = await User.findById(session.metadata.userId);

      const products = JSON.parse(session.metadata.products);
      const storeProducts = await Product.find({ _id: { $in: products.map(product => product.id) } });

      // Create a new Order
      const newOrder = new Order({
        user: user,
        products: products.map((product) => ({
          product: storeProducts.find(p => p._id.equals(product.id)),
          quantity: product.quantity,
          price: product.price,
        })),
        status: 'confirmed',
        shippingPrice: session.metadata.shippingPrice,
        shippingDate: session.metadata.shippingDate,
        shippingDiscount: session.metadata.shippingDiscount,
        paymentMethod: session.payment_method_types[0],
        totalAmount: session.amount_total,
        stripeSessionId: sessionId,
      });

      await newOrder.save();

      res.status(200).json({
        success: true,
        message: "Payment successful, order created, and coupons deactivated if used.",
        order: newOrder,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({
      success: false,
      message: "Error processing successful checkout",
      error: error.message
    });
  }
};

export const createCashOrder = async (req, res) => {
  try {
    const { products, shippingDate, shippingPrice, shippingDiscount, totalAmount } = req.body;
    const user = req.user;

    const storeProducts = await Product.find({ _id: { $in: products.map(product => product._id) } });

    const orderProducts = products.map((product) => {
      const storeProduct = storeProducts.find(p => p._id.toString() === product._id);
      if (!storeProduct) {
        throw new Error(`Product with ID ${product.id} not found`);
      }
      return {
        product: storeProduct,
        quantity: product.quantity,
        price: storeProduct.current_seller.price,
      };
    });

    const newOrder = new Order({
      user: user,
      products: orderProducts,
      status: 'confirmed',
      shippingPrice: shippingPrice,
      shippingDate: shippingDate,
      shippingDiscount: shippingDiscount,
      paymentMethod: 'cash',
      totalAmount: totalAmount,
      stripeSessionId: Math.random().toString(36).substring(2, 15),
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment successful, order created, and coupons deactivated if used.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({
      success: false,
      message: "Error processing successful checkout",
      error: error.message
    });
  }
}
