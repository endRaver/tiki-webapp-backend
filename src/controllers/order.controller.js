import Order from "../models/order.model.js";

export const getOrders = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id).populate({
      path: 'products.product',
      select: 'name images original_price list_price current_seller categories'
    });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrdersByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'products.product',
        select: 'name images original_price list_price current_seller categories'
      });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;

  const {
    status,
    shippingPrice,
    shippingDate,
    shippingDiscount,
    paymentMethod
  } = req.body;

  if (!status || !shippingPrice || !shippingDate || !shippingDiscount || !paymentMethod) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const order = await Order.findByIdAndUpdate(id, {
      status,
      shippingPrice,
      shippingDate,
      shippingDiscount,
      paymentMethod
    }, { new: true });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





