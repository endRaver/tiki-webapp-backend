import Coupon from "../models/coupon.model.js";
import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCodes } = req.body;
    console.log('couponCodes', couponCodes);
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid or empty products array" });
    }

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
            images: [product.image],
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
          userId: "67f06ec04b967d17645c0223",
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

    // Ensure totalAmount is valid after discounts
    const finalAmount = totalAmount - totalDiscount;
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
        userId: "67f06ec04b967d17645c0223",
        couponCodes: JSON.stringify(couponCodes || []),
        products: JSON.stringify(
          products.map((product) => ({
            id: product._id,
            quantity: product.quantity,
            price: product.current_seller.price,
          }))
        ),
        totalDiscount: totalDiscount.toString()
      }
    });

    // Send response with session ID and amounts
    res.status(200).json({
      id: session.id,
      totalAmount: finalAmount,
      originalAmount: totalAmount,
      discount: totalDiscount,
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


    console.log('Creating Stripe coupon with data:', couponData);
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
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          {
            isActive: false,
          }
        );
      }

      // create a new Order
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total,
        stripeSessionId: sessionId,
      });

      await newOrder.save();

      res.status(200).json({
        success: true,
        message: "Payment successful, order created, and coupon deactivated if used.",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({ message: "Error processing successful checkout", error: error.message });
  }
};