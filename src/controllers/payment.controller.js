import Coupon from "../models/coupon.model.js";
import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid or empty products array" });
    }

    let totalAmount = 0;

    // Calculate total amount for all products
    const lineItems = products.map(product => {
      const amount = Math.round(product.price);
      totalAmount += amount * product.quantity;

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

    // Check if coupon is valid and apply discount
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
      if (coupon) {
        if (coupon.discountType === 'percentage') {
          const discountAmount = Math.round(totalAmount * (coupon.discount / 100));
          if (discountAmount > coupon.maxDiscount) {
            totalAmount -= coupon.maxDiscount;
          } else {
            totalAmount -= discountAmount;
          }
        } else {
          totalAmount -= coupon.discount;
        }
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
          {
            coupon: await createStripeCoupon(
              coupon.discount,
              coupon.discountType
            )
          }
        ] : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map(product => ({
            id: product._id,
            quantity: product.quantity,
            price: product.price,
          }))
        ),
      }
    });

    // // Create new coupon if total amount is >= 200$
    // if (totalAmount >= 20000) {
    //   await createNewCoupon(req.user._id);
    // }

    // Send response with session ID and total amount
    res.status(200).json({ id: session.id, totalAmount: totalAmount });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

// Create Stripe coupon
async function createStripeCoupon(discount, discountType) {
  const coupon = await stripe.coupons.create({
    percent_off: discountType === 'percentage' ? discount : null,
    amount_off: discountType === 'amount' ? discount : null,
    duration: 'once',
  });
  return coupon.id
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